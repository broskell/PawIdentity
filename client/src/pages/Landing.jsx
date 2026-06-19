import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import WhyPawIdentity from '../components/landing/WhyPawIdentity';
import Showcase from '../components/landing/Showcase';
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
        <Showcase />
        <Features />
        <MissingSection />
      </main>
      <Footer />
    </div>
  );
}
