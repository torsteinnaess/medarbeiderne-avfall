import { useAuthStore } from "@/lib/stores/auth";
import { useToastStore } from "@/lib/stores/toast";
import { supabase } from "@/lib/supabase";
import { isNetworkError } from "@/lib/utils/network-error";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, setProfile, setLoading, setInitialized } = useAuthStore();

  useEffect(() => {
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
        setLoading(false);
        setInitialized(true);
      })
      .catch((error) => {
        console.error("[AuthProvider] getSession feilet:", error);
        if (isNetworkError(error)) {
          useToastStore
            .getState()
            .showToast("Kunne ikke koble til serveren. Sjekk nettverket ditt.");
        }
        setLoading(false);
        setInitialized(true);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("[AuthProvider] fetchProfile feilet:", error);
      // Ikke vis toast her — profilen kan hentes ved neste forsøk
    }
  };

  return <>{children}</>;
}
