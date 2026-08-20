import { apiFetch } from './client';

export type WalletOrder = { orderId: string; amount: number; currency: string; keyId: string };

export const walletApi = {
  createOrder: (amount: number, gstAmount: number) =>
    apiFetch<WalletOrder>('/api/wallet/create-order', { method: 'POST', body: JSON.stringify({ amount, gstAmount }) }),

  verifyPayment: (orderId: string, paymentId: string, signature: string) =>
    apiFetch<{ verified: boolean; paymentId: string }>('/api/wallet/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ orderId, paymentId, signature }),
    }),
};
