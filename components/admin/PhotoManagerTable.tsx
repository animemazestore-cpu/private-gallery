// Photo inventory with selection + delete controls (docs/ADMIN.md).

"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./PhotoManagerTable.module.css";

export interface AdminPhoto {
  id: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  width: number;
  height: number;
  caption: string | null;
  sort_order: number;
  created_at: string;
  url: string; // Short-lived signed URL for admin thumbnail
}

interface PhotoManagerTableProps {
  photos: AdminPhoto[];
  onDelete: (ids: string[]) => void;
}

export default function PhotoManagerTable({
  photos,
  onDelete,
}: PhotoManagerTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(photos.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isAllSelected = photos.length > 0 && selectedIds.length === photos.length;
  const isSomeSelected = selectedIds.length > 0;

  return (
    <div className={styles.container}>
      {/* Bulk actions bar */}
      <div className={styles.actionBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            className={styles.checkbox}
            disabled={photos.length === 0}
            aria-label="Select all photos"
          />
          <span className={styles.selectedCount}>
            {isSomeSelected
              ? `${selectedIds.length} photo${selectedIds.length !== 1 ? "s" : ""} selected`
              : "Select photos to manage"}
          </span>
        </div>

        {isSomeSelected && (
          <button
            type="button"
            onClick={() => {
              onDelete(selectedIds);
              setSelectedIds([]); // clear selection
            }}
            className={styles.bulkDeleteBtn}
          >
            {/* Trash icon */}
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Selected
          </button>
        )}
      </div>

      {/* Photo items listing */}
      <div className={styles.list}>
        {photos.map((photo) => {
          const isChecked = selectedIds.includes(photo.id);

          return (
            <div key={photo.id} className={styles.card}>
              {/* Checkbox */}
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleSelectOne(photo.id, e.target.checked)}
                  className={styles.checkbox}
                  aria-label={`Select photo ${photo.original_filename}`}
                />
              </div>

              {/* Thumbnail */}
              <div className={styles.thumbnailWrapper}>
                {photo.url ? (
                  <Image
                    src={photo.url}
                    alt={photo.caption || photo.original_filename}
                    width={70}
                    height={70}
                    className={styles.thumbnail}
                    loading="lazy"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#2d3748",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                )}
              </div>

              {/* Metadata */}
              <div className={styles.info}>
                <p className={styles.filename} title={photo.original_filename}>
                  {photo.original_filename}
                </p>
                <p className={styles.caption}>
                  {photo.caption ? (
                    <span>&ldquo;{photo.caption}&rdquo;</span>
                  ) : (
                    <span className={styles.noCaption}>No caption</span>
                  )}
                </p>
                <div className={styles.meta}>
                  <span className={styles.metaItem}>
                    <strong>Size:</strong> {formatSize(photo.size_bytes)}
                  </span>
                  <span className={styles.metaItem}>
                    <strong>Dimensions:</strong> {photo.width} &times; {photo.height}px
                  </span>
                  <span className={styles.metaItem}>
                    <strong>Uploaded:</strong> {formatDate(photo.created_at)}
                  </span>
                </div>
              </div>

              {/* Action delete single */}
              <button
                type="button"
                onClick={() => onDelete([photo.id])}
                className={styles.deleteBtn}
                aria-label={`Delete photo ${photo.original_filename}`}
              >
                {/* Trash icon */}
                <svg
                  style={{ width: "18px", height: "18px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
