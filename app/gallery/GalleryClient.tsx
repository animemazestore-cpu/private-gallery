"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import GalleryGrid from "@/components/visitor/GalleryGrid";
import Lightbox from "@/components/visitor/Lightbox";
import type { GalleryPhoto } from "@/types/photo";
import styles from "./gallery.module.css";

interface GalleryClientProps {
  initialPhotos: GalleryPhoto[];
}

export default function GalleryClient({ initialPhotos }: GalleryClientProps) {
  const [photos] = useState<GalleryPhoto[]>(initialPhotos);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        console.error("Logout request failed.");
        setLoggingOut(false);
      }
    } catch (err) {
      console.error("Error during logout:", err);
      setLoggingOut(false);
    }
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

  return (
    <div className={styles.container}>
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
          onClick={handleLogout}
          className={styles.logoutBtn}
          disabled={loggingOut}
        >
          {/* Logout Icon */}
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
          {loggingOut ? "Locking..." : "Lock Gallery"}
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
