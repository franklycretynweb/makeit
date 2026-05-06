"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import logoSrc from "../../public/logo/logo_makeit.webp";

import codeImg from "../../public/services/code_first.webp";
import rocketImg from "../../public/services/rocket_second.webp";
import cameraImg from "../../public/services/camera_third.webp";

const navLinks = [
  { label: "O nas", href: "/onas" },
  { label: "Usługi", href: "#uslugi", hasDropdown: true },
  { label: "Pakiety", href: "/pakiety" },
  { label: "Projekty", href: "#projekty" },
  { label: "Kontakt", href: "#kontakt" },
];

const serviceCards = [
  {
    title: "Web Design",
    sub: "Strony i sklepy internetowe",
    image: codeImg,
    href: "/uslugi/web-design",
  },
  {
    title: "Social Media",
    sub: "Content, który sprzedaje",
    image: rocketImg,
    href: "/uslugi/social-media",
  },
  {
    title: "Foto & Wideo",
    sub: "Profesjonalne sesje i filmy",
    image: cameraImg,
    href: "/uslugi/foto-wideo",
  },
];

const expertiseItems = [
  { label: "UI/UX Design", sub: "Autorskie projekty w Figmie", icon: "/services/icons/ui_ux.svg" },
  { label: "Wdrożenia Next.js", sub: "Szybkość i skalowalność", icon: "/services/icons/nextjs.svg" },
  { label: "Strategia Contentowa", sub: "Plan, który działa", icon: "/services/icons/strategia_content.svg" },
  { label: "Grafiki & Reelsy", sub: "Wizualny content co miesiąc", icon: "/services/icons/grafiki_reelsy.svg" },
  { label: "Sesje Produktowe", sub: "Zdjęcia, które konwertują", icon: "/services/icons/sesje_produktowe.svg" },
  { label: "Filmy Reklamowe", sub: "Short-form i corporate", icon: "/services/icons/filmy_reklamowe.svg" },
];

