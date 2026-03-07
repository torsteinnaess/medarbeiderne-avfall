// Toast-store — global feilmelding / suksessmelding via Zustand
import { create } from "zustand";

type ToastType = "error" | "success" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (message, type = "error", duration = 4000) => {
    const id = `toast-${++nextId}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));
    // Auto-dismiss etter varighet
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

