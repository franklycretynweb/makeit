"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, MonitorSmartphone, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getProjectForUser } from "@/lib/utils/project";

interface Snapshot {
  snapshot_date: string;
  uptime_status: number;
  lcp_ms: number | null;
  inp_ms: number | null;
  cls_value: number | null;
  lighthouse_perf: number | null;
  lighthouse_acc: number | null;
  lighthouse_bp: number | null;
  lighthouse_seo: number | null;
  response_time_ms: number | null;
  mobile_score: number | null;
  ssl_expiry_date: string | null;
}

interface LighthouseRow {
  date: string;
  perf: number;
  acc: number;
  bp: number;
  seo: number;
}

function groupByMonth(snapshots: Snapshot[]): LighthouseRow[] {
  const map = new Map<string, Snapshot>();
  for (const s of snapshots) {
    const monthKey = s.snapshot_date.slice(0, 7); // "2026-04"
    map.set(monthKey, s); // last in wins (sorted asc)
  }
  return Array.from(map.entries()).map(([key, s]) => ({
    date: new Date(key + "-01").toLocaleDateString("pl-PL", { month: "short", year: "numeric" }),
    perf: s.lighthouse_perf ?? 0,
    acc: s.lighthouse_acc ?? 0,
    bp: s.lighthouse_bp ?? 0,
    seo: s.lighthouse_seo ?? 0,
  }));
}

