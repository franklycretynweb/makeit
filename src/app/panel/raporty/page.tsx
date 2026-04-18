"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Globe, MousePointerClick, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getProjectForUser } from "@/lib/utils/project";
import { formatMonth } from "@/lib/utils/date";

interface Keyword {
  keyword: string;
  page: string;
  position: number;
  prev: number;
  change: number;
  volume: number;
  ctr: number;
}

interface TopPage {
  page: string;
  title: string;
  clicks: number;
  impressions: number;
}

interface Recommendation {
  n: string;
  impact: string;
  title: string;
  description: string;
}

interface SeoReport {
  id: string;
  report_month: string;
  organic_sessions: number | null;
  gsc_clicks: number | null;
  gsc_impressions: number | null;
  sessions_prev: number | null;
  clicks_prev: number | null;
  impressions_prev: number | null;
  keywords: Keyword[];
  top_pages: TopPage[];
  recommendations: Recommendation[];
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

function fmtNum(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("pl-PL");
}

function fmtDelta(curr: number | null, prev: number | null): string {
  if (curr == null || prev == null) return "";
  const diff = curr - prev;
  return diff >= 0 ? `↑ +${fmtNum(diff)} vs poprzedni msc` : `↓ ${fmtNum(diff)} vs poprzedni msc`;
}

export default function RaportyPage() {
  const [reports, setReports] = useState<SeoReport[]>([]);
  const [activeMonth, setActiveMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const project = await getProjectForUser(supabase);
      if (!project) { setLoading(false); return; }

      const { data } = await supabase
        .from("seo_reports")
        .select("*")
        .eq("project_id", project.id)
        .order("report_month", { ascending: true });

      const rows = (data ?? []) as SeoReport[];
      setReports(rows);
      setActiveMonth(Math.max(rows.length - 1, 0));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1060px] flex flex-col gap-5 animate-pulse">
        <div className="h-8 bg-[#F0F0F0] rounded w-40" />
        <div className="h-28 bg-[#F0F0F0] rounded-xl" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="max-w-[1060px] flex flex-col gap-5">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">
            Raport SEO
          </h1>
        </div>
        <div className="rounded-xl border border-[#EBEBEB] bg-white p-12 text-center">
          <p className="font-sans text-[14px] text-[#AAAAAA]">Brak danych SEO</p>
          <p className="font-sans text-[13px] text-[#CCCCCC] mt-1">
            Agencja doda raport po uruchomieniu strony.
          </p>
        </div>
      </div>
    );
  }

  const report = reports[activeMonth];
  const topKeywords = (report?.keywords ?? []) as Keyword[];
  const topPages = (report?.top_pages ?? []) as TopPage[];
  const recommendations = (report?.recommendations ?? []) as Recommendation[];
  const months = reports.map((r) => formatMonth(r.report_month));

  const trafficStats = [
    {
      icon: Globe,
      label: "Sesje organiczne",
      value: fmtNum(report?.organic_sessions ?? null),
      sub: fmtDelta(report?.organic_sessions ?? null, report?.sessions_prev ?? null),
    },
    {
      icon: MousePointerClick,
      label: "Kliknięcia GSC",
      value: fmtNum(report?.gsc_clicks ?? null),
      sub: fmtDelta(report?.gsc_clicks ?? null, report?.clicks_prev ?? null),
    },
    {
      icon: Search,
      label: "Wyświetlenia",
      value: fmtNum(report?.gsc_impressions ?? null),
      sub: fmtDelta(report?.gsc_impressions ?? null, report?.impressions_prev ?? null),
    },
  ];

  const improved = topKeywords.filter((k) => k.change > 0).length;
  const declined = topKeywords.filter((k) => k.change < 0).length;

  return (
    <div className="max-w-[1060px] flex flex-col gap-5">

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">
            Raport SEO
          </h1>
          <p className="font-sans text-[14px] text-[#888888] mt-0.5">
            {improved} słów kluczowych wzrosło · {declined} spadło · {months[activeMonth]}
          </p>
        </div>
        {/* Period switcher */}
        {months.length > 1 && (
          <div className="flex gap-0.5 bg-[#F0F0F0] rounded-lg p-0.5">
            {months.map((m, i) => (
              <button
                key={m}
                onClick={() => setActiveMonth(i)}
                className={`font-sans text-[13px] font-medium px-4 py-1.5 rounded-md transition-all duration-150 ${
                  i === activeMonth
                    ? "bg-white text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "text-[#888888] hover:text-[#111111]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Traffic stats */}
      <motion.div {...fadeUp(0.05)}>
        <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-[#F5F5F5]">
            {trafficStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-md bg-[#F5F5F5] border border-[#EBEBEB] flex items-center justify-center">
                      <Icon size={14} strokeWidth={1.75} color="#555555" />
                    </div>
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA]">
                      {stat.label}
                    </span>
                  </div>
                  <p className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111] leading-none">
                    {stat.value}
                  </p>
                  {stat.sub && (
                    <p className="font-sans text-[12px] text-[#555555] mt-1.5">
                      {stat.sub}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Keywords table */}
      {topKeywords.length > 0 && (
        <motion.div {...fadeUp(0.1)}>
          <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F5F5F5] flex items-center justify-between">
              <h2 className="font-sans text-[13px] font-semibold text-[#111111]">
                Top słowa kluczowe
              </h2>
              <span className="font-sans text-[11px] text-[#AAAAAA]">
                Google Search Console · {months[activeMonth]}
              </span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F5F5F5]">
                  {[
                    { label: "Słowo kluczowe", align: "left",  cls: "pl-6" },
                    { label: "Podstrona",       align: "left",  cls: "px-4" },
                    { label: "Pozycja",         align: "center",cls: "px-4" },
                    { label: "Zmiana",          align: "center",cls: "px-4" },
                    { label: "CTR",             align: "center",cls: "px-4" },
                    { label: "Wyszukiwania",    align: "right", cls: "pr-6" },
                  ].map(({ label, align, cls }) => (
                    <th
                      key={label}
                      className={`font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA] py-3 ${cls} text-${align}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topKeywords.map((kw) => {
                  const isTop3 = kw.position <= 3;
                  const isTop10 = kw.position <= 10;
                  return (
                    <tr
                      key={kw.keyword}
                      className="border-b border-[#F7F7F7] last:border-0 hover:bg-[#FAFAFA] transition-colors duration-100"
                    >
                      <td className="pl-6 py-3.5 font-sans text-[13px] font-medium text-[#111111]">
                        {kw.keyword}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-sans text-[11px] font-medium text-[#AAAAAA] bg-[#F5F5F5] px-2 py-0.5 rounded-md">
                          {kw.page}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-display font-bold tracking-tight ${
                          isTop3
                            ? "text-[18px] text-[#111111]"
                            : isTop10
                            ? "text-[15px] text-[#444444]"
                            : "text-[14px] text-[#888888]"
                        }`}>
                          {kw.position}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {kw.change > 0 ? (
                          <span className="inline-flex items-center gap-0.5 font-sans text-[12px] font-semibold text-[#333333]">
                            <TrendingUp size={12} strokeWidth={2.5} />
                            +{kw.change}
                          </span>
                        ) : kw.change < 0 ? (
                          <span className="inline-flex items-center gap-0.5 font-sans text-[12px] font-medium text-[#AAAAAA]">
                            <TrendingDown size={12} strokeWidth={2} />
                            {kw.change}
                          </span>
                        ) : (
                          <span className="font-sans text-[12px] text-[#DDDDDD]">
                            <Minus size={12} strokeWidth={2} />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-sans text-[13px] font-medium text-[#555555]">
                          {kw.ctr}%
                        </span>
                      </td>
                      <td className="pr-6 py-3.5 text-right font-sans text-[13px] text-[#888888]">
                        {kw.volume.toLocaleString("pl-PL")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Bottom row */}
      {(recommendations.length > 0 || topPages.length > 0) && (
        <motion.div {...fadeUp(0.15)} className="grid grid-cols-[1fr_300px] gap-5 items-start">

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F5F5F5]">
                <h2 className="font-sans text-[13px] font-semibold text-[#111111]">
                  Rekomendacje
                </h2>
              </div>
              <ul className="divide-y divide-[#F7F7F7]">
                {recommendations.map((rec) => (
                  <li key={rec.n} className="flex items-start gap-4 px-6 py-4 hover:bg-[#FAFAFA] transition-colors duration-100">
                    <span className="shrink-0 font-display text-[18px] font-bold tracking-tight text-[#EBEBEB] w-6 text-right leading-tight mt-0.5">
                      {rec.n}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-sans text-[13px] font-semibold text-[#111111]">
                          {rec.title}
                        </p>
                        <span className="font-sans text-[10px] font-semibold text-[#AAAAAA] bg-[#F5F5F5] border border-[#EBEBEB] rounded-md px-1.5 py-0.5 shrink-0">
                          {rec.impact}
                        </span>
                      </div>
                      <p className="font-sans text-[12px] text-[#888888] leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Top organic pages */}
          {topPages.length > 0 && (
            <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#F5F5F5]">
                <h2 className="font-sans text-[13px] font-semibold text-[#111111]">
                  Top stron organicznych
                </h2>
              </div>
              <ul className="divide-y divide-[#F7F7F7]">
                {topPages.map((p, i) => {
                  const maxClicks = topPages[0].clicks;
                  const barW = Math.round((p.clicks / maxClicks) * 100);
                  return (
                    <li key={p.page} className="px-5 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-sans text-[11px] font-bold text-[#DDDDDD] w-4 shrink-0">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="font-sans text-[12px] font-semibold text-[#111111] truncate">
                              {p.title}
                            </p>
                            <p className="font-sans text-[10px] text-[#AAAAAA]">{p.page}</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right ml-2">
                          <p className="font-display text-[14px] font-bold text-[#111111]">
                            {p.clicks}
                          </p>
                          <p className="font-sans text-[10px] text-[#AAAAAA]">kliknięć</p>
                        </div>
                      </div>
                      <div className="h-[2px] w-full rounded-full bg-[#F0F0F0] overflow-hidden">
                        <div
                          className="h-full bg-[#111111] rounded-full"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
