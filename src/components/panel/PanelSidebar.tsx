"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PenLine,
  FolderOpen,
  CreditCard,
  MessageSquare,
  History,
  ShieldCheck,
  BarChart3,
  FileEdit,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import logoSrc from "../../../public/logo/logo_makeit.webp";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navGroups = [
  {
    label: "Projekt",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/panel" },
      { icon: PenLine, label: "Design Review", href: "/panel/design-review" },
      { icon: FolderOpen, label: "Pliki", href: "/panel/pliki" },
      { icon: CreditCard, label: "Płatności", href: "/panel/platnosci" },
    ],
  },
  {
    label: "Komunikacja",
    items: [
      { icon: MessageSquare, label: "Wiadomosci", href: "/panel/wiadomosci" },
      { icon: History, label: "Historia", href: "/panel/historia" },
    ],
  },
  {
    label: "Po launchu",
    items: [
      { icon: ShieldCheck, label: "Monitoring",   href: "/panel/monitoring" },
      { icon: BarChart3,   label: "Raporty SEO",  href: "/panel/raporty" },
      { icon: FileEdit,    label: "Zgloszenia",   href: "/panel/zgloszenia" },
    ],
  },
  {
    label: "Konto",
    items: [
      { icon: Settings, label: "Moje konto", href: "/panel/konto" },
    ],
  },
];

const statusToPhase: Record<string, string> = {
  discovery: "Discovery",
  design: "Design",
  development: "Development",
  review: "Review",
  launch: "Launch",
  live: "Live",
};

interface PanelSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function PanelSidebar({ collapsed, onToggle }: PanelSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };
  const [phase, setPhase] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [initials, setInitials] = useState("?");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Rola z app_metadata — nie wymaga DB query, nie ma problemów z RLS
      if (user.app_metadata?.role === "admin") setIsAdmin(true);

      const [{ data: profile }, { data: project }] = await Promise.all([
        supabase.from("profiles").select("company_name").eq("id", user.id).single(),
        supabase.from("projects").select("progress, status").eq("client_id", user.id).single(),
      ]);

      if (profile?.company_name) {
        const name: string = profile.company_name;
        const short = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
        const short_name = name.length > 14 ? name.slice(0, 12) + "…" : name;
        setCompanyName(short_name);
        setInitials(short || "?");
      }

      if (project) {
        setProgress(project.progress ?? 0);
        setPhase(statusToPhase[project.status] ?? "");
      }
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
      <div
        className={`flex items-center h-[56px] shrink-0 border-b border-white/[0.06] ${
          collapsed ? "justify-center px-0" : "justify-between px-5"
        }`}
      >
        <Link href="/panel" className="flex items-center min-w-0">
          <Image
            src={logoSrc}
            alt="make it."
            className={`object-contain invert ${collapsed ? "h-6 w-auto" : "h-7 w-auto"}`}
            height={28}
          />
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-white/50 transition-colors duration-150"
          >
            <ChevronLeft size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav
        className={`flex-1 overflow-y-auto overflow-x-hidden pt-4 ${
          collapsed ? "px-2" : "px-3"
        }`}
        data-tour="sidebar"
      >
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 select-none">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/panel"
                    ? pathname === "/panel"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.label} title={collapsed ? item.label : undefined}>
                    <Link
                      href={item.href}
                      className={`relative flex items-center transition-colors duration-150 group ${
                        collapsed
                          ? `w-10 h-10 mx-auto justify-center rounded-lg ${
                              isActive
                                ? "bg-white/10 text-white"
                                : "text-white/35 hover:text-white/60 hover:bg-white/5"
                            }`
                          : `gap-2.5 px-3 py-2 rounded-lg ${
                              isActive
                                ? "bg-white/10 text-white"
                                : "text-white/40 hover:text-white/70 hover:bg-white/5"
                            }`
                      }`}
                    >
                      {isActive && !collapsed && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full bg-white"
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}

                      <Icon
                        size={16}
                        strokeWidth={isActive ? 2.5 : 1.75}
                        className="shrink-0"
                      />

                      {!collapsed && (
                        <span className="font-sans text-[13px] font-medium leading-none">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Admin link — widoczny tylko dla adminów */}
      {isAdmin && (
        <div className={`border-t border-white/[0.06] ${collapsed ? "px-2 py-3" : "px-4 py-3"}`}>
          <Link
            href="/admin"
            title={collapsed ? "Panel admina" : undefined}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-150 ${collapsed ? "w-10 h-10 mx-auto justify-center" : ""}`}
          >
            <ShieldCheck size={15} strokeWidth={1.75} className="shrink-0" />
            {!collapsed && <span className="font-sans text-[12px] font-medium">Panel admina</span>}
          </Link>
        </div>
      )}

      {/* Bottom */}
      <div
        className={`border-t border-white/[0.06] ${
          collapsed ? "px-2 py-4" : "px-4 py-4"
        }`}
      >
        {/* Progress ring */}
        {progress > 0 && (
          <div
            className={`flex items-center mb-4 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="relative w-8 h-8 shrink-0">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="14"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="2"
                />
                <circle
                  cx="18" cy="18" r="14"
                  fill="none"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 0.879} 87.9`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-sans text-[8px] font-bold text-white/50">
                {progress}
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-sans text-[11px] font-medium text-white/45 truncate">
                  Postęp projektu
                </p>
                {phase && (
                  <p className="font-sans text-[10px] text-white/25 truncate">
                    Faza: {phase}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Client + toggle + logout */}
        <div className={`flex items-center ${collapsed ? "justify-center flex-col gap-2" : "justify-between"}`}>
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2 min-w-0"}`}>
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
              <span className="font-sans text-[9px] font-bold text-white/60">{initials}</span>
            </div>
            {!collapsed && companyName && (
              <div className="min-w-0">
                <p className="font-sans text-[11px] font-medium text-white/55 truncate">
                  {companyName}
                </p>
              </div>
            )}
          </div>
          <div className={`flex items-center gap-1 ${collapsed ? "flex-col" : ""}`}>
            {collapsed ? (
              <>
                <button
                  onClick={onToggle}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-white/50 transition-colors duration-150"
                >
                  <ChevronRight size={13} strokeWidth={2} />
                </button>
                <button
                  onClick={handleLogout}
                  title="Wyloguj się"
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-white/50 transition-colors duration-150"
                >
                  <LogOut size={13} strokeWidth={2} />
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                title="Wyloguj się"
                className="flex items-center gap-1.5 font-sans text-[11px] text-white/30 hover:text-white/70 px-2 py-1 rounded-md hover:bg-white/5 transition-all duration-150"
              >
                <LogOut size={12} strokeWidth={2} />
                Wyloguj
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
