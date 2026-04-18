"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const pageNames: Record<string, string> = {
  "/panel": "Dashboard",
  "/panel/design-review": "Design Review",
  "/panel/pliki": "Pliki & Deliverables",
  "/panel/wiadomosci": "Wiadomosci",
  "/panel/historia": "Historia decyzji",
  "/panel/monitoring": "Monitoring & Uptime",
  "/panel/raporty": "Raporty SEO",
  "/panel/zgloszenia": "Zgloszenia zmian",
  "/panel/platnosci": "Płatności",
};

export default function PanelTopBar() {
  const pathname = usePathname();
  const pageName = pageNames[pathname] || "Panel";
  const [displayName, setDisplayName] = useState("");
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("id", user.id)
        .single();

      const name = profile?.company_name ?? user.email ?? "";
      const short = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
      const label = name.split(" ")[0] ?? name;
      setDisplayName(label);
      setInitials(short || "?");
    };
    load();
  }, []);

  return (
    <header className="h-[56px] px-8 flex items-center justify-between shrink-0 border-b border-[#EBEBEB] bg-[#F7F7F8]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 font-sans text-[13px]">
        <Link href="/panel" className="text-[#999999] hover:text-[#666666] transition-colors duration-150">
          Panel
        </Link>
        {pathname !== "/panel" && (
          <>
            <span className="text-[#DEDEDE]">/</span>
            <span className="font-medium text-[#111111]">{pageName}</span>
          </>
        )}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#AAAAAA] hover:text-[#666666] hover:bg-black/[0.04] transition-all duration-150">
          <Search size={15} strokeWidth={1.75} />
        </button>

        <Link href="/panel/wiadomosci" className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[#AAAAAA] hover:text-[#666666] hover:bg-black/[0.04] transition-all duration-150">
          <Bell size={15} strokeWidth={1.75} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#111111]" />
        </Link>

        <div className="w-px h-4 bg-[#EBEBEB] mx-1" />

        <Link href="/panel/konto" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] transition-all duration-150">
          <div className="w-6 h-6 rounded-full bg-[#111111] flex items-center justify-center">
            <span className="font-sans text-[8px] font-bold text-white">{initials}</span>
          </div>
          {displayName && (
            <span className="font-sans text-[13px] font-medium text-[#333333]">{displayName}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
