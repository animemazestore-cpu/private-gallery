// Visitor entry point: locked PIN screen (docs/UI_UX.md > Locked screen).
// Renders components/visitor/PinEntry.tsx. If a valid visitor session
// already exists, redirect to /gallery instead.

import { redirect } from "next/navigation";
import { getVisitorSession } from "@/lib/auth/session";
import HomePageClient from "./HomePageClient";
import styles from "./page.module.css";

export default async function HomePage() {
  // Server-side redirect if visitor session already exists
  const session = await getVisitorSession();
  if (session) {
    redirect("/gallery");
  }

  return (
    <main className={styles.main}>
      <HomePageClient />
    </main>
  );
}
