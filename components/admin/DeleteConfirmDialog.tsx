// Confirmation dialog for destructive delete actions (docs/ADMIN.md > Delete behavior).

"use client";

import React, { useEffect, useRef } from "react";
import styles from "./DeleteConfirmDialog.module.css";

interface DeleteConfirmDialogProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  count,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // 1. Keyboard accessibility (Escape key to cancel, auto-focus confirm button)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    confirmBtnRef.current?.focus(); // Focus primary action for screen readers

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div
      className={styles.overlay}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
      onClick={onCancel} // Click overlay backdrop to cancel
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Warning Icon */}
        <div className={styles.iconWrapper}>
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
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 id="dialog-title" className={styles.title}>
          Delete Photos?
        </h2>
        <p id="dialog-desc" className={styles.description}>
          You are about to permanently delete {count} photo{count !== 1 ? "s" : ""}. This action will delete the image files from storage and cannot be undone. Are you sure you want to proceed?
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelBtn}
          >
            No, Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={styles.confirmBtn}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
