"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import UploadDropzone from "@/components/admin/UploadDropzone";
import PhotoManagerTable, { type AdminPhoto } from "@/components/admin/PhotoManagerTable";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import { adminLogoutAction } from "../login/actions";
import styles from "./dashboard.module.css";

interface DashboardClientProps {
  initialPhotos: AdminPhoto[];
}

export default function DashboardClient({ initialPhotos }: DashboardClientProps) {
  const [photos, setPhotos] = useState<AdminPhoto[]>(initialPhotos);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const triggerNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const refreshPhotos = async () => {
    try {
      const res = await fetch("/api/admin/photos");
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      } else {
        console.error("Failed to refresh photos list.");
      }
    } catch (err) {
      console.error("Error refreshing photos:", err);
    }
  };

  const handleDeleteTrigger = (ids: string[]) => {
    setDeleteIds(ids);
  };

  const handleConfirmDelete = async () => {
    if (!deleteIds || deleteIds.length === 0) return;

    const idsToDelete = [...deleteIds];
    setDeleteIds(null); // Close dialog

    let successCount = 0;
    let failCount = 0;

    // Delete photos one by one
    for (const id of idsToDelete) {
      try {
        const res = await fetch(`/api/admin/photos/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    // Refresh display
    await refreshPhotos();

    if (failCount === 0) {
      triggerNotification(
        "success",
        `Successfully deleted ${successCount} photo${successCount !== 1 ? "s" : ""}.`
      );
    } else if (successCount > 0) {
      triggerNotification(
        "error",
        `Deleted ${successCount} photo${successCount !== 1 ? "s" : ""}, but failed to delete ${failCount} photo${failCount !== 1 ? "s" : ""}.`
      );
    } else {
      triggerNotification("error", "Failed to delete the selected photos.");
    }
  };

  const handleCancelDelete = () => {
    setDeleteIds(null);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await adminLogoutAction();
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Error logging out admin:", err);
      setLoggingOut(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoArea}>
          {/* Admin logo icon */}
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className={styles.title}>Admin Control Panel</span>
        </div>

        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
          disabled={loggingOut}
        >
          Logout Admin
        </button>
      </header>

      <main className={styles.main}>
        {/* Floating Notification Alerts */}
        {notification && (
          <div
            className={`${styles.notification} ${
              notification.type === "success"
                ? styles.notificationSuccess
                : styles.notificationError
            }`}
            role="status"
          >
            {notification.message}
          </div>
        )}

        {/* Section 1: Upload Dropzone */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <svg
              className={styles.sectionTitleIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload New Photos
          </h2>
          <UploadDropzone onUploadComplete={refreshPhotos} />
        </section>

        {/* Section 2: Photo Manager Table */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <svg
              className={styles.sectionTitleIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Gallery Inventory
          </h2>
          <PhotoManagerTable photos={photos} onDelete={handleDeleteTrigger} />
        </section>
      </main>

      {/* Delete Confirmation Modal Overlay */}
      {deleteIds && (
        <DeleteConfirmDialog
          count={deleteIds.length}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
