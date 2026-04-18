"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Minus, ArrowRight } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────────────────

const tiers = [
  {
    id: "standard",
    name: "Standard",
    tagline: "Dobry start",
    price: { monthly: 3000 },
    description: "Idealne dla firm, które chcą zaistnieć w internecie i mediach społecznościowych.",
    cta: "Zacznij ze Standard",
    featured: false,
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Pełna moc",
    price: { monthly: 6000 },
    description: "Kompleksowe działania marketingowe dla firm gotowych na intensywny wzrost.",
    cta: "Zacznij z Premium",
    featured: true,
  },
  {
    id: "make-it-work",
    name: "Make it Work",
    tagline: "Robimy wszystko",
    price: { monthly: 12000 },
    description: "Dedykowany zespół, który przejmuje cały marketing Twojej firmy.",
    cta: "Porozmawiajmy",
    featured: false,
  },
] as const;

// Feature categories with per-tier values (true = included, false = not, string = specific detail)
const featureGroups = [
  {
    label: "Strona internetowa",
    features: [
      {
        name: "Strona internetowa",
        values: ["One-page lub 3 podstrony", "Do 7 podstron + SEO + GA", "Custom design + animacje + blog"],
      },
      {
        name: "Identyfikacja wizualna",
        values: [false, "Logo + kolory + fonty + brand book", "Pełny brand book + materiały drukowane"],
      },
    ],
  },
  {
    label: "Social Media",
    features: [
      {
        name: "Rolki miesięcznie",
        values: ["4 rolki (Reels/TikTok)", "8 rolek (Reels/TikTok/Shorts)", "12 rolek + 4 długie formy wideo"],
      },
      {
        name: "Prowadzone platformy",
        values: ["Instagram + Facebook", "Instagram + FB + TikTok + YT", "5 platform + LinkedIn"],
      },
      {
        name: "Content plan",
        values: [false, "Na miesiąc do przodu", "Na kwartał — z lejkiem sprzedażowym"],
      },
    ],
  },
  {
    label: "Foto & Wideo",
    features: [
      {
        name: "Sesja zdjęciowa",
        values: ["5 zdjęć produktowych", "15 zdjęć + obróbka", "Pełny dzień zdjęciowy na lokacji"],
      },
    ],
  },
  {
    label: "Reklamy",
    features: [
      {
        name: "Kampanie reklamowe",
        values: [false, "Meta Ads (konfiguracja + obsługa)", "Meta Ads + Google Ads + optymalizacja"],
      },
    ],
  },
  {
    label: "Raportowanie",
    features: [
      {
        name: "Raport wyników",
        values: ["Miesięczny raport", "Miesięczny + spotkanie online", "Tygodniowy + spotkanie z roadmapą"],
      },
      {
        name: "Opiekun klienta",
        values: [false, false, "Dedykowany opiekun 6 dni/tyg."],
      },
    ],
  },
];

const faq = [
  {
    q: "Czy mogę zmienić pakiet w trakcie współpracy?",
    a: "Tak. Zmiana pakietu jest możliwa z miesięcznym wyprzedzeniem. Nie ma żadnych kar ani ukrytych kosztów przy zmianie.",
  },
  {
    q: "Jaki jest minimalny czas współpracy?",
    a: "Nie narzucamy minimalnego czasu, ale rekomendujemy 3 miesiące — tyle zajmuje zwykle wypracowanie widocznych efektów.",
  },
  {
    q: "Czy podane ceny są netto czy brutto?",
    a: "Wszystkie ceny są podane w wartościach netto. Do każdej ceny należy doliczyć VAT 23%.",
  },
  {
    q: "Co jeśli potrzebuję czegoś spoza pakietu?",
    a: "Zawsze możemy wycenić dodatkowe usługi indywidualnie. Napisz do nas — przygotujemy ofertę dopasowaną do potrzeb.",
  },
  {
    q: "Jak wygląda start współpracy?",
    a: "Po wyborze pakietu umawiamy się na kick-off call, ustalamy cele i harmonogram. Pierwsze działania startują w ciągu 5 dni roboczych.",
  },
  {
    q: "Jak wygląda rozwiązanie umowy?",
    a: "Miesięczne wypowiedzenie, bez ukrytych kosztów. Wszystkie materiały i dostępy zostają u Ciebie.",
  },
];

