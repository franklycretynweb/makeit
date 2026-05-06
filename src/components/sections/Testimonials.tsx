"use client";

import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";

function avatarSrc(seed: string): string {
  const svg = createAvatar(notionists, { seed }).toString();
  return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}`;
}

const testimonials = [
  {
    logo: (
      <div className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L8.5 5H13L9.5 7.5L11 11.5L7 9L3 11.5L4.5 7.5L1 5H5.5L7 1Z" fill="#AAAAAA"/>
        </svg>
        <span className="font-sans text-[13px] font-semibold text-[#999999] tracking-tight">Bloom Kwiaty</span>
      </div>
    ),
    quote: (
      <>
        Strona przeszła nasze oczekiwania.{" "}
        <span className="text-[#7B61FF]">Projekt był zrealizowany szybko i bezbłędnie</span>
        {" "}— wszystko działa idealnie. Polecamy każdemu, kto szuka solidnej ekipy.
      </>
    ),
    name: "Anna Kowalska",
    title: "Właścicielka, Bloom Kwiaty",
  },
  {
    logo: (
      <div className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" fill="#AAAAAA"/>
          <rect x="8" y="1" width="5" height="5" rx="1" fill="#AAAAAA"/>
          <rect x="1" y="8" width="5" height="5" rx="1" fill="#AAAAAA"/>
          <rect x="8" y="8" width="5" height="5" rx="1" fill="#CCCCCC"/>
        </svg>
        <span className="font-sans text-[13px] font-semibold text-[#999999] tracking-tight">TechBuild</span>
      </div>
    ),
    quote: (
      <>
        Social media prowadzone profesjonalnie.{" "}
        <span className="text-[#4EA8FF]">Zaangażowanie wzrosło o 180% w ciągu 3 miesięcy</span>
        , a klienci coraz częściej trafiają do nas właśnie z Instagrama.
      </>
    ),
    name: "Tomasz Wiśniewski",
    title: "CEO, TechBuild",
  },
  {
    logo: (
      <div className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5" stroke="#AAAAAA" strokeWidth="1.5"/>
          <path d="M5 7h4M7 5v4" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className="font-sans text-[13px] font-semibold text-[#999999] tracking-tight">Golden Jewel</span>
      </div>
    ),
    quote: (
      <>
        Sklep działa świetnie —{" "}
        <span className="text-[#7B61FF]">konwersja wzrosła o 40% po redesignie</span>
        . Zdjęcia produktowe są przepiękne, klienci często piszą, że właśnie przez nie zdecydowali się na zakup.
      </>
    ),
    name: "Karolina Bąk",
    title: "Właścicielka, Golden Jewel",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#F2F2F4] pt-0 pb-20" style={{ position: "relative" }}>

      {/* Slab */}
      <div className="flex justify-center" style={{ height: 72 }}>
        <div
          style={{
            width: 130,
            height: 72,
            borderRadius: "0 0 22px 22px",
            background: "linear-gradient(180deg, #2a2a2a 0%, #161616 100%)",
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        />
      </div>
      <div style={{ height: 56 }} />

      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="font-display font-medium text-[40px] sm:text-[48px] text-[#111111] inline-flex flex-wrap items-center justify-center gap-x-3 leading-tight">
            <span>Dlaczego klienci</span>

            {/* Sticker icon — dark rounded square with heart + floating "ufają" label */}
            <span className="relative inline-flex items-center justify-center mx-1" style={{ width: 52, height: 52 }}>
              {/* Floating "ufają" badge above */}
              <span
                className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-[#111111] font-sans text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap z-10"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
              >
                ufają
              </span>
              {/* Dark icon square */}
              <span
                className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shadow-lg"
                style={{
                  background: "linear-gradient(145deg, #2d2d2d, #1a1a1a)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"
                    fill="#e05c8a"
                  />
                </svg>
              </span>
            </span>

            <span>Make it</span>

            {/* Decorative arrows */}
            <span className="text-[#CCCCCC] text-xl font-light ml-1 tracking-tighter hidden sm:inline">››</span>
          </h2>
        </div>

        {/* Cards - Mobile Swipeable Carousel / Desktop Grid */}
        <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-px-6 pb-8 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="w-[85vw] sm:w-[340px] md:w-auto shrink-0 snap-start bg-white rounded-2xl p-7 flex flex-col border border-[#E8E8EA] shadow-sm relative"
            >
              {/* Company logo */}
              <div className="mb-5">{t.logo}</div>

              {/* Quote */}
              <p className="font-sans text-[15px] leading-[1.75] text-[#333333] flex-1 mb-7">
                {t.quote}
              </p>

              {/* Dashed separator */}
              <div className="border-t border-dashed border-[#E0E0E0] mb-5" />

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Notion-style avatar — generated locally from seed, no external deps */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarSrc(t.name)}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full shrink-0 object-cover bg-[#EBE9E4]"
                />
                <div>
                  <p className="font-sans text-sm font-semibold text-[#111111] leading-none mb-0.5">
                    {t.name}
                  </p>
                  <p className="font-sans text-xs text-[#999999]">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
