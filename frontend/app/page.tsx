import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Services from "./components/Services";
import Stats from "./components/Stats";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="px-6 pb-20 pt-28 sm:px-8 lg:px-12">
        <Hero />
        <Services />
        <Stats />
      </main>
      <Footer />
    </div>
  );
}
