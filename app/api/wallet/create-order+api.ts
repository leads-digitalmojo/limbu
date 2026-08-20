/* POST /api/wallet/create-order — opens a real Razorpay order for a wallet
   top-up. Body: { amount, gstAmount } (rupees). Returns the order id and the
   public key id the client-side Checkout needs; the secret never leaves
   this route. */
import { env } from '../../../lib/server/env';
import { createOrder } from '../../../lib/server/razorpay';

type Body = { amount?: number; gstAmount?: number };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const { amount, gstAmount = 0 } = body;
  if (!amount || amount < 100) return Response.json({ error: 'invalid_amount' }, { status: 400 });

  const payable = amount + gstAmount;

  try {
    const order = await createOrder(Math.round(payable * 100), `wallet_${Date.now()}`);
    return Response.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: env.razorpayKeyId() });
  } catch (e) {
    return Response.json({ error: 'razorpay_error', detail: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
