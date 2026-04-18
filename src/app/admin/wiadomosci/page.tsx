"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Search, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AdminModal from "@/components/admin/AdminModal";
import ProjectSelector from "@/components/admin/ProjectSelector";

interface Thread {
  id: string;
  title: string;
  project_id: string;
  project_name: string;
  company_name: string;
  lastMessage: string;
  lastTime: string;
}

interface Message {
  id: string;
  content: string;
  is_client: boolean;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "przed chwilą";
  if (m < 60) return `${m} min`;
  if (h < 24) return `${h} godz.`;
  return `${d} dni`;
}

function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
}

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function AdminWiadomosci() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newProjectId, setNewProjectId] = useState("");
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [creatingThread, setCreatingThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: threadData } = await supabase
        .from("threads")
        .select("id, title, project_id, projects(name, profiles!client_id(company_name))")
        .order("created_at", { ascending: false });

      const enriched: Thread[] = await Promise.all(
        (threadData ?? []).map(async (t: any) => {
          const { data: last } = await supabase
            .from("messages").select("content, created_at")
            .eq("thread_id", t.id).order("created_at", { ascending: false }).limit(1).single();
          return {
            id: t.id, title: t.title, project_id: t.project_id,
            project_name: t.projects?.name ?? "—",
            company_name: t.projects?.profiles?.company_name ?? "—",
            lastMessage: last?.content ?? "",
            lastTime: last ? timeAgo(last.created_at) : "",
          };
        })
      );
      setThreads(enriched);
      setActiveThreadId(enriched[0]?.id ?? null);
      setLoadingThreads(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeThreadId) return;
    setLoadingMessages(true);
    const fetch = async () => {
      const { data } = await supabase
        .from("messages").select("id, content, is_client, created_at")
        .eq("thread_id", activeThreadId).order("created_at", { ascending: true });
      setMessages(data ?? []);
      setLoadingMessages(false);
    };
    fetch();
    const channel = supabase.channel(`admin-thread-${activeThreadId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${activeThreadId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const send = async () => {
    if (!input.trim() || !activeThreadId || !activeThread || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    await supabase.from("messages").insert({
      project_id: activeThread.project_id,
      thread_id: activeThreadId,
      content,
      is_client: false, // agencja pisze
    });
    setThreads((prev) => prev.map((t) => t.id === activeThreadId ? { ...t, lastMessage: content, lastTime: "przed chwilą" } : t));
    setSending(false);
  };

  const createThread = async () => {
    if (!newProjectId || !newThreadTitle.trim()) return;
    setCreatingThread(true);
    const { data } = await supabase.from("threads")
      .insert({ project_id: newProjectId, title: newThreadTitle.trim() })
      .select("id, title, project_id, projects(name, profiles!client_id(company_name))")
      .single();
    if (data) {
      const t: Thread = {
        id: (data as any).id, title: (data as any).title, project_id: (data as any).project_id,
        project_name: (data as any).projects?.name ?? "—",
        company_name: (data as any).projects?.profiles?.company_name ?? "—",
        lastMessage: "", lastTime: "",
      };
      setThreads((prev) => [t, ...prev]);
      setActiveThreadId(t.id);
    }
    setCreatingThread(false);
    setShowNewThread(false);
    setNewThreadTitle("");
  };

  return (
    <div className="flex -mt-6 -mx-8 -mb-10 h-[calc(100vh-56px)]">
      {/* Thread list */}
      <div className="w-[300px] shrink-0 border-r border-[#EBEBEB] bg-white flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-[#EBEBEB] flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#CCCCCC]" strokeWidth={1.75} />
            <input type="text" placeholder="Szukaj..." className="w-full font-sans text-[13px] pl-9 pr-3 py-2 bg-[#F5F5F5] rounded-lg focus:outline-none placeholder:text-[#CCCCCC]" />
          </div>
          <button onClick={() => setShowNewThread(true)}
            className="flex items-center justify-center gap-1.5 font-sans text-[12px] font-medium text-[#888888] hover:text-[#111111] border border-[#EBEBEB] hover:border-[#CCCCCC] rounded-lg py-1.5 transition-all"
          >
            <Plus size={12} strokeWidth={2.5} /> Nowy wątek
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {loadingThreads ? (
            <div className="flex flex-col gap-0">
              {[1,2,3].map(i => (
                <div key={i} className="px-4 py-4 border-b border-[#F5F5F5] animate-pulse">
                  <div className="h-3 bg-[#F0F0F0] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#F0F0F0] rounded w-full" />
                </div>
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="font-sans text-[13px] text-[#AAAAAA]">Brak wątków</p>
            </div>
          ) : threads.map((thread) => (
            <button key={thread.id} onClick={() => setActiveThreadId(thread.id)}
              className={`w-full text-left px-4 py-3.5 transition-colors duration-150 border-b border-[#F5F5F5] border-l-2 ${activeThreadId === thread.id ? "bg-[#F0F0F0] border-l-[#111111]" : "border-l-transparent hover:bg-[#F7F7F7]"}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-sans text-[13px] font-medium text-[#555555] truncate">{thread.title}</span>
                <span className="font-sans text-[11px] text-[#AAAAAA] shrink-0 ml-2">{thread.lastTime}</span>
              </div>
              <p className="font-sans text-[11px] text-[#AAAAAA] font-medium mb-0.5">{thread.company_name}</p>
              <p className="font-sans text-[12px] text-[#AAAAAA] truncate">{thread.lastMessage}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-5 py-3 bg-white border-b border-[#EBEBEB] flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center shrink-0">
            <span className="font-sans text-[9px] font-bold text-white">MI</span>
          </div>
          <div>
            <p className="font-sans text-[14px] font-semibold text-[#111111]">{activeThread?.title ?? "Wiadomości"}</p>
            <p className="font-sans text-[11px] text-[#AAAAAA]">{activeThread?.company_name ?? "Wybierz wątek"} · {activeThread?.project_name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#EBEBEB] px-5 py-5">
          {loadingMessages ? (
            <div className="max-w-[620px] mx-auto flex flex-col gap-4 animate-pulse">
              {[1,2,3].map(i => <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}><div className="w-7 h-7 rounded-full bg-[#DDDDDD] shrink-0" /><div className={`rounded-2xl h-12 ${i % 2 === 0 ? "bg-[#AAAAAA]" : "bg-white"}`} style={{ width: `${120 + i * 40}px` }} /></div>)}
            </div>
          ) : (
            <div className="max-w-[620px] mx-auto flex flex-col">
              {messages.map((msg, i) => {
                const prev = messages[i - 1];
                const next = messages[i + 1];
                const isGroupStart = !prev || prev.is_client !== msg.is_client;
                const isGroupEnd = !next || next.is_client !== msg.is_client;
                const topGap = isGroupStart && i > 0 ? "mt-4" : "mt-0.5";
                const showDateSep = !prev || !sameDay(prev.created_at, msg.created_at);
                // In admin: is_client=false = agency (right side), is_client=true = client (left side)
                const isMe = !msg.is_client;
                return (
                  <div key={msg.id}>
                    {showDateSep && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-[#DDDDDD]" />
                        <span className="font-sans text-[11px] font-medium text-[#AAAAAA]">{fmtDate(msg.created_at)}</span>
                        <div className="flex-1 h-px bg-[#DDDDDD]" />
                      </div>
                    )}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                      className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""} ${topGap}`}
                    >
                      <div className="shrink-0 w-7 self-end mb-0.5">
                        {isGroupEnd && (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isMe ? "bg-[#111111]" : "bg-[#DDDDDD]"}`}>
                            <span className={`font-sans text-[8px] font-bold ${isMe ? "text-white" : "text-[#555555]"}`}>{isMe ? "MI" : activeThread?.company_name?.slice(0, 2).toUpperCase() ?? "K"}</span>
                          </div>
                        )}
                      </div>
                      <div className={`flex flex-col max-w-[440px] ${isMe ? "items-end" : "items-start"}`}>
                        {isGroupStart && <span className="font-sans text-[11px] font-medium text-[#999999] mb-1 px-1">{isMe ? "make it" : activeThread?.company_name}</span>}
                        <div className={`px-4 py-2.5 rounded-2xl ${isMe ? "bg-[#111111] text-white rounded-br-sm" : "bg-white text-[#111111] rounded-bl-sm shadow-[0_1px_2px_rgba(0,0,0,0.06)]"}`}>
                          <p className="font-sans text-[13.5px] leading-relaxed">{msg.content}</p>
                        </div>
                        {isGroupEnd && <span className="font-sans text-[10px] text-[#AAAAAA] mt-1 px-1">{fmtTime(msg.created_at)}</span>}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 bg-white border-t border-[#EBEBEB]">
          <div className="max-w-[620px] mx-auto flex items-center gap-2">
            <button className="w-9 h-9 rounded-lg border border-[#EBEBEB] flex items-center justify-center text-[#AAAAAA] hover:border-[#CCCCCC] transition-all shrink-0">
              <Paperclip size={15} strokeWidth={1.75} />
            </button>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Napisz wiadomość do klienta..."
              className="flex-1 font-sans text-[14px] bg-[#F5F5F5] rounded-lg px-4 py-2.5 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#CCCCCC] transition-all placeholder:text-[#CCCCCC]"
            />
            <button onClick={send} disabled={sending || !input.trim()}
              className="w-9 h-9 rounded-lg bg-[#111111] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors shrink-0 disabled:opacity-40"
            >
              <Send size={14} strokeWidth={2} className="text-white translate-x-px" />
            </button>
          </div>
        </div>
      </div>

      <AdminModal open={showNewThread} title="Nowy wątek" onClose={() => setShowNewThread(false)}
        footer={
          <button onClick={createThread} disabled={creatingThread || !newThreadTitle.trim()}
            className="w-full bg-[#111111] hover:bg-[#2a2a2a] disabled:opacity-50 text-white font-sans text-[14px] font-medium py-2.5 rounded-lg transition-all"
          >
            {creatingThread ? "Tworzę..." : "Utwórz wątek"}
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Projekt</label>
            <ProjectSelector value={newProjectId} onChange={setNewProjectId} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#555555]">Tytuł wątku</label>
            <input type="text" value={newThreadTitle} onChange={e => setNewThreadTitle(e.target.value)}
              placeholder="np. Feedback do mockupów"
              className="font-sans text-[14px] border border-[#EBEBEB] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] placeholder:text-[#CCCCCC]"
            />
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
