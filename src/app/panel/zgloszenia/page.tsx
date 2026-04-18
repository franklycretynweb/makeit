"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Clock, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getProjectForUser } from "@/lib/utils/project";

interface Request {
  id: string;
  title: string;
  description: string;
  page: string;
  priority: "normal" | "urgent";
  status: "new" | "progress" | "done";
  created_at: string;
}

const columns = [
  { key: "new" as const,      label: "Nowe",   icon: Inbox  },
  { key: "progress" as const, label: "W toku", icon: Clock  },
  { key: "done" as const,     label: "Gotowe", icon: Check  },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}

export default function ZgloszeniaPage() {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState<Record<"new" | "progress" | "done", Request[]>>({
    new: [],
    progress: [],
    done: [],
  });
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [submitting, setSubmitting] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("");

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const pageRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const project = await getProjectForUser(supabase);
      if (!project) return;

      setProjectId(project.id);
      setCompanyName(project.name ?? "");

      const { data: rows } = await supabase
        .from("requests")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false });

      const grouped: Record<"new" | "progress" | "done", Request[]> = {
        new: [],
        progress: [],
        done: [],
      };
      for (const row of rows ?? []) {
        if (row.status in grouped) {
          grouped[row.status as "new" | "progress" | "done"].push(row as Request);
        }
      }
      setData(grouped);
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!projectId) return;
    const title = titleRef.current?.value.trim();
    const description = descRef.current?.value.trim() ?? "";
    const page = pageRef.current?.value ?? "Strona główna";
    if (!title) return;

    setSubmitting(true);
    const supabase = createClient();

    const { data: inserted, error } = await supabase
      .from("requests")
      .insert({ project_id: projectId, title, description, page, priority, status: "new" })
      .select()
      .single();

    if (!error && inserted) {
      // Insert activity event
      await supabase.from("activity_events").insert({
        project_id: projectId,
        event_type: "request",
        title: `Nowe zgłoszenie: ${title}`,
        description: `Strona: ${page} · Priorytet: ${priority === "urgent" ? "pilne" : "normalny"}`,
        author: companyName,
      });

      setData((prev) => ({
        ...prev,
        new: [inserted as Request, ...prev.new],
      }));
      setShowModal(false);
      setPriority("normal");
      if (titleRef.current) titleRef.current.value = "";
      if (descRef.current) descRef.current.value = "";
    }
    setSubmitting(false);
  };

  const total = Object.values(data).flat().length;

  return (
    <>
      <div className="max-w-[1060px] flex flex-col gap-5">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">
              Zgłoszenia zmian
            </h1>
            <p className="font-sans text-[14px] text-[#888888] mt-0.5">
              {data.new.length} nowych · {data.progress.length} w toku · {data.done.length} gotowych · {total} łącznie
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#111111] hover:bg-[#2a2a2a] text-white font-sans text-[13px] font-medium px-4 py-2 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150"
          >
            <Plus size={14} strokeWidth={2.5} />
            Nowe zgłoszenie
          </button>
        </motion.div>

        {/* Kanban */}
        <motion.div {...fadeUp(0.06)} className="grid grid-cols-3 gap-4 items-start">
          {columns.map((col) => {
            const Icon = col.icon;
            const items = data[col.key];
            const isDone = col.key === "done";

            return (
              <div key={col.key} className="flex flex-col gap-2.5">

                {/* Column header */}
                <div className="flex items-center justify-between px-1 mb-0.5">
                  <div className="flex items-center gap-2">
                    <Icon size={14} strokeWidth={1.75} color="#888888" />
                    <span className="font-sans text-[13px] font-semibold text-[#111111]">
                      {col.label}
                    </span>
                  </div>
                  <span className="font-sans text-[11px] font-semibold text-[#888888] bg-[#F0F0F0] rounded-md px-2 py-0.5">
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                {items.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isDone ? 0.45 : 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.08 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -1 }}
                    className={`rounded-xl bg-white border shadow-[0_1px_4px_rgba(0,0,0,0.04)] cursor-pointer overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 ${
                      req.priority === "urgent"
                        ? "border-[#111111]"
                        : "border-[#EBEBEB] hover:border-[#CCCCCC]"
                    }`}
                  >
                    {/* Urgent: top border accent */}
                    {req.priority === "urgent" && (
                      <div className="h-[3px] w-full bg-[#111111]" />
                    )}

                    <div className="p-4">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-sans text-[13px] font-semibold text-[#111111] leading-snug">
                          {req.title}
                        </h3>
                        {req.priority === "urgent" && (
                          <span className="shrink-0 font-sans text-[10px] font-bold text-[#111111] uppercase tracking-[0.08em]">
                            Pilne
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="font-sans text-[12px] text-[#888888] leading-relaxed line-clamp-2 mb-3">
                        {req.description}
                      </p>

                      {/* Footer meta */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-sans text-[11px] font-medium text-[#888888] bg-[#F5F5F5] border border-[#EBEBEB] rounded-md px-2 py-0.5 truncate max-w-[120px]">
                          {req.page}
                        </span>
                        <span className="font-sans text-[11px] text-[#BBBBBB] shrink-0">
                          {fmtDate(req.created_at)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Empty state for "new" column */}
                {col.key === "new" && items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[#EBEBEB] p-6 text-center">
                    <p className="font-sans text-[12px] text-[#CCCCCC]">Brak nowych zgłoszeń</p>
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[460px] mx-6 rounded-xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB]">
                <h2 className="font-sans text-[15px] font-semibold text-[#111111]">
                  Nowe zgłoszenie
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-7 h-7 rounded-lg hover:bg-[#F5F5F5] flex items-center justify-center text-[#AAAAAA] hover:text-[#111111] transition-all duration-150"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>

              {/* Form */}
              <div className="px-6 py-5 flex flex-col gap-4">

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[12px] font-semibold text-[#555555]">
                    Co chcesz zmienić?
                  </label>
                  <input
                    ref={titleRef}
                    type="text"
                    placeholder="Krótki tytuł zmiany..."
                    className="font-sans text-[14px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] transition-colors placeholder:text-[#CCCCCC]"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[12px] font-semibold text-[#555555]">
                    Opisz szczegółowo
                  </label>
                  <textarea
                    ref={descRef}
                    rows={3}
                    placeholder="Co dokładnie i gdzie powinno się zmienić..."
                    className="font-sans text-[14px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] transition-colors placeholder:text-[#CCCCCC] resize-none"
                  />
                </div>

                {/* Page */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[12px] font-semibold text-[#555555]">
                    Podstrona
                  </label>
                  <select
                    ref={pageRef}
                    className="font-sans text-[14px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] transition-colors bg-white text-[#111111] cursor-pointer"
                  >
                    <option>Strona główna</option>
                    <option>/uslugi</option>
                    <option>/o-nas</option>
                    <option>/realizacje</option>
                    <option>/kontakt</option>
                    <option>Wszystkie podstrony</option>
                    <option>Inne</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[12px] font-semibold text-[#555555]">
                    Priorytet
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPriority("normal")}
                      className={`flex-1 font-sans text-[13px] font-medium py-2 rounded-lg border transition-all duration-150 ${
                        priority === "normal"
                          ? "bg-[#111111] text-white border-[#111111]"
                          : "text-[#666666] border-[#EBEBEB] hover:border-[#CCCCCC]"
                      }`}
                    >
                      Normalny
                    </button>
                    <button
                      onClick={() => setPriority("urgent")}
                      className={`flex-1 font-sans text-[13px] font-medium py-2 rounded-lg border transition-all duration-150 ${
                        priority === "urgent"
                          ? "bg-[#111111] text-white border-[#111111]"
                          : "text-[#666666] border-[#EBEBEB] hover:border-[#CCCCCC]"
                      }`}
                    >
                      Pilne
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="px-6 pb-5">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-[#111111] hover:bg-[#2a2a2a] disabled:opacity-50 text-white font-sans text-[14px] font-medium py-2.5 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150"
                >
                  {submitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
