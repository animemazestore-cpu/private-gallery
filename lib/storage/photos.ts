// Protected media storage helpers (docs/STORAGE.md).
// Storage bucket must be PRIVATE. Never return permanent public URLs.

import { getSupabaseAdmin } from "@/lib/supabase/server";

const BUCKET_NAME = "photos";

/**
 * Upload an image file buffer to the private storage bucket.
 */
export async function uploadPhotoObject(
  file: Buffer,
  path: string,
  contentType?: string
): Promise<{ error?: string }> {
  try {
    const { error } = await getSupabaseAdmin().storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        contentType: contentType,
        upsert: false,
      });

    if (error) {
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message || String(err) };
  }
}

/**
 * Delete an image file from the private storage bucket.
 */
export async function deletePhotoObject(
  path: string
): Promise<{ error?: string }> {
  try {
    const { error } = await getSupabaseAdmin().storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message || String(err) };
  }
}

/**
 * Generate a short-lived signed URL for a private storage object.
 * Only call after the caller's session has been authorized
 * (see docs/STORAGE.md "Recommended read pipeline").
 */
export async function getSignedPhotoUrl(
  path: string,
  expiresInSeconds: number
): Promise<{ url?: string; error?: string }> {
  try {
    const { data, error } = await getSupabaseAdmin().storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      return { error: error.message };
    }
    if (!data?.signedUrl) {
      return { error: "Failed to generate signed URL." };
    }
    return { url: data.signedUrl };
  } catch (err: any) {
    return { error: err.message || String(err) };
  }
}

export { BUCKET_NAME };
