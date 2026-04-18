import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import Hero from "@/components/hero/Hero";

const Testimonials     = dynamic(() => import("@/components/sections/Testimonials"));
const OurWork          = dynamic(() => import("@/components/sections/OurWork"));
const HowWeHelp        = dynamic(() => import("@/components/sections/HowWeHelp"));
const WhoWePartnerWith = dynamic(() => import("@/components/sections/WhoWePartnerWith"));
const ContactCTA       = dynamic(() => import("@/components/sections/ContactCTA"));
const Footer           = dynamic(() => import("@/components/Footer"));

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Testimonials />
        <OurWork />
        <HowWeHelp />
        <WhoWePartnerWith />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
