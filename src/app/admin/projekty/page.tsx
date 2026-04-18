"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import AdminModal from "@/components/admin/AdminModal";

interface Project {
  id: string;
  name: string;
  domain: string;
  status: string;
  progress: number;
  deadline: string;
  visits_count: number;
  leads_count: number;
  company_name: string;
  client_id: string;
}

interface Profile { id: string; company_name: string; }

const STATUSES = ["discovery", "design", "development", "review", "launch", "live"];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function AdminProjekty() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // New project form refs
  const newNameRef = useRef<HTMLInputElement>(null);
  const newDomainRef = useRef<HTMLInputElement>(null);
  const newDeadlineRef = useRef<HTMLInputElement>(null);
  const [newClientId, setNewClientId] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: projs }, { data: profs }] = await Promise.all([
        supabase.from("projects").select("id, name, domain, status, progress, deadline, visits_count, leads_count, client_id, profiles!client_id(company_name)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, company_name").eq("role", "client").order("company_name"),
      ]);
      setProjects((projs ?? []).map((p: any) => ({
        id: p.id, name: p.name, domain: p.domain ?? "", status: p.status,
        progress: p.progress ?? 0, deadline: p.deadline ?? "", visits_count: p.visits_count ?? 0,
        leads_count: p.leads_count ?? 0, company_name: p.profiles?.company_name ?? "—", client_id: p.client_id,
      })));
      setProfiles(profs ?? []);
      if (profs && profs.length > 0) setNewClientId(profs[0].id);
      setLoading(false);
    };
    load();
  }, []);

  const save = async (id: string, field: string, value: string | number) => {
    const supabase = createClient();
    await supabase.from("projects").update({ [field]: value }).eq("id", id);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleCreate = async () => {
    const name = newNameRef.current?.value.trim();
    if (!name || !newClientId) return;
    setCreating(true);
    const supabase = createClient();
    const { data } = await supabase.from("projects").insert({
      client_id: newClientId,
      name,
      domain: newDomainRef.current?.value.trim() || "",
      deadline: newDeadlineRef.current?.value || null,
      status: "discovery",
      progress: 0,
    }).select("id, name, domain, status, progress, deadline, visits_count, leads_count, client_id, profiles!client_id(company_name)").single();

    if (data) {
      setProjects((prev) => [{
        id: data.id, name: data.name, domain: data.domain ?? "", status: data.status,
        progress: data.progress ?? 0, deadline: data.deadline ?? "", visits_count: 0,
        leads_count: 0, company_name: (data as any).profiles?.company_name ?? "—", client_id: data.client_id,
      }, ...prev]);
    }
    setCreating(false);
    setShowModal(false);
  };

  return (
    <div className="max-w-[1060px] flex flex-col gap-6">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">Projekty</h1>
          <p className="font-sans text-[14px] text-[#888888] mt-0.5">Edytuj inline — zmiany zapisują się automatycznie.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#111111] hover:bg-[#2a2a2a] text-white font-sans text-[13px] font-medium px-4 py-2 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150"
        >
          <Plus size={14} strokeWidth={2.5} />
          Nowy projekt
        </button>
      </motion.div>

      <motion.div {...fadeUp(0.06)}>
        <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-[#F5F5F5] rounded-lg" />)}
            </div>
          ) : (
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#F5F5F5]">
                  {["Klient", "Nazwa projektu", "Domena", "Status", "Postęp", "Deadline", "Wizyty", "Leady", ""].map((h) => (
                    <th key={h} className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA] py-3 px-3 text-left first:pl-6 last:pr-6 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-[#F7F7F7] last:border-0 hover:bg-[#FAFAFA] transition-colors duration-100">
                    <td className="pl-6 pr-3 py-2.5 font-sans text-[12px] text-[#888888] whitespace-nowrap">{p.company_name}</td>
                    <td className="px-3 py-2.5">
                      <input
                        defaultValue={p.name}
                        onBlur={(e) => save(p.id, "name", e.target.value)}
                        className="font-sans text-[13px] font-medium text-[#111111] bg-transparent border border-transparent hover:border-[#EBEBEB] focus:border-[#AAAAAA] rounded-md px-2 py-1 focus:outline-none transition-colors w-full min-w-[120px]"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        defaultValue={p.domain}
                        onBlur={(e) => save(p.id, "domain", e.target.value)}
                        placeholder="domena.pl"
                        className="font-sans text-[12px] text-[#555555] bg-transparent border border-transparent hover:border-[#EBEBEB] focus:border-[#AAAAAA] rounded-md px-2 py-1 focus:outline-none transition-colors w-full min-w-[100px] placeholder:text-[#CCCCCC]"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        defaultValue={p.status}
                        onChange={(e) => save(p.id, "status", e.target.value)}
                        className="font-sans text-[12px] bg-transparent border border-[#EBEBEB] hover:border-[#CCCCCC] rounded-md px-2 py-1 focus:outline-none transition-colors cursor-pointer"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number" min={0} max={100}
                        defaultValue={p.progress}
                        onBlur={(e) => save(p.id, "progress", parseInt(e.target.value))}
                        className="font-sans text-[12px] text-[#555555] bg-transparent border border-transparent hover:border-[#EBEBEB] focus:border-[#AAAAAA] rounded-md px-2 py-1 focus:outline-none transition-colors w-16 text-center"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="date"
                        defaultValue={p.deadline}
                        onBlur={(e) => save(p.id, "deadline", e.target.value)}
                        className="font-sans text-[12px] text-[#555555] bg-transparent border border-transparent hover:border-[#EBEBEB] focus:border-[#AAAAAA] rounded-md px-2 py-1 focus:outline-none transition-colors"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number" min={0}
                        defaultValue={p.visits_count}
                        onBlur={(e) => save(p.id, "visits_count", parseInt(e.target.value))}
                        className="font-sans text-[12px] text-[#555555] bg-transparent border border-transparent hover:border-[#EBEBEB] focus:border-[#AAAAAA] rounded-md px-2 py-1 focus:outline-none transition-colors w-16 text-center"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number" min={0}
                        defaultValue={p.leads_count}
                        onBlur={(e) => save(p.id, "leads_count", parseInt(e.target.value))}
                        className="font-sans text-[12px] text-[#555555] bg-transparent border border-transparent hover:border-[#EBEBEB] focus:border-[#AAAAAA] rounded-md px-2 py-1 focus:outline-none transition-colors w-16 text-center"
                      />
                    </td>
                    <td className="pr-6 px-3 py-2.5 text-right">
                      {savedId === p.id && (
                        <span className="inline-flex items-center gap-1 font-sans text-[11px] text-[#888888]">
                          <Check size={11} strokeWidth={2.5} /> Zapisano
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      <AdminModal open={showModal} title="Nowy projekt" onClose={() => setShowModal(false)}
        footer={
          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full bg-[#111111] hover:bg-[#2a2a2a] disabled:opacity-50 text-white font-sans text-[14px] font-medium py-2.5 rounded-lg transition-all duration-150"
          >
            {creating ? "Tworzę..." : "Utwórz projekt"}
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Klient</label>
            <select value={newClientId} onChange={e => setNewClientId(e.target.value)}
              className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] bg-white"
            >
              {profiles.map(p => <option key={p.id} value={p.id}>{p.company_name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Nazwa projektu</label>
            <input ref={newNameRef} type="text" placeholder="np. Strona XYZ"
              className="font-sans text-[14px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Domena</label>
            <input ref={newDomainRef} type="text" placeholder="domena.pl"
              className="font-sans text-[14px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Deadline</label>
            <input ref={newDeadlineRef} type="date"
              className="font-sans text-[14px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA]"
            />
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
