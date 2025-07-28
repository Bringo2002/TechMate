import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header/Header';
import Hero from './pages/Home/Home';
import AboutUs from './pages/About/About';
import './index.css';
import ServicesSection from './pages/Services/ServicesPage';
import PortfolioSection from './components/Portfolio/PortfolioSection';
import Contact from './pages/Contact/Contact';
import Footer from './components/Footer/Footer';
import Quote from './pages/Quote/Quote'; 
import Blog from './pages/Blog/Blog';
import BlogPost from './pages/BlogPost/BlogPost'; 
import NotFoundPage from './pages/NotFoundPage';

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
    <Footer />
  </>
);

const ContactPage: React.FC = () => (
  <>
    <Header />
    <Contact />
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
const QuotePage: React.FC = () => {
  return (
    <>
      <Header />
      <Quote />
      <Footer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <>
      <ScrollToTopAndTitle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/quote" element={<QuotePage />} />
      </Routes>
    </>
  );
};

export default App;