// ─── Components ──────────────────────────────────────────────────────────────

function FeatureValue({ value, featured = false }: { value: string | boolean; featured?: boolean }) {
  if (value === false) {
    return <Minus size={14} strokeWidth={2} className="text-[#D8D8D8]" />;
  }
  if (value === true) {
    return <Check size={15} strokeWidth={2.5} className="text-[#111111]" />;
  }
  return (
    <p className={`font-sans text-[13px] text-center leading-snug max-w-[180px] ${
      featured ? "font-semibold text-[#111111]" : "text-[#555555]"
    }`}>
      {value as string}
    </p>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left py-5 border-b border-[#EBEBEB] group"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-sans text-[15px] font-semibold text-[#111111] leading-snug">{q}</span>
        <span className={`shrink-0 w-5 h-5 rounded-full border border-[#CCCCCC] flex items-center justify-center transition-all duration-200 mt-0.5 ${open ? "bg-[#111111] border-[#111111]" : "group-hover:border-[#888888]"}`}>
          <span className={`font-sans text-[12px] font-bold leading-none transition-transform duration-200 ${open ? "text-white rotate-45" : "text-[#888888]"}`}>+</span>
        </span>
      </div>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="font-sans text-[14px] text-[#666666] leading-relaxed mt-3"
        >
          {a}
        </motion.p>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PakietyPage() {
  const tableRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const tableInView = useInView(tableRef, { once: true, margin: "-100px" });
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const chooseTier = (tierId: string) => {
    setSelectedTier(tierId);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  });

  return (
    <>
      <Nav />
      <main className="bg-[#F9F9F9]">

        {/* ── Hero ── */}
        <section className="pt-36 pb-20 px-6 text-center">
          <motion.div {...fadeUp(0)} className="max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 font-sans text-[12px] font-medium text-[#888888] tracking-[0.12em] uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Dostępni na nowe projekty
            </span>
            <h1 className="font-display text-[52px] sm:text-[64px] font-medium tracking-[-0.04em] text-[#111111] leading-[1.05] mb-6">
              Transparentne ceny,<br />
              <span className="gradient-text">mierzalne wyniki.</span>
            </h1>
            <p className="font-sans text-[17px] text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Każdy pakiet to kompletny zespół — designer, developer, social media manager i fotograf w jednym. Bez ukrytych kosztów.
            </p>
            <div className="flex items-center justify-center gap-6 font-sans text-[13px] text-[#888888]">
              <span className="flex items-center gap-1.5"><Check size={13} strokeWidth={2.5} className="text-[#111111]" /> Miesięczne wypowiedzenie</span>
              <span className="flex items-center gap-1.5"><Check size={13} strokeWidth={2.5} className="text-[#111111]" /> Ceny netto + VAT 23%</span>
              <span className="flex items-center gap-1.5"><Check size={13} strokeWidth={2.5} className="text-[#111111]" /> Start w 5 dni roboczych</span>
            </div>
          </motion.div>
        </section>

        {/* ── Pricing cards ── */}
        <section className="px-6 pb-8">
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                {...fadeUp(0.1 + i * 0.08)}
                className={`relative rounded-[28px] p-8 flex flex-col ${
                  tier.featured
                    ? "bg-[#111111] text-white shadow-[0_24px_80px_rgba(0,0,0,0.18)] scale-[1.03]"
                    : "bg-white border border-[#EBEBEB] shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4EA8FF] to-[#9B66FF] text-white font-sans text-[11px] font-bold uppercase tracking-[0.1em] px-4 py-1.5 rounded-full whitespace-nowrap">
                    Najpopularniejszy
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-baseline justify-between mb-1">
                    <h2 className={`font-display text-[22px] font-bold tracking-[-0.03em] ${tier.featured ? "text-white" : "text-[#111111]"}`}>
                      {tier.name}
                    </h2>
                    <span className={`font-sans text-[11px] font-semibold uppercase tracking-[0.1em] ${tier.featured ? "text-white/40" : "text-[#CCCCCC]"}`}>
                      {tier.tagline}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-4 mb-3">
                    <span className={`font-display text-[48px] font-bold tracking-[-0.05em] leading-none ${tier.featured ? "text-white" : "text-[#111111]"}`}>
                      {tier.price.monthly.toLocaleString("pl-PL")}
                    </span>
                    <span className={`font-sans text-[14px] ${tier.featured ? "text-white/40" : "text-[#AAAAAA]"}`}>
                      zł / msc
                    </span>
                  </div>
                  <p className={`font-sans text-[13px] leading-relaxed ${tier.featured ? "text-white/55" : "text-[#888888]"}`}>
                    {tier.description}
                  </p>
                </div>

                <button
                  onClick={() => chooseTier(tier.id)}
                  className={`group flex items-center justify-center gap-2 font-sans text-[14px] font-medium py-3 rounded-xl transition-all duration-200 mb-8 ${
                    tier.featured
                      ? "bg-white text-[#111111] hover:bg-[#F0F0F0]"
                      : "bg-[#111111] text-white hover:bg-[#2a2a2a]"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight size={14} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Top features preview */}
                <ul className="flex flex-col gap-3 mt-auto">
                  {featureGroups.flatMap(g => g.features).filter(f => f.values[tiers.indexOf(tier)] !== false).slice(0, 5).map((f) => (
                    <li key={f.name} className="flex items-start gap-2.5">
                      <Check size={13} strokeWidth={2.5} className={`shrink-0 mt-[2px] ${tier.featured ? "text-white/60" : "text-[#111111]"}`} />
                      <span className={`font-sans text-[12.5px] leading-snug ${tier.featured ? "text-white/70" : "text-[#555555]"}`}>
                        {f.values[tiers.indexOf(tier)] as string}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Comparison table — full viewport ── */}
        <section className="bg-white border-t border-[#EBEBEB]" ref={tableRef}>

          {/* Section title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={tableInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center pt-16 pb-10 px-6"
          >
            <h2 className="font-display text-[40px] font-bold tracking-[-0.04em] text-[#111111] mb-2">
              Porównaj wszystko
            </h2>
            <p className="font-sans text-[15px] text-[#888888]">
              Dokładnie co dostajesz w każdym pakiecie. Przewiń — nagłówki zostają na górze.
            </p>
          </motion.div>

          {/* Sticky tier header */}
          <div className="sticky top-[57px] z-30 bg-white border-b-2 border-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <div className="grid grid-cols-4 max-w-[1400px] mx-auto">
              <div className="px-8 py-5 flex items-end">
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#AAAAAA]">Funkcja</span>
              </div>
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`px-6 py-5 border-l flex flex-col justify-center ${
                    tier.featured
                      ? "bg-[#111111] border-[#111111]"
                      : "border-[#EBEBEB]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`font-display text-[18px] font-bold tracking-[-0.03em] ${tier.featured ? "text-white" : "text-[#111111]"}`}>
                      {tier.name}
                    </span>
                    {tier.featured && (
                      <span className="font-sans text-[9px] font-bold uppercase tracking-[0.1em] bg-gradient-to-r from-[#4EA8FF] to-[#9B66FF] text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                        Popularny
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-display text-[26px] font-bold tracking-[-0.04em] leading-none ${tier.featured ? "text-white" : "text-[#111111]"}`}>
                      {tier.price.monthly.toLocaleString("pl-PL")}
                    </span>
                    <span className={`font-sans text-[12px] ${tier.featured ? "text-white/40" : "text-[#AAAAAA]"}`}>
                      zł/msc
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature rows */}
          <div className="max-w-[1400px] mx-auto">
            {featureGroups.map((group, gi) => (
              <div key={group.label}>
                {/* Category header — eye-guiding divider */}
                <div className="grid grid-cols-4 bg-[#F5F5F5] border-b border-[#E8E8E8]">
                  <div className="px-8 py-4 col-span-4 flex items-center gap-3">
                    <div className="w-1 h-4 rounded-full bg-[#111111]" />
                    <span className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-[#555555]">
                      {group.label}
                    </span>
                  </div>
                </div>

                {group.features.map((feature, fi) => {
                  const isEven = fi % 2 === 0;
                  return (
                    <motion.div
                      key={feature.name}
                      initial={{ opacity: 0, x: -8 }}
                      animate={tableInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.35, delay: gi * 0.04 + fi * 0.025 }}
                      className={`grid grid-cols-4 border-b border-[#F0F0F0] group/row transition-colors duration-100 ${
                        isEven ? "bg-white" : "bg-[#FAFAFA]"
                      } hover:bg-[#F0F5FF]`}
                    >
                      {/* Feature name */}
                      <div className="px-8 py-5 flex items-center border-r border-[#EBEBEB]">
                        <span className="font-sans text-[14px] font-semibold text-[#222222] group-hover/row:text-[#111111] transition-colors">
                          {feature.name}
                        </span>
                      </div>

                      {/* Values */}
                      {feature.values.map((val, vi) => (
                        <div
                          key={vi}
                          className={`px-6 py-5 flex items-center justify-center border-r border-[#EBEBEB] last:border-r-0 ${
                            tiers[vi].featured
                              ? "bg-[#111111]/[0.03] group-hover/row:bg-[#111111]/[0.05]"
                              : ""
                          }`}
                        >
                          <FeatureValue value={val} featured={tiers[vi].featured} />
                        </div>
                      ))}
                    </motion.div>
                  );
                })}
              </div>
            ))}

            {/* CTA row */}
            <div className="grid grid-cols-4 border-t-2 border-[#111111] bg-[#FAFAFA]">
              <div className="px-8 py-6">
                <p className="font-sans text-[13px] font-medium text-[#888888]">Gotowy?</p>
              </div>
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`px-6 py-6 border-l flex items-center justify-center ${
                    tier.featured ? "bg-[#111111] border-[#111111]" : "border-[#EBEBEB]"
                  }`}
                >
                  <button
                    onClick={() => chooseTier(tier.id)}
                    className={`group/btn flex items-center gap-1.5 font-sans text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all duration-150 ${
                      tier.featured
                        ? "bg-white text-[#111111] hover:bg-[#F0F0F0]"
                        : "bg-[#111111] text-white hover:bg-[#2a2a2a]"
                    }`}
                  >
                    Wybierz {tier.name}
                    <ArrowRight size={12} strokeWidth={2.5} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust signals — typographic, no icons ── */}
        <section className="px-6 py-16 bg-[#F9F9F9] border-t border-[#EBEBEB]">
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-px bg-[#EBEBEB]">
            {[
              { n: "01", title: "Gwarancja satysfakcji", desc: "Jeśli po pierwszym miesiącu nie jesteś zadowolony, zwracamy pieniądze. Bez pytań." },
              { n: "02", title: "Start w 5 dni roboczych", desc: "Od podpisania umowy do pierwszych działań — w mniej niż tydzień." },
              { n: "03", title: "Miesięczne wypowiedzenie", desc: "Bez długoterminowych zobowiązań. Zostań tak długo, jak chcesz." },
            ].map(({ n, title, desc }) => (
              <div key={title} className="bg-[#F9F9F9] px-10 py-10">
                <span className="font-display text-[52px] font-bold tracking-[-0.05em] text-[#EBEBEB] leading-none block mb-4">{n}</span>
                <h3 className="font-display text-[18px] font-bold tracking-[-0.03em] text-[#111111] mb-2">{title}</h3>
                <p className="font-sans text-[13px] text-[#888888] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-6 py-16 bg-white border-t border-[#EBEBEB]">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-[32px] font-bold tracking-[-0.04em] text-[#111111] mb-2">
                Częste pytania
              </h2>
              <p className="font-sans text-[15px] text-[#888888]">
                Nie znalazłeś odpowiedzi?{" "}
                <Link href="/#kontakt" className="text-[#111111] font-semibold hover:underline">
                  Napisz do nas →
                </Link>
              </p>
            </motion.div>

            <div className="border-t border-[#EBEBEB]">
              {faq.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact form ── */}
        <section className="bg-[#111111] py-24 px-6" ref={formRef}>
          <div className="max-w-5xl mx-auto grid grid-cols-2 gap-16 items-start">

            {/* Left — headline */}
            <div className="pt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-display text-[44px] font-bold tracking-[-0.04em] text-white leading-tight mb-5">
                  Gotowy, żeby internet
                  <br />
                  <span className="gradient-text">o Tobie wiedział?</span>
                </h2>
                <p className="font-sans text-[15px] text-white/45 leading-relaxed mb-10">
                  Wypełnij formularz — odezwiemy się w ciągu jednego dnia roboczego z propozycją współpracy.
                </p>

                {/* Package selector */}
                <div className="flex flex-col gap-2">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-1">
                    Interesuję się pakietem:
                  </p>
                  {tiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all duration-150 text-left ${
                        selectedTier === tier.id
                          ? "bg-white border-white"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div>
                        <span className={`font-sans text-[14px] font-semibold block ${selectedTier === tier.id ? "text-[#111111]" : "text-white/70"}`}>
                          {tier.name}
                        </span>
                        <span className={`font-sans text-[12px] ${selectedTier === tier.id ? "text-[#555555]" : "text-white/30"}`}>
                          {tier.price.monthly.toLocaleString("pl-PL")} zł/msc
                        </span>
                      </div>
                      {selectedTier === tier.id && (
                        <Check size={15} strokeWidth={2.5} className="text-[#111111] shrink-0" />
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedTier("custom")}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all duration-150 text-left ${
                      selectedTier === "custom"
                        ? "bg-white border-white"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div>
                      <span className={`font-sans text-[14px] font-semibold block ${selectedTier === "custom" ? "text-[#111111]" : "text-white/70"}`}>
                        Szyj na miarę
                      </span>
                      <span className={`font-sans text-[12px] ${selectedTier === "custom" ? "text-[#555555]" : "text-white/30"}`}>
                        Wycenimy indywidualnie
                      </span>
                    </div>
                    {selectedTier === "custom" && (
                      <Check size={15} strokeWidth={2.5} className="text-[#111111] shrink-0" />
                    )}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right — form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-[28px] p-8"
            >
              {sent ? (
                <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                  <div className="w-14 h-14 rounded-full bg-[#111111] flex items-center justify-center mb-2">
                    <Check size={22} strokeWidth={2.5} className="text-white" />
                  </div>
                  <h3 className="font-display text-[24px] font-bold tracking-[-0.03em] text-[#111111]">Dziękujemy!</h3>
                  <p className="font-sans text-[14px] text-[#888888] leading-relaxed max-w-xs">
                    Odezwiemy się w ciągu jednego dnia roboczego.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {selectedTier && selectedTier !== "custom" && (
                    <div className="flex items-center gap-2 bg-[#F5F5F5] border border-[#EBEBEB] rounded-xl px-4 py-3">
                      <Check size={13} strokeWidth={2.5} className="text-[#111111] shrink-0" />
                      <span className="font-sans text-[13px] font-medium text-[#333333]">
                        Pakiet {tiers.find(t => t.id === selectedTier)?.name} — {tiers.find(t => t.id === selectedTier)?.price.monthly.toLocaleString("pl-PL")} zł/msc
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[12px] font-semibold text-[#555555]">Imię i nazwisko</label>
                    <input
                      type="text" required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jan Kowalski"
                      className="border border-[#E5E5E5] hover:border-[#D0D0D0] focus:border-[#111111] rounded-xl px-4 py-3 font-sans text-[14px] text-[#111111] placeholder:text-[#CCCCCC] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[12px] font-semibold text-[#555555]">Adres e-mail</label>
                    <input
                      type="email" required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jan@firma.pl"
                      className="border border-[#E5E5E5] hover:border-[#D0D0D0] focus:border-[#111111] rounded-xl px-4 py-3 font-sans text-[14px] text-[#111111] placeholder:text-[#CCCCCC] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[12px] font-semibold text-[#555555]">Opowiedz o projekcie</label>
                    <textarea
                      required rows={4}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Czym zajmuje się firma, co chcesz osiągnąć..."
                      className="border border-[#E5E5E5] hover:border-[#D0D0D0] focus:border-[#111111] rounded-xl px-4 py-3 font-sans text-[14px] text-[#111111] placeholder:text-[#CCCCCC] focus:outline-none transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-[52px] flex items-center justify-center gap-2 rounded-full bg-[#111111] hover:bg-[#2a2a2a] font-sans text-[15px] font-semibold text-white transition-colors duration-200 mt-1"
                  >
                    Wyślij wiadomość
                    <ArrowRight size={15} strokeWidth={2} />
                  </button>
                  <p className="font-sans text-[11px] text-[#CCCCCC] text-center">
                    Odpowiadamy w ciągu 1 dnia roboczego.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
