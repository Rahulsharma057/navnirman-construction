import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsStrip from "@/components/StatsStrip";
import ServicesStrip from "@/components/ServicesStrip";
import AboutSection from "@/components/AboutSection";
import FeaturedWorks from "@/components/FeaturedWorks";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsStrip />
      <ServicesStrip />
      <AboutSection />
      <FeaturedWorks />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </>
  );
}
