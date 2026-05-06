"use client";

import { motion } from "framer-motion";
import GridBackground from "./GridBackground";
import RotatingSubline from "./RotatingSubline";

function LaurelBranch({ mirrored = false }: { mirrored?: boolean }) {
  // Quadratic bezier almond leaf — symmetric, clean at any small size.
  // Ratio l:w ≈ 4.5:1 matches real laurel proportions.
  const leafPath = (l: number, w: number) =>
    `M 0 0 Q ${l * 0.5} ${-w} ${l} 0 Q ${l * 0.5} ${w} 0 0 Z`;

  // Leaves attach to stem at natural intervals, radiating outward.
  const leaves = [
    { x: 15, y: 37, a: -138, l: 10,  w: 2.2 },
    { x: 12, y: 30, a: -158, l: 10,  w: 2.3 },
    { x: 8,  y: 23, a:  172, l: 10,  w: 2.2 },
    { x: 7,  y: 16, a:  155, l: 9.5, w: 2.1 },
    { x: 8,  y: 10, a:  138, l: 9,   w: 2.0 },
    { x: 12, y:  4, a:  118, l: 8.5, w: 1.9 },
  ];

  return (
    <svg
      width="28"
      height="44"
      viewBox="0 0 28 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={mirrored ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* Stem */}
      <path
        d="M15 40 C11 32 6 23 6 15 C6 9 9 4 14 1"
        stroke="#C0BAB2"
        strokeWidth="0.75"
        strokeLinecap="round"
        fill="none"
      />
      {/* Leaves */}
      {leaves.map((leaf, i) => (
        <path
          key={i}
          d={leafPath(leaf.l, leaf.w)}
          fill="#B0AA9E"
          transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.a})`}
        />
      ))}
    </svg>
  );
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.65,
    delay,
    ease: "easeOut" as const,
  },
});

const clients = [
  "Trinity Power",
  "Bloom Kwiaty",
  "Golden Jewel",
  "Złoty Karp",
  "TechBuild",
  "Patrycja G.",
  "Zielony Warsztat",
];

export default function Hero() {
  console.log("Hero component rendered! If you see this, HMR is working.");
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-transparent z-0">
      <div className="absolute inset-0 -z-10">
        <GridBackground />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6 pt-24 pb-8">

        {/* Laurel wreath badge — drewl 1:1 */}
        <motion.div {...fadeUp(0.2)} className="flex items-center gap-3 mb-8">
          <LaurelBranch />
          <span className="font-sans text-[12px] font-medium text-[#A8A29A] tracking-[0.12em] uppercase">
            Agencja kreatywna z Krakowa
          </span>
          <LaurelBranch mirrored />
        </motion.div>

        {/* Headline - Resized to match Drewl proportions precisely */}
        <h1 className="flex flex-col items-center gap-0 mb-8 relative max-w-5xl mx-auto">
          
          {/* Ambient, wide multi-color glow (Mesh Gradient style) */}
          <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[900px] h-[300px] pointer-events-none -z-20">
            {/* Blue glow on the left */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[15%] w-[350px] h-[250px] bg-[#4EA8FF] opacity-[0.18] blur-[100px] rounded-full" />
            {/* Purple glow on the right */}
            <div className="absolute top-1/2 -translate-y-1/2 right-[15%] w-[350px] h-[250px] bg-[#9B66FF] opacity-[0.18] blur-[100px] rounded-full" />
          </div>

          <motion.span
            {...fadeUp(0.35)}
            className="font-display font-extrabold text-[44px] leading-[0.95] sm:text-[56px] md:text-[68px] lg:text-[84px] text-[#111111] tracking-[-0.05em] md:leading-[1.05] text-center uppercase md:normal-case"
          >
            Twój biznes jest dobry,
          </motion.span>
          <motion.div {...fadeUp(0.5)} className="relative inline-block mt-[-2px] text-center">
            <span
              className="font-display font-extrabold text-[44px] leading-[0.95] sm:text-[56px] md:text-[68px] lg:text-[84px] tracking-[-0.05em] md:leading-[1.05] text-[#111111] uppercase md:normal-case"
            >
              ale internet o tym{" "}
            </span>
            <span
              className="font-display font-extrabold text-[44px] leading-[0.95] sm:text-[56px] md:text-[68px] lg:text-[84px] tracking-[-0.05em] md:leading-[1.05] gradient-text relative z-10 uppercase md:normal-case"
            >
              nie wie.
              {/* The animated swoosh matching the gradient */}
              <svg 
                className="absolute -bottom-1 left-0 w-[110%] h-[20px] overflow-visible -translate-x-[5%] z-20" 
                viewBox="0 0 400 30" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path 
                  className="swoosh-path"
                  d="M 5 20 Q 150 0 395 15" 
                  stroke="url(#paint0_linear)" 
                  strokeWidth="5" 
                  strokeLinecap="round" 
                />
                <defs>
                  <linearGradient id="paint0_linear" x1="5" y1="10" x2="395" y2="10" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4EA8FF" />
                    <stop offset="1" stopColor="#9B66FF" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </motion.div>
        </h1>

        {/* Rotating subline */}
        <motion.div {...fadeUp(0.65)} className="mb-12 mt-6 z-10 max-w-2xl">
          <RotatingSubline />
        </motion.div>

        {/* CTAs - Refined to match Webhero (massive on mobile, stacked, full width) */}
        <motion.div {...fadeUp(0.8)} className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full max-w-[90%] sm:max-w-[80%] md:max-w-none mx-auto mb-10 md:mb-16 z-10">
          <a
            href="/pakiety"
            className="w-full sm:w-auto group relative inline-flex h-[60px] md:h-[52px] items-center justify-center overflow-hidden rounded-[20px] md:rounded-full bg-[#111111] border-2 border-[#111111] px-8 font-sans text-[17px] md:text-[15px] font-semibold text-white transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.16)] hover:bg-[#000000]"
          >
            <span className="relative z-10">Zacznij projekt</span>
            {/* Subtle highlight overlay on hover */}
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
              <div className="relative h-full w-8 bg-white/20" />
            </div>
          </a>

          <a
            href="#dlaczego-make-it"
            className="w-full sm:w-auto group relative inline-flex h-[60px] md:h-[52px] items-center justify-center overflow-hidden rounded-[20px] md:rounded-full bg-white px-8 font-sans text-[17px] md:text-[15px] font-semibold text-[#111111] transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-2 border-[#E5E5E5] hover:border-[#111111] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
          >
            <span className="relative z-10">Dlaczego Make it?</span>
          </a>
        </motion.div>

        {/* Social Proof Badges immediately below CTAs (Webhero style) */}
        <motion.div {...fadeUp(0.9)} className="flex items-center justify-center gap-6 sm:gap-12 w-full mb-12 md:mb-0 z-10">
          {/* Badge 1 */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-display font-bold text-[#111111] text-[18px] md:text-[20px] leading-none tracking-tight flex items-center gap-1">
              Clutch
            </span>
            <div className="flex gap-0.5 text-[#FFB800] text-[12px] md:text-[14px]">
              ★★★★★
            </div>
            <span className="font-sans text-[10px] md:text-[11px] font-semibold text-[#666666] tracking-wide uppercase mt-0.5">
              5.0 Rating
            </span>
          </div>

          {/* Badge 2 */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-display font-bold text-[#111111] text-[18px] md:text-[20px] leading-none tracking-tight">
              Google
            </span>
            <div className="flex gap-0.5 text-[#FFB800] text-[12px] md:text-[14px]">
              ★★★★★
            </div>
            <span className="font-sans text-[10px] md:text-[11px] font-semibold text-[#666666] tracking-wide uppercase mt-0.5">
              5.0 Rating
            </span>
          </div>

          {/* Badge 3 */}
          <div className="flex flex-col items-center gap-1 hidden sm:flex">
            <span className="font-display font-bold text-[#111111] text-[18px] md:text-[20px] leading-none tracking-tight">
              Trustpilot
            </span>
            <div className="flex gap-0.5 text-[#00B67A] text-[12px] md:text-[14px]">
              ★★★★★
            </div>
            <span className="font-sans text-[10px] md:text-[11px] font-semibold text-[#666666] tracking-wide uppercase mt-0.5">
              5.0 Rating
            </span>
          </div>
        </motion.div>
      </div>

      {/* Client logos strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="relative z-10 py-6 px-6 mt-auto overflow-hidden"
      >
        {/* Fading edges - purely matching the #F9F9F9 background */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-[#F9F9F9] via-transparent to-[#F9F9F9] w-full h-full" />
        
        {/* Scrolling marquee — two identical halves for seamless loop */}
        <div className="relative overflow-hidden z-0">
          <div className="flex w-max animate-[marquee_20s_linear_infinite]">
            {[0, 1].map((half) => (
              <div key={half} className="flex gap-16 md:gap-24 items-center shrink-0 pr-16 md:pr-24">
                {clients.map((name) => (
                  <span
                    key={`${half}-${name}`}
                    className="font-sans text-[22px] md:text-[28px] font-semibold text-[#A3A3A3] cursor-default select-none shrink-0 opacity-70"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
