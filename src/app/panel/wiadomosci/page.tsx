"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Thread {
  id: string;
  title: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

interface Message {
  id: string;
  content: string;
  is_client: boolean;
  created_at: string;
  author_name?: string;
  initials?: string;
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

function fmtTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
}

function sameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function WiadomosciPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("Klient");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Inicjalizacja — pobierz projekt i wątki
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles").select("company_name").eq("id", user.id).single();
      if (profile?.company_name) setCompanyName(profile.company_name);

      const { data: project } = await supabase
        .from("projects").select("id").eq("client_id", user.id).single();
      if (!project) { setLoadingThreads(false); return; }
      setProjectId(project.id);

      const { data: threadData } = await supabase
        .from("threads").select("id, title, created_at")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false });

      if (!threadData?.length) { setLoadingThreads(false); return; }

      // Dla każdego wątku pobierz ostatnią wiadomość
      const enriched: Thread[] = await Promise.all(
        threadData.map(async (t) => {
          const { data: last } = await supabase
            .from("messages").select("content, created_at, is_client")
            .eq("thread_id", t.id)
            .order("created_at", { ascending: false })
            .limit(1).single();
          return {
            id: t.id,
            title: t.title,
            lastMessage: last?.content ?? "",
            lastTime: last ? timeAgo(last.created_at) : "",
            unread: 0,
          };
        })
      );

      setThreads(enriched);
      setActiveThreadId(enriched[0]?.id ?? null);
      setLoadingThreads(false);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pobierz wiadomości gdy zmienia się aktywny wątek
  useEffect(() => {
    if (!activeThreadId) return;
    setLoadingMessages(true);

    const fetch = async () => {
      const { data } = await supabase
        .from("messages").select("id, content, is_client, created_at")
        .eq("thread_id", activeThreadId)
        .order("created_at", { ascending: true });
      setMessages(data ?? []);
      setLoadingMessages(false);
    };
    fetch();

    // Real-time subskrypcja
    const channel = supabase
      .channel(`thread-${activeThreadId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `thread_id=eq.${activeThreadId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadId]);

  // Auto-scroll na nową wiadomość
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !activeThreadId || !projectId || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    await supabase.from("messages").insert({
      project_id: projectId,
      thread_id: activeThreadId,
      content,
      is_client: true,
    });

    // Zaktualizuj podgląd wątku
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? { ...t, lastMessage: content, lastTime: "przed chwilą" }
          : t
      )
    );
    setSending(false);
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="flex -mt-6 -mx-8 -mb-10 h-[calc(100vh-56px)]">

      {/* Thread list */}
      <div className="w-[280px] shrink-0 border-r border-[#EBEBEB] bg-white flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-[#EBEBEB]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#CCCCCC]" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Szukaj..."
              className="w-full font-sans text-[13px] pl-9 pr-3 py-2 bg-[#F5F5F5] rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#EBEBEB] transition-all duration-150 placeholder:text-[#CCCCCC]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loadingThreads ? (
            <div className="flex flex-col gap-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-4 py-4 border-b border-[#F5F5F5] animate-pulse">
                  <div className="h-3 bg-[#F0F0F0] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#F0F0F0] rounded w-full" />
                </div>
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="font-sans text-[13px] text-[#AAAAAA]">Brak wiadomości</p>
            </div>
          ) : (
            threads.map((thread) => {
              const isActive = activeThreadId === thread.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full text-left px-4 py-3.5 transition-colors duration-150 border-b border-[#F5F5F5] border-l-2 ${
                    isActive ? "bg-[#F0F0F0] border-l-[#111111]" : "border-l-transparent hover:bg-[#F7F7F7]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`font-sans text-[13px] truncate ${thread.unread > 0 ? "font-semibold text-[#111111]" : "font-medium text-[#555555]"}`}>
                      {thread.title}
                    </span>
                    <span className="font-sans text-[11px] text-[#AAAAAA] shrink-0 ml-2">{thread.lastTime}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-sans text-[12px] text-[#AAAAAA] truncate flex-1">{thread.lastMessage}</p>
                    {thread.unread > 0 && (
                      <span className="shrink-0 w-[18px] h-[18px] rounded-full bg-[#111111] text-white font-sans text-[10px] font-bold flex items-center justify-center">
                        {thread.unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="px-5 py-3 bg-white border-b border-[#EBEBEB] flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center shrink-0">
            <span className="font-sans text-[9px] font-bold text-white">MB</span>
          </div>
          <div>
            <p className="font-sans text-[14px] font-semibold text-[#111111]">
              {activeThread?.title ?? "Wiadomości"}
            </p>
            <p className="font-sans text-[11px] text-[#AAAAAA]">Mateusz B. · make it studio</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto bg-[#EBEBEB] px-5 py-5">
          {loadingMessages ? (
            <div className="max-w-[620px] mx-auto flex flex-col gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                  <div className="w-7 h-7 rounded-full bg-[#DDDDDD] shrink-0" />
                  <div className={`rounded-2xl h-12 ${i % 2 === 0 ? "bg-[#AAAAAA]" : "bg-white"}`} style={{ width: `${120 + i * 40}px` }} />
                </div>
              ))}
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

                return (
                  <div key={msg.id}>
                    {showDateSep && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-[#DDDDDD]" />
                        <span className="font-sans text-[11px] font-medium text-[#AAAAAA]">
                          {fmtDate(msg.created_at)}
                        </span>
                        <div className="flex-1 h-px bg-[#DDDDDD]" />
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className={`flex gap-2.5 ${msg.is_client ? "flex-row-reverse" : ""} ${topGap}`}
                    >
                      <div className="shrink-0 w-7 self-end mb-0.5">
                        {isGroupEnd && (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${msg.is_client ? "bg-[#DDDDDD]" : "bg-[#111111]"}`}>
                            <span className={`font-sans text-[8px] font-bold ${msg.is_client ? "text-[#555555]" : "text-white"}`}>
                              {msg.is_client ? companyName.slice(0, 2).toUpperCase() : "MB"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className={`flex flex-col max-w-[440px] ${msg.is_client ? "items-end" : "items-start"}`}>
                        {isGroupStart && (
                          <span className="font-sans text-[11px] font-medium text-[#999999] mb-1 px-1">
                            {msg.is_client ? companyName : "Mateusz B."}
                          </span>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl ${msg.is_client ? "bg-[#111111] text-white rounded-br-sm" : "bg-white text-[#111111] rounded-bl-sm shadow-[0_1px_2px_rgba(0,0,0,0.06)]"}`}>
                          <p className="font-sans text-[13.5px] leading-relaxed">{msg.content}</p>
                        </div>
                        {isGroupEnd && (
                          <span className="font-sans text-[10px] text-[#AAAAAA] mt-1 px-1">
                            {fmtTime(msg.created_at)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-3.5 bg-white border-t border-[#EBEBEB]">
          <div className="max-w-[620px] mx-auto flex items-center gap-2">
            <button className="w-9 h-9 rounded-lg border border-[#EBEBEB] flex items-center justify-center text-[#AAAAAA] hover:text-[#555555] hover:border-[#CCCCCC] transition-all duration-150 shrink-0">
              <Paperclip size={15} strokeWidth={1.75} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Napisz wiadomość..."
              className="flex-1 font-sans text-[14px] bg-[#F5F5F5] rounded-lg px-4 py-2.5 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#CCCCCC] transition-all duration-150 placeholder:text-[#CCCCCC]"
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="w-9 h-9 rounded-lg bg-[#111111] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors duration-150 shrink-0 disabled:opacity-40"
            >
              <Send size={14} strokeWidth={2} className="text-white translate-x-px" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
