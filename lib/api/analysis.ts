// Analyse-API — AI-basert bildeanalyse via Edge Function
import { supabase } from '../supabase';
import type { AnalysisResult } from '../types';

// Analyser bilder via Edge Function (GPT-4o Vision)
export async function analyzeImages(
  imageUrls: string[]
): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-images', {
    body: { image_urls: imageUrls },
  });

  if (error) {
    throw new Error(`Feil ved bildeanalyse: ${error.message}`);
  }

  return data as AnalysisResult;
}

