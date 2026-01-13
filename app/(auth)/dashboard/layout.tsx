"use client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="max-w-xl mx-auto space-y-8 px-4">{children}</div>;
}
