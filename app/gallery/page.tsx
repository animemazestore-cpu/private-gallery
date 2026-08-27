// Redirect to index page. The gallery view is now rendered transiently
// inline on the home page "/" for absolute one-time session security.

import { redirect } from "next/navigation";

export default function GalleryPage() {
  redirect("/");
}
