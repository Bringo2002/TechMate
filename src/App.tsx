import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import AboutUs from './components/About Us/About';
import './index.css';
import ServicesSection from './components/Services/ServicesSection';
import PortfolioSection from './components/Portfolio/PortfolioSection';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import Quote from './pages/Quote'; 
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost'; 

// Scroll to top and update title on route change
const ScrollToTopAndTitle: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    let pageTitle = 'TechMate';
    if (location.pathname === '/contact') pageTitle = 'Contact | TechMate';
    else if (location.pathname === '/about') pageTitle = 'About Us | TechMate';
    document.title = pageTitle;
  }, [location]);
  return null;
};

const Home: React.FC = () => (
  <>
    <Header />
    <div className="pt-24">
      <Hero />
    </div>
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 px-4 mt-20">
      <div className="md:col-span-1">
        <AboutUs />
      </div>
      <div className="md:col-span-1 flex flex-col gap-12">
        <PortfolioSection />
      </div>
    </div>
    <Footer />
  </>
);

const ContactPage: React.FC = () => (
  <>
    <Header />
    <Contact />
    <Quote />
    <Footer />
  </>
);

const AboutPage: React.FC = () => (
  <>
    <Header />
    <AboutUs />
    <Footer />
  </>
);

const ServicesPage: React.FC = () => (
  <>
    <Header />
    <ServicesSection />
    <Footer />
  </>
);

const BlogPage: React.FC = () => (
  <>
    <Header />
    <Blog />
    <Footer />
  </>
);

const BlogPostPage: React.FC = () => (
    <>
      <Header />
      <BlogPost />
      <Footer />
    </>
  );


const App: React.FC = () => {
  return (
    <>
      <ScrollToTopAndTitle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>
    </>
  );
};

export default App;
