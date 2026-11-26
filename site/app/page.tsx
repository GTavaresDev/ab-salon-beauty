import { ClinicGallery } from "@/components/ClinicGallery";
import { CTA } from "@/components/CTA";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { FirstExperienceDiscount } from "@/components/FirstExperienceDiscount";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Testimonials } from "@/components/Testimonials";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const beautySalonJsonLd = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: "AB Sobrancelhas",
  url: "https://studioamandabeauty.com/",
  image: "https://studioamandabeauty.com/assets/absobrancelhas.jpeg",
  description:
    "Estudio de sobrancelhas em Goiania especializado em design de sobrancelhas, sobrancelha + henna, brow lamination, dermaplaning e estetica facial com resultado natural.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Goiânia",
    addressRegion: "GO",
    addressCountry: "BR",
  },
  areaServed: {
    "@type": "City",
    name: "Goiânia",
  },
  telephone: "+55 62 9139-0313",
  sameAs: ["https://www.instagram.com/amandaborges.beauty"],
  makesOffer: [
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Design de sobrancelhas",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Sobrancelha + henna",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Brow lamination",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Dermaplaning",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Lash lifting",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Limpeza de pele",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Nanoblading",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(beautySalonJsonLd) }}
      />
      <Hero />
      <FirstExperienceDiscount />
      <Services />
      <ClinicGallery />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
