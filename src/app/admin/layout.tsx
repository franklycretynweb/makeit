"use client";

import { useState } from "react";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const ready = useAdminGuard();
  const [collapsed, setCollapsed] = useState(false);

  if (!ready) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F8]">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          collapsed ? "ml-[64px]" : "ml-[240px]"
        }`}
      >
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1100px] mx-auto px-8 pt-6 pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
