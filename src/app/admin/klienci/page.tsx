"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";

interface Client {
  id: string;
  first_name: string;
  company_name: string;
  phone: string;
  project_id: string | null;
  project_name: string | null;
  project_status: string | null;
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function AdminKlienci() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const [{ data: profiles }, { data: projects }] = await Promise.all([
        supabase.from("profiles").select("id, first_name, company_name, phone").eq("role", "client").order("company_name"),
        supabase.from("projects").select("id, client_id, name, status"),
      ]);

      const projectMap = new Map((projects ?? []).map((p: any) => [p.client_id, p]));

      setClients(
        (profiles ?? []).map((p: any) => {
          const proj = projectMap.get(p.id);
          return {
            id: p.id,
            first_name: p.first_name ?? "",
            company_name: p.company_name ?? "—",
            phone: p.phone ?? "—",
            project_id: proj?.id ?? null,
            project_name: proj?.name ?? null,
            project_status: proj?.status ?? null,
          };
        })
      );
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="max-w-[1060px] flex flex-col gap-6">
      <motion.div {...fadeUp(0)}>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">Klienci</h1>
        <p className="font-sans text-[14px] text-[#888888] mt-0.5">
          {clients.length} klientów w systemie
        </p>
      </motion.div>

      <motion.div {...fadeUp(0.06)}>
        <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-[#F5F5F5] rounded-lg" />)}
            </div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-sans text-[14px] text-[#AAAAAA]">Brak klientów</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F5F5F5]">
                  {["Firma", "Imię", "Telefon", "Projekt", "Status", ""].map((h) => (
                    <th key={h} className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA] py-3 px-4 text-left first:pl-6 last:pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const ins = (c.company_name ?? "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <tr key={c.id} className="border-b border-[#F7F7F7] last:border-0 hover:bg-[#FAFAFA] transition-colors duration-100">
                      <td className="pl-6 pr-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center shrink-0">
                            <span className="font-sans text-[9px] font-bold text-white">{ins}</span>
                          </div>
                          <span className="font-sans text-[13px] font-medium text-[#111111]">{c.company_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-sans text-[13px] text-[#555555]">{c.first_name || "—"}</td>
                      <td className="px-4 py-3.5 font-sans text-[13px] text-[#555555]">{c.phone}</td>
                      <td className="px-4 py-3.5 font-sans text-[13px] text-[#555555]">{c.project_name ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        {c.project_status ? <StatusBadge status={c.project_status} /> : <span className="font-sans text-[12px] text-[#CCCCCC]">—</span>}
                      </td>
                      <td className="pr-6 px-4 py-3.5 text-right">
                        {c.project_id && (
                          <Link
                            href={`/admin/projekty`}
                            className="font-sans text-[12px] font-medium text-[#888888] hover:text-[#111111] inline-flex items-center gap-1 transition-colors"
                          >
                            Projekt <ArrowRight size={11} strokeWidth={2} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
