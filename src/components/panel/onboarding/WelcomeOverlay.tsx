"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import logoSrc from "../../../../public/logo/logo_makeit.webp";
import { createClient } from "@/lib/supabase/client";

interface WelcomeOverlayProps {
  onContinue: (firstName: string) => void;
}

type Step = "name" | "welcome";

export default function WelcomeOverlay({ onContinue }: WelcomeOverlayProps) {
  const [step, setStep] = useState<Step>("name");
  const [firstName, setFirstName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("company_name, first_name")
        .eq("id", user.id)
        .single();
      if (data?.company_name) setCompanyName(data.company_name);
      // If already has first_name, skip to welcome
      if (data?.first_name) {
        setFirstName(data.first_name);
        setStep("welcome");
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (step === "name") {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [step]);

  const handleNameSubmit = async () => {
    const name = firstName.trim();
    if (!name) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ first_name: name })
        .eq("id", user.id);
    }

    setSaving(false);
    setStep("welcome");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E8F1FF] via-[#F0F5FF] to-white" />

      {/* Cloud decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 0.12, x: 0 }}
          transition={{ duration: 1.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -left-[10%] top-[10%] w-[55%]"
        >
          <Image src="/design/parallax/cloud-left.png" alt="" width={800} height={500} className="w-full h-auto" priority />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 0.10, x: 0 }}
          transition={{ duration: 1.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -right-[10%] top-[5%] w-[55%]"
        >
          <Image src="/design/parallax/cloud-right.png" alt="" width={800} height={500} className="w-full h-auto" priority />
        </motion.div>
      </div>

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] rounded-full bg-[#4EA8FF] opacity-[0.06] blur-[120px]" />
        <div className="absolute top-[40%] right-[25%] w-[250px] h-[250px] rounded-full bg-[#9B66FF] opacity-[0.05] blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">

        {/* Step 1 — Name input */}
        {step === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-[460px] w-full mx-6"
          >
            <div className="relative rounded-[32px] bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_24px_80px_rgba(0,0,0,0.08),0_8px_32px_rgba(78,168,255,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] p-10 text-center">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

              <div className="relative">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  <Image src={logoSrc} alt="make it." className="h-7 w-auto object-contain" height={28} />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                </div>

                <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111] leading-tight mb-2">
                  Zanim zaczniemy —
                </h1>
                <p className="font-sans text-[15px] text-[#6B7280] leading-relaxed mb-8">
                  Jak masz na imię? Chcemy się zwracać do&nbsp;Ciebie personalnie.
                </p>

                <div className="flex flex-col gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                    placeholder="Twoje imię..."
                    className="w-full font-sans text-[16px] text-[#111111] bg-white border border-[#E5E7EB] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#4EA8FF] focus:ring-2 focus:ring-[#4EA8FF]/20 transition-all placeholder:text-[#C4C9D4]"
                  />
                  <button
                    onClick={handleNameSubmit}
                    disabled={!firstName.trim() || saving}
                    className="group w-full inline-flex items-center justify-center gap-2.5 bg-[#111111] hover:bg-[#000000] disabled:opacity-40 text-white font-sans text-[15px] font-medium px-7 py-3.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {saving ? "Zapisuję..." : "Dalej"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2 — Welcome */}
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-[520px] w-full mx-6"
          >
            <div className="relative rounded-[32px] bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_24px_80px_rgba(0,0,0,0.08),0_8px_32px_rgba(78,168,255,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] p-12 text-center">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

              <div className="relative">
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center justify-center gap-2.5 mb-10"
                >
                  <Image src={logoSrc} alt="make it." className="h-8 w-auto object-contain" height={32} />
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                >
                  <h1 className="font-display text-[36px] font-bold tracking-[-0.04em] text-[#111111] leading-[1.15] mb-4">
                    Witaj, <span className="gradient-text">{firstName || companyName || "w panelu"}</span>.
                  </h1>
                  <p className="font-sans text-[16px] text-[#6B7280] leading-relaxed max-w-[380px] mx-auto">
                    Tutaj śledzisz postępy, akceptujesz projekty i&nbsp;komunikujesz się z&nbsp;naszym zespołem. Wszystko w&nbsp;jednym miejscu.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 }}
                  className="mt-10"
                >
                  <button
                    onClick={() => onContinue(firstName)}
                    className="group inline-flex items-center gap-2.5 bg-[#111111] hover:bg-[#000000] text-white font-sans text-[15px] font-medium px-7 py-3.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Pokaż mi panel
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={2} />
                  </button>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="font-sans text-[11px] text-[#CCCCCC] mt-8 tracking-wide"
                >
                  powered by make it
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
