import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header/Header';
import Hero from './pages/Home/Home';
import AboutUs from './pages/About/About';
import './index.css';
import ServicesSection from './pages/Services/ServicesPage';
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
import { useAuth } from './hooks/useAuth';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Cookies from './pages/Cookies';
import AuthCallback from './pages/AuthCallback';
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import UserDashboardLayout from './layouts/UserDashboardLayout';
import Overview from "./pages/dashboard/Overview";
import Analytics from "./pages/dashboard/Analytics";
import Clients from "./pages/dashboard/Clients";
import Settings from "./pages/dashboard/Settings";
import UserOverview from './pages/user/UserOverview';
import UserOrders from './pages/user/UserOrders';
import UserProfile from './pages/user/UserProfile';
import UserSupport from './pages/user/UserSupport';

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
const ProtectedRoute: React.FC<{children: React.ReactNode; role?: string}> = ({ children, role }) => {
  const { isAuthenticated, loading, userRole } = useAuth();

  if (loading) return <p className="text-center mt-20 text-white">Checking authentication...</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <>
      <ScrollToTopAndTitle />
      <Routes>
  {/* PUBLIC ROUTES */}
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
  <Route path="/cookies" element={<Cookies />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route path="/auth/callback" element={<AuthCallback />} />
  <Route path="*" element={<NotFoundPage />} />

  {/* ADMIN DASHBOARD (Protected) */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <AdminDashboardLayout>
          <Outlet />
        </AdminDashboardLayout>
      </ProtectedRoute>
    }
  >
    <Route index element={<Overview />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="clients" element={<Clients />} />
    <Route path="settings" element={<Settings />} />
  </Route>


  {/* USER DASHBOARD */}
  <Route
    path="/user"
    element={
      <ProtectedRoute role="user">
        <UserDashboardLayout>
          <Outlet />
        </UserDashboardLayout>
      </ProtectedRoute>
    }
  >
    <Route index element={<UserOverview />} />
    <Route path="orders" element={<UserOrders />} />
    <Route path="profile" element={<UserProfile />} />
    <Route path="support" element={<UserSupport />} />
  </Route>
</Routes>

    </>
  );
};

export default App;
