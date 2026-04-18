"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, FolderOpen, Zap, FileEdit, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils/date";

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  progress: number;
  deadline: string | null;
  company_name: string;
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function AdminDashboard() {
  const [stats, setStats] = useState({ clients: 0, projects: 0, actions: 0, requests: 0 });
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const [
        { count: clients },
        { data: projectsData },
        { count: actions },
        { count: requests },
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
        supabase.from("projects").select("id, name, status, progress, deadline, profiles!client_id(company_name)").order("created_at", { ascending: false }),
        supabase.from("actions").select("id", { count: "exact", head: true }).eq("is_resolved", false),
        supabase.from("requests").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);

      setStats({
        clients: clients ?? 0,
        projects: projectsData?.length ?? 0,
        actions: actions ?? 0,
        requests: requests ?? 0,
      });

      setProjects(
        (projectsData ?? []).map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status,
          progress: p.progress ?? 0,
          deadline: p.deadline,
          company_name: p.profiles?.company_name ?? "—",
        }))
      );

      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { icon: Users,      label: "Klienci",             value: stats.clients,   href: "/admin/klienci",  },
    { icon: FolderOpen, label: "Projekty",             value: stats.projects,  href: "/admin/projekty", },
    { icon: Zap,        label: "Nierozwiązane akcje",  value: stats.actions,   href: "/admin/akcje",    },
    { icon: FileEdit,   label: "Nowe zgłoszenia",      value: stats.requests,  href: "/admin/zgloszenia"},
  ];

  return (
    <div className="max-w-[1060px] flex flex-col gap-6">

      <motion.div {...fadeUp(0)}>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">
          Dashboard
        </h1>
        <p className="font-sans text-[14px] text-[#888888] mt-0.5">
          Przegląd wszystkich klientów i projektów.
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-xl border border-[#EBEBEB] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-[#CCCCCC] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] border border-[#EBEBEB] flex items-center justify-center mb-4">
                <Icon size={15} strokeWidth={1.75} color="#555555" />
              </div>
              <p className="font-display text-[32px] font-bold tracking-[-0.04em] text-[#111111] leading-none mb-1">
                {loading ? "—" : card.value}
              </p>
              <p className="font-sans text-[12px] text-[#888888]">{card.label}</p>
            </Link>
          );
        })}
      </motion.div>

      {/* Projects table */}
      <motion.div {...fadeUp(0.1)}>
        <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F5F5F5] flex items-center justify-between">
            <h2 className="font-sans text-[13px] font-semibold text-[#111111]">Wszystkie projekty</h2>
            <Link href="/admin/projekty" className="font-sans text-[12px] text-[#888888] hover:text-[#111111] inline-flex items-center gap-1 transition-colors">
              Zarządzaj <ArrowRight size={11} strokeWidth={2} />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-[#F5F5F5] rounded-lg" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-sans text-[14px] text-[#AAAAAA]">Brak projektów</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F5F5F5]">
                  {["Klient", "Projekt", "Status", "Postęp", "Deadline"].map((h) => (
                    <th key={h} className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA] py-3 px-4 text-left first:pl-6 last:pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-[#F7F7F7] last:border-0 hover:bg-[#FAFAFA] transition-colors duration-100">
                    <td className="pl-6 pr-4 py-3.5 font-sans text-[13px] text-[#888888]">{p.company_name}</td>
                    <td className="px-4 py-3.5 font-sans text-[13px] font-medium text-[#111111]">{p.name}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-[3px] rounded-full bg-[#F0F0F0] overflow-hidden w-[80px]">
                          <div className="h-full bg-[#111111] rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="font-sans text-[11px] text-[#AAAAAA] w-8">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="pr-6 px-4 py-3.5 font-sans text-[12px] text-[#888888]">
                      {p.deadline ? formatDate(p.deadline) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
