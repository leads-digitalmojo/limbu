/* POST /api/wallet/verify-payment — verifies a completed Razorpay checkout
   server-side before the client is allowed to credit the wallet. The
   Checkout success callback alone proves nothing; only this signature
   check does. Body: { orderId, paymentId, signature }. */
import { verifyPaymentSignature } from '../../../lib/server/razorpay';

type Body = { orderId?: string; paymentId?: string; signature?: string };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const { orderId, paymentId, signature } = body;
  if (!orderId || !paymentId || !signature) return Response.json({ error: 'missing_fields' }, { status: 400 });

  try {
    const verified = verifyPaymentSignature(orderId, paymentId, signature);
    if (!verified) return Response.json({ error: 'signature_mismatch' }, { status: 400 });
    return Response.json({ verified: true, paymentId });
  } catch (e) {
    return Response.json({ error: 'razorpay_error', detail: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
