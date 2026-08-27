// Server-side upload validation (docs/SECURITY.md > Upload security,
// docs/STORAGE.md > Recommended upload pipeline).
//
// Must validate, NOT trusting client-provided values:
//   - file extension + real (sniffed) MIME type, not just the browser's Content-Type
//   - max file size
//   - max pixel dimensions
//   - sanitized/normalized filename -> safe unique storage object path

import imageSize from "image-size";
import crypto from "crypto";

// Supported image formats and their corresponding sniffed types from image-size
const SUPPORTED_FORMATS: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 8000; // Max 8000px width or height to prevent zip bombs/decompression issues

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  sizeBytes?: number;
}

export async function validateUploadFile(
  file: File
): Promise<UploadValidationResult> {
  try {
    // 1. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds the limit of 10MB (got ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
      };
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: "File is empty.",
      };
    }

    // Convert file to Buffer for image-size analysis
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Validate image structure and get format/dimensions using magic bytes (sniffing)
    let dimensions;
    try {
      dimensions = imageSize(buffer);
    } catch (e) {
      return {
        valid: false,
        error: "Invalid or unsupported image format. (Could not parse image header)",
      };
    }

    if (!dimensions || !dimensions.type || !dimensions.width || !dimensions.height) {
      return {
        valid: false,
        error: "Invalid image metadata.",
      };
    }

    const format = dimensions.type.toLowerCase();
    const mappedMimeType = SUPPORTED_FORMATS[format];

    if (!mappedMimeType) {
      return {
        valid: false,
        error: `Unsupported image format: ${format}. Only JPEG, PNG, GIF, and WebP are allowed.`,
      };
    }

    // 3. Enforce maximum pixel dimensions
    if (dimensions.width > MAX_DIMENSION || dimensions.height > MAX_DIMENSION) {
      return {
        valid: false,
        error: `Image dimensions (${dimensions.width}x${dimensions.height}) exceed the limit of ${MAX_DIMENSION}x${MAX_DIMENSION}px.`,
      };
    }

    // 4. Check that file extension matches sniffed format
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || (format === "jpg" || format === "jpeg" ? !["jpg", "jpeg"].includes(extension) : extension !== format)) {
      return {
        valid: false,
        error: `File extension (.${extension}) does not match the actual image type (${format}).`,
      };
    }

    return {
      valid: true,
      width: dimensions.width,
      height: dimensions.height,
      mimeType: mappedMimeType,
      sizeBytes: file.size,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Validation failed: ${err.message || err}`,
    };
  }
}

/**
 * Convert an untrusted original filename into a safe, unique storage object path.
 * Strips path traversals, normalizes the extension, and prepends a UUID.
 */
export function toSafeObjectPath(originalFilename: string): string {
  // Strip path traversal and weird characters, allow alphanumeric, dash, underscore, and dot
  const baseName = originalFilename.replace(/^.*[\\\/]/, ""); // strip directory path
  const parts = baseName.split(".");
  const extension = parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
  const cleanNameWithoutExt = parts
    .join(".")
    .replace(/[^a-zA-Z0-9_\-]/g, "_") // replace unsafe characters with underscore
    .substring(0, 100); // limit length

  const finalExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)
    ? extension
    : "bin";

  const uuid = crypto.randomUUID();

  return `${uuid}_${cleanNameWithoutExt}.${finalExt}`;
}
