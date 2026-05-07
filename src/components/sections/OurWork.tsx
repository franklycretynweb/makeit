import Image from "next/image";
import Link from "next/link";

// Używamy statycznych importów, aby Next.js automatycznie zaczytał wymiary i proporcje obrazków.
// Zapobiega to ucinaniu i pozwala na idealne dopasowanie kontenera do faktycznego zdjęcia.
import zielonyImg from "../../../public/portfolio/zielonywarsztat.webp";
import artavenueImg from "../../../public/portfolio/artavenue5.webp";
import golaszewskaImg from "../../../public/portfolio/golaszewska.webp";
import jotkaImg from "../../../public/portfolio/jotka.webp";
import trinityImg from "../../../public/portfolio/trinity.webp";
import offscriptImg from "../../../public/portfolio/offscript.webp";

const projects = [
  {
    name: "Zielony Warsztat",
    description: "Kompleksowy redesign oparty na autorskim systemie, który zoptymalizował workflow i zwiększył konwersję.",
    tags: ["Atomic Systems", "Enterprise", "UI/UX"],
    image: zielonyImg,
    width: 2,
    href: "https://zielonywarsztat.com",
  },
  {
    name: "Art Avenue",
    description: "Platforma e-commerce o oszałamiającym wyglądzie, która podniosła prestiż marki i konwersję.",
    tags: ["E-commerce", "Web Design", "Next.js"],
    image: artavenueImg,
    width: 1,
    href: "https://artavenue5.pl",
  },
  {
    name: "Patrycja Gołaszewska",
    description: "Wysoko konwertujący landing page zaprojektowany do zbierania leadów i sprzedaży ekskluzywnych kursów.",
    tags: ["Landing Page", "Conversion", "UI"],
    image: golaszewskaImg,
    width: 1,
    href: "https://golaszewskapatrycja.pl",
  },
  {
    name: "Jotka",
    description: "Minimalistyczne portfolio artystyczne z płynnymi animacjami i perfekcyjną typografią.",
    tags: ["Portfolio", "Framer Motion", "Minimalist"],
    image: jotkaImg,
    width: 2,
    href: "https://jotka.vercel.app",
  },
  {
    name: "Trinity Power",
    description: "Innowacyjna platforma e-learningowa. Skalowalne rozwiązanie do przekazywania wiedzy.",
    tags: ["E-learning", "Web App", "UX/UI"],
    image: trinityImg,
    width: 2,
  },
  {
    name: "Offscript",
    description: "Dynamiczna platforma dla agencji kreatywnej, podkreślająca ich nieszablonowe podejście.",
    tags: ["Agency", "Branding", "Web Design"],
    image: offscriptImg,
    width: 1,
    href: "https://createoffscript.com",
  },
];

export default function OurWork() {

  return (
    <section className="bg-[#F9F9F9] py-16 md:py-32 px-4 md:px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header - Zoptymalizowany pod kątem wielkości i detali (Technical Brutalism) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-6 md:gap-8">
          <div className="max-w-2xl">
            <h2
              className="font-sans font-semibold text-[36px] md:text-5xl lg:text-6xl text-[#111111] leading-[1.05] tracking-[-0.04em] mb-3 md:mb-5"
            >
              Nasze realizacje.
            </h2>

            <p className="font-sans text-base md:text-lg text-[#666666] leading-relaxed max-w-xl font-normal tracking-tight">
              Marki z całej Polski. Projekty każdej skali. Każdy przemyślany i zbudowany z obsesją na punkcie detali.
            </p>
          </div>

          {/* Premium "Magnetic/Hover" Button */}
          <div>
            <Link
              href="/portfolio"
              className="group relative inline-flex items-center gap-3 font-sans text-[15px] font-semibold text-[#111111] bg-white border border-[#E5E5E5] hover:border-[#111111] px-5 py-2.5 rounded-full transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              <span className="relative z-10 pl-2">Wszystkie projekty</span>
              <div className="relative z-10 w-8 h-8 rounded-full bg-[#F5F5F7] group-hover:bg-[#111111] transition-colors duration-300 flex items-center justify-center overflow-hidden">
                {/* Ikonka strzałki, która wyjeżdża i wjeżdża z lewej */}
                <svg className="w-3.5 h-3.5 text-[#111111] group-hover:text-white transform group-hover:translate-x-[150%] transition-transform duration-300 ease-in-out" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                {/* Zapasowa ikonka czekająca po lewej stronie */}
                <svg className="absolute w-3.5 h-3.5 text-white transform -translate-x-[150%] group-hover:translate-x-0 transition-transform duration-300 ease-in-out" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-y-16 gap-x-8 items-start">
          {projects.map((p, i) => {
            const content = (
              <>
                {/* Image Container */}
                <div className="relative w-full rounded-[24px] md:rounded-[32px] bg-[#F9F9F9] overflow-hidden mb-5 md:mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 transform group-hover:-translate-y-2">
                  <Image
                    src={p.image}
                    alt={p.name}
                    className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                    placeholder="blur"
                    sizes={p.width === 2 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                  />

                  {/* Floating "View Project" button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-sm text-[#111111] font-sans font-semibold text-sm px-6 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      Zobacz projekt
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="pr-8">
                  <h3 className="font-display font-semibold text-[26px] text-[#111111] tracking-[-0.04em] mb-3">
                    {p.name}
                  </h3>
                  <p className="font-sans text-[17px] text-[#666666] leading-relaxed mb-6">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-sans text-[14px] font-bold text-[#888888] bg-[#F0F0F0] px-4 py-1.5 rounded-full tracking-tight"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            );

            const className = `group flex flex-col ${p.width === 2 ? 'md:col-span-2' : 'md:col-span-1'}`;

            if (p.href) {
              return (
                <Link key={i} href={p.href} target="_blank" rel="noopener noreferrer" className={className}>
                  {content}
                </Link>
              );
            }

            return (
              <div key={i} className={className}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
