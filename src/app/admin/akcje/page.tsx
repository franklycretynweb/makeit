"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, Trash2, PenLine, MessageSquare, CreditCard, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProjectSelector from "@/components/admin/ProjectSelector";
import AdminModal from "@/components/admin/AdminModal";
import { timeAgo } from "@/lib/utils/timeAgo";

interface Action {
  id: string;
  type: string;
  title: string;
  description: string;
  context: string;
  href: string;
  cta: string;
  is_resolved: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, typeof PenLine> = {
  design: PenLine, message: MessageSquare, payment: CreditCard, file: FileText,
};
const TYPE_LABELS: Record<string, string> = {
  design: "Design", message: "Wiadomość", payment: "Płatność", file: "Plik",
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function AdminAkcje() {
  const [projectId, setProjectId] = useState("");
  const [actions, setActions] = useState<Action[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editAction, setEditAction] = useState<Action | null>(null);
  const [saving, setSaving] = useState(false);

  const typeRef = useRef<HTMLSelectElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const contextRef = useRef<HTMLInputElement>(null);
  const hrefRef = useRef<HTMLInputElement>(null);
  const ctaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("actions").select("*")
        .eq("project_id", projectId).order("created_at", { ascending: true });
      setActions(data ?? []);
    };
    load();
  }, [projectId]);

  const openCreate = () => { setEditAction(null); setShowModal(true); };
  const openEdit = (a: Action) => { setEditAction(a); setShowModal(true); };

  const handleSave = async () => {
    if (!projectId) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      project_id: projectId,
      type: typeRef.current?.value ?? "design",
      title: titleRef.current?.value.trim() ?? "",
      description: descRef.current?.value.trim() ?? "",
      context: contextRef.current?.value.trim() ?? "",
      href: hrefRef.current?.value.trim() ?? "/panel",
      cta: ctaRef.current?.value.trim() ?? "Przejdź",
      is_resolved: false,
    };
    if (!payload.title) { setSaving(false); return; }

    if (editAction) {
      const { data } = await supabase.from("actions").update(payload).eq("id", editAction.id).select().single();
      if (data) setActions(prev => prev.map(a => a.id === editAction.id ? data as Action : a));
    } else {
      const { data } = await supabase.from("actions").insert(payload).select().single();
      if (data) {
        setActions(prev => [...prev, data as Action]);
        await supabase.from("activity_events").insert({
          project_id: projectId, event_type: "decision",
          title: `Nowa akcja: ${payload.title}`, description: "", author: "make it",
        });
      }
    }
    setSaving(false);
    setShowModal(false);
  };

  const handleResolve = async (id: string, resolved: boolean) => {
    const supabase = createClient();
    await supabase.from("actions").update({ is_resolved: !resolved }).eq("id", id);
    setActions(prev => prev.map(a => a.id === id ? { ...a, is_resolved: !resolved } : a));
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("actions").delete().eq("id", id);
    setActions(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-[1060px] flex flex-col gap-6">
      <motion.div {...fadeUp(0)} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">Akcje</h1>
          <p className="font-sans text-[14px] text-[#888888] mt-0.5">To co klient widzi na dashboardzie jako "Czeka na Ciebie".</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#111111] hover:bg-[#2a2a2a] text-white font-sans text-[13px] font-medium px-4 py-2 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150"
        >
          <Plus size={14} strokeWidth={2.5} /> Dodaj akcję
        </button>
      </motion.div>

      <motion.div {...fadeUp(0.04)}>
        <ProjectSelector value={projectId} onChange={setProjectId} />
      </motion.div>

      <motion.div {...fadeUp(0.08)} className="flex flex-col gap-3">
        {actions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#EBEBEB] p-10 text-center">
            <p className="font-sans text-[13px] text-[#CCCCCC]">Brak akcji dla tego projektu</p>
          </div>
        ) : actions.map((action) => {
          const Icon = TYPE_ICONS[action.type] ?? PenLine;
          return (
            <div key={action.id} className={`rounded-xl border bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-200 ${action.is_resolved ? "border-[#EBEBEB] opacity-50" : "border-[#E0E0E0]"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] border border-[#EBEBEB] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} strokeWidth={1.75} color="#555555" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA]">{TYPE_LABELS[action.type] ?? action.type}</span>
                      <span className="font-sans text-[10px] text-[#CCCCCC]">· {timeAgo(action.created_at)}</span>
                    </div>
                    <p className="font-sans text-[14px] font-semibold text-[#111111] leading-snug">{action.title}</p>
                    {action.description && <p className="font-sans text-[12px] text-[#888888] mt-0.5">{action.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-sans text-[11px] text-[#AAAAAA] bg-[#F5F5F5] px-2 py-0.5 rounded-md">{action.href}</span>
                      <span className="font-sans text-[11px] font-medium text-[#555555]">{action.cta}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleResolve(action.id, action.is_resolved)}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-150 ${action.is_resolved ? "bg-[#111111] border-[#111111] text-white" : "border-[#EBEBEB] text-[#AAAAAA] hover:border-[#111111] hover:text-[#111111]"}`}
                    title={action.is_resolved ? "Przywróć" : "Rozwiąż"}
                  >
                    <Check size={13} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => openEdit(action)}
                    className="w-8 h-8 rounded-lg border border-[#EBEBEB] flex items-center justify-center text-[#AAAAAA] hover:border-[#CCCCCC] hover:text-[#111111] transition-all duration-150"
                  >
                    <PenLine size={13} strokeWidth={1.75} />
                  </button>
                  <button onClick={() => handleDelete(action.id)}
                    className="w-8 h-8 rounded-lg border border-[#EBEBEB] flex items-center justify-center text-[#AAAAAA] hover:border-red-300 hover:text-red-500 transition-all duration-150"
                  >
                    <Trash2 size={13} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      <AdminModal open={showModal} title={editAction ? "Edytuj akcję" : "Nowa akcja"} onClose={() => setShowModal(false)}
        footer={
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-[#111111] hover:bg-[#2a2a2a] disabled:opacity-50 text-white font-sans text-[14px] font-medium py-2.5 rounded-lg transition-all"
          >
            {saving ? "Zapisuję..." : "Zapisz"}
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">Typ</label>
              <select ref={typeRef} defaultValue={editAction?.type ?? "design"}
                className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] bg-white"
              >
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">CTA (tekst przycisku)</label>
              <input ref={ctaRef} type="text" defaultValue={editAction?.cta ?? "Przejdź"}
                className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Tytuł</label>
            <input ref={titleRef} type="text" defaultValue={editAction?.title ?? ""}
              placeholder="np. Zatwierdź projekt logo — wersja 3"
              className="font-sans text-[14px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Opis</label>
            <textarea ref={descRef} rows={2} defaultValue={editAction?.description ?? ""}
              placeholder="Krótki opis co klient ma zrobić..."
              className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] resize-none placeholder:text-[#CCCCCC]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Kontekst (podtytuł)</label>
            <input ref={contextRef} type="text" defaultValue={editAction?.context ?? ""}
              placeholder="np. Mateusz B. czeka na Twoją decyzję"
              className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Link (href)</label>
            <input ref={hrefRef} type="text" defaultValue={editAction?.href ?? "/panel/design-review"}
              placeholder="/panel/design-review"
              className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
            />
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
