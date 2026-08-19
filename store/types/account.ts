/* Account, wallet & settings domain — owner: Person B */

export type Tx = { id: string; type: 'credit' | 'debit'; label: string; amount: number; at: string; ref: string };

export type Settings = {
  autoReply: boolean; autoPost: boolean; passkey: boolean; adminApproval: boolean;
  lang: string; notifyEmail: boolean; notifyWhatsapp: boolean;
};

export type User = {
  name: string; email: string; phone: string; plan: string; verified: boolean;
  memberSince: string; renews: string; credits: number; creditCap: number;
};

export type Notification = { id: string; icon: string; title: string; desc: string; at: string };
