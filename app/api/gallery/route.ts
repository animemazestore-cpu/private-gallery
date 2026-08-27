// GET /api/gallery — docs/API.md
// Requires a valid visitor session (lib/auth/session.ts).
// Loads photo metadata from DB, resolves each to a short-lived signed URL
// via lib/storage/photos.ts, and returns GalleryPhoto[] (types/photo.ts).
// Never return raw storage_path.

import { type NextRequest, NextResponse } from "next/server";
import { getVisitorSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSignedPhotoUrl } from "@/lib/storage/photos";
import type { GalleryPhoto } from "@/types/photo";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify visitor session
    const session = await getVisitorSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Valid visitor session required." },
        { status: 401 }
      );
    }

    // 2. Fetch photo metadata ordered by sort_order (ascending), then created_at (descending)
    const { data: photos, error: dbError } = await getSupabaseAdmin()
      .from("photos")
      .select("id, storage_path, caption, width, height, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Database error fetching photos:", dbError.message);
      return NextResponse.json(
        { error: "Failed to load gallery metadata." },
        { status: 500 }
      );
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 3. Resolve signed storage URLs for each photo
    const galleryPhotos: GalleryPhoto[] = [];
    const urlPromises = photos.map(async (photo) => {
      // 15 minutes signed URL expiration (900 seconds)
      const signedUrlRes = await getSignedPhotoUrl(photo.storage_path, 900);
      if (signedUrlRes.error || !signedUrlRes.url) {
        console.error(
          `Failed to sign URL for photo ${photo.id}:`,
          signedUrlRes.error || "Missing URL"
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

    const resolved = await Promise.all(urlPromises);
    for (const item of resolved) {
      if (item) {
        galleryPhotos.push(item);
      }
    }

    return NextResponse.json(galleryPhotos, { status: 200 });
  } catch (err: any) {
    console.error("Gallery GET API handler failed:", err.message || err);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
