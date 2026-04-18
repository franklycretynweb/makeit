import Image from "next/image";
import logoSrc from "../../public/logo/logo_makeit.webp";

const footerLinks = {
  Strony: [
    { label: "O nas", href: "#o-nas" },
    { label: "Usługi", href: "#uslugi" },
    { label: "Projekty", href: "#projekty" },
    { label: "Blog", href: "#" },
  ],
  Usługi: [
    { label: "Web Design", href: "#uslugi" },
    { label: "Social Media", href: "#uslugi" },
    { label: "Fotografia", href: "#uslugi" },
    { label: "Wideo", href: "#uslugi" },
    { label: "Marka osobista", href: "#uslugi" },
  ],
  Kontakt: [
    { label: "kontakt@make.it", href: "mailto:kontakt@make.it" },
    { label: "+48 123 456 789", href: "tel:+48123456789" },
    { label: "Kraków, Polska", href: "#" },
  ],
};

const socials = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "TikTok", href: "#" },
];

const marqueeWord = "MAKEIT";
const marqueeRepeat = Array.from({ length: 12 }, () => marqueeWord);

export default function Footer() {
  return (
    <footer className="bg-[#F9F9F9] border-t border-[#EAEAEA] overflow-hidden relative">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <a href="/" className="inline-flex items-center group mb-5">
              <Image
                src={logoSrc}
                alt="make it."
                className="h-7 w-auto object-contain group-hover:opacity-80 transition-opacity duration-200"
                height={28}
              />
            </a>
            <p className="font-sans text-sm text-[#666666] leading-relaxed mb-8 max-w-xs">
              Projektujemy obecność, która sprzedaje. Strony, social media, zdjęcia i wideo — wszystko w jednym miejscu.
            </p>
            {/* Newsletter */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Twój email"
                className="flex-1 border border-[#EAEAEA] rounded-full px-4 py-2.5 font-sans text-sm text-[#111111] placeholder:text-[#BBBBBB] focus:outline-none focus:border-[#CCCCCC] transition-colors bg-white"
              />
              <button className="font-sans text-sm font-semibold text-white bg-[#0A0A0A] hover:bg-[#222222] transition-colors duration-200 px-5 py-2.5 rounded-full whitespace-nowrap">
                Zapisz się
              </button>
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(footerLinks).map(([section, items]) => (
            <div key={section}>
              <p className="font-sans text-[11px] font-semibold text-[#111111] uppercase tracking-[0.15em] mb-5">
                {section}
              </p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="font-sans text-sm text-[#666666] hover:text-[#111111] transition-colors duration-200"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#EAEAEA] px-6 py-5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-[#AAAAAA]">
            © {new Date().getFullYear()} Make it. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex items-center gap-5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="font-sans text-xs text-[#AAAAAA] hover:text-[#111111] transition-colors duration-200"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee watermark — two identical halves for seamless loop */}
      <div className="relative z-0 select-none pointer-events-none overflow-hidden py-4" aria-hidden="true">
        <div className="flex w-max whitespace-nowrap animate-[marquee_60s_linear_infinite]">
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0">
              {marqueeRepeat.map((word, i) => (
                <span
                  key={`${half}-${i}`}
                  className="font-display font-black text-[clamp(100px,18vw,240px)] leading-none text-[#111111]/[0.75] tracking-tighter mx-[0.15em]"
                >
                  {word}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
