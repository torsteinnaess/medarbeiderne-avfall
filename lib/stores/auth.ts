import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),

  setProfile: (profile) => set({ profile }),

  setLoading: (isLoading) => set({ isLoading }),

  setInitialized: (isInitialized) => set({ isInitialized }),

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("[AuthStore] signOut feilet:", error);
      // Logg ut lokalt uansett — brukeren ønsker å logge ut
    }
    set({
      session: null,
      user: null,
      profile: null,
      isLoading: false,
    });
  },

  reset: () =>
    set({
      session: null,
      user: null,
      profile: null,
      isLoading: false,
    }),
}));
