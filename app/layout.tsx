// Root layout. Minimal, elegant, private visual style (docs/UI_UX.md).

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private Gallery",
  description: "A private, PIN-protected photo gallery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
