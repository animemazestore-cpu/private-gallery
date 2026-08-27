// Admin section layout — distinct chrome from the visitor app.
// TODO: implement admin-specific styling and navigation.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
