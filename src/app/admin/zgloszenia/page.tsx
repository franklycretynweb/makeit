"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProjectSelector from "@/components/admin/ProjectSelector";

interface Request {
  id: string;
  title: string;
  description: string;
  page: string;
  priority: string;
  status: "new" | "progress" | "done";
  created_at: string;
}

const columns = [
  { key: "new" as const,      label: "Nowe",   icon: Inbox },
  { key: "progress" as const, label: "W toku", icon: Clock },
  { key: "done" as const,     label: "Gotowe", icon: Check },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function AdminZgloszenia() {
  const [projectId, setProjectId] = useState("");
  const [data, setData] = useState<Record<"new" | "progress" | "done", Request[]>>({ new: [], progress: [], done: [] });

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      const supabase = createClient();
      const { data: rows } = await supabase.from("requests").select("*")
        .eq("project_id", projectId).order("created_at", { ascending: false });
      const grouped: Record<"new" | "progress" | "done", Request[]> = { new: [], progress: [], done: [] };
      for (const row of rows ?? []) {
        if (row.status in grouped) grouped[row.status as "new" | "progress" | "done"].push(row as Request);
      }
      setData(grouped);
    };
    load();
  }, [projectId]);

  const changeStatus = async (id: string, newStatus: "new" | "progress" | "done") => {
    const supabase = createClient();
    await supabase.from("requests").update({ status: newStatus }).eq("id", id);
    setData((prev) => {
      const all = [...prev.new, ...prev.progress, ...prev.done];
      const req = all.find((r) => r.id === id);
      if (!req) return prev;
      const next = { ...prev };
      for (const k of ["new", "progress", "done"] as const) {
        next[k] = next[k].filter((r) => r.id !== id);
      }
      next[newStatus] = [{ ...req, status: newStatus }, ...next[newStatus]];
      return next;
    });
  };

  return (
    <div className="max-w-[1060px] flex flex-col gap-6">
      <motion.div {...fadeUp(0)}>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">Zgłoszenia zmian</h1>
        <p className="font-sans text-[14px] text-[#888888] mt-0.5">Zarządzaj statusem zgłoszeń klientów.</p>
      </motion.div>

      <motion.div {...fadeUp(0.04)}>
        <ProjectSelector value={projectId} onChange={setProjectId} />
      </motion.div>

      <motion.div {...fadeUp(0.08)} className="grid grid-cols-3 gap-4 items-start">
        {columns.map((col) => {
          const Icon = col.icon;
          const items = data[col.key];
          return (
            <div key={col.key} className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1 mb-0.5">
                <div className="flex items-center gap-2">
                  <Icon size={14} strokeWidth={1.75} color="#888888" />
                  <span className="font-sans text-[13px] font-semibold text-[#111111]">{col.label}</span>
                </div>
                <span className="font-sans text-[11px] font-semibold text-[#888888] bg-[#F0F0F0] rounded-md px-2 py-0.5">{items.length}</span>
              </div>

              {items.map((req) => (
                <div key={req.id} className={`rounded-xl bg-white border shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-200 ${col.key === "done" ? "opacity-50" : ""} ${req.priority === "urgent" ? "border-[#111111]" : "border-[#EBEBEB]"}`}>
                  {req.priority === "urgent" && <div className="h-[3px] w-full bg-[#111111]" />}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-sans text-[13px] font-semibold text-[#111111] leading-snug">{req.title}</h3>
                      {req.priority === "urgent" && <span className="shrink-0 font-sans text-[10px] font-bold text-[#111111] uppercase tracking-[0.08em]">Pilne</span>}
                    </div>
                    <p className="font-sans text-[12px] text-[#888888] leading-relaxed line-clamp-2 mb-3">{req.description}</p>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-sans text-[11px] font-medium text-[#888888] bg-[#F5F5F5] border border-[#EBEBEB] rounded-md px-2 py-0.5 truncate max-w-[100px]">{req.page}</span>
                    </div>
                    {/* Status changer */}
                    <select
                      value={req.status}
                      onChange={e => changeStatus(req.id, e.target.value as "new" | "progress" | "done")}
                      className="w-full font-sans text-[11px] border border-[#EBEBEB] rounded-md px-2 py-1 bg-white focus:outline-none focus:border-[#AAAAAA] cursor-pointer"
                    >
                      <option value="new">Nowe</option>
                      <option value="progress">W toku</option>
                      <option value="done">Gotowe</option>
                    </select>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#EBEBEB] p-6 text-center">
                  <p className="font-sans text-[12px] text-[#CCCCCC]">Brak</p>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
