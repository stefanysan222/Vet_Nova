import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Services from "./components/Services";
import Stats from "./components/Stats";
import ReportSection from "./components/ReportSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-surface-900">
      <Navbar />
      <main className="px-0 pb-20 pt-20">
        <Hero />
        <Services />
        <Stats />
        <div className="px-6 sm:px-8 lg:px-12">
          <ReportSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
