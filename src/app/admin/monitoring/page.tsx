"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProjectSelector from "@/components/admin/ProjectSelector";
import AdminModal from "@/components/admin/AdminModal";

interface Snapshot {
  id: string;
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

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function AdminMonitoring() {
  const [projectId, setProjectId] = useState("");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uptime, setUptime] = useState<"1" | "0.5" | "0">("1");

  const dateRef = useRef<HTMLInputElement>(null);
  const lcpRef = useRef<HTMLInputElement>(null);
  const inpRef = useRef<HTMLInputElement>(null);
  const clsRef = useRef<HTMLInputElement>(null);
  const perfRef = useRef<HTMLInputElement>(null);
  const accRef = useRef<HTMLInputElement>(null);
  const bpRef = useRef<HTMLInputElement>(null);
  const seoRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const sslRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("monitoring_snapshots").select("*")
        .eq("project_id", projectId).order("snapshot_date", { ascending: false }).limit(10);
      setSnapshots(data ?? []);
    };
    load();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId || !dateRef.current?.value) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.from("monitoring_snapshots").insert({
      project_id: projectId,
      snapshot_date: dateRef.current.value,
      uptime_status: parseFloat(uptime),
      lcp_ms: lcpRef.current?.value ? parseInt(lcpRef.current.value) : null,
      inp_ms: inpRef.current?.value ? parseInt(inpRef.current.value) : null,
      cls_value: clsRef.current?.value ? parseFloat(clsRef.current.value) : null,
      lighthouse_perf: perfRef.current?.value ? parseInt(perfRef.current.value) : null,
      lighthouse_acc: accRef.current?.value ? parseInt(accRef.current.value) : null,
      lighthouse_bp: bpRef.current?.value ? parseInt(bpRef.current.value) : null,
      lighthouse_seo: seoRef.current?.value ? parseInt(seoRef.current.value) : null,
      response_time_ms: responseRef.current?.value ? parseInt(responseRef.current.value) : null,
      mobile_score: mobileRef.current?.value ? parseInt(mobileRef.current.value) : null,
      ssl_expiry_date: sslRef.current?.value || null,
    }).select().single();
    if (data) setSnapshots((prev) => [data as Snapshot, ...prev]);
    setSaving(false);
    setShowModal(false);
  };

  return (
    <div className="max-w-[1060px] flex flex-col gap-6">
      <motion.div {...fadeUp(0)} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">Monitoring</h1>
          <p className="font-sans text-[14px] text-[#888888] mt-0.5">Dodawaj dzienne snapshoty monitoringu.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#111111] hover:bg-[#2a2a2a] text-white font-sans text-[13px] font-medium px-4 py-2 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all"
        >
          <Plus size={14} strokeWidth={2.5} /> Dodaj snapshot
        </button>
      </motion.div>

      <motion.div {...fadeUp(0.04)}>
        <ProjectSelector value={projectId} onChange={setProjectId} />
      </motion.div>

      <motion.div {...fadeUp(0.08)}>
        <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#F5F5F5]">
                {["Data", "Uptime", "LCP", "INP", "CLS", "Perf", "Acc", "BP", "SEO", "Response", "Mobile"].map(h => (
                  <th key={h} className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA] py-3 px-3 text-left first:pl-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshots.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-10 font-sans text-[13px] text-[#CCCCCC]">Brak danych</td></tr>
              ) : snapshots.map((s) => (
                <tr key={s.id} className="border-b border-[#F7F7F7] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                  <td className="pl-6 pr-3 py-3 font-sans text-[12px] font-medium text-[#111111] whitespace-nowrap">{s.snapshot_date}</td>
                  <td className="px-3 py-3">
                    <span className={`font-sans text-[11px] font-semibold px-2 py-0.5 rounded-md ${s.uptime_status === 1 ? "bg-green-50 text-green-700" : s.uptime_status === 0.5 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                      {s.uptime_status === 1 ? "OK" : s.uptime_status === 0.5 ? "Degraded" : "Down"}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-sans text-[12px] text-[#555555]">{s.lcp_ms ? `${s.lcp_ms}ms` : "—"}</td>
                  <td className="px-3 py-3 font-sans text-[12px] text-[#555555]">{s.inp_ms ? `${s.inp_ms}ms` : "—"}</td>
                  <td className="px-3 py-3 font-sans text-[12px] text-[#555555]">{s.cls_value ?? "—"}</td>
                  <td className="px-3 py-3 font-sans text-[12px] font-medium text-[#111111]">{s.lighthouse_perf ?? "—"}</td>
                  <td className="px-3 py-3 font-sans text-[12px] text-[#555555]">{s.lighthouse_acc ?? "—"}</td>
                  <td className="px-3 py-3 font-sans text-[12px] text-[#555555]">{s.lighthouse_bp ?? "—"}</td>
                  <td className="px-3 py-3 font-sans text-[12px] text-[#555555]">{s.lighthouse_seo ?? "—"}</td>
                  <td className="px-3 py-3 font-sans text-[12px] text-[#555555]">{s.response_time_ms ? `${s.response_time_ms}ms` : "—"}</td>
                  <td className="px-3 py-3 font-sans text-[12px] text-[#555555]">{s.mobile_score ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AdminModal open={showModal} title="Nowy snapshot" onClose={() => setShowModal(false)} width="max-w-[560px]"
        footer={
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-[#111111] hover:bg-[#2a2a2a] disabled:opacity-50 text-white font-sans text-[14px] font-medium py-2.5 rounded-lg transition-all"
          >
            {saving ? "Zapisuję..." : "Dodaj snapshot"}
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">Data</label>
              <input ref={dateRef} type="date" defaultValue={new Date().toISOString().split("T")[0]}
                className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">Uptime</label>
              <div className="flex gap-2">
                {([["1","OK"],["0.5","Degraded"],["0","Down"]] as [string, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => setUptime(v as "1"|"0.5"|"0")}
                    className={`flex-1 font-sans text-[11px] font-medium py-2 rounded-lg border transition-all ${uptime === v ? "bg-[#111111] text-white border-[#111111]" : "border-[#EBEBEB] text-[#666666]"}`}
                  >{l}</button>
                ))}
              </div>
            </div>
          </div>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA]">Core Web Vitals</p>
          <div className="grid grid-cols-3 gap-3">
            {[["LCP (ms)", lcpRef, "1200"], ["INP (ms)", inpRef, "80"], ["CLS", clsRef, "0.02"]].map(([l, ref, ph]) => (
              <div key={l as string} className="flex flex-col gap-1">
                <label className="font-sans text-[11px] font-semibold text-[#888888]">{l as string}</label>
                <input ref={ref as React.RefObject<HTMLInputElement>} type="number" placeholder={ph as string}
                  className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
                />
              </div>
            ))}
          </div>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA]">Lighthouse</p>
          <div className="grid grid-cols-4 gap-3">
            {[["Perf", perfRef, "94"], ["Acc", accRef, "97"], ["BP", bpRef, "95"], ["SEO", seoRef, "100"]].map(([l, ref, ph]) => (
              <div key={l as string} className="flex flex-col gap-1">
                <label className="font-sans text-[11px] font-semibold text-[#888888]">{l as string}</label>
                <input ref={ref as React.RefObject<HTMLInputElement>} type="number" min={0} max={100} placeholder={ph as string}
                  className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
                />
              </div>
            ))}
          </div>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA]">Inne</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-sans text-[11px] font-semibold text-[#888888]">Response (ms)</label>
              <input ref={responseRef} type="number" placeholder="120"
                className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-sans text-[11px] font-semibold text-[#888888]">Mobile score</label>
              <input ref={mobileRef} type="number" min={0} max={100} placeholder="92"
                className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-sans text-[11px] font-semibold text-[#888888]">SSL wygasa</label>
              <input ref={sslRef} type="date"
                className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA]"
              />
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
