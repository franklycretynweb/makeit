"use client";

import { useEffect, useState, useRef } from "react";
import { Check, X, Send } from "lucide-react";
import VersionSwitcher from "./VersionSwitcher";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils/timeAgo";
import type { DesignVersion } from "@/app/panel/design-review/page";

interface Comment {
  id: string;
  content: string;
  is_client: boolean;
  author_name: string;
  author_initials: string;
  created_at: string;
}

interface ReviewSidebarProps {
  activeVersion: number;
  onVersionChange: (i: number) => void;
  onApprove: () => void;
  approved: boolean;
  versions: DesignVersion[];
  projectId: string;
  companyName: string;
}

export default function ReviewSidebar({
  activeVersion,
  onVersionChange,
  onApprove,
  approved,
  versions,
  projectId,
  companyName,
}: ReviewSidebarProps) {
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [revisionText, setRevisionText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [sending, setSending] = useState(false);
  const currentVersion = versions[activeVersion];
  const supabaseRef = useRef(createClient());

  // Fetch comments when version changes
  useEffect(() => {
    if (!currentVersion?.id) return;
    const supabase = supabaseRef.current;

    const load = async () => {
      const { data } = await supabase
        .from("design_comments")
        .select("*")
        .eq("design_version_id", currentVersion.id)
        .order("created_at", { ascending: true });
      setComments((data ?? []) as Comment[]);
    };
    load();

    // Real-time subscription
    const channel = supabase
      .channel(`design-comments-${currentVersion.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "design_comments",
          filter: `design_version_id=eq.${currentVersion.id}`,
        },
        (payload) => {
          setComments((prev) => [...prev, payload.new as Comment]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentVersion?.id]);

  const sendComment = async (content: string, isRevision = false) => {
    if (!content.trim() || !currentVersion?.id || !projectId) return;
    setSending(true);

    const supabase = supabaseRef.current;
    const { data: { user } } = await supabase.auth.getUser();

    const initials = companyName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const { data: inserted } = await supabase
      .from("design_comments")
      .insert({
        design_version_id: currentVersion.id,
        project_id: projectId,
        content: isRevision ? `[Prośba o poprawki] ${content}` : content,
        is_client: true,
        author_name: companyName || user?.email || "Klient",
        author_initials: initials || "K",
      })
      .select()
      .single();

    if (inserted) {
      // Optimistic update — real-time will also fire, but we deduplicate by id
      setComments((prev) => {
        const exists = prev.some((c) => c.id === (inserted as Comment).id);
        return exists ? prev : [...prev, inserted as Comment];
      });
    }

    setNewComment("");
    setRevisionText("");
    setShowRevisionInput(false);
    setSending(false);
  };

  // Version history from props
  const versionHistory = versions.map((v, i) => ({
    label: v.label,
    note: v.status === "approved" ? "zatwierdzona"
      : v.status === "rejected" ? "odrzucona"
      : v.status === "changes" ? "poprawki"
      : "w review",
    date: new Date(v.created_at).toLocaleDateString("pl-PL", { day: "numeric", month: "short" }),
    done: v.status !== "review",
    current: i === activeVersion,
  }));

  return (
    <div className="w-[360px] shrink-0 border-l border-[#EBEBEB] bg-white flex flex-col h-full">

      {/* Version switcher */}
      <div className="px-5 py-4 border-b border-[#EBEBEB]">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] mb-2.5">
          Wersja
        </p>
        <VersionSwitcher
          versions={versions.map((v) => v.label)}
          active={activeVersion}
          onSelect={onVersionChange}
        />
      </div>

      {/* Comments + version history */}
      <div className="flex-1 overflow-auto px-5 py-4 flex flex-col gap-5">

        {/* Comments */}
        <div>
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] mb-3">
            Komentarze ({comments.length})
          </p>
          {comments.length === 0 ? (
            <p className="font-sans text-[12px] text-[#CCCCCC]">Brak komentarzy do tej wersji.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  {/* Avatar — agency: black, client: light */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      !c.is_client
                        ? "bg-[#111111]"
                        : "bg-[#F0F0F0] border border-[#E5E5E5]"
                    }`}
                  >
                    <span
                      className={`font-sans text-[9px] font-bold ${
                        !c.is_client ? "text-white" : "text-[#555555]"
                      }`}
                    >
                      {c.author_initials}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-sans text-[13px] font-semibold text-[#111111]">
                        {c.author_name}
                      </span>
                      <span className="font-sans text-[11px] text-[#AAAAAA]">
                        {timeAgo(c.created_at)}
                      </span>
                    </div>
                    <p className="font-sans text-[13px] text-[#555555] leading-relaxed mt-0.5">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Version history */}
        {versionHistory.length > 0 && (
          <div className="pt-4 border-t border-[#F0F0F0]">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] mb-3">
              Historia wersji
            </p>
            <div className="flex flex-col gap-2.5">
              {versionHistory.map((v) => (
                <div key={v.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        v.current ? "bg-[#111111]" : "bg-[#DDDDDD]"
                      }`}
                    />
                    <span
                      className={`font-sans text-[13px] font-medium ${
                        v.current ? "text-[#111111]" : "text-[#AAAAAA]"
                      }`}
                    >
                      {v.label}
                    </span>
                    <span className="font-sans text-[12px] text-[#AAAAAA]">
                      — {v.note}
                    </span>
                  </div>
                  <span className="font-sans text-[11px] text-[#CCCCCC]">{v.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comment input */}
      <div className="px-5 py-3.5 border-t border-[#EBEBEB]">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendComment(newComment)}
            placeholder="Dodaj komentarz..."
            className="flex-1 font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2 focus:outline-none focus:border-[#AAAAAA] transition-colors placeholder:text-[#CCCCCC]"
          />
          <button
            onClick={() => sendComment(newComment)}
            disabled={sending || !newComment.trim()}
            className="w-9 h-9 rounded-lg bg-[#111111] hover:bg-[#2a2a2a] disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Approval actions */}
      <div className="px-5 py-4 border-t border-[#EBEBEB] bg-[#FAFAFA]">
        {approved ? (
          <div className="flex items-center gap-3 justify-center py-1">
            <div className="w-7 h-7 rounded-full bg-[#111111] flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-sans text-[14px] font-semibold text-[#111111]">
              Wersja zatwierdzona
            </span>
          </div>
        ) : showRevisionInput ? (
          <div className="flex flex-col gap-2.5">
            <textarea
              value={revisionText}
              onChange={(e) => setRevisionText(e.target.value)}
              placeholder="Co chcesz zmienić?"
              rows={3}
              className="font-sans text-[13px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] transition-colors placeholder:text-[#CCCCCC] resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => sendComment(revisionText, true)}
                disabled={sending || !revisionText.trim()}
                className="flex-1 font-sans text-[13px] font-medium bg-[#111111] text-white rounded-lg py-2.5 hover:bg-[#2a2a2a] disabled:opacity-40 transition-colors"
              >
                Wyślij poprawki
              </button>
              <button
                onClick={() => setShowRevisionInput(false)}
                className="font-sans text-[13px] font-medium text-[#888888] hover:text-[#111111] px-3 transition-colors"
              >
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={onApprove}
              className="w-full flex items-center justify-center gap-2 font-sans text-[14px] font-medium bg-[#111111] hover:bg-[#2a2a2a] text-white rounded-lg py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150"
            >
              <Check className="w-4 h-4" strokeWidth={2.5} />
              Zatwierdź tę wersję
            </button>
            <button
              onClick={() => setShowRevisionInput(true)}
              className="w-full flex items-center justify-center gap-2 font-sans text-[14px] font-medium text-[#555555] hover:text-[#111111] border border-[#EBEBEB] hover:border-[#CCCCCC] rounded-lg py-2.5 transition-all duration-150"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
              Zgłoś poprawki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
