// PIN input + unlock button + generic error state (docs/UI_UX.md > Locked screen).
// Calls POST /api/auth/unlock. Never validates the PIN client-side.

"use client";

import React, { useState, useRef } from "react";
import styles from "./PinEntry.module.css";

interface PinEntryProps {
  onUnlockSuccess: () => void;
}

export default function PinEntry({ onUnlockSuccess }: PinEntryProps) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !pin) return;

    setLoading(true);
    setError(null);
    setShake(false);

    try {
      const res = await fetch("/api/auth/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onUnlockSuccess();
      } else {
        setError(data.error || "Invalid PIN. Access denied.");
        setShake(true);
        setPin(""); // Clear input on failure
        // Auto focus back to input
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } catch (err) {
      setError("A connection error occurred. Please try again.");
      setShake(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numeric digits for PIN inputs if appropriate, otherwise pass all
    if (/^\d*$/.test(value)) {
      setPin(value);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${shake ? styles.shake : ""}`}>
        <div className={styles.logoContainer}>
          {/* Lock Icon */}
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        
        <h1 className={styles.title}>Protected Gallery</h1>
        <p className={styles.subtitle}>Enter access PIN to view private photos</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate autoComplete="off">
          <div className={styles.inputGroup}>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder="••••"
              value={pin}
              onChange={handleInputChange}
              className={styles.input}
              disabled={loading}
              autoFocus
              maxLength={12}
              aria-label="PIN entry"
            />
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={loading || !pin}
          >
            {loading ? <div className={styles.spinner} /> : "Unlock Gallery"}
          </button>
        </form>

        {error && <p className={styles.errorText} role="alert">{error}</p>}
      </div>
    </div>
  );
}
