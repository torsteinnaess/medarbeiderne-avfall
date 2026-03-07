import { useToastStore } from "@/lib/stores/toast";
import {
    getUserFriendlyErrorMessage,
    isNetworkError,
} from "@/lib/utils/network-error";
import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: (failureCount, error) => {
              // Ikke retry ved nettverksfeil (offline) — det hjelper ikke
              if (isNetworkError(error)) return false;
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: (failureCount, error) => {
              if (isNetworkError(error)) return false;
              return failureCount < 1;
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            console.error(
              "[Query Error]",
              query.queryKey,
              error.message,
              error,
            );
            // Vis toast for nettverksfeil — andre query-feil håndteres av UI
            if (isNetworkError(error)) {
              useToastStore
                .getState()
                .showToast(getUserFriendlyErrorMessage(error));
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            console.error(
              "[Mutation Error]",
              mutation.options.mutationKey ?? "unknown",
              error.message,
              error,
            );
            // Vis toast for alle mutation-feil som ikke allerede håndteres i onError-callback
            if (!mutation.options.onError) {
              useToastStore
                .getState()
                .showToast(getUserFriendlyErrorMessage(error));
            }
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
