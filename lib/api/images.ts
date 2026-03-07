// Bilde-API — opplasting, resize og signerte URLer for ordrebilder
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Platform } from "react-native";
import { supabase } from "../supabase";
import { withNetworkError } from "../utils/network-error";

const BUCKET = "order-images";
const MAX_IMAGE_WIDTH = 1024;

// Hent bilde-data som kan lastes opp til Supabase Storage
// På web: fetch blob fra blob:-URL, på native: bruk FormData med fil-URI
async function getUploadBody(
  uri: string,
  fileName: string,
): Promise<Blob | FormData> {
  if (Platform.OS === "web") {
    // På web er URI en blob:-URL — hent selve blob-objektet
    const response = await fetch(uri);
    return await response.blob();
  }
  // React Native aksepterer dette spesielle objektet som fil-referanse
  const formData = new FormData();
  formData.append("", {
    uri,
    name: fileName,
    type: "image/jpeg",
  } as unknown as Blob);
  return formData;
}

// Resize et bilde til maks bredde, returner ny URI
async function resizeImage(uri: string): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: MAX_IMAGE_WIDTH });
  const imageRef = await context.renderAsync();
  const result = await imageRef.saveAsync({
    compress: 0.7,
    format: SaveFormat.JPEG,
  });
  console.log(
    "[Images] Resized:",
    result.width,
    "x",
    result.height,
    "→",
    result.uri.substring(0, 60),
  );
  return result.uri;
}

// Last opp resizede bilder til temp/{sessionId}/ for analyse (anonym tilgang)
export function uploadTempImages(
  imageUris: string[],
  sessionId: string,
): Promise<string[]> {
  return withNetworkError(async () => {
    const storagePaths: string[] = [];

    for (let i = 0; i < imageUris.length; i++) {
      const uri = imageUris[i];
      const resizedUri = await resizeImage(uri);
      const path = `temp/${sessionId}/${Date.now()}-${i}.jpg`;

      const body = await getUploadBody(resizedUri, `${Date.now()}-${i}.jpg`);

      console.log("[Images] Laster opp til:", path);

      const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
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
  }, "Opplasting av bilder");
}

// Generer signerte URLer for temp-bilder (brukes av Edge Function / OpenAI)
export function getSignedUrls(storagePaths: string[]): Promise<string[]> {
  return withNetworkError(async () => {
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
  }, "Generering av bilde-URLer");
}

// Flytt bilder fra temp/ til brukerens mappe ved checkout
export function moveTempImages(
  tempPaths: string[],
  userId: string,
): Promise<string[]> {
  return withNetworkError(async () => {
    const newPaths: string[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < tempPaths.length; i++) {
      const oldPath = tempPaths[i];
      const newPath = `${userId}/${timestamp}-${i}.jpg`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .move(oldPath, newPath);

      if (error) {
        throw new Error(
          `Feil ved flytting av bilde ${i + 1}: ${error.message}`,
        );
      }

      newPaths.push(newPath);
    }

    return newPaths;
  }, "Flytting av bilder");
}

// Last opp bilder direkte til brukerens mappe (autentisert)
export function uploadImages(
  imageUris: string[],
  userId: string,
): Promise<string[]> {
  return withNetworkError(async () => {
    const timestamp = Date.now();
    const storagePaths: string[] = [];

    for (let i = 0; i < imageUris.length; i++) {
      const uri = imageUris[i];
      const path = `${userId}/${timestamp}-${i}.jpg`;

      const body = await getUploadBody(uri, `${timestamp}-${i}.jpg`);

      const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
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
  }, "Opplasting av bilder");
}

// Hent signerte URLer for visning av bilder (alias for bakoverkompatibilitet)
export const getImageUrls = getSignedUrls;
