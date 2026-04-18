"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, FileText, Palette, Rocket, MessageSquare, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { getProjectForUser } from "@/lib/utils/project";
import { timeAgo } from "@/lib/utils/timeAgo";

type EventType = "message" | "file" | "invoice" | "request" | "decision" | "design";

interface ActivityEvent {
  id: string;
  event_type: EventType;
  title: string;
  description: string;
  author: string;
  created_at: string;
}

const eventIcon: Record<EventType, typeof Check> = {
  message: MessageSquare,
  file: FileText,
  invoice: CreditCard,
  request: Pencil,
  decision: Check,
  design: Palette,
};

// Opacity cascade: newest is full weight, older entries fade naturally
const opacities = [1, 0.85, 0.65, 0.5, 0.38];

export default function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const project = await getProjectForUser(supabase);
      if (!project) return;

      const { data } = await supabase
        .from("activity_events")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setEvents(data ?? []);
    };
    load();
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#F5F5F5] flex items-center justify-between">
        <h3 className="font-sans text-[13px] font-semibold text-[#111111]">
          Ostatnia aktywność
        </h3>
        <span className="font-sans text-[11px] text-[#BBBBBB]">
          {events.length} zdarzeń
        </span>
      </div>

      <ul className="relative px-6 py-3">
        {/* Vertical guide line — aligned to icon centers */}
        <div className="absolute left-[34px] top-5 bottom-5 w-px bg-[#EFEFEF]" />

        {events.map((event, i) => {
          const Icon = eventIcon[event.event_type] ?? Rocket;
          const isLatest = i === 0;

          return (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: opacities[i] ?? 0.3, y: 0 }}
              transition={{
                delay: 0.05 * i,
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative pl-10 py-3.5"
            >
              {/* Icon marker */}
              {isLatest ? (
                <div className="absolute left-0 top-[13px] w-[22px] h-[22px] rounded-full bg-[#111111] flex items-center justify-center">
                  <Icon size={10} strokeWidth={2.5} color="#ffffff" />
                </div>
              ) : (
                <div className="absolute left-0 top-[13px] w-[22px] h-[22px] rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center">
                  <Icon size={10} strokeWidth={2} color="#AAAAAA" />
                </div>
              )}

              {/* Content */}
              <p
                className={`font-sans leading-snug ${
                  isLatest
                    ? "text-[14px] font-semibold text-[#111111]"
                    : "text-[13px] font-medium text-[#222222]"
                }`}
              >
                {event.title}
              </p>
              <p className="font-sans text-[13px] text-[#666666] mt-0.5 leading-snug">
                {event.description}
              </p>
              <p className="font-sans text-[11px] text-[#AAAAAA] mt-1.5">
                {event.author} · {timeAgo(event.created_at)}
              </p>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
