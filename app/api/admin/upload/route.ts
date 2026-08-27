// POST /api/admin/upload — docs/API.md, docs/ADMIN.md, docs/STORAGE.md
// Requires a valid admin session.
// 1. Validate each file server-side (lib/validation/upload.ts).
// 2. Upload to private bucket (lib/storage/photos.ts).
// 3. Insert metadata row; if the DB write fails, delete the uploaded object
//    (docs/STORAGE.md upload pipeline step 6).
// 4. Return per-file success/error status.

import { type NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { uploadPhotoObject, deletePhotoObject } from "@/lib/storage/photos";
import { validateUploadFile, toSafeObjectPath } from "@/lib/validation/upload";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify admin session
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    // 2. Parse Multipart Form data
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const caption = formData.get("caption") as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files selected for upload." },
        { status: 400 }
      );
    }

    const results = [];

    // 3. Process each file in the batch
    for (const file of files) {
      try {
        // A. Validate file structure and sniff format/dimensions
        const validation = await validateUploadFile(file);
        if (
          !validation.valid ||
          !validation.width ||
          !validation.height ||
          !validation.mimeType
        ) {
          results.push({
            name: file.name,
            success: false,
            error: validation.error || "Image validation failed.",
          });
          continue;
        }

        // B. Generate safe unique file path
        const storagePath = toSafeObjectPath(file.name);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // C. Upload file to private storage bucket
        const uploadRes = await uploadPhotoObject(
          buffer,
          storagePath,
          validation.mimeType
        );

        if (uploadRes.error) {
          results.push({
            name: file.name,
            success: false,
            error: `Storage upload failed: ${uploadRes.error}`,
          });
          continue;
        }

        // D. Insert photo metadata row into the database
        const { data: photoData, error: dbError } = await getSupabaseAdmin()
          .from("photos")
          .insert({
            storage_path: storagePath,
            original_filename: file.name,
            mime_type: validation.mimeType,
            size_bytes: file.size,
            width: validation.width,
            height: validation.height,
            caption: caption || null,
            sort_order: 0,
          })
          .select()
          .single();

        if (dbError) {
          // E. Transaction Cleanup: delete uploaded storage object if DB insert fails
          console.warn(
            `Database save failed for ${file.name}, cleaning up storage object:`,
            dbError.message
          );
          await deletePhotoObject(storagePath);

          results.push({
            name: file.name,
            success: false,
            error: `Database save failed: ${dbError.message}`,
          });
          continue;
        }

        results.push({
          name: file.name,
          success: true,
          id: photoData.id,
        });
      } catch (fileErr: any) {
        results.push({
          name: file.name,
          success: false,
          error: fileErr.message || String(fileErr),
        });
      }
    }

    return NextResponse.json({ results }, { status: 200 });
  } catch (err: any) {
    console.error("Upload API handler failed:", err.message || err);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
