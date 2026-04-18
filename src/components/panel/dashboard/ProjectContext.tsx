"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Project {
  name: string;
  status: string;
  progress: number;
  deadline: string | null;
  domain: string | null;
}

const PHASES = ["Discovery", "Design", "Development", "Review", "Launch"];

const statusToPhaseIndex: Record<string, number> = {
  discovery: 0,
  design: 1,
  development: 2,
  review: 3,
  launch: 4,
  live: 4,
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export default function ProjectContext() {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("projects")
        .select("name, status, progress, deadline, domain")
        .eq("client_id", user.id)
        .single();

      if (data) setProject(data);
    };
    fetch();
  }, []);

  if (!project) return null;

  const activePhaseIndex = statusToPhaseIndex[project.status] ?? 1;
  const days = project.deadline ? daysUntil(project.deadline) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="pt-6 border-t border-[#F0F0F0]"
    >
      {/* Phase timeline */}
      <div className="flex items-start mb-3">
        {PHASES.map((phase, i) => {
          const isDone = i < activePhaseIndex;
          const isActive = i === activePhaseIndex;
          return (
            <div key={phase} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                  isDone ? "bg-[#111111]"
                    : isActive ? "bg-[#111111] ring-[3px] ring-[#111111]/10"
                    : "bg-white border border-[#DDDDDD]"
                }`}>
                  {isDone && <Check size={9} strokeWidth={3} color="white" />}
                </div>
                <span className={`font-sans text-[11px] whitespace-nowrap ${
                  isDone || isActive ? "font-medium text-[#333333]" : "text-[#AAAAAA]"
                }`}>
                  {phase}
                </span>
              </div>
              {i < PHASES.length - 1 && (
                <div className={`h-px w-[52px] mx-1 mb-[14px] ${
                  isDone ? "bg-[#111111]" : "bg-[#EBEBEB]"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar + meta */}
      <div className="flex items-center gap-4 mt-1">
        <div className="flex-1 h-[2px] rounded-full bg-[#EBEBEB] overflow-hidden">
          <div
            className="h-full bg-[#111111] rounded-full transition-all duration-700"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <p className="font-sans text-[12px] text-[#888888] shrink-0">
          {project.progress}% · Deadline:{" "}
          {project.deadline ? (
            <>
              <span className="font-semibold text-[#333333]">
                {new Date(project.deadline).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              {days !== null && (
                <span className="text-[#999999]"> ({days > 0 ? `${days} dni` : "dziś"})</span>
              )}
            </>
          ) : (
            <span className="text-[#AAAAAA]">brak</span>
          )}
        </p>
      </div>
    </motion.div>
  );
}
