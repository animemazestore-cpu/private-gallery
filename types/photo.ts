// Mirrors docs/DATABASE.md `photos` table.
export interface Photo {
  id: string;
  storagePath: string;       // never sent to the client as-is; resolve to a signed URL server-side
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Shape returned by GET /api/gallery — metadata + a resolved access URL,
// never a raw storage_path (docs/API.md, docs/STORAGE.md).
export interface GalleryPhoto {
  id: string;
  url: string;          // short-lived signed URL
  caption: string | null;
  width: number;
  height: number;
  sortOrder: number;
}
