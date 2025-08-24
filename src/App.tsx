import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import DashboardPage from './pages/Dashboard';
import { useAuth } from './hooks/useAuth';

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

// Layout wrappers for pages
const PageLayout: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

const HomePage = () => <PageLayout><Hero /></PageLayout>;
const ContactPage = () => <PageLayout><Contact /></PageLayout>;
const AboutPage = () => <PageLayout><AboutUs /></PageLayout>;
const ServicesPage = () => <PageLayout><ServicesSection /></PageLayout>;
const BlogPage = () => <PageLayout><Blog /></PageLayout>;
const BlogPostPage = () => <PageLayout><BlogPost /></PageLayout>;
const QuotePage = () => <PageLayout><Quote /></PageLayout>;

// ProtectedRoute wrapper
const ProtectedRoute: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p className="text-center mt-20 text-white">Checking authentication...</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <>
      <ScrollToTopAndTitle />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFoundPage />} />

        {/* Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
};

export default App;
