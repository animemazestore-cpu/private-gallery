// Full-screen viewer: prev/next, close, keyboard-accessible, touch-friendly,
// prevents accidental navigation (docs/UI_UX.md > Gallery, Mobile, Accessibility).

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { GalleryPhoto } from "@/types/photo";
import styles from "./Lightbox.module.css";

interface LightboxProps {
  photos: GalleryPhoto[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const photo = photos[currentIndex];

  // 1. Keyboard event listeners (Escape, Left, Right Arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        onPrev();
      } else if (e.key === "ArrowRight") {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scrolling when lightbox is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  if (!photo) return null;

  // 2. Mobile touch swipe helpers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setTouchStartX(touch.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setTouchEndX(touch.clientX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const deltaX = touchStartX - touchEndX;
    const swipeThreshold = 50; // minimum pixels to swipe

    if (deltaX > swipeThreshold) {
      // Swipe left -> Next photo
      onNext();
    } else if (deltaX < -swipeThreshold) {
      // Swipe right -> Prev photo
      onPrev();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Photo Lightbox"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onClose} // Clicking backdrop closes lightbox
    >
      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className={styles.closeBtn}
        aria-label="Close lightbox"
      >
        <svg
          style={{ width: "20px", height: "20px" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Main Content Area */}
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {/* Navigation Touch Zones & Arrow Buttons */}
        <div
          className={`${styles.touchZone} ${styles.touchZoneLeft}`}
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          role="button"
          aria-label="Previous photo"
        >
          <button className={styles.arrowBtn} tabIndex={-1}>
            <svg
              style={{ width: "20px", height: "20px" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <div className={styles.imageWrapper}>
          <Image
            src={photo.url}
            alt={photo.caption || "Lightbox zoom photo"}
            width={photo.width}
            height={photo.height}
            className={styles.image}
            priority
            sizes="90vw"
          />
          
          {/* Metadata Display Overlay */}
          <div className={styles.info}>
            {photo.caption && <span className={styles.caption}>{photo.caption}</span>}
            <span className={styles.counter}>
              {currentIndex + 1} of {photos.length}
            </span>
          </div>
        </div>

        <div
          className={`${styles.touchZone} ${styles.touchZoneRight}`}
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          role="button"
          aria-label="Next photo"
        >
          <button className={styles.arrowBtn} tabIndex={-1}>
            <svg
              style={{ width: "20px", height: "20px" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
