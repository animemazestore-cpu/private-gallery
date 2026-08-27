// Admin dashboard: upload dropzone, photo inventory, delete controls
// (docs/ADMIN.md, docs/UI_UX.md > Admin).
// Server Component: verify admin session, redirect to /admin/login if absent.

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSignedPhotoUrl } from "@/lib/storage/photos";
import type { AdminPhoto } from "@/components/admin/PhotoManagerTable";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboardPage() {
  // 1. Verify admin session server-side
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  // 2. Fetch full photo inventory from database
  let photosData: any[] = [];
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("photos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database query failed in admin dashboard:", error.message);
    } else if (data) {
      photosData = data;
    }
  } catch (err: any) {
    console.error("Failed to load inventory from database:", err.message || err);
  }

  // 3. Resolve short-lived signed URLs (15m expiry) for thumbnails
  const adminPhotos: AdminPhoto[] = [];
  if (photosData.length > 0) {
    for (const photo of photosData) {
      const signedUrlRes = await getSignedPhotoUrl(photo.storage_path, 900);
      adminPhotos.push({
        id: photo.id,
        storage_path: photo.storage_path,
        original_filename: photo.original_filename,
        mime_type: photo.mime_type,
        size_bytes: photo.size_bytes,
        width: photo.width,
        height: photo.height,
        caption: photo.caption,
        sort_order: photo.sort_order,
        created_at: photo.created_at,
        url: signedUrlRes.url || "", // short-lived signed URL for thumbnail render
      });
    }
  }

  return <DashboardClient initialPhotos={adminPhotos} />;
}
