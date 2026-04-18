"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Palette, FileText, MessageSquare, Layers, Zap } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getProjectForUser } from "@/lib/utils/project";

type DecisionType = "approval" | "color" | "document" | "message" | "design" | "launch";

interface Decision {
  id: string;
  type: DecisionType;
  title: string;
  description: string;
  author: string;
  author_initials: string;
  is_agency: boolean;
  decision_date: string;
  link?: string;
}

// Single neutral style — icon shape communicates type, color adds nothing
const typeIcon: Record<DecisionType, typeof Check> = {
  approval: Check,
  color: Palette,
  document: FileText,
  message: MessageSquare,
  design: Layers,
  launch: Zap,
};

const allFilters = ["Wszystkie", "Zatwierdzenia", "Design", "Dokumenty", "Komunikacja"] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function HistoriaPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [filter, setFilter] = useState<(typeof allFilters)[number]>("Wszystkie");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const project = await getProjectForUser(supabase);
      if (!project) return;

      const { data } = await supabase
        .from("project_decisions")
        .select("*")
        .eq("project_id", project.id)
        .order("decision_date", { ascending: false });

      setDecisions(data ?? []);
    };
    load();
  }, []);

  const filtered = filter === "Wszystkie"
    ? decisions
    : decisions.filter((d) => {
        if (filter === "Zatwierdzenia") return d.type === "approval";
        if (filter === "Design") return d.type === "design" || d.type === "color";
        if (filter === "Dokumenty") return d.type === "document";
        if (filter === "Komunikacja") return d.type === "message";
        return true;
      });

  return (
    <div className="max-w-[800px] flex flex-col gap-6">

      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">
          Historia decyzji
        </h1>
        <p className="font-sans text-[14px] text-[#888888] mt-0.5">
          Pełny zapis wszystkich kluczowych decyzji projektowych.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div {...fadeUp(0.04)} className="flex gap-1.5">
        {allFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-sans text-[13px] font-medium px-4 py-1.5 rounded-lg transition-all duration-150 ${
              f === filter
                ? "bg-[#111111] text-white"
                : "text-[#666666] bg-white border border-[#EBEBEB] hover:border-[#CCCCCC] hover:text-[#111111]"
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* Timeline */}
      <motion.div {...fadeUp(0.08)} className="relative">
        {/* Vertical connector */}
        <div className="absolute left-[17px] top-5 bottom-5 w-px bg-[#EBEBEB]" />

        <div className="flex flex-col">
          {filtered.map((decision, i) => {
            const Icon = typeIcon[decision.type];
            return (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.06 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="relative pl-12 pb-5 last:pb-0"
              >
                {/* Icon node — neutral, all same */}
                <div className="absolute left-0 top-0 w-[34px] h-[34px] rounded-lg bg-white border border-[#EBEBEB] flex items-center justify-center z-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <Icon size={15} strokeWidth={1.75} color="#888888" />
                </div>

                {/* Card */}
                <div className="rounded-xl border border-[#EBEBEB] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-[#CCCCCC] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="font-sans text-[14px] font-semibold text-[#111111] leading-snug">
                      {decision.title}
                    </h3>
                    <span className="font-sans text-[11px] text-[#AAAAAA] whitespace-nowrap shrink-0 pt-0.5">
                      {new Date(decision.decision_date).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="font-sans text-[13px] text-[#666666] leading-relaxed mb-3.5">
                    {decision.description}
                  </p>
                  <div className="flex items-center justify-between">
                    {/* Author */}
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        decision.is_agency
                          ? "bg-[#111111]"
                          : "bg-[#F0F0F0] border border-[#E5E5E5]"
                      }`}>
                        <span className={`font-sans text-[7px] font-bold ${
                          decision.is_agency ? "text-white" : "text-[#555555]"
                        }`}>
                          {decision.author_initials}
                        </span>
                      </div>
                      <span className="font-sans text-[12px] text-[#AAAAAA]">
                        {decision.author}
                      </span>
                    </div>

                    {/* Link */}
                    {decision.link && (
                      <Link
                        href={decision.link}
                        className="font-sans text-[12px] font-medium text-[#888888] hover:text-[#111111] underline underline-offset-2 transition-colors duration-150"
                      >
                        Zobacz szczegóły
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
