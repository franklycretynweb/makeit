"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, Palette, FileText, MessageSquare, Layers, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProjectSelector from "@/components/admin/ProjectSelector";
import AdminModal from "@/components/admin/AdminModal";

interface Decision {
  id: string;
  type: string;
  title: string;
  description: string;
  author: string;
  author_initials: string;
  is_agency: boolean;
  link: string | null;
  decision_date: string;
}

const TYPE_ICONS: Record<string, typeof Check> = {
  approval: Check, color: Palette, document: FileText,
  message: MessageSquare, design: Layers, launch: Zap,
};

const TYPE_OPTIONS = [
  { value: "approval", label: "Zatwierdzenie" },
  { value: "color", label: "Kolor/Styl" },
  { value: "document", label: "Dokument" },
  { value: "message", label: "Komunikacja" },
  { value: "design", label: "Design" },
  { value: "launch", label: "Launch" },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function AdminDecyzje() {
  const [projectId, setProjectId] = useState("");
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState("approval");
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const initialsRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const [isAgency, setIsAgency] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("project_decisions").select("*")
        .eq("project_id", projectId).order("decision_date", { ascending: false });
      setDecisions(data ?? []);
    };
    load();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId || !titleRef.current?.value.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.from("project_decisions").insert({
      project_id: projectId,
      type,
      title: titleRef.current.value.trim(),
      description: descRef.current?.value.trim() ?? "",
      author: authorRef.current?.value.trim() || "make it",
      author_initials: initialsRef.current?.value.trim() || "MI",
      is_agency: isAgency,
      link: linkRef.current?.value.trim() || null,
      decision_date: dateRef.current?.value || new Date().toISOString().split("T")[0],
    }).select().single();
    if (data) setDecisions((prev) => [data as Decision, ...prev]);
    setSaving(false);
    setShowModal(false);
  };

  return (
    <div className="max-w-[800px] flex flex-col gap-6">
      <motion.div {...fadeUp(0)} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">Decyzje</h1>
          <p className="font-sans text-[14px] text-[#888888] mt-0.5">Historia decyzji projektowych widoczna przez klienta.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#111111] hover:bg-[#2a2a2a] text-white font-sans text-[13px] font-medium px-4 py-2 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all"
        >
          <Plus size={14} strokeWidth={2.5} /> Dodaj decyzję
        </button>
      </motion.div>

      <motion.div {...fadeUp(0.04)}>
        <ProjectSelector value={projectId} onChange={setProjectId} />
      </motion.div>

      <motion.div {...fadeUp(0.08)} className="relative">
        <div className="absolute left-[17px] top-5 bottom-5 w-px bg-[#EBEBEB]" />
        <div className="flex flex-col">
          {decisions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#EBEBEB] p-10 text-center">
              <p className="font-sans text-[13px] text-[#CCCCCC]">Brak decyzji dla tego projektu</p>
            </div>
          ) : decisions.map((d, i) => {
            const Icon = TYPE_ICONS[d.type] ?? Check;
            return (
              <div key={d.id} className="relative pl-12 pb-5 last:pb-0">
                <div className="absolute left-0 top-0 w-[34px] h-[34px] rounded-lg bg-white border border-[#EBEBEB] flex items-center justify-center z-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <Icon size={15} strokeWidth={1.75} color="#888888" />
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                  className="rounded-xl border border-[#EBEBEB] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="font-sans text-[14px] font-semibold text-[#111111]">{d.title}</h3>
                    <span className="font-sans text-[11px] text-[#AAAAAA] shrink-0">{new Date(d.decision_date).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <p className="font-sans text-[13px] text-[#666666] leading-relaxed mb-3">{d.description}</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${d.is_agency ? "bg-[#111111]" : "bg-[#F0F0F0] border border-[#E5E5E5]"}`}>
                      <span className={`font-sans text-[7px] font-bold ${d.is_agency ? "text-white" : "text-[#555555]"}`}>{d.author_initials}</span>
                    </div>
                    <span className="font-sans text-[12px] text-[#AAAAAA]">{d.author}</span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <AdminModal open={showModal} title="Nowa decyzja" onClose={() => setShowModal(false)}
        footer={
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-[#111111] hover:bg-[#2a2a2a] disabled:opacity-50 text-white font-sans text-[14px] font-medium py-2.5 rounded-lg transition-all"
          >
            {saving ? "Zapisuję..." : "Dodaj decyzję"}
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">Typ</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none bg-white"
              >
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">Data</label>
              <input ref={dateRef} type="date" defaultValue={new Date().toISOString().split("T")[0]}
                className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Tytuł</label>
            <input ref={titleRef} type="text" placeholder="np. Paleta kolorów wybrana"
              className="font-sans text-[14px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Opis</label>
            <textarea ref={descRef} rows={2} placeholder="Szczegóły decyzji..."
              className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] resize-none placeholder:text-[#CCCCCC]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">Autor</label>
              <input ref={authorRef} type="text" defaultValue="make it"
                className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">Inicjały</label>
              <input ref={initialsRef} type="text" defaultValue="MI" maxLength={2}
                className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Link (opcjonalny)</label>
            <input ref={linkRef} type="text" placeholder="/panel/design-review"
              className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isAgency" checked={isAgency} onChange={e => setIsAgency(e.target.checked)} className="rounded" />
            <label htmlFor="isAgency" className="font-sans text-[12px] text-[#555555]">Decyzja agencji</label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
