"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getProjectForUser } from "@/lib/utils/project";

const packages = [
  {
    id: "seo",
    name: "SEO",
    tagline: "Strona rośnie w Google",
    price: 499,
    dark: true,
    features: [
      "Hosting & obsługa domeny",
      "Backup dzienny",
      "2h zmian miesięcznie",
      "Miesięczny raport SEO",
      "Aktywna optymalizacja",
    ],
    cta: "Aktywuj SEO",
  },
  {
    id: "basic",
    name: "Basic",
    tagline: "Strona zawsze online",
    price: 299,
    dark: false,
    features: [
      "Hosting & obsługa domeny",
      "Backup dzienny",
      "2h zmian miesięcznie",
      "Aktualizacje bezpieczeństwa",
    ],
    cta: "Aktywuj Basic",
  },
] as const;

export default function MaintenanceUpsell() {
  const [domain, setDomain] = useState<string | null>(null);
  const [visits, setVisits] = useState(0);
  const [leads, setLeads] = useState(0);
  const [daysLive, setDaysLive] = useState(0);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const project = await getProjectForUser(supabase);
      if (!project) return;

      setDomain(project.domain ?? null);
      setVisits(project.visits_count ?? 0);
      setLeads(project.leads_count ?? 0);
      setDaysLive(
        Math.floor((Date.now() - new Date(project.created_at).getTime()) / 86400000)
      );
    };
    load();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3"
    >
      {/* Live domain indicator */}
      {domain && (
        <div className="flex items-center gap-2 px-1 mb-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#111111] opacity-40" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#111111]" />
          </span>
          <span className="font-sans text-[12px] font-medium text-[#111111] truncate">
            {domain}
          </span>
        </div>
      )}

      {/* Headline */}
      <div className="px-1 mb-1">
        <h3 className="font-display text-[20px] font-bold tracking-[-0.04em] text-[#111111] leading-tight mb-1.5">
          Kto o nią dba<br />po launchu?
        </h3>
        <p className="font-sans text-[12px] text-[#888888] leading-relaxed">
          {visits > 0
            ? `${visits} wizyt · ${leads} zapytani${leads === 1 ? "e" : "a"} w ${daysLive} dni. My pilnujemy — Wy budujecie.`
            : "My pilnujemy — Wy budujecie."}
        </p>
      </div>

      {/* Packages — stacked, SEO on top */}
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className={`rounded-2xl p-5 flex flex-col gap-4 ${
            pkg.dark
              ? "bg-[#111111] shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
              : "bg-white border border-[#EBEBEB] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
          }`}
        >
          {/* Price row */}
          <div>
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <span
                className={`font-display text-[32px] font-bold tracking-[-0.05em] leading-none ${
                  pkg.dark ? "text-white" : "text-[#111111]"
                }`}
              >
                {pkg.price}
              </span>
              <span
                className={`font-sans text-[13px] ${
                  pkg.dark ? "text-white/40" : "text-[#999999]"
                }`}
              >
                zł / msc
              </span>
              <span
                className={`font-sans text-[10px] font-bold uppercase tracking-[0.1em] ml-auto ${
                  pkg.dark ? "text-white/30" : "text-[#CCCCCC]"
                }`}
              >
                {pkg.name}
              </span>
            </div>
            <p
              className={`font-sans text-[12px] ${
                pkg.dark ? "text-white/50" : "text-[#888888]"
              }`}
            >
              {pkg.tagline}
            </p>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-2">
            {pkg.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check
                  size={12}
                  strokeWidth={2.5}
                  className={`shrink-0 mt-[2px] ${
                    pkg.dark ? "text-white/60" : "text-[#111111]"
                  }`}
                />
                <span
                  className={`font-sans text-[12px] leading-snug ${
                    pkg.dark ? "text-white/75" : "text-[#444444]"
                  }`}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            className={`w-full font-sans text-[13px] font-medium py-2.5 rounded-xl transition-colors duration-150 ${
              pkg.dark
                ? "bg-white text-[#111111] hover:bg-[#F0F0F0]"
                : "border border-[#CCCCCC] text-[#111111] hover:border-[#111111]"
            }`}
          >
            {pkg.cta}
          </button>
        </div>
      ))}

      {/* Escape hatch */}
      <p className="font-sans text-[12px] text-[#BBBBBB] text-center px-1">
        Masz pytania?{" "}
        <Link
          href="/panel/wiadomosci"
          className="text-[#888888] hover:text-[#111111] underline underline-offset-2 transition-colors duration-150 inline-flex items-center gap-0.5"
        >
          Napisz do nas
          <ArrowRight size={10} strokeWidth={2} />
        </Link>
      </p>
    </motion.div>
  );
}
