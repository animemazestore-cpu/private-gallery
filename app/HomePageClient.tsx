"use client";

import PinEntry from "@/components/visitor/PinEntry";
import { useRouter } from "next/navigation";

export default function HomePageClient() {
  const router = useRouter();

  const handleUnlockSuccess = () => {
    // Successful login redirects to protected gallery view
    router.push("/gallery");
    router.refresh();
  };

  return <PinEntry onUnlockSuccess={handleUnlockSuccess} />;
}
