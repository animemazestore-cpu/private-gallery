"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { adminLoginAction } from "./actions";
import styles from "./login.module.css";

export default function AdminLoginClient() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !password) return;

    setLoading(true);
    setError(null);
    setShake(false);

    try {
      const res = await adminLoginAction(password);

      if (res.success) {
        // Redirection to the admin dashboard
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError(res.error || "Authentication failed.");
        setShake(true);
        setPassword("");
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setShake(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.card} ${shake ? styles.shake : ""}`}>
      <div className={styles.logoContainer}>
        {/* Shield Key Icon */}
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>

      <h1 className={styles.title}>Admin Control Panel</h1>
      <p className={styles.subtitle}>Enter administrator credentials to authenticate</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="admin-password" className={styles.label}>
            Dashboard Password
          </label>
          <input
            id="admin-password"
            ref={inputRef}
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            disabled={loading}
            autoFocus
            required
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={loading || !password}
        >
          {loading ? <div className={styles.spinner} /> : "Authenticate Admin"}
        </button>
      </form>

      {error && (
        <p id="login-error" className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
