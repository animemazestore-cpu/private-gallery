// Visitor entry point: locked PIN screen (docs/UI_UX.md > Locked screen).
// Renders components/visitor/PinEntry.tsx inline inside HomePageClient.
// Uses a 100% transient, client-side memory session.
// Refreshing (F5) or closing the page completely resets authentication.

import HomePageClient from "./HomePageClient";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <HomePageClient />
    </main>
  );
}
