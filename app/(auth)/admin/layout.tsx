"use client";

import AdminNav from "./AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Check if user is admin in database using useQuery(api.users.isUserAdmin)
  // For now, allow all authenticated users

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4">
      <AdminNav />
      {children}
    </div>
  );
}
