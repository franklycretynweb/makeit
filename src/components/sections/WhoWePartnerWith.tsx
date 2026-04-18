"use client";

import { motion } from "framer-motion";

const partners = [
  {
    type: "Firmy usługowe",
    subtitle: "Lokalne i ogólnopolskie",
    description: "Restauracje, kliniki, salony, agencje, kancelarie — jeśli sprzedajesz usługi, wiemy jak zbudować Twoją obecność online.",
    tags: ["Strony internetowe", "Social media", "Fotografia"],
    n: "01",
  },
  {
    type: "E-commerce",
    subtitle: "Sklepy i marki produktowe",
    description: "Budujemy sklepy, które sprzedają. Dbamy o UX, zdjęcia produktowe i content, który przekonuje do zakupu.",
    tags: ["Sklepy online", "Sesje produktowe", "Konwersja"],
    n: "02",
  },
  {
    type: "Marki osobiste",
    subtitle: "Twórcy i eksperci",
    description: "Coachowie, specjaliści, influencerzy — pomagamy budować markę osobistą, która przyciąga właściwych ludzi.",
    tags: ["Personal branding", "LinkedIn", "Content"],
    n: "03",
  },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

export default function WhoWePartnerWith() {
  return (
    <section className="bg-[#F9F9F9] py-32 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="mb-16 max-w-2xl">
          <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.15em] text-[#AAAAAA] mb-4">
            Dla kogo
          </p>
          <h2 className="font-display font-medium text-[44px] sm:text-[52px] text-[#111111] tracking-[-0.04em] leading-[1.1] mb-5">
            Z kim współpracujemy
          </h2>
          <p className="font-sans text-[16px] text-[#666666] leading-relaxed">
            Nasze doświadczenie w designie i marketingu —<br className="hidden sm:block" />
            dopasowane do Twojego biznesu.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {partners.map((p, i) => (
            <motion.div
              key={i}
              {...fadeUp(0.1 + i * 0.08)}
              className="group relative rounded-[28px] bg-white border border-[#EAEAEA] p-8 flex flex-col gap-6 overflow-hidden hover:border-[#D0D0D0] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-400"
            >
              {/* Large muted number — eye-guiding */}
              <span className="absolute top-6 right-7 font-display text-[64px] font-bold tracking-[-0.05em] text-[#F0F0F0] leading-none select-none pointer-events-none">
                {p.n}
              </span>

              {/* Type */}
              <div className="relative z-10">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#AAAAAA] mb-2">
                  {p.subtitle}
                </p>
                <h3 className="font-display font-semibold text-[26px] text-[#111111] tracking-[-0.03em] leading-tight">
                  {p.type}
                </h3>
              </div>

              {/* Description */}
              <p className="font-sans text-[14px] text-[#666666] leading-relaxed relative z-10">
                {p.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-auto relative z-10">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-sans text-[12px] font-medium text-[#555555] bg-[#F5F5F5] border border-[#EAEAEA] px-3 py-1.5 rounded-full group-hover:border-[#D8D8D8] transition-colors duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