// --- Mobile Navigation Item Component ---
function MobileNavItem({ 
  link, 
  index, 
  setMobileMenuOpen 
}: { 
  link: typeof navLinks[0]; 
  index: number; 
  setMobileMenuOpen: (v: boolean) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.1 + index * 0.08, ease: [0.2, 0.65, 0.3, 0.9] as const }
    }
  };

  if (link.hasDropdown) {
    return (
      <div className="flex flex-col border-b border-[#EAEAEA] pb-4">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between text-left group w-full">
          <motion.span variants={itemVariants} initial="hidden" animate="visible" className="font-display font-medium text-[44px] tracking-[-0.04em] text-[#111111]">
            {link.label}
          </motion.span>
          <motion.svg 
            variants={itemVariants} 
            initial="hidden" 
            animate="visible" 
            className="w-8 h-8 text-[#111111] transition-transform duration-400 ease-out" 
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} 
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="overflow-hidden flex flex-col gap-5 pt-6 pb-2"
            >
              {serviceCards.map((s, idx) => (
                <motion.a
                  key={s.href}
                  href={s.href}
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
                  className="flex items-center gap-4 group/mobile-card"
                >
                  <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-[#F5F5F5]">
                    <Image src={s.image} alt={s.title} fill sizes="64px" className="object-cover transition-transform duration-500 group-hover/mobile-card:scale-105" />
                  </div>
                  <div>
                     <p className="font-display font-semibold text-[18px] text-[#111111] leading-tight mb-0.5">{s.title}</p>
                     <p className="font-sans text-[13px] text-[#888888]">{s.sub}</p>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <a href={link.href} onClick={() => setMobileMenuOpen(false)} className="block border-b border-[#EAEAEA] pb-4">
      <motion.span variants={itemVariants} initial="hidden" animate="visible" className="font-display font-medium text-[44px] tracking-[-0.04em] text-[#111111] block">
        {link.label}
      </motion.span>
    </a>
  );
}


// --- Mobile Hamburger Button ---
function HamburgerButton({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) {
  return (
    <motion.button
      onClick={toggle}
      className="relative z-[60] flex items-center justify-center w-[42px] h-[42px] rounded-full outline-none focus:outline-none"
      initial={false}
      animate={{
        backgroundColor: isOpen ? "#111111" : "#FFFFFF",
        borderColor: isOpen ? "#111111" : "#EAEAEA",
        boxShadow: isOpen ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.04)"
      }}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
      style={{ borderWidth: 1 }}
      aria-label="Toggle menu"
    >
      {/* Animated lines - thinner, more precise spacing */}
      <div className="relative w-[18px] h-[11px] flex flex-col justify-between items-end">
        <motion.span
          className="h-[1.5px] rounded-full origin-center"
          initial={false}
          animate={{
            width: "100%",
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 4.75 : 0,
            backgroundColor: isOpen ? "#FFFFFF" : "#111111",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        />
        <motion.span
          className="h-[1.5px] rounded-full origin-center"
          initial={false}
          animate={{
            width: isOpen ? "100%" : "65%",
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -4.75 : 0,
            backgroundColor: isOpen ? "#FFFFFF" : "#111111",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        />
      </div>
    </motion.button>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Close mobile menu on desktop resize (safeguard)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  // Close desktop dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // Close desktop dropdown on Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dropdownOpen]);

  const handleDropdownEnter = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setDropdownOpen(true);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 200);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-300 md:top-0 md:left-0 md:right-0 md:rounded-none md:mx-0 ${
        scrolled && !mobileMenuOpen
          ? "top-3 left-3 right-3 rounded-2xl bg-[#F9F9F9]/90 backdrop-blur-xl border border-[#EAEAEA] py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:py-2 md:border-t-0 md:border-l-0 md:border-r-0 md:border-b md:border-[#E5E5E5]"
          : mobileMenuOpen
          ? "top-0 left-0 right-0 bg-[#F9F9F9] border-b border-transparent py-4"
          : "top-3 left-3 right-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-[#EAEAEA] py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:top-0 md:left-0 md:right-0 md:rounded-none md:bg-transparent md:border-transparent md:border-b md:py-4 md:shadow-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-6 flex items-center justify-between transition-all duration-300 relative z-[60]">
        {/* Wordmark logo */}
        <a href="/" className="flex items-center group relative z-[60]" onClick={() => setMobileMenuOpen(false)}>
          <Image
            src={logoSrc}
            alt="make it."
            className="h-8 w-auto object-contain group-hover:opacity-80 transition-opacity duration-200"
            height={32}
            priority
          />
        </a>

        {/* Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.hasDropdown ? (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  ref={triggerRef}
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={`font-sans text-[14px] font-medium transition-colors duration-200 flex items-center gap-1 ${
                    dropdownOpen
                      ? "text-[#111111]"
                      : "text-[#666666] hover:text-[#111111]"
                  }`}
                >
                  {link.label}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </button>
              </div>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="font-sans text-[14px] font-medium text-[#666666] hover:text-[#111111] transition-colors duration-200"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* CTAs (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/login"
            className="hidden lg:inline-flex font-sans text-[14px] font-medium text-[#111111] hover:text-[#111111] transition-all duration-200 px-5 py-2.5 rounded-full border border-[#EAEAEA] hover:border-[#CCCCCC] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          >
            Panel klienta
          </a>

          {/* Electric Border Button */}
          <a
            href="/pakiety"
            className="relative inline-flex h-10 overflow-hidden rounded-full p-[2px] group focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:ring-offset-2 focus:ring-offset-[#FCFCFD]"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#111111_0%,#111111_45%,#4EA8FF_65%,#9B66FF_90%,#FFFFFF_100%)] group-hover:bg-[conic-gradient(from_90deg_at_50%_50%,#4EA8FF_0%,#9B66FF_50%,#4EA8FF_100%)] transition-all duration-500" />
            <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-[#0A0A0A] px-5 py-2.5 text-[14px] font-medium text-white backdrop-blur-3xl transition-colors duration-300 group-hover:bg-[#151515]">
              Zacznij projekt
            </span>
          </a>
        </div>

        {/* Mobile Actions (Phone & Hamburger) */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href="tel:+48573989427"
            className={`relative z-[60] flex items-center justify-center w-[42px] h-[42px] rounded-full transition-all duration-300 ${
              mobileMenuOpen 
                ? "opacity-0 pointer-events-none scale-90" 
                : "bg-white border border-[#EAEAEA] text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[#F9F9F9] hover:scale-[0.96]"
            }`}
            aria-label="Zadzwoń do nas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </a>
          <HamburgerButton isOpen={mobileMenuOpen} toggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </div>
      </div>

      {/* ─── Mega Dropdown (Desktop) ─── */}
      <div
        ref={dropdownRef}
        onMouseEnter={handleDropdownEnter}
        onMouseLeave={handleDropdownLeave}
        className={`hidden md:block absolute left-0 right-0 top-full transition-all duration-300 ease-out ${
          dropdownOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        {/* Dashed border top */}
        <div className="border-t border-dashed border-[#D4D4D4]" />

        <div className="bg-[#F9F9F9]/95 backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-12 gap-6">
              {/* Left — Service image cards */}
              <div className="col-span-8">
                <p className="font-sans text-[11px] font-semibold text-[#999999] uppercase tracking-[0.15em] mb-4">
                  Usługi:
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {serviceCards.map((card) => (
                    <a
                      key={card.title}
                      href={card.href}
                      onClick={() => setDropdownOpen(false)}
                      className="group/card flex flex-col rounded-[20px] bg-white border border-[#EAEAEA] overflow-hidden hover:border-[#D0D0D0] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-400 hover:-translate-y-0.5"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F5F5]">
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          className="object-cover grayscale opacity-80 group-hover/card:grayscale-0 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-700"
                          sizes="280px"
                        />
                      </div>
                      <div className="px-4 py-3.5">
                        <h4 className="font-display font-semibold text-[15px] text-[#111111] mb-0.5">
                          {card.title}
                        </h4>
                        <p className="font-sans text-[12px] text-[#888888]">
                          {card.sub}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Right — Expertise list */}
              <div className="col-span-4">
                <p className="font-sans text-[11px] font-semibold text-[#999999] uppercase tracking-[0.15em] mb-4">
                  Ekspertyza:
                </p>
                <div className="flex flex-col gap-1">
                  {expertiseItems.map((item) => (
                    <a
                      key={item.label}
                      href="#uslugi"
                      onClick={() => setDropdownOpen(false)}
                      className="group/item flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-white hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#F0F0F0] group-hover/item:bg-gradient-to-br group-hover/item:from-[#4EA8FF] group-hover/item:to-[#6B4EFF] flex items-center justify-center shrink-0 transition-all duration-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.icon}
                          alt=""
                          width={18}
                          height={18}
                          className="w-[18px] h-[18px] brightness-0 opacity-40 group-hover/item:brightness-0 group-hover/item:invert group-hover/item:opacity-100 transition-all duration-300"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans text-[13px] font-semibold text-[#111111] leading-tight">
                          {item.label}
                        </p>
                        <p className="font-sans text-[11px] text-[#999999] leading-tight mt-0.5">
                          {item.sub}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA bar */}
            <div className="mt-6 pt-5 border-t border-dashed border-[#E5E5E5] flex items-center justify-between">
              <p className="font-sans text-[13px] text-[#888888]">
                Nie wiesz czego potrzebujesz?{" "}
                <a
                  href="#kontakt"
                  onClick={() => setDropdownOpen(false)}
                  className="text-[#111111] font-semibold hover:underline"
                >
                  Porozmawiajmy →
                </a>
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-sans text-[12px] font-medium text-[#888888]">
                  Dostępni na nowe projekty
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile Fullscreen Overlay ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { ease: [0.76, 0, 0.24, 1], duration: 0.5 } }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[50] bg-[#F9F9F9] flex flex-col justify-between px-6 pt-[100px] pb-8 overflow-y-auto md:hidden"
          >
            {/* Links container */}
            <div className="flex flex-col gap-6 w-full max-w-sm mx-auto mt-4">
              {navLinks.map((link, i) => (
                <MobileNavItem 
                  key={link.href} 
                  link={link} 
                  index={i} 
                  setMobileMenuOpen={setMobileMenuOpen} 
                />
              ))}
            </div>

            {/* Bottom CTAs & Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
              className="mt-12 flex flex-col gap-6 w-full max-w-sm mx-auto"
            >
              <div className="flex flex-col gap-3">
                {/* Electric CTA for mobile */}
                <a
                  href="/pakiety"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative inline-flex h-[56px] w-full overflow-hidden rounded-full p-[2px] group focus:outline-none"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#111111_0%,#111111_45%,#4EA8FF_65%,#9B66FF_90%,#FFFFFF_100%)] transition-all duration-500" />
                  <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-[#0A0A0A] px-5 py-2.5 text-[16px] font-semibold text-white backdrop-blur-3xl transition-colors duration-300 active:bg-[#151515]">
                    Zacznij projekt
                  </span>
                </a>
                
                {/* Secondary CTA */}
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-[56px] w-full items-center justify-center rounded-full border border-[#EAEAEA] bg-white font-sans text-[15px] font-semibold text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:bg-gray-50 transition-colors"
                >
                  Panel klienta
                </a>
              </div>

              {/* Minimal footer inside menu */}
              <div className="flex items-center justify-between border-t border-dashed border-[#D4D4D4] pt-5 font-sans text-[13px] text-[#888888]">
                <a href="mailto:kontakt@makeit.pl" className="hover:text-[#111111] transition-colors">kontakt@makeit.pl</a>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-[#111111] transition-colors font-medium">IG</a>
                  <a href="#" className="hover:text-[#111111] transition-colors font-medium">IN</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
