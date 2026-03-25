import { api } from './api';

interface CloudinarySignature {
  signature: string;
  apiKey: string;
  cloudName: string;
  timestamp: number;
  folder: string;
}

/**
 * Converts a base URL to a Cloudinary URL with transformations applied.
 * Use this to display optimized thumbnails in the feed.
 *
 * @param url    - The original Cloudinary URL (stored in the database)
 * @param width  - Desired width in pixels (default 400)
 * @param height - Desired height in pixels (default 500)
 */
export function cloudinaryThumb(url: string, width = 400, height = 500): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  // Insert transformation params after /upload/
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto,f_webp/`);
}

/**
 * Uploads an array of local URIs directly to Cloudinary using a presigned signature
 * obtained from our backend. The raw files never touch our server.
 *
 * @returns An array of secure Cloudinary URLs ready to be stored in the database.
 */
export async function uploadImagesToCloudinary(localUris: string[]): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const uri of localUris) {
    // 1. Get a fresh signature for each upload
    const { data: sig } = await api.post<CloudinarySignature>('/upload/signature', {
      folder: 'listings',
    });

    // 2. Build multipart form data for direct Cloudinary upload
    const formData = new FormData();

    // React Native accepts { uri, name, type } as a file-like object in FormData
    formData.append('file', {
      uri,
      name: `listing_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as unknown as Blob);

    formData.append('api_key', sig.apiKey);
    formData.append('timestamp', sig.timestamp.toString());
    formData.append('signature', sig.signature);
    formData.append('folder', sig.folder);

    // 3. POST directly to Cloudinary — bypasses our backend entirely
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudinary upload failed: ${error}`);
    }

    const result = await response.json();
    uploadedUrls.push(result.secure_url as string);
  }

  return uploadedUrls;
}
