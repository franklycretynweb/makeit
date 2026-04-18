"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const pageNames: Record<string, string> = {
  "/admin":             "Dashboard",
  "/admin/klienci":     "Klienci",
  "/admin/projekty":    "Projekty",
  "/admin/akcje":       "Akcje",
  "/admin/wiadomosci":  "Wiadomości",
  "/admin/zgloszenia":  "Zgłoszenia",
  "/admin/design":      "Design",
  "/admin/decyzje":     "Decyzje",
  "/admin/monitoring":  "Monitoring",
  "/admin/seo":         "SEO",
};

export default function AdminTopBar() {
  const pathname = usePathname();
  const pageName = pageNames[pathname] || "Admin";

  return (
    <header className="h-[56px] px-8 flex items-center justify-between shrink-0 border-b border-[#EBEBEB] bg-[#F7F7F8]">
      <nav className="flex items-center gap-1.5 font-sans text-[13px]">
        <Link href="/admin" className="text-[#999999] hover:text-[#666666] transition-colors duration-150">
          Admin
        </Link>
        {pathname !== "/admin" && (
          <>
            <span className="text-[#DEDEDE]">/</span>
            <span className="font-medium text-[#111111]">{pageName}</span>
          </>
        )}
      </nav>

      <div className="flex items-center gap-2">
        <span className="font-sans text-[11px] font-semibold text-[#AAAAAA] bg-[#F0F0F0] border border-[#E5E5E5] px-2.5 py-1 rounded-md">
          Panel administracyjny
        </span>
      </div>
    </header>
  );
}
