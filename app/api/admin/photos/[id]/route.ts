// DELETE /api/admin/photos/:id — docs/API.md, docs/ADMIN.md
// Requires admin session.
// 1. Look up the photo's storage_path.
// 2. Delete the storage object.
// 3. Delete the DB row.
// 4. Handle partial failure so the state stays recoverable (docs/ADMIN.md).

import { type NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { deletePhotoObject } from "@/lib/storage/photos";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    // 1. Verify admin session
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    // 2. Await dynamic route parameters (required in Next.js 15)
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Photo ID is required." },
        { status: 400 }
      );
    }

    // 3. Retrieve storage_path of the photo to be deleted
    const { data: photo, error: fetchError } = await getSupabaseAdmin()
      .from("photos")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json(
        { error: "Photo not found in database inventory." },
        { status: 404 }
      );
    }

    // 4. Delete the physical storage object first
    const storageRes = await deletePhotoObject(photo.storage_path);
    if (storageRes.error) {
      // Log the warning but do not block DB cleanup. This handles cases where
      // the storage object is already deleted, making state recovery possible.
      console.warn(
        `Warning: Storage object cleanup failed for path ${photo.storage_path}:`,
        storageRes.error
      );
    }

    // 5. Delete the database record
    const { error: dbDeleteError } = await getSupabaseAdmin()
      .from("photos")
      .delete()
      .eq("id", id);

    if (dbDeleteError) {
      console.error(`Database deletion failed for photo ${id}:`, dbDeleteError.message);
      return NextResponse.json(
        { error: "Failed to delete photo record from database." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Photo deleted successfully." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Photo DELETE handler failed:", err.message || err);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
