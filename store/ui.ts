/* Limbu AI — ephemeral UI state: toasts, modal stack, command palette, drawer */
import React from 'react';
import { create } from 'zustand';

export type ToastKind = 'ok' | 'err' | 'info';
export type Toast = { id: string; title: string; desc?: string; kind: ToastKind };

export type ModalSpec = {
  title: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
};

type UIState = {
  toasts: Toast[];
  modal: ModalSpec | null;
  paletteOpen: boolean;
  drawerOpen: boolean;
  toast: (title: string, desc?: string, kind?: ToastKind) => void;
  dismiss: (id: string) => void;
  openModal: (m: ModalSpec) => void;
  closeModal: () => void;
  setPalette: (v: boolean) => void;
  setDrawer: (v: boolean) => void;
};

export const useUI = create<UIState>((set, get) => ({
  toasts: [],
  modal: null,
  paletteOpen: false,
  drawerOpen: false,

  toast: (title, desc, kind = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    set({ toasts: [...get().toasts, { id, title, desc, kind }] });
    setTimeout(() => get().dismiss(id), 3400);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
  setPalette: (paletteOpen) => set({ paletteOpen }),
  setDrawer: (drawerOpen) => set({ drawerOpen }),
}));

export const toast = (title: string, desc?: string, kind?: ToastKind) => useUI.getState().toast(title, desc, kind);
export const openModal = (m: ModalSpec) => useUI.getState().openModal(m);
export const closeModal = () => useUI.getState().closeModal();
