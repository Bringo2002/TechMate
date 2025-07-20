import React from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import AboutUs from './components/About Us/About';
//import index css  file here
import './index.css';
import ServicesSection from './components/Services/ServicesSection';
import PortfolioSection from './components/Portfolio/PortfolioSection';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';

const App: React.FC = () => {
  return (
    <div className="bg-[#f5f8fd] min-h-screen">
      <Header />
      <div className="pt-24">
        <Hero />
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16 px-4 mt-20">
          <div className="md:col-span-1">
            <AboutUs />
          </div>
          <div className="md:col-span-1">
            <ServicesSection />
          </div>
          <div className="md:col-span-1 flex flex-col gap-12">
            <PortfolioSection />
            <Contact />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
