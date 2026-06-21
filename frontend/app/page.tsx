import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import WhatIsVetnova from "./components/WhatIsVetnova";
import Services from "./components/Services";
import Stats from "./components/Stats";
import Reviews from "./components/Reviews";
import Clinics from "./components/Clinics";
import ReportSection from "./components/ReportSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 transition-colors dark:bg-surface-950 dark:text-white">
      <Navbar />
      <main className="px-0 pb-20 pt-20">
        <Hero />
        <WhatIsVetnova />
        <Services />
        <Stats />
        <Reviews />
        <Clinics />
        <div className="px-6 sm:px-8 lg:px-12">
          <ReportSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
