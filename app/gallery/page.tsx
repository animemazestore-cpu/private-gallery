// Protected gallery view (docs/UI_UX.md > Gallery).
// Server Component: verify visitor session, redirect to "/" if absent.
// Renders components/visitor/GalleryGrid.tsx + Lightbox.tsx via GalleryClient.

import { redirect } from "next/navigation";
import { getVisitorSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSignedPhotoUrl } from "@/lib/storage/photos";
import type { GalleryPhoto } from "@/types/photo";
import GalleryClient from "./GalleryClient";

export default async function GalleryPage() {
  // 1. Verify visitor session server-side
  const session = await getVisitorSession();
  if (!session) {
    redirect("/");
  }

  // 2. Fetch photos metadata from the database
  let photosData: any[] = [];
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("photos")
      .select("id, storage_path, caption, width, height, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database query failed in gallery view:", error.message);
    } else if (data) {
      photosData = data;
    }
  } catch (err: any) {
    console.error("Failed to load photos from database:", err.message || err);
  }

  // 3. Generate short-lived signed URLs (15m expiry) for private objects
  const galleryPhotos: GalleryPhoto[] = [];
  if (photosData.length > 0) {
    const signedPromises = photosData.map(async (photo) => {
      const signedUrlRes = await getSignedPhotoUrl(photo.storage_path, 900);
      if (signedUrlRes.error || !signedUrlRes.url) {
        console.error(
          `Failed to sign URL for photo ID ${photo.id}:`,
          signedUrlRes.error || "Missing signed URL"
        );
        return null;
      }
      return {
        id: photo.id,
        url: signedUrlRes.url,
        caption: photo.caption,
        width: photo.width,
        height: photo.height,
        sortOrder: photo.sort_order,
      } as GalleryPhoto;
    });

    const resolved = await Promise.all(signedPromises);
    for (const item of resolved) {
      if (item) {
        galleryPhotos.push(item);
      }
    }
  }

  return <GalleryClient initialPhotos={galleryPhotos} />;
}
