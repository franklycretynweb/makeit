"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProjectSelector from "@/components/admin/ProjectSelector";
import AdminModal from "@/components/admin/AdminModal";
import { formatMonth } from "@/lib/utils/date";

interface Report {
  id: string;
  report_month: string;
  organic_sessions: number | null;
  gsc_clicks: number | null;
  gsc_impressions: number | null;
}

const JSON_EXAMPLE = {
  keywords: `[
  {"keyword":"fraza kluczowa","page":"/","position":3,"prev":5,"change":2,"volume":1200,"ctr":24}
]`,
  top_pages: `[
  {"page":"/","title":"Strona główna","clicks":342,"impressions":4200}
]`,
  recommendations: `[
  {"n":"01","impact":"Wysoki","title":"Tytuł rekomendacji","description":"Opis co zrobić."}
]`,
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function AdminSeo() {
  const [projectId, setProjectId] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExample, setShowExample] = useState<string | null>(null);

  const monthRef = useRef<HTMLInputElement>(null);
  const sessionsRef = useRef<HTMLInputElement>(null);
  const clicksRef = useRef<HTMLInputElement>(null);
  const impressionsRef = useRef<HTMLInputElement>(null);
  const sessionsPrevRef = useRef<HTMLInputElement>(null);
  const clicksPrevRef = useRef<HTMLInputElement>(null);
  const impressionsPrevRef = useRef<HTMLInputElement>(null);
  const keywordsRef = useRef<HTMLTextAreaElement>(null);
  const pagesRef = useRef<HTMLTextAreaElement>(null);
  const recsRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("seo_reports").select("id, report_month, organic_sessions, gsc_clicks, gsc_impressions")
        .eq("project_id", projectId).order("report_month", { ascending: false });
      setReports(data ?? []);
    };
    load();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId || !monthRef.current?.value) return;
    setSaving(true);

    let keywords = [], topPages = [], recommendations = [];
    try { keywords = JSON.parse(keywordsRef.current?.value || "[]"); } catch {}
    try { topPages = JSON.parse(pagesRef.current?.value || "[]"); } catch {}
    try { recommendations = JSON.parse(recsRef.current?.value || "[]"); } catch {}

    const supabase = createClient();
    const { data } = await supabase.from("seo_reports").insert({
      project_id: projectId,
      report_month: monthRef.current.value + "-01",
      organic_sessions: sessionsRef.current?.value ? parseInt(sessionsRef.current.value) : null,
      gsc_clicks: clicksRef.current?.value ? parseInt(clicksRef.current.value) : null,
      gsc_impressions: impressionsRef.current?.value ? parseInt(impressionsRef.current.value) : null,
      sessions_prev: sessionsPrevRef.current?.value ? parseInt(sessionsPrevRef.current.value) : null,
      clicks_prev: clicksPrevRef.current?.value ? parseInt(clicksPrevRef.current.value) : null,
      impressions_prev: impressionsPrevRef.current?.value ? parseInt(impressionsPrevRef.current.value) : null,
      keywords,
      top_pages: topPages,
      recommendations,
    }).select("id, report_month, organic_sessions, gsc_clicks, gsc_impressions").single();

    if (data) setReports((prev) => [data as Report, ...prev]);
    setSaving(false);
    setShowModal(false);
  };

  return (
    <div className="max-w-[800px] flex flex-col gap-6">
      <motion.div {...fadeUp(0)} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">Raporty SEO</h1>
          <p className="font-sans text-[14px] text-[#888888] mt-0.5">Dodawaj miesięczne raporty SEO dla klientów.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#111111] hover:bg-[#2a2a2a] text-white font-sans text-[13px] font-medium px-4 py-2 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all"
        >
          <Plus size={14} strokeWidth={2.5} /> Dodaj raport
        </button>
      </motion.div>

      <motion.div {...fadeUp(0.04)}>
        <ProjectSelector value={projectId} onChange={setProjectId} />
      </motion.div>

      <motion.div {...fadeUp(0.08)}>
        <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F5F5F5]">
                {["Miesiąc", "Sesje organiczne", "Kliknięcia GSC", "Wyświetlenia"].map(h => (
                  <th key={h} className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA] py-3 px-4 text-left first:pl-6 last:pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 font-sans text-[13px] text-[#CCCCCC]">Brak raportów</td></tr>
              ) : reports.map((r) => (
                <tr key={r.id} className="border-b border-[#F7F7F7] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                  <td className="pl-6 pr-4 py-3.5 font-sans text-[13px] font-medium text-[#111111]">{formatMonth(r.report_month)}</td>
                  <td className="px-4 py-3.5 font-sans text-[13px] text-[#555555]">{r.organic_sessions?.toLocaleString("pl-PL") ?? "—"}</td>
                  <td className="px-4 py-3.5 font-sans text-[13px] text-[#555555]">{r.gsc_clicks?.toLocaleString("pl-PL") ?? "—"}</td>
                  <td className="pr-6 px-4 py-3.5 font-sans text-[13px] text-[#555555]">{r.gsc_impressions?.toLocaleString("pl-PL") ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AdminModal open={showModal} title="Nowy raport SEO" onClose={() => setShowModal(false)} width="max-w-[600px]"
        footer={
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-[#111111] hover:bg-[#2a2a2a] disabled:opacity-50 text-white font-sans text-[14px] font-medium py-2.5 rounded-lg transition-all"
          >
            {saving ? "Zapisuję..." : "Dodaj raport"}
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Miesiąc</label>
            <input ref={monthRef} type="month"
              className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA]"
            />
          </div>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA]">Ruch organiczny</p>
          <div className="grid grid-cols-3 gap-3">
            {[["Sesje", sessionsRef], ["Kliknięcia", clicksRef], ["Wyświetlenia", impressionsRef]].map(([l, ref]) => (
              <div key={l as string} className="flex flex-col gap-1">
                <label className="font-sans text-[11px] font-semibold text-[#888888]">{l as string}</label>
                <input ref={ref as React.RefObject<HTMLInputElement>} type="number" placeholder="0"
                  className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
                />
              </div>
            ))}
          </div>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA]">Poprzedni miesiąc (do delty)</p>
          <div className="grid grid-cols-3 gap-3">
            {[["Sesje prev", sessionsPrevRef], ["Kliknięcia prev", clicksPrevRef], ["Wyśw. prev", impressionsPrevRef]].map(([l, ref]) => (
              <div key={l as string} className="flex flex-col gap-1">
                <label className="font-sans text-[11px] font-semibold text-[#888888]">{l as string}</label>
                <input ref={ref as React.RefObject<HTMLInputElement>} type="number" placeholder="0"
                  className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
                />
              </div>
            ))}
          </div>

          {/* JSON fields */}
          {([["keywords", "Słowa kluczowe (JSON)", keywordsRef], ["top_pages", "Top strony (JSON)", pagesRef], ["recommendations", "Rekomendacje (JSON)", recsRef]] as [string, string, React.RefObject<HTMLTextAreaElement>][]).map(([key, label, ref]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-sans text-[12px] font-semibold text-[#555555]">{label}</label>
                <button onClick={() => setShowExample(showExample === key ? null : key)}
                  className="font-sans text-[11px] text-[#AAAAAA] hover:text-[#555555] flex items-center gap-1 transition-colors"
                >
                  {showExample === key ? <ChevronDown size={11} strokeWidth={2} /> : <ChevronRight size={11} strokeWidth={2} />} Przykład
                </button>
              </div>
              {showExample === key && (
                <pre className="font-mono text-[10px] bg-[#F5F5F5] rounded-lg p-3 text-[#555555] overflow-x-auto">{JSON_EXAMPLE[key as keyof typeof JSON_EXAMPLE]}</pre>
              )}
              <textarea ref={ref} rows={3} placeholder="[]"
                className="font-mono text-[11px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA] resize-none placeholder:text-[#CCCCCC]"
              />
            </div>
          ))}
        </div>
      </AdminModal>
    </div>
  );
}
