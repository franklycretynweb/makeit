"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import codeImg from "../../../public/services/code_first.webp";
import rocketImg from "../../../public/services/rocket_second.webp";
import cameraImg from "../../../public/services/camera_third.webp";

const services = [
  {
    image: codeImg,
    href: "/uslugi/web-design",
    label: "Strony i sklepy",
    title: "Web Design",
    description: "Projektujemy i budujemy strony, które konwertują. Od wizytówki po e-commerce.",
    glowColor: "rgba(78, 168, 255, 0.4)", // Blue glow for the B&W hover
    tags: [
      { text: "Projekty UX/UI w Figmie", icon: "/services/icons/ui_ux.svg" },
      { text: "Szybkie wdrożenie Next.js", icon: "/services/icons/nextjs.svg" },
      { text: "Responsywność i SEO", icon: "/services/icons/seo.svg" },
    ],
  },
  {
    image: rocketImg,
    label: "Social i treści",
    href: "/uslugi/social-media",
    title: "Social Media",
    description: "Tworzymy content, który buduje markę i generuje mierzalne wyniki sprzedaży.",
    glowColor: "rgba(107, 78, 255, 0.4)", // Purple glow
    tags: [
      { text: "Strategia contentowa", icon: "/services/icons/strategia_content.svg" },
      { text: "Grafiki i Reelsy", icon: "/services/icons/grafiki_reelsy.svg" },
      { text: "Copywriting i posty", icon: "/services/icons/copywriting.svg" },
    ],
  },
  {
    image: cameraImg,
    href: "/uslugi/foto-wideo",
    label: "Foto i wideo",
    title: "Fotografia",
    description: "Profesjonalne zdjęcia produktowe, sesje wizerunkowe i filmy, które przykuwają uwagę.",
    glowColor: "rgba(239, 68, 68, 0.4)", // Red/Pink glow
    tags: [
      { text: "Sesje produktowe", icon: "/services/icons/sesje_produktowe.svg" },
      { text: "Filmy reklamowe", icon: "/services/icons/filmy_reklamowe.svg" },
      { text: "Postprodukcja", icon: "/services/icons/postprodukcja.svg" },
    ],
  },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

// Warianty dla nagłówka
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] as [number, number, number, number] },
  },
};

export default function HowWeHelp() {
  const title = "Jak pomagamy";
  const titleWords = title.split(" ");

  return (
    <section id="dlaczego-make-it" className="bg-[#F9F9F9] py-16 md:py-32 px-4 md:px-6 relative overflow-hidden">
      {/* Bardzo delikatne, gigantyczne tła oświetlające całą sekcję */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#4EA8FF] opacity-[0.04] blur-[80px] rounded-full pointer-events-none hidden md:block" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#9B66FF] opacity-[0.04] blur-[80px] rounded-full pointer-events-none hidden md:block" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header - Zoptymalizowany układ i typografia pod mobile */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-24 px-2">
          <motion.h2
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-display font-medium text-[38px] md:text-6xl text-[#111111] leading-[1.1] md:leading-[1.05] tracking-[-0.04em] mb-4 md:mb-6 flex flex-wrap justify-center gap-x-2 md:gap-x-3"
          >
            {titleWords.map((word, idx) => (
              <motion.span key={idx} variants={childVariants} className="inline-block">
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-sans text-[16px] md:text-[20px] text-[#666666] leading-[1.6] md:leading-relaxed max-w-2xl font-normal tracking-tight"
          >
            Od strategii po realizację — jesteśmy z Tobą na każdym etapie budowania marki. Współpracujemy z Tobą, aby ożywić pomysły i dostarczyć <span className="text-[#111111] bg-[#F0F0F0] px-1.5 py-[2px] rounded-md font-medium">mierzalne rezultaty</span>.
          </motion.p>
        </div>

        {/* Top Cards - Horizontal scroll on mobile, Grid on desktop */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-5 md:gap-8 pb-8 md:pb-0 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {services.map((s, i) => (
            <motion.div
              key={i}
              {...fadeUp(0.1 + i * 0.1)}
              className="group flex flex-col gap-5 md:gap-6 shrink-0 w-[85vw] sm:w-[340px] md:w-auto snap-center"
            >
              {/* Image Container */}
              <a href={s.href} className="relative w-full aspect-square rounded-[32px] md:rounded-[40px] bg-[#FFFFFF] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#EAEAEA] group-hover:border-[#E5E5E5] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 transform md:group-hover:-translate-y-2 p-3 md:p-4 block">
                
                {/* Opcjonalny Glow zza obrazka na hover */}
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[50px] opacity-10 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                  style={{ background: s.glowColor }}
                />

                {/* Wewnętrzny kontener na obraz, pozwalający na białą obwolutę wokół zdjęcia */}
                <div className="relative w-full h-full rounded-[24px] md:rounded-[32px] overflow-hidden bg-white z-10">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    className="object-cover object-center mix-blend-normal opacity-100 md:mix-blend-luminosity md:opacity-80 md:group-hover:mix-blend-normal md:group-hover:opacity-100 transition-all duration-700 md:group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    placeholder="blur"
                  />
                  
                  {/* Subtle vignette/overlay for better contrast when colorless on desktop */}
                  <div className="absolute inset-0 bg-transparent md:bg-black/5 md:group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                </div>
              </a>

              {/* Content under the image */}
              <div className="flex flex-col px-1 md:px-2 mt-1 md:mt-2 text-left">
                <h3 className="font-display font-bold text-[28px] md:text-2xl text-[#111111] tracking-[-0.03em] mb-3 md:mb-4">
                  {s.title}
                </h3>
                <p className="font-sans text-[16px] md:text-[15px] text-[#666666] leading-relaxed mb-5 md:mb-6 flex-grow">
                  {s.description}
                </p>

                {/* List Items (formerly tags) */}
                <ul className="flex flex-col gap-3 md:gap-4 mt-auto">
                  {s.tags.map((tag) => (
                    <li
                      key={tag.text}
                      className="group/item flex items-center gap-3 font-sans text-[15px] font-medium text-[#444444] transition-colors hover:text-[#111111]"
                    >
                      <div className="flex items-center justify-center shrink-0 transition-transform duration-300 md:group-hover/item:scale-110">
                        <img 
                          src={tag.icon} 
                          alt={tag.text} 
                          className="w-5 h-5 md:w-6 md:h-6 opacity-80 md:opacity-60 md:group-hover/item:opacity-100 transition-opacity duration-300 invert" 
                        />
                      </div>
                      <span className="tracking-tight">{tag.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
