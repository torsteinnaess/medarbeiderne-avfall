// Nettverksfeil-håndtering — oversetter rå nettverksfeil til brukervennlige meldinger

const NETWORK_ERROR_PATTERNS = [
  "Failed to fetch",
  "Network request failed",
  "NetworkError",
  "ERR_NETWORK",
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "ECONNABORTED",
  "AbortError",
  "timeout",
  "net::ERR_",
];

const OFFLINE_MESSAGE =
  "Ingen internettforbindelse. Sjekk nettverket ditt og prøv igjen.";
const TIMEOUT_MESSAGE = "Forespørselen tok for lang tid. Prøv igjen.";
const GENERIC_NETWORK_MESSAGE =
  "Kunne ikke koble til serveren. Prøv igjen senere.";

/**
 * Sjekker om en feil er en nettverksfeil (offline, timeout, DNS, etc.)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return true;
  }
  const message =
    error instanceof Error ? error.message : String(error);
  return NETWORK_ERROR_PATTERNS.some((pattern) =>
    message.includes(pattern),
  );
}

/**
 * Oversetter en nettverksfeil til en brukervennlig norsk melding.
 * Returnerer null hvis feilen ikke er en nettverksfeil.
 */
export function getNetworkErrorMessage(error: unknown): string | null {
  if (!isNetworkError(error)) {
    return null;
  }

  const message =
    error instanceof Error ? error.message : String(error);

  if (
    message.includes("timeout") ||
    message.includes("ETIMEDOUT") ||
    message.includes("ECONNABORTED") ||
    message.includes("AbortError")
  ) {
    return TIMEOUT_MESSAGE;
  }

  return typeof navigator !== "undefined" && !navigator.onLine
    ? OFFLINE_MESSAGE
    : GENERIC_NETWORK_MESSAGE;
}

/**
 * Wrapper som kjører en async operasjon og oversetter nettverksfeil
 * til brukervennlige norske feilmeldinger.
 *
 * Bruk: const data = await withNetworkError(someAsyncFn, "henting av ordrer");
 */
export async function withNetworkError<T>(
  fn: () => Promise<T>,
  operationLabel?: string,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const networkMessage = getNetworkErrorMessage(error);
    if (networkMessage) {
      const prefix = operationLabel ? `${operationLabel}: ` : "";
      throw new Error(`${prefix}${networkMessage}`);
    }
    throw error;
  }
}

/**
 * Henter en brukervennlig feilmelding fra en ukjent feil.
 * Bruker nettverksfeil-oversettelse først, deretter fallback.
 */
export function getUserFriendlyErrorMessage(
  error: unknown,
  fallback = "Noe gikk galt. Prøv igjen.",
): string {
  const networkMessage = getNetworkErrorMessage(error);
  if (networkMessage) {
    return networkMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

