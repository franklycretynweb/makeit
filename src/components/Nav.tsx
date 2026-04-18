"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
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

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on click outside
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

  // Close on Escape
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F9F9F9]/80 backdrop-blur-md border-b border-[#E5E5E5] py-2 shadow-sm"
          : "bg-transparent border-b border-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-300">
        {/* Wordmark logo */}
        <a href="/" className="flex items-center group">
          <Image
            src={logoSrc}
            alt="make it."
            className="h-8 w-auto object-contain group-hover:opacity-80 transition-opacity duration-200"
            height={32}
            priority
          />
        </a>

        {/* Links */}
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

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden sm:inline-flex font-sans text-[14px] font-medium text-[#111111] hover:text-[#111111] transition-all duration-200 px-5 py-2.5 rounded-full border border-[#EAEAEA] hover:border-[#CCCCCC] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
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
      </div>

      {/* ─── Mega Dropdown ─── */}
      <div
        ref={dropdownRef}
        onMouseEnter={handleDropdownEnter}
        onMouseLeave={handleDropdownLeave}
        className={`absolute left-0 right-0 top-full transition-all duration-300 ease-out ${
          dropdownOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        {/* Dashed border top — drewl style */}
        <div className="border-t border-dashed border-[#D4D4D4]" />

        <div className="bg-[#F9F9F9]/95 backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-12 gap-6">
              {/* Left — Service image cards (8 cols) */}
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
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F5F5]">
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          className="object-cover grayscale opacity-80 group-hover/card:grayscale-0 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-700"
                          sizes="280px"
                        />
                      </div>
                      {/* Text */}
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

              {/* Right — Expertise list (4 cols) */}
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
                      {/* Icon box — gradient bg on hover, white icon */}
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
    </header>
  );
}
