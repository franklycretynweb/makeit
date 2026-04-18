"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown } from "lucide-react";

interface Project {
  id: string;
  name: string;
  company_name: string;
}

interface ProjectSelectorProps {
  value: string;
  onChange: (projectId: string) => void;
}

export default function ProjectSelector({ value, onChange }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select("id, name, profiles!client_id(company_name)")
        .order("name");

      const mapped = (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        company_name: p.profiles?.company_name ?? "—",
      }));
      setProjects(mapped);
      if (!value && mapped.length > 0) onChange(mapped[0].id);
    };
    load();
  }, []);

  const selected = projects.find((p) => p.id === value);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none font-sans text-[13px] bg-white border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 pr-9 focus:outline-none focus:border-[#AAAAAA] transition-colors text-[#111111] cursor-pointer"
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.company_name} — {p.name}
          </option>
        ))}
      </select>
      <ChevronDown size={14} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] pointer-events-none" />
    </div>
  );
}
