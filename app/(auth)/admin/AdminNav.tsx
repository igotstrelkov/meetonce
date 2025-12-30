"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: "/admin" },
    { name: "Photo Review", href: "/admin/photo-review" },
    { name: "Matches", href: "/admin/matches" },
    { name: "Analytics", href: "/admin/analytics" },
  ];

  return (
    <nav className="flex space-x-8 mb-8 overflow-x-auto whitespace-nowrap">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
