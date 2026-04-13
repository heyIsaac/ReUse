import { env } from "@/src/config/env";
import { supabase } from "./supabase";

const BUCKET = "listings";

/**
 * Retorna a URL pública de uma imagem no Supabase Storage,
 * opcionalmente com transformação de tamanho (thumbnail).
 */
export function getPublicUrl(
  path: string,
  width?: number,
  height?: number
): string {
  if (!path) return path;

  if (path.startsWith("http")) {
    const fileName = extractPathFromUrl(path);
    if (!fileName) return path;
    path = fileName;
  }

  if (width && height) {
    return `${env.SUPABASE_URL}/storage/v1/render/image/public/${BUCKET}/${path}?width=${width}&height=${height}&resize=cover`;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Faz upload de um array de URIs locais para o Supabase Storage.
 * Retorna os paths relativos no bucket (para armazenar no banco).
 */
export async function uploadImages(localUris: string[]): Promise<string[]> {
  const uploadedPaths: string[] = [];

  for (const uri of localUris) {
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
    const filePath = `${fileName}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload falhou: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    uploadedPaths.push(data.publicUrl);
  }

  return uploadedPaths;
}

function extractPathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length).split("?")[0];
}
