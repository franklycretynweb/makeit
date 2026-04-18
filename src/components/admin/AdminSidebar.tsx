"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, FolderOpen, Zap, MessageSquare,
  FileEdit, PenLine, BookOpen, Activity, BarChart3,
  ChevronLeft, ChevronRight, ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import logoSrc from "../../../public/logo/logo_makeit.webp";
import { createClient } from "@/lib/supabase/client";

const navGroups = [
  {
    label: "Przegląd",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    ],
  },
  {
    label: "Klienci",
    items: [
      { icon: Users,      label: "Klienci",   href: "/admin/klienci" },
      { icon: FolderOpen, label: "Projekty",   href: "/admin/projekty" },
    ],
  },
  {
    label: "Zarządzanie",
    items: [
      { icon: Zap,          label: "Akcje",       href: "/admin/akcje" },
      { icon: MessageSquare,label: "Wiadomości",  href: "/admin/wiadomosci" },
      { icon: FileEdit,     label: "Zgłoszenia",  href: "/admin/zgloszenia" },
    ],
  },
  {
    label: "Treści",
    items: [
      { icon: PenLine,  label: "Design",   href: "/admin/design" },
      { icon: BookOpen, label: "Decyzje",  href: "/admin/decyzje" },
    ],
  },
  {
    label: "Dane",
    items: [
      { icon: Activity,  label: "Monitoring", href: "/admin/monitoring" },
      { icon: BarChart3, label: "SEO",         href: "/admin/seo" },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [adminName, setAdminName] = useState("");
  const [initials, setInitials] = useState("A");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("first_name, company_name")
        .eq("id", user.id)
        .single();
      const name = data?.first_name || data?.company_name || user.email || "";
      const short = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
      setAdminName(name.split(" ")[0] ?? name);
      setInitials(short || "A");
    };
    load();
  }, []);

  return (
    <aside
      className={`h-screen fixed left-0 top-0 z-40 flex flex-col bg-[#111111] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        collapsed ? "w-[64px]" : "w-[240px]"
      }`}
    >
      {/* Logo row */}
      <div className={`flex items-center h-[56px] shrink-0 border-b border-white/[0.06] ${collapsed ? "justify-center px-0" : "justify-between px-5"}`}>
        <Link href="/admin" className="flex items-center min-w-0">
          <Image
            src={logoSrc}
            alt="make it."
            className={`object-contain invert ${collapsed ? "h-6 w-auto" : "h-7 w-auto"}`}
            height={28}
          />
        </Link>
        {!collapsed && (
          <button onClick={onToggle} className="w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-white/50 transition-colors duration-150">
            <ChevronLeft size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden pt-4 ${collapsed ? "px-2" : "px-3"}`}>
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 select-none">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

                return (
                  <li key={item.label} title={collapsed ? item.label : undefined}>
                    <Link
                      href={item.href}
                      className={`relative flex items-center transition-colors duration-150 ${
                        collapsed
                          ? `w-10 h-10 mx-auto justify-center rounded-lg ${isActive ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60 hover:bg-white/5"}`
                          : `gap-2.5 px-3 py-2 rounded-lg ${isActive ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`
                      }`}
                    >
                      {isActive && !collapsed && (
                        <motion.div
                          layoutId="admin-nav-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full bg-white"
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                      <Icon size={16} strokeWidth={isActive ? 2.5 : 1.75} className="shrink-0" />
                      {!collapsed && (
                        <span className="font-sans text-[13px] font-medium leading-none">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className={`border-t border-white/[0.06] ${collapsed ? "px-2 py-4" : "px-4 py-4"}`}>
        {/* Back to client panel */}
        <Link
          href="/panel"
          title={collapsed ? "Panel klienta" : undefined}
          className={`flex items-center gap-2 mb-3 text-white/30 hover:text-white/60 transition-colors duration-150 ${collapsed ? "justify-center" : ""}`}
        >
          <ArrowLeft size={13} strokeWidth={2} className="shrink-0" />
          {!collapsed && <span className="font-sans text-[11px]">Panel klienta</span>}
        </Link>

        {/* Admin info */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2 min-w-0"}`}>
          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
            <span className="font-sans text-[9px] font-bold text-white/60">{initials}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-sans text-[11px] font-medium text-white/55 truncate">{adminName}</p>
              <p className="font-sans text-[10px] text-white/25">Administrator</p>
            </div>
          )}
          {collapsed && (
            <button onClick={onToggle} className="w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-white/50 transition-colors duration-150 mt-1">
              <ChevronRight size={13} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
