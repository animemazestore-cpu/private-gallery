// Admin login screen — visually separate from visitor UI (docs/UI_UX.md).
// Verifies admin session, redirecting to dashboard if already authenticated.

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import AdminLoginClient from "./AdminLoginClient";
import styles from "./login.module.css";

export default async function AdminLoginPage() {
  // If admin is already authenticated, skip login and redirect directly to dashboard
  const session = await getAdminSession();
  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <main className={styles.container}>
      <AdminLoginClient />
    </main>
  );
}
