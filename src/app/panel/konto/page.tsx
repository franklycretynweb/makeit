"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function KontoPage() {
  const [firstName, setFirstName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("first_name, company_name, phone")
        .eq("id", user.id)
        .single();
      if (data) {
        setFirstName(data.first_name ?? "");
        setCompanyName(data.company_name ?? "");
        setPhone(data.phone ?? "");
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    await supabase.from("profiles").update({ first_name: firstName, company_name: companyName, phone }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = (firstName || companyName || email)
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="max-w-[600px] flex flex-col gap-6">
      <motion.div {...fadeUp(0)}>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">Moje konto</h1>
        <p className="font-sans text-[14px] text-[#888888] mt-0.5">Zarządzaj swoimi danymi osobowymi.</p>
      </motion.div>

      <motion.div {...fadeUp(0.06)}>
        <div className="rounded-xl border border-[#EBEBEB] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#F5F5F5]">
            <div className="w-14 h-14 rounded-full bg-[#111111] flex items-center justify-center shrink-0">
              <span className="font-sans text-[16px] font-bold text-white">{initials}</span>
            </div>
            <div>
              <p className="font-sans text-[16px] font-semibold text-[#111111]">{firstName || companyName || "—"}</p>
              <p className="font-sans text-[13px] text-[#888888]">{email}</p>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[12px] font-semibold text-[#555555]">Imię</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jan"
                  className="font-sans text-[14px] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] transition-colors placeholder:text-[#CCCCCC]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[12px] font-semibold text-[#555555]">Firma</label>
                <input
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Nazwa firmy"
                  className="font-sans text-[14px] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] transition-colors placeholder:text-[#CCCCCC]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">Telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+48 000 000 000"
                className="font-sans text-[14px] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#AAAAAA] transition-colors placeholder:text-[#CCCCCC]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-[#555555]">Adres e-mail</label>
              <input
                value={email}
                disabled
                className="font-sans text-[14px] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 bg-[#FAFAFA] text-[#AAAAAA] cursor-not-allowed"
              />
              <p className="font-sans text-[11px] text-[#CCCCCC]">
                Zalogowano przez Google — e-mail nie może być zmieniony.
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#2a2a2a] text-white font-sans text-[13px] font-medium transition-colors disabled:opacity-60"
          >
            {saved ? <Check size={15} strokeWidth={2.5} /> : null}
            {saving ? "Zapisuję..." : saved ? "Zapisano!" : "Zapisz zmiany"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
