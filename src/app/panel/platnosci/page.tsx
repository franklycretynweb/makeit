"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Download, Clock, Lock, Copy } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Dane stałe agencji — przenieść do ustawień gdy będzie admin panel
const BANK = {
  recipient: "Make it Studio sp. z o.o.",
  account: "PL 12 1140 2004 0000 3802 8016 8348",
};

type InvoiceStatus = "paid" | "upcoming" | "future";

interface Invoice {
  id: string;
  phase: string;
  invoice_number: string;
  name: string;
  description: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string | null;
  paid_date: string | null;
}

interface Project {
  name: string;
  domain: string | null;
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

function fmt(amount: number) {
  return new Intl.NumberFormat("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) + " zł";
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

function daysLeft(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="shrink-0 text-[#CCCCCC] hover:text-[#555555] transition-colors duration-150"
    >
      {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={1.75} />}
    </button>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-[1060px] animate-pulse">
      <div className="h-8 bg-[#F0F0F0] rounded w-40" />
      <div className="grid grid-cols-[1fr_300px] gap-5">
        <div className="flex flex-col gap-5">
          <div className="rounded-xl bg-[#F0F0F0] h-40" />
          <div className="rounded-xl bg-[#F0F0F0] h-64" />
        </div>
        <div className="flex flex-col gap-5">
          <div className="rounded-xl bg-[#F0F0F0] h-48" />
          <div className="rounded-xl bg-[#F0F0F0] h-48" />
        </div>
      </div>
    </div>
  );
}

export default function PlatnosciPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Pobierz profil (nazwa firmy do tytułu przelewu)
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("id", user.id)
        .single();
      if (profile?.company_name) setCompanyName(profile.company_name);

      // Pobierz projekt
      const { data: proj } = await supabase
        .from("projects")
        .select("id, name, domain")
        .eq("client_id", user.id)
        .single();
      if (!proj) { setLoading(false); return; }
      setProject(proj);

      // Pobierz faktury
      const { data: invData } = await supabase
        .from("invoices")
        .select("*")
        .eq("project_id", proj.id)
        .order("created_at", { ascending: true });
      setInvoices(invData ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <Skeleton />;
  if (!project) return <div className="font-sans text-[14px] text-[#AAAAAA]">Brak projektu.</div>;

  const paidAmount = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
  const paidCount = invoices.filter(i => i.status === "paid").length;
  const paidPct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
  const upcoming = invoices.find(i => i.status === "upcoming");
  const allPaid = invoices.length > 0 && invoices.every(i => i.status === "paid");

  const bankDetails = [
    { label: "Odbiorca", value: BANK.recipient },
    { label: "Nr konta", value: BANK.account },
    { label: "Tytuł przelewu", value: `Faktura #${upcoming?.invoice_number ?? "—"} — ${companyName || project.name}` },
    { label: "Kwota", value: upcoming ? `${fmt(upcoming.amount).replace(" zł", ",00 zł")}` : "—" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1060px]">

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-center gap-3">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">
          Płatności
        </h1>
        <span className="font-sans text-[11px] font-semibold text-[#555555] bg-[#EFEFEF] px-2.5 py-1 rounded-full">
          {allPaid ? "Wszystko opłacone" : "Na bieżąco"}
        </span>
      </motion.div>

      <div className="grid grid-cols-[1fr_300px] gap-5 items-start">

        {/* LEFT */}
        <div className="flex flex-col gap-5">

          {/* Hero */}
          <motion.div {...fadeUp(0.04)}>
            <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] mb-3">
                {upcoming ? "Następna płatność" : "Status płatności"}
              </p>
              {upcoming ? (
                <>
                  <p className="font-display text-[52px] font-bold tracking-[-0.05em] text-[#111111] leading-none">
                    {fmt(upcoming.amount)}
                  </p>
                  <div className="flex items-baseline gap-2 mt-3">
                    <p className="font-sans text-[14px] font-medium text-[#111111]">
                      Faktura #{upcoming.invoice_number}
                    </p>
                    <span className="text-[#AAAAAA]">·</span>
                    {upcoming.due_date && (
                      <>
                        <p className="font-sans text-[13px] text-[#555555]">
                          termin {fmtDate(upcoming.due_date)}
                        </p>
                        <span className="font-sans text-[12px] text-[#AAAAAA]">
                          (za {daysLeft(upcoming.due_date)} dni)
                        </span>
                      </>
                    )}
                  </div>
                  <p className="font-sans text-[12px] text-[#AAAAAA] mt-1">
                    {upcoming.description}
                  </p>
                </>
              ) : (
                <p className="font-display text-[32px] font-bold tracking-[-0.04em] text-[#111111]">
                  Wszystko opłacone 🎉
                </p>
              )}
            </div>
          </motion.div>

          {/* Milestone list */}
          <motion.div {...fadeUp(0.08)}>
            <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F5F5F5]">
                <h2 className="font-sans text-[13px] font-semibold text-[#111111]">Harmonogram płatności</h2>
              </div>

              <ul className="relative">
                <div className="absolute left-[37px] top-6 bottom-12 w-px bg-[#EFEFEF]" />
                {invoices.map((inv, i) => {
                  const isPaid = inv.status === "paid";
                  const isUpcoming = inv.status === "upcoming";
                  const isFuture = inv.status === "future";
                  return (
                    <li
                      key={inv.id}
                      className={`relative flex items-center gap-4 px-6 py-4 ${i < invoices.length - 1 ? "border-b border-[#F7F7F7]" : ""} ${isPaid ? "opacity-50" : ""} ${isFuture ? "opacity-30" : ""} ${isUpcoming ? "bg-[#FAFAFA]" : ""}`}
                    >
                      <div className="shrink-0 relative z-10">
                        {isPaid && <div className="w-[26px] h-[26px] rounded-full bg-[#111111] flex items-center justify-center"><Check size={12} strokeWidth={2.5} color="#fff" /></div>}
                        {isUpcoming && <div className="w-[26px] h-[26px] rounded-full bg-white border-2 border-[#111111] flex items-center justify-center"><Clock size={11} strokeWidth={2} color="#111111" /></div>}
                        {isFuture && <div className="w-[26px] h-[26px] rounded-full bg-white border border-[#DDDDDD] flex items-center justify-center"><Lock size={10} strokeWidth={1.75} color="#CCCCCC" /></div>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] mb-0.5">{inv.phase}</p>
                        <p className="font-sans text-[14px] font-semibold text-[#111111] leading-tight">{inv.name}</p>
                        <p className="font-sans text-[12px] text-[#AAAAAA] mt-0.5">
                          {inv.description}
                          {isPaid && inv.paid_date && <> · Opłacono {fmtDate(inv.paid_date)}</>}
                          {isUpcoming && inv.due_date && (
                            <> · <span className="text-[#555555] font-medium">za {daysLeft(inv.due_date)} dni</span></>
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <span className="font-display text-[15px] font-bold tracking-[-0.03em] text-[#111111]">
                          {fmt(inv.amount)}
                        </span>
                        {isPaid && (
                          <button className="flex items-center gap-1.5 font-sans text-[11px] font-medium text-[#888888] border border-[#E5E5E5] hover:border-[#CCCCCC] hover:text-[#333333] px-2.5 py-1 rounded-md transition-all duration-150 whitespace-nowrap">
                            <Download size={11} strokeWidth={2} /> PDF
                          </button>
                        )}
                        {isUpcoming && (
                          <span className="font-sans text-[11px] font-medium text-[#555555] bg-white border border-[#DDDDDD] px-2.5 py-1 rounded-md whitespace-nowrap">Oczekuje</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="px-6 py-4 border-t border-[#EBEBEB] bg-[#FAFAFA] flex items-center justify-between">
                <p className="font-sans text-[12px] text-[#AAAAAA]">Łączna wartość projektu</p>
                <p className="font-display text-[17px] font-bold tracking-[-0.03em] text-[#111111]">{fmt(totalAmount)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-5">

          {/* Payment progress */}
          <motion.div {...fadeUp(0.06)}>
            <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA] mb-4">Postęp płatności</p>
              <div className="flex items-start gap-2 mb-4">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${inv.status === "paid" ? "bg-[#111111]" : inv.status === "upcoming" ? "border-2 border-[#CCCCCC] bg-white" : "border border-[#EBEBEB] bg-white"}`}>
                      {inv.status === "paid" && <Check size={13} strokeWidth={2.5} color="#fff" />}
                    </div>
                    <span className={`font-sans text-[9px] font-semibold text-center leading-tight ${inv.status === "paid" ? "text-[#555555]" : "text-[#CCCCCC]"}`}>
                      {inv.phase}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-[2px] w-full rounded-full bg-[#F0F0F0] overflow-hidden mb-2">
                <div className="h-full bg-[#111111] rounded-full" style={{ width: `${paidPct}%` }} />
              </div>

              <div className="flex justify-between items-baseline mt-3">
                <div>
                  <p className="font-display text-[18px] font-bold tracking-[-0.03em] text-[#111111]">{fmt(paidAmount)}</p>
                  <p className="font-sans text-[11px] text-[#AAAAAA]">zapłacono</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-[18px] font-bold tracking-[-0.03em] text-[#CCCCCC]">{fmt(totalAmount - paidAmount)}</p>
                  <p className="font-sans text-[11px] text-[#AAAAAA]">pozostało</p>
                </div>
              </div>

              <p className="font-sans text-[11px] text-[#AAAAAA] mt-3 pt-3 border-t border-[#F5F5F5]">
                {paidCount} z {invoices.length} płatności · {paidPct}% wartości projektu
              </p>
            </div>
          </motion.div>

          {/* Bank details — tylko gdy jest upcoming */}
          {upcoming && (
            <motion.div {...fadeUp(0.1)}>
              <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#F5F5F5]">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA]">Dane do przelewu</p>
                  <p className="font-sans text-[12px] text-[#AAAAAA] mt-0.5">Faktura #{upcoming.invoice_number}</p>
                </div>
                <ul className="divide-y divide-[#F7F7F7]">
                  {bankDetails.map(({ label, value }) => (
                    <li key={label} className="px-5 py-3">
                      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#AAAAAA] mb-1">{label}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-sans text-[12px] font-medium text-[#111111] leading-snug break-all">{value}</p>
                        <CopyButton value={value} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          <motion.div {...fadeUp(0.12)}>
            <p className="font-sans text-[12px] text-[#BBBBBB] text-center">
              Pytania?{" "}
              <Link href="/panel/wiadomosci" className="text-[#888888] hover:text-[#111111] underline underline-offset-2 transition-colors">
                Napisz do nas
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
