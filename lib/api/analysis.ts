// Analyse-API — AI-basert bildeanalyse via Edge Function
import { supabase } from "../supabase";
import type { AnalysisResult } from "../types";
import { withNetworkError } from "../utils/network-error";

// Analyser bilder via Edge Function (GPT-4o Vision)
export function analyzeImages(imageUrls: string[]): Promise<AnalysisResult> {
  return withNetworkError(async () => {
    const { data, error } = await supabase.functions.invoke("analyze-images", {
      body: { image_urls: imageUrls },
    });

    if (error) {
      // supabase.functions.invoke legger detaljert info i error.context (Response-objekt)
      let detail = error.message;
      if (error.context && typeof error.context.json === "function") {
        try {
          const body = await error.context.json();
          if (body?.error) {
            detail = body.error;
          }
        } catch {
          // Prøv text() som fallback
          try {
            const text = await error.context.text();
            if (text) detail = text;
          } catch {
            // Bruk generisk melding
          }
        }
      }
      console.error("[analyzeImages] Edge Function feil:", {
        message: error.message,
        detail,
        status: error.context?.status,
      });
      throw new Error(`Feil ved bildeanalyse: ${detail}`);
    }

    return data as AnalysisResult;
  }, "Bildeanalyse");
}
