import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import WhyPawIdentity from '../components/landing/WhyPawIdentity';
import Workflow from '../components/landing/Workflow';
import Features from '../components/landing/Features';
import MissingSection from '../components/landing/MissingSection';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <WhyPawIdentity />
        <Workflow />
        <Features />
        <MissingSection />
      </main>
      <Footer />
    </div>
  );
}
