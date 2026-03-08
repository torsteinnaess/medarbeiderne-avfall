import { useAuthStore } from "@/lib/stores/auth";
import { useToastStore } from "@/lib/stores/toast";
import { supabase } from "@/lib/supabase";
import { isNetworkError } from "@/lib/utils/network-error";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, setProfile, setLoading, setInitialized } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const startTime = Date.now();
    console.log("[AuthProvider] Initializing — calling getSession()...");

    const SESSION_TIMEOUT_MS = 5000;
    let initializedByAuthChange = false;

    // Listen for auth changes FIRST — this fires before getSession resolves
    // when returning from an external redirect
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(
        `[AuthProvider] onAuthStateChange: event=${_event}, user=${session?.user?.email ?? "none"}`,
      );
      setSession(session);

      // Initialize immediately — don't wait for profile fetch
      if (!useAuthStore.getState().isInitialized) {
        console.log(
          "[AuthProvider] Initializing from onAuthStateChange (getSession still pending)",
        );
        setInitialized(true);
        initializedByAuthChange = true;
      }

      setLoading(false);

      if (session?.user) {
        // Fetch profile in background — don't block initialization
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      // Refetch queries when auth state changes (login/logout)
      queryClient.invalidateQueries();
    });

    // Race getSession() against a timeout to prevent navigator.locks hangs
    const timeoutPromise = new Promise<"timeout">((resolve) =>
      setTimeout(() => resolve("timeout"), SESSION_TIMEOUT_MS),
    );

    const sessionPromise = supabase.auth
      .getSession()
      .then(({ data: { session } }) => ({ session, error: null }))
      .catch((error: Error) => ({ session: null, error }));

    Promise.race([sessionPromise, timeoutPromise]).then((result) => {
      // Skip if onAuthStateChange already initialized us
      if (initializedByAuthChange) {
        console.log(
          "[AuthProvider] getSession race resolved, but already initialized via onAuthStateChange — skipping",
        );
        return;
      }

      const elapsed = Date.now() - startTime;

      if (result === "timeout") {
        console.warn(
          `[AuthProvider] getSession() timed out after ${SESSION_TIMEOUT_MS}ms — forcing initialization. onAuthStateChange will recover if session exists.`,
        );
        // Don't overwrite session if onAuthStateChange already set it
        if (!useAuthStore.getState().user) {
          setSession(null);
        }
        setLoading(false);
        setInitialized(true);
        return;
      }

      if (result.error) {
        console.error(
          `[AuthProvider] getSession() failed after ${elapsed}ms:`,
          result.error,
        );
        if (isNetworkError(result.error)) {
          useToastStore
            .getState()
            .showToast("Kunne ikke koble til serveren. Sjekk nettverket ditt.");
        }
        setLoading(false);
        setInitialized(true);
        return;
      }

      const { session } = result;
      console.log(
        `[AuthProvider] getSession() resolved in ${elapsed}ms — user: ${session?.user?.email ?? "none"}`,
      );
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
      setInitialized(true);
      if (session) {
        queryClient.invalidateQueries();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
