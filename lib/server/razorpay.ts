/* Server-only Razorpay access: create a real payment order, and verify a
   completed payment's signature server-side before trusting it. The
   verification step is the whole point of doing this server-side at all —
   a client callback saying "payment succeeded" is not proof of anything;
   only a signature only Razorpay and this server can compute is. */
import { createHmac, timingSafeEqual } from 'crypto';
import { env } from './env';

function authHeader(): string {
  const token = Buffer.from(`${env.razorpayKeyId()}:${env.razorpayKeySecret()}`).toString('base64');
  return `Basic ${token}`;
}

export type RazorpayOrder = { id: string; amount: number; currency: string };

/** amountInPaise: Razorpay's smallest currency unit — ₹1 = 100 paise. */
export async function createOrder(amountInPaise: number, receipt: string): Promise<RazorpayOrder> {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountInPaise, currency: 'INR', receipt, payment_capture: 1 }),
  });
  if (!res.ok) throw new Error(`Razorpay order creation failed (${res.status}): ${await res.text()}`);
  const order = (await res.json()) as RazorpayOrder;
  return order;
}

/** The exact HMAC formula Razorpay documents for verifying a checkout
    callback: sign "{order_id}|{payment_id}" with the key secret and
    compare to what the client reports. Never skip this. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = createHmac('sha256', env.razorpayKeySecret()).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
