// Multi-file dropzone/picker with client-side pre-validation + per-file
// progress and error state (docs/ADMIN.md > Upload behavior).

"use client";

import React, { useState, useRef } from "react";
import styles from "./UploadDropzone.module.css";

interface UploadFileState {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  errorMsg?: string;
}

interface UploadDropzoneProps {
  onUploadComplete?: () => void;
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadDropzone({ onUploadComplete }: UploadDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<UploadFileState[]>([]);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFileState[] = [];

    Array.from(files).forEach((file) => {
      let status: "pending" | "error" = "pending";
      let errorMsg: string | undefined;

      // Pre-validation checks
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        status = "error";
        errorMsg = "Unsupported file type. Only JPG, PNG, GIF, and WebP are allowed.";
      } else if (file.size > MAX_FILE_SIZE) {
        status = "error";
        errorMsg = "File size exceeds the 10MB limit.";
      }

      newFiles.push({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status,
        errorMsg,
      });
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setCaption("");
  };

  const handleUpload = async () => {
    const filesToUpload = selectedFiles.filter((f) => f.status === "pending");
    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    // Upload files one by one to show individual progress states
    for (const fileState of filesToUpload) {
      // 1. Mark file status as uploading
      setSelectedFiles((prev) =>
        prev.map((f) => (f.id === fileState.id ? { ...f, status: "uploading" } : f))
      );

      const formData = new FormData();
      formData.append("files", fileState.file);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok && data.results && data.results[0]?.success) {
          setSelectedFiles((prev) =>
            prev.map((f) => (f.id === fileState.id ? { ...f, status: "success" } : f))
          );
        } else {
          const errMsg = data.results?.[0]?.error || data.error || "Upload failed.";
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.id === fileState.id ? { ...f, status: "error", errorMsg: errMsg } : f
            )
          );
        }
      } catch (err: any) {
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === fileState.id
              ? { ...f, status: "error", errorMsg: "Network connection error." }
              : f
          )
        );
      }
    }

    setIsUploading(false);
    setCaption("");
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const hasPending = selectedFiles.some((f) => f.status === "pending");

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.gif,.webp"
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={isUploading}
      />

      <div
        className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        {/* Upload Icon */}
        <svg
          className={styles.icon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <span className={styles.text}>Drag & drop photos here</span>
        <span className={styles.subtext}>Supports JPG, PNG, GIF, and WebP (Max 10MB)</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBrowseClick();
          }}
          className={styles.browseBtn}
          disabled={isUploading}
        >
          Browse Files
        </button>
      </div>

      {selectedFiles.length > 0 && (
        <div className={styles.fileList}>
          {/* Caption Input Field */}
          {hasPending && (
            <div className={styles.captionGroup}>
              <label htmlFor="caption" className={styles.captionLabel}>
                Add Caption (Optional, applies to new uploads in batch)
              </label>
              <input
                id="caption"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className={styles.captionInput}
                placeholder="E.g., Summer trip at the beach"
                disabled={isUploading}
              />
            </div>
          )}

          {/* List of files with current statuses */}
          {selectedFiles.map((fileState) => (
            <div key={fileState.id} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                {/* Paperclip/file icon */}
                <svg
                  className={styles.fileIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                <div style={{ minWidth: 0 }}>
                  <p className={styles.fileName}>{fileState.file.name}</p>
                  <p className={styles.fileSize}>{formatSize(fileState.file.size)}</p>
                </div>
              </div>

              <div className={styles.fileStatus}>
                {fileState.status === "pending" && (
                  <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>
                )}
                {fileState.status === "uploading" && (
                  <span className={`${styles.badge} ${styles.badgeUploading}`}>Uploading</span>
                )}
                {fileState.status === "success" && (
                  <span className={`${styles.badge} ${styles.badgeSuccess}`}>Success</span>
                )}
                {fileState.status === "error" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span className={`${styles.badge} ${styles.badgeError}`}>Error</span>
                    {fileState.errorMsg && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#feb2b2",
                          marginTop: "0.25rem",
                          maxWidth: "200px",
                          textAlign: "right",
                        }}
                      >
                        {fileState.errorMsg}
                      </span>
                    )}
                  </div>
                )}

                {fileState.status !== "uploading" && !isUploading && (
                  <button
                    type="button"
                    onClick={() => removeFile(fileState.id)}
                    className={styles.removeBtn}
                    aria-label="Remove file"
                  >
                    <svg
                      style={{ width: "16px", height: "16px" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Action buttons */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearBtn}
              disabled={isUploading}
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className={styles.uploadBtn}
              disabled={isUploading || !hasPending}
            >
              {isUploading ? "Uploading..." : "Start Upload"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
