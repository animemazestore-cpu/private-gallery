// GET /api/admin/photos — docs/API.md
// Requires admin session. Returns full photo inventory with signed URLs for the dashboard thumbnails.

import { type NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSignedPhotoUrl } from "@/lib/storage/photos";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify admin session
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    // 2. Fetch full photo inventory ordered by sort_order (ascending), then created_at (descending)
    const { data: photos, error: dbError } = await getSupabaseAdmin()
      .from("photos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Database error fetching admin photos:", dbError.message);
      return NextResponse.json(
        { error: "Failed to fetch photo inventory." },
        { status: 500 }
      );
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 3. Resolve short-lived signed URLs (15m expiry) for dashboard thumbnails
    const photosWithUrls = [];
    for (const photo of photos) {
      const signedUrlRes = await getSignedPhotoUrl(photo.storage_path, 900);
      photosWithUrls.push({
        ...photo,
        url: signedUrlRes.url || "", // short-lived signed URL for thumbnail
      });
    }

    return NextResponse.json(photosWithUrls, { status: 200 });
  } catch (err: any) {
    console.error("Admin photos GET API handler failed:", err.message || err);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
