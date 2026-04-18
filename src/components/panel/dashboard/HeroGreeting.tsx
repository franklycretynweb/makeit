"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 5)  return `Dobranoc, ${name}`;
  if (hour < 12) return `Dzień dobry, ${name}`;
  if (hour < 18) return `Cześć, ${name}`;
  return `Dobry wieczór, ${name}`;
}

interface HeroGreetingProps {
  actionCount: number;
  firstName?: string;
}

export default function HeroGreeting({ actionCount, firstName: firstNameProp }: HeroGreetingProps) {
  const [firstName, setFirstName] = useState(firstNameProp ?? "");

  useEffect(() => {
    if (firstNameProp) { setFirstName(firstNameProp); return; }
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();
      if (data?.first_name) setFirstName(data.first_name);
    };
    load();
  }, [firstNameProp]);

  const statusLine =
    actionCount === 0 ? (
      <span>Nic nie czeka — wszystko gra.</span>
    ) : actionCount === 1 ? (
      <>
        Czeka na Ciebie{" "}
        <span className="font-semibold text-[#111111]">1 rzecz</span>.
      </>
    ) : (
      <>
        Czekają na Ciebie{" "}
        <span className="font-semibold text-[#111111]">{actionCount} rzeczy</span>.
      </>
    );

  return (
    <div data-tour="hero">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-[36px] font-bold tracking-[-0.04em] text-[#111111] leading-tight"
      >
        {firstName ? getGreeting(firstName) : "Cześć!"}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
        className="font-sans text-[16px] text-[#666666] mt-1.5"
      >
        {statusLine}
      </motion.p>
    </div>
  );
}
