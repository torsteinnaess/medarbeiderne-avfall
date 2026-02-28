// Bilde-API — opplasting og signerte URLer for ordrebilder
import { supabase } from "../supabase";

const BUCKET = "order-images";

// Last opp bilder til Supabase Storage
export async function uploadImages(
  imageUris: string[],
  userId?: string,
): Promise<string[]> {
  const timestamp = Date.now();
  const folder = userId ?? `anon-${timestamp}`;
  const storagePaths: string[] = [];

  for (let i = 0; i < imageUris.length; i++) {
    const uri = imageUris[i];
    const path = `${folder}/${timestamp}-${i}.jpg`;

    // Hent bildet som blob fra lokal URI
    const response = await fetch(uri);
    const blob = await response.blob();

    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });

    if (error) {
      throw new Error(
        `Feil ved opplasting av bilde ${i + 1}: ${error.message}`,
      );
    }

    storagePaths.push(path);
  }

  return storagePaths;
}

// Hent signerte URLer for visning av bilder
export async function getImageUrls(storagePaths: string[]): Promise<string[]> {
  const urls: string[] = [];

  for (const path of storagePaths) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600); // 1 time

    if (error) {
      throw new Error(`Feil ved generering av bilde-URL: ${error.message}`);
    }

    urls.push(data.signedUrl);
  }

  return urls;
}
