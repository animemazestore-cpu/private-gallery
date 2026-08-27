"use client";

import React, { useState } from "react";
import PinEntry from "@/components/visitor/PinEntry";
import GalleryGrid from "@/components/visitor/GalleryGrid";
import Lightbox from "@/components/visitor/Lightbox";
import type { GalleryPhoto } from "@/types/photo";
import styles from "./gallery/gallery.module.css";

export default function HomePageClient() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleUnlockSuccess = (loadedPhotos: GalleryPhoto[]) => {
    setPhotos(loadedPhotos);
    setIsUnlocked(true);
  };

  const handleLock = () => {
    // Clear all credentials and photo list from memory instantly
    setPhotos([]);
    setIsUnlocked(false);
    setActiveIndex(null);
  };

  const handlePhotoClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleCloseLightbox = () => {
    setActiveIndex(null);
  };

  const handlePrev = () => {
    if (activeIndex === null) return;
    setActiveIndex((prevIndex) => {
      if (prevIndex === null) return null;
      return prevIndex === 0 ? photos.length - 1 : prevIndex - 1;
    });
  };

  const handleNext = () => {
    if (activeIndex === null) return;
    setActiveIndex((prevIndex) => {
      if (prevIndex === null) return null;
      return prevIndex === photos.length - 1 ? 0 : prevIndex + 1;
    });
  };

  // If not unlocked, render the lock screen PIN input panel
  if (!isUnlocked) {
    return <PinEntry onUnlockSuccess={handleUnlockSuccess} />;
  }

  // If unlocked, render the gallery inline on the main index route.
  // Refreshing the page (F5) resets React state and locks the screen immediately.
  return (
    <div className={styles.container} style={{ width: "100%" }}>
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <svg
            className={styles.logoIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className={styles.title}>Private Gallery</span>
        </div>

        <button
          onClick={handleLock}
          className={styles.logoutBtn}
        >
          {/* Lock Icon */}
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Lock Gallery
        </button>
      </header>

      <main className={styles.main}>
        {photos.length === 0 ? (
          <div className={styles.emptyState}>
            <svg
              className={styles.emptyIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className={styles.emptyText}>No photos in this gallery yet.</p>
          </div>
        ) : (
          <GalleryGrid photos={photos} onPhotoClick={handlePhotoClick} />
        )}
      </main>

      {activeIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={activeIndex}
          onClose={handleCloseLightbox}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
