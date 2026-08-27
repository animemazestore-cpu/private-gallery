// Responsive masonry/justified grid, lazy-loaded thumbnails (docs/UI_UX.md > Gallery).

"use client";

import React from "react";
import Image from "next/image";
import type { GalleryPhoto } from "@/types/photo";
import styles from "./GalleryGrid.module.css";

interface GalleryGridProps {
  photos: GalleryPhoto[];
  onPhotoClick: (index: number) => void;
}

export default function GalleryGrid({ photos, onPhotoClick }: GalleryGridProps) {
  if (photos.length === 0) {
    return <p>No photos yet.</p>;
  }

  return (
    <div className={styles.grid}>
      {photos.map((photo, index) => {
        // Calculate display dimensions based on native aspect ratio
        const aspect = photo.width / photo.height;
        // Standard width for optimized remote Next.js images in grid is around 400-600px
        const displayWidth = 500;
        const displayHeight = Math.round(displayWidth / aspect);

        return (
          <div
            key={photo.id}
            className={styles.item}
            onClick={() => onPhotoClick(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPhotoClick(index);
              }
            }}
            aria-label={photo.caption || `View gallery image ${index + 1}`}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={photo.url}
                alt={photo.caption || "Gallery photo"}
                width={displayWidth}
                height={displayHeight}
                className={styles.image}
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            {photo.caption && (
              <div className={styles.overlay}>
                <span className={styles.caption}>{photo.caption}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
