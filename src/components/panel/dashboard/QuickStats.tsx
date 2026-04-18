"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { daysUntil, formatDate } from "@/lib/utils/date";

const PHASES = ["Discovery", "Design", "Development", "Review", "Launch"];
const statusToPhaseIndex: Record<string, number> = {
  discovery: 0,
  design: 1,
  development: 2,
  review: 3,
  launch: 4,
  live: 4,
};

function useCountUp(end: number, duration = 1000, delay = 100) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const ran = useRef(false);

  useEffect(() => {
    if (!inView || ran.current || end === 0) return;
    ran.current = true;
    const t = setTimeout(() => {
      const s = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - s) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setVal(e * end);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [inView, end, duration, delay]);

  return { ref, val };
}

interface StatProps {
  label: string;
  value: string;
  sub: string;
  data: { v: number }[];
  numEnd: number;
  numSuffix?: string;
  isText?: boolean;
  textValue?: string;
}

function StatCard({ label, sub, data, numEnd, numSuffix = "", isText, textValue }: StatProps) {
  const { ref, val } = useCountUp(numEnd, 900, 150);

  const display = isText
    ? textValue
    : `${numEnd % 1 !== 0 ? val.toFixed(1) : Math.round(val)}${numSuffix}`;

  return (
    <div
      ref={ref}
      className="rounded-xl border border-[#EBEBEB] bg-white p-5 flex flex-col shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-[#CCCCCC] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200"
    >
      <div>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-[#BBBBBB] mb-2.5">
          {label}
        </p>
        <p className="font-display text-[26px] font-bold tracking-[-0.04em] text-[#111111] leading-none mb-1">
          {display}
        </p>
        <p className="font-sans text-[11px] text-[#BBBBBB]">{sub}</p>
      </div>

      {/* Sparkline */}
      <div className="mt-4 h-[36px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="#AAAAAA"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={true}
            />
            <Tooltip
              contentStyle={{
                background: "#111111",
                border: "none",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "11px",
                color: "#ffffff",
              }}
              itemStyle={{ color: "#ffffff", fontSize: "11px" }}
              labelFormatter={() => ""}
              formatter={(val) => [val ?? 0, ""]}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function QuickStats() {
  const [uptimeData, setUptimeData] = useState<{ v: number }[]>([]);
  const [perfData, setPerfData] = useState<{ v: number }[]>([]);
  const [deadlineData, setDeadlineData] = useState<{ v: number }[]>([]);
  const [phaseData, setPhaseData] = useState<{ v: number }[]>([]);

  const [uptimeValue, setUptimeValue] = useState("—");
  const [perfValue, setPerfValue] = useState(0);
  const [phaseName, setPhaseName] = useState("—");
  const [deadlineDays, setDeadlineDays] = useState(0);
  const [deadlineDateStr, setDeadlineDateStr] = useState("brak");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: project } = await supabase
        .from("projects")
        .select("id, status, deadline")
        .eq("client_id", user.id)
        .single();

      if (!project) return;

      // Phase & deadline from project
      const phaseIdx = statusToPhaseIndex[project.status] ?? 1;
      setPhaseName(PHASES[phaseIdx] ?? "—");
      setPhaseData([{ v: phaseIdx }, { v: phaseIdx }]);

      if (project.deadline) {
        const days = daysUntil(project.deadline);
        setDeadlineDays(Math.max(days, 0));
        setDeadlineDateStr(formatDate(project.deadline));
        // Simple countdown sparkline
        const step = Math.max(days / 9, 1);
        setDeadlineData(
          Array.from({ length: 10 }, (_, i) => ({ v: Math.max(days + step * i - step * 9, 0) }))
        );
      }

      // Monitoring snapshots
      const { data: snapshots } = await supabase
        .from("monitoring_snapshots")
        .select("snapshot_date, uptime_status, lighthouse_perf")
        .eq("project_id", project.id)
        .order("snapshot_date", { ascending: false })
        .limit(10);

      if (snapshots && snapshots.length > 0) {
        const reversed = [...snapshots].reverse();
        setUptimeData(reversed.map((s) => ({ v: s.uptime_status * 100 })));
        setPerfData(reversed.map((s) => ({ v: s.lighthouse_perf ?? 0 })));

        const uptimePct =
          (snapshots.filter((s) => s.uptime_status === 1).length / snapshots.length) * 100;
        setUptimeValue(uptimePct.toFixed(1) + "%");
        setPerfValue(snapshots[0].lighthouse_perf ?? 0);
      } else {
        setUptimeData([{ v: 0 }, { v: 0 }]);
        setPerfData([{ v: 0 }, { v: 0 }]);
      }
    };
    load();
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        label="Uptime"
        value={uptimeValue}
        sub="ostatnie snapshoty"
        data={uptimeData.length > 1 ? uptimeData : [{ v: 0 }, { v: 0 }]}
        numEnd={0}
        isText
        textValue={uptimeValue}
      />
      <StatCard
        label="Performance"
        value={perfValue > 0 ? `${perfValue}/100` : "—"}
        sub="Lighthouse score"
        data={perfData.length > 1 ? perfData : [{ v: 0 }, { v: 0 }]}
        numEnd={perfValue}
        numSuffix="/100"
        isText={perfValue === 0}
        textValue="—"
      />
      <StatCard
        label="Faza projektu"
        value={phaseName}
        sub={`Etap ${(statusToPhaseIndex[phaseName.toLowerCase()] ?? 1) + 1} z 5`}
        data={phaseData.length > 1 ? phaseData : [{ v: 0 }, { v: 0 }]}
        numEnd={0}
        isText
        textValue={phaseName}
      />
      <StatCard
        label="Do deadline"
        value={deadlineDays > 0 ? `${deadlineDays} dni` : "—"}
        sub={deadlineDateStr}
        data={deadlineData.length > 1 ? deadlineData : [{ v: 0 }, { v: 0 }]}
        numEnd={deadlineDays}
        numSuffix=" dni"
        isText={deadlineDays === 0}
        textValue="—"
      />
    </div>
  );
}
