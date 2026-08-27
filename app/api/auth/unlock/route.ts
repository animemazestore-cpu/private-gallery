// POST /api/auth/unlock — docs/API.md, docs/AUTH.md
// Body: { pin: string }
// 1. Rate-limit check (lib/auth/rateLimit.ts) keyed by IP.
// 2. Verify PIN via lib/auth/pin.ts (hash comparison).
// 3. On success: load photo metadata from DB, resolve to short-lived signed URLs,
//    and return them directly in the response payload.
//    No persistent cookies are set, ensuring true one-time transient sessions.
// 4. On failure: generic 401.

import { type NextRequest, NextResponse } from "next/server";
import { verifyVisitorPin } from "@/lib/auth/pin";
import { checkAndRecordAttempt, resetAttempts } from "@/lib/auth/rateLimit";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSignedPhotoUrl } from "@/lib/storage/photos";
import type { GalleryPhoto } from "@/types/photo";

export async function POST(req: NextRequest) {
  try {
    // 1. Extract IP for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // 2. Check rate limit
    const rateLimit = await checkAndRecordAttempt(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    // 3. Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { pin } = body;
    if (typeof pin !== "string" || !pin) {
      return NextResponse.json(
        { error: "PIN is required." },
        { status: 400 }
      );
    }

    // 4. Verify PIN
    const isValid = await verifyVisitorPin(pin);

    if (isValid) {
      // Clear rate limit record on successful unlock
      await resetAttempts(ip);

      // 5. Load photo metadata and generate signed URLs (15m expiry) directly.
      // Since the user wants a true one-time transient session that clears on refresh,
      // we return photos directly without setting any session cookies.
      let photosData: any[] = [];
      try {
        const { data, error } = await getSupabaseAdmin()
          .from("photos")
          .select("id, storage_path, caption, width, height, sort_order")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Database query failed in unlock fetch:", error.message);
        } else if (data) {
          photosData = data;
        }
      } catch (dbErr: any) {
        console.error("Database error in unlock fetch:", dbErr.message || dbErr);
      }

      const galleryPhotos: GalleryPhoto[] = [];
      if (photosData.length > 0) {
        const signedPromises = photosData.map(async (photo) => {
          const signedUrlRes = await getSignedPhotoUrl(photo.storage_path, 900);
          if (signedUrlRes.error || !signedUrlRes.url) {
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

      return NextResponse.json(
        { success: true, photos: galleryPhotos },
        { status: 200 }
      );
    }

    // Generic error response on failure
    return NextResponse.json(
      { error: "Invalid PIN." },
      { status: 401 }
    );
  } catch (err: any) {
    console.error("Unlock API handler failed:", err.message || err);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
