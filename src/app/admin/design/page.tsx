"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Check, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProjectSelector from "@/components/admin/ProjectSelector";
import { formatDate } from "@/lib/utils/date";

interface Version {
  id: string;
  version_name: string;
  label: string;
  note: string;
  storage_path: string;
  status: string;
  is_current: boolean;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "review", label: "W review" },
  { value: "changes", label: "Poprawki" },
  { value: "approved", label: "Zatwierdzona" },
  { value: "rejected", label: "Odrzucona" },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function AdminDesign() {
  const [projectId, setProjectId] = useState("");
  const [versions, setVersions] = useState<Version[]>([]);
  const [uploading, setUploading] = useState(false);
  const [versionName, setVersionName] = useState("");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("review");
  const [isCurrent, setIsCurrent] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("design_versions").select("*")
        .eq("project_id", projectId).order("created_at", { ascending: true });
      setVersions(data ?? []);
    };
    load();
  }, [projectId]);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !projectId || !versionName.trim()) return;
    setUploading(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${projectId}/${Date.now()}_${label || "v"}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("designs").upload(path, file, { upsert: true });
    if (uploadError) { setUploading(false); return; }

    if (isCurrent) {
      await supabase.from("design_versions").update({ is_current: false }).eq("project_id", projectId);
    }

    const { data } = await supabase.from("design_versions").insert({
      project_id: projectId,
      version_name: versionName.trim(),
      label: label.trim() || `v${versions.length + 1}`,
      note: note.trim(),
      storage_path: path,
      status,
      is_current: isCurrent,
    }).select().single();

    if (data) setVersions((prev) => [...prev, data as Version]);

    setVersionName(""); setLabel(""); setNote(""); setStatus("review"); setIsCurrent(true);
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
  };

  const setCurrentVersion = async (id: string) => {
    const supabase = createClient();
    await supabase.from("design_versions").update({ is_current: false }).eq("project_id", projectId);
    await supabase.from("design_versions").update({ is_current: true }).eq("id", id);
    setVersions((prev) => prev.map((v) => ({ ...v, is_current: v.id === id })));
  };

  return (
    <div className="max-w-[1060px] flex flex-col gap-6">
      <motion.div {...fadeUp(0)}>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">Design</h1>
        <p className="font-sans text-[14px] text-[#888888] mt-0.5">Dodawaj wersje designu do przeglądu przez klienta.</p>
      </motion.div>

      <motion.div {...fadeUp(0.04)}>
        <ProjectSelector value={projectId} onChange={setProjectId} />
      </motion.div>

      <div className="grid grid-cols-[1fr_340px] gap-6 items-start">
        {/* Existing versions */}
        <motion.div {...fadeUp(0.08)}>
          <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F5F5F5]">
              <h2 className="font-sans text-[13px] font-semibold text-[#111111]">Wersje ({versions.length})</h2>
            </div>
            {versions.length === 0 ? (
              <div className="p-10 text-center"><p className="font-sans text-[13px] text-[#CCCCCC]">Brak wersji dla tego projektu</p></div>
            ) : (
              <ul className="divide-y divide-[#F7F7F7]">
                {versions.map((v) => {
                  const { data: { publicUrl } } = createClient().storage.from("designs").getPublicUrl(v.storage_path);
                  return (
                    <li key={v.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAFAFA] transition-colors">
                      {/* Thumbnail */}
                      <div className="w-16 h-10 rounded-md bg-[#F5F5F5] border border-[#EBEBEB] overflow-hidden shrink-0">
                        <img src={publicUrl} alt={v.version_name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-sans text-[13px] font-semibold text-[#111111]">{v.version_name}</span>
                          <span className="font-sans text-[10px] text-[#AAAAAA] bg-[#F5F5F5] px-1.5 py-0.5 rounded">{v.label}</span>
                          {v.is_current && <span className="font-sans text-[10px] font-semibold text-white bg-[#111111] px-1.5 py-0.5 rounded">Aktywna</span>}
                        </div>
                        <p className="font-sans text-[11px] text-[#AAAAAA]">{v.note} · {v.status} · {formatDate(v.created_at)}</p>
                      </div>
                      {!v.is_current && (
                        <button onClick={() => setCurrentVersion(v.id)}
                          className="shrink-0 flex items-center gap-1 font-sans text-[11px] font-medium text-[#888888] hover:text-[#111111] border border-[#EBEBEB] hover:border-[#CCCCCC] px-2.5 py-1.5 rounded-lg transition-all"
                          title="Ustaw jako aktywną"
                        >
                          <Star size={11} strokeWidth={2} /> Aktywuj
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.div>

        {/* Upload form */}
        <motion.div {...fadeUp(0.12)}>
          <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 flex flex-col gap-4">
            <h2 className="font-sans text-[13px] font-semibold text-[#111111]">Dodaj wersję</h2>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">Nazwa wersji</label>
              <input value={versionName} onChange={e => setVersionName(e.target.value)} placeholder="np. Strona Główna — v3"
                className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[12px] font-semibold text-[#555555]">Etykieta</label>
                <input value={label} onChange={e => setLabel(e.target.value)} placeholder="v3"
                  className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[12px] font-semibold text-[#555555]">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA] bg-white"
                >
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">Notatka</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="np. poprawiony nagłówek"
                className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isCurrent" checked={isCurrent} onChange={e => setIsCurrent(e.target.checked)} className="rounded" />
              <label htmlFor="isCurrent" className="font-sans text-[12px] text-[#555555]">Ustaw jako aktywną wersję</label>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">Plik (webp/jpg/png)</label>
              <input ref={fileRef} type="file" accept="image/*"
                className="font-sans text-[12px] text-[#555555] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border file:border-[#EBEBEB] file:font-sans file:text-[12px] file:font-medium file:text-[#555555] file:bg-white hover:file:border-[#CCCCCC] cursor-pointer"
              />
            </div>
            <button onClick={handleUpload} disabled={uploading || !versionName.trim()}
              className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#2a2a2a] disabled:opacity-50 text-white font-sans text-[13px] font-medium py-2.5 rounded-lg transition-all"
            >
              {uploading ? "Wgrywam..." : <><Upload size={14} strokeWidth={2} /> Wgraj wersję</>}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
