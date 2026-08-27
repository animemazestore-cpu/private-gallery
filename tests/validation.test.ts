import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateUploadFile, toSafeObjectPath } from "../lib/validation/upload";

// Mock image-size library
vi.mock("image-size", () => {
  return {
    default: vi.fn((buffer: Buffer) => {
      const content = buffer.toString();
      if (content === "corrupted-image-data") {
        throw new Error("Invalid image header");
      }
      if (content === "unsupported-image-format") {
        return { type: "bmp", width: 200, height: 200 };
      }
      if (content === "oversized-pixel-dimensions") {
        return { type: "png", width: 9000, height: 9000 };
      }
      return { type: "png", width: 800, height: 600 };
    }),
  };
});

describe("validateUploadFile", () => {
  it("should fail if file size exceeds 10MB limit", async () => {
    const file = new File([new ArrayBuffer(11 * 1024 * 1024)], "test.png", {
      type: "image/png",
    });
    const res = await validateUploadFile(file);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("exceeds the limit of 10MB");
  });

  it("should fail if file is empty", async () => {
    const file = new File([new ArrayBuffer(0)], "empty.png", {
      type: "image/png",
    });
    const res = await validateUploadFile(file);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("empty");
  });

  it("should fail if image header parsing fails", async () => {
    const file = new File([Buffer.from("corrupted-image-data")], "test.png", {
      type: "image/png",
    });
    const res = await validateUploadFile(file);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Invalid or unsupported image format");
  });

  it("should fail if image type is not supported", async () => {
    const file = new File([Buffer.from("unsupported-image-format")], "test.bmp", {
      type: "image/bmp",
    });
    const res = await validateUploadFile(file);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Unsupported image format");
  });

  it("should fail if pixel dimensions exceed limit", async () => {
    const file = new File([Buffer.from("oversized-pixel-dimensions")], "test.png", {
      type: "image/png",
    });
    const res = await validateUploadFile(file);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("exceed the limit");
  });

  it("should fail if file extension mismatches sniffed format", async () => {
    const file = new File([Buffer.from("normal-image-data")], "test.jpg", {
      type: "image/jpeg",
    });
    const res = await validateUploadFile(file);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("does not match");
  });

  it("should succeed with valid image parameters", async () => {
    const file = new File([Buffer.from("normal-image-data")], "test.png", {
      type: "image/png",
    });
    const res = await validateUploadFile(file);
    expect(res.valid).toBe(true);
    expect(res.width).toBe(800);
    expect(res.height).toBe(600);
    expect(res.mimeType).toBe("image/png");
  });
});

describe("toSafeObjectPath", () => {
  it("should strip path traversal directory structures", () => {
    const path = toSafeObjectPath("../../../etc/passwd.png");
    expect(path).not.toContain("..");
    expect(path).not.toContain("/");
    expect(path).toContain("_passwd.png");
  });

  it("should sanitize unsafe special characters into underscores", () => {
    const path = toSafeObjectPath("my photo! @summer.jpg");
    expect(path).not.toContain("!");
    expect(path).not.toContain("@");
    expect(path).toContain("my_photo___summer.jpg");
  });

  it("should generate unique paths using UUIDs", () => {
    const path1 = toSafeObjectPath("photo.jpg");
    const path2 = toSafeObjectPath("photo.jpg");
    expect(path1).not.toBe(path2);
    
    // Check UUID format prefix (36 chars uuid + 1 char underscore = index 37)
    const suffix1 = path1.substring(37);
    const suffix2 = path2.substring(37);
    expect(suffix1).toBe("photo.jpg");
    expect(suffix2).toBe("photo.jpg");
  });
});