function getDelta(
  arr: LighthouseRow[],
  key: keyof Omit<LighthouseRow, "date">
): number {
  if (arr.length < 2) return 0;
  return arr[arr.length - 1][key] - arr[arr.length - 2][key];
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function MonitoringPage() {
  const [domain, setDomain] = useState<string | null>(null);
  const [uptimeDays, setUptimeDays] = useState<number[]>([]);
  const [vitals, setVitals] = useState<
    { label: string; fullLabel: string; value: string; target: string; percent: number }[]
  >([]);
  const [lighthouseHistory, setLighthouseHistory] = useState<LighthouseRow[]>([]);
  const [quickStats, setQuickStats] = useState<
    { icon: typeof Eye; label: string; value: string; sub: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const project = await getProjectForUser(supabase);
      if (!project) { setLoading(false); return; }

      setDomain(project.domain ?? null);

      const { data: snapshots30 } = await supabase
        .from("monitoring_snapshots")
        .select("*")
        .eq("project_id", project.id)
        .order("snapshot_date", { ascending: false })
        .limit(30);

      const rows = snapshots30 ?? [];
      setUptimeDays(rows.map((s) => s.uptime_status).reverse());

      const latest = rows[0];
      if (latest) {
        setVitals([
          {
            label: "LCP",
            fullLabel: "Largest Contentful Paint",
            value: latest.lcp_ms ? `${(latest.lcp_ms / 1000).toFixed(1)}s` : "—",
            target: "< 2.5s",
            percent: latest.lcp_ms ? Math.min(Math.round((2500 / latest.lcp_ms) * 48), 100) : 0,
          },
          {
            label: "INP",
            fullLabel: "Interaction to Next Paint",
            value: latest.inp_ms ? `${latest.inp_ms}ms` : "—",
            target: "< 200ms",
            percent: latest.inp_ms ? Math.min(Math.round((200 / latest.inp_ms) * 42), 100) : 0,
          },
          {
            label: "CLS",
            fullLabel: "Cumulative Layout Shift",
            value: latest.cls_value != null ? `${latest.cls_value}` : "—",
            target: "< 0.1",
            percent: latest.cls_value != null ? Math.min(Math.round((1 - latest.cls_value / 0.1) * 100), 100) : 0,
          },
        ]);

        const sslSub = latest.ssl_expiry_date
          ? `ważny do ${new Date(latest.ssl_expiry_date).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" })}`
          : "brak danych";

        setQuickStats([
          {
            icon: Eye,
            label: "Czas odpowiedzi",
            value: latest.response_time_ms ? `${latest.response_time_ms}ms` : "—",
            sub: "ostatni snapshot",
          },
          {
            icon: MonitorSmartphone,
            label: "Mobile score",
            value: latest.mobile_score ? `${latest.mobile_score}/100` : "—",
            sub: "PageSpeed Insights",
          },
          {
            icon: Globe,
            label: "SSL certyfikat",
            value: latest.ssl_expiry_date ? "Aktywny" : "—",
            sub: sslSub,
          },
        ]);
      }

      // Lighthouse history — all snapshots with at least one lighthouse score
      const { data: allSnaps } = await supabase
        .from("monitoring_snapshots")
        .select("snapshot_date, lighthouse_perf, lighthouse_acc, lighthouse_bp, lighthouse_seo, uptime_status, lcp_ms, inp_ms, cls_value, response_time_ms, mobile_score, ssl_expiry_date")
        .eq("project_id", project.id)
        .not("lighthouse_perf", "is", null)
        .order("snapshot_date", { ascending: true });

      if (allSnaps && allSnaps.length > 0) {
        setLighthouseHistory(groupByMonth(allSnaps as Snapshot[]));
      }

      setLoading(false);
    };
    load();
  }, []);

  const uptimePercent = uptimeDays.length > 0
    ? ((uptimeDays.filter((d) => d === 1).length / uptimeDays.length) * 100).toFixed(1)
    : "—";
  const degradedCount = uptimeDays.filter((d) => d === 0.5).length;

  if (loading) {
    return (
      <div className="max-w-[1060px] flex flex-col gap-5">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#F0F0F0] rounded w-48" />
          <div className="h-36 bg-[#F0F0F0] rounded-xl" />
        </div>
      </div>
    );
  }

  if (uptimeDays.length === 0 && vitals.length === 0) {
    return (
      <div className="max-w-[1060px] flex flex-col gap-5">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">
            Monitoring & Uptime
          </h1>
          {domain && (
            <p className="font-sans text-[14px] text-[#888888] mt-0.5">{domain}</p>
          )}
        </div>
        <div className="rounded-xl border border-[#EBEBEB] bg-white p-12 text-center">
          <p className="font-sans text-[14px] text-[#AAAAAA]">Brak danych monitoringu</p>
          <p className="font-sans text-[13px] text-[#CCCCCC] mt-1">
            Agencja doda dane po uruchomieniu strony.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1060px] flex flex-col gap-5">

      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">
          Monitoring & Uptime
        </h1>
        {domain && (
          <p className="font-sans text-[14px] text-[#888888] mt-0.5">
            {domain} — dane z snapshots
          </p>
        )}
      </motion.div>

      {/* Uptime hero */}
      {uptimeDays.length > 0 && (
        <motion.div {...fadeUp(0.05)}>
          <div className="rounded-xl bg-[#111111] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/[0.07] border border-white/10 flex items-center justify-center">
                  <Shield size={18} strokeWidth={1.75} color="rgba(255,255,255,0.6)" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white/70" />
                    <span className="font-sans text-[14px] font-medium text-white/80">
                      Strona działa poprawnie
                    </span>
                  </div>
                  {domain && (
                    <p className="font-sans text-[12px] text-white/30 mt-0.5">{domain}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-[40px] font-bold tracking-[-0.05em] text-white leading-none">
                  {uptimePercent}%
                </p>
                <p className="font-sans text-[11px] text-white/30 mt-1">
                  uptime · ostatnie {uptimeDays.length} dni
                  {degradedCount > 0 && (
                    <span className="ml-1.5 text-white/45">· {degradedCount} dzień degradacji</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-end gap-[3px] h-[40px]">
              {uptimeDays.map((day, i) => (
                <div
                  key={i}
                  title={`Dzień ${i + 1}: ${day === 1 ? "OK" : day === 0.5 ? "Degraded" : "Down"}`}
                  className="flex-1 rounded-[2px] transition-opacity duration-150 hover:opacity-60"
                  style={{
                    height: day === 1 ? "100%" : day === 0.5 ? "65%" : "25%",
                    background: day === 1
                      ? "rgba(255,255,255,0.35)"
                      : day === 0.5
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(255,255,255,0.08)",
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-sans text-[10px] text-white/20">{uptimeDays.length} dni temu</span>
              <span className="font-sans text-[10px] text-white/20">Dziś</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Core Web Vitals */}
      {vitals.length > 0 && (
        <motion.div {...fadeUp(0.1)}>
          <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F5F5F5]">
              <h2 className="font-sans text-[13px] font-semibold text-[#111111]">
                Core Web Vitals
              </h2>
              <p className="font-sans text-[12px] text-[#AAAAAA] mt-0.5">
                Ostatni pomiar
              </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-[#F5F5F5]">
              {vitals.map((v) => (
                <div key={v.label} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA]">
                      {v.label}
                    </span>
                    <span className="font-sans text-[10px] font-semibold text-[#555555] bg-[#F5F5F5] border border-[#EBEBEB] rounded-md px-2 py-0.5">
                      Dobry
                    </span>
                  </div>

                  <p className="font-display text-[32px] font-bold tracking-[-0.04em] text-[#111111] leading-none">
                    {v.value}
                  </p>
                  <p className="font-sans text-[11px] text-[#AAAAAA] mt-1 mb-4">
                    {v.fullLabel}
                  </p>

                  <div className="h-[3px] rounded-full bg-[#F0F0F0] overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${v.percent}%` }}
                      transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-[#111111] rounded-full"
                    />
                  </div>
                  <p className="font-sans text-[11px] text-[#AAAAAA] mt-1.5">
                    Cel: {v.target}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Lighthouse history + Quick stats */}
      {(lighthouseHistory.length > 0 || quickStats.length > 0) && (
        <motion.div {...fadeUp(0.15)} className="grid grid-cols-[1fr_280px] gap-5 items-start">

          {/* Lighthouse history table */}
          {lighthouseHistory.length > 0 && (
            <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F5F5F5]">
                <h2 className="font-sans text-[13px] font-semibold text-[#111111]">
                  Historia Lighthouse
                </h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F5F5F5]">
                    {["Miesiąc", "Performance", "Accessibility", "Best Practices", "SEO"].map((h) => (
                      <th
                        key={h}
                        className={`font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA] py-3 ${
                          h === "Miesiąc" ? "text-left px-6" : "text-center px-4"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lighthouseHistory.map((row, rowIdx) => {
                    const isLatest = rowIdx === lighthouseHistory.length - 1;
                    const scores = [row.perf, row.acc, row.bp, row.seo] as const;
                    const keys = ["perf", "acc", "bp", "seo"] as const;
                    return (
                      <tr
                        key={row.date}
                        className={`border-b border-[#F7F7F7] last:border-0 ${
                          isLatest ? "bg-[#FAFAFA]" : "hover:bg-[#FAFAFA]"
                        } transition-colors duration-100`}
                      >
                        <td className="px-6 py-3.5">
                          <span className={`font-sans text-[13px] font-medium ${
                            isLatest ? "text-[#111111]" : "text-[#555555]"
                          }`}>
                            {row.date}
                          </span>
                          {isLatest && (
                            <span className="ml-2 font-sans text-[10px] font-semibold text-[#AAAAAA] bg-[#F0F0F0] px-1.5 py-0.5 rounded-md">
                              Teraz
                            </span>
                          )}
                        </td>
                        {scores.map((score, i) => {
                          const delta = isLatest ? getDelta(lighthouseHistory, keys[i]) : null;
                          return (
                            <td key={i} className="text-center px-4 py-3.5">
                              <div className="inline-flex items-baseline gap-1">
                                <span className={`font-display text-[15px] font-bold tracking-tight ${
                                  isLatest ? "text-[#111111]" : "text-[#888888]"
                                }`}>
                                  {score}
                                </span>
                                {delta !== null && delta > 0 && (
                                  <span className="font-sans text-[10px] font-semibold text-[#888888]">
                                    +{delta}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick stats */}
          {quickStats.length > 0 && (
            <div className="flex flex-col gap-4">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-[#EBEBEB] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] border border-[#EBEBEB] flex items-center justify-center mb-3">
                      <Icon size={15} strokeWidth={1.75} color="#555555" />
                    </div>
                    <p className="font-display text-[22px] font-bold tracking-[-0.04em] text-[#111111] leading-none">
                      {stat.value}
                    </p>
                    <p className="font-sans text-[12px] font-medium text-[#555555] mt-1">
                      {stat.label}
                    </p>
                    <p className="font-sans text-[11px] text-[#AAAAAA] mt-0.5">
                      {stat.sub}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
