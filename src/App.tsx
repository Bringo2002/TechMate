import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
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
import AdminOverview from "./pages/dashboard/AdminOverview";
import Projects from "./pages/dashboard/Projects";
import Services from "./pages/dashboard/Services";
import Analytics from "./pages/dashboard/Analytics";
import Clients from "./pages/dashboard/Clients";
import Revenue from "./pages/dashboard/Revenue";
import Consulting from "./pages/dashboard/Consulting";
import Deployments from "./pages/dashboard/Deployments";
import { InquiryPipeline } from './pages/admin/InquiryPipeline';
import { InquiryDetail } from './pages/admin/InquiryDetail';
import Messages from './pages/user/Messages';
import UserOverview from './pages/user/UserOverview';
import UserOrders from './pages/user/UserOrders';
import UserProfile from './pages/user/UserProfile';
import UserSupport from './pages/user/UserSupport';
import UserSettings from './pages/user/UserSettings';
import Billing from './pages/user/Billing';
import Notifications from './pages/user/Notifications';
import Stats from './pages/user/Stats';
import OrderDetail from './pages/user/OrderDetail';
import ErrorBoundary from './components/ErrorBoundary';
import SettingsLayout from './pages/dashboard/settings/SettingsLayout';
import TeamManagement from './pages/dashboard/settings/team/TeamManagement';
import ProfileSettings from './pages/dashboard/settings/profile/ProfileSettings';
import SecuritySettings from './pages/dashboard/settings/security/SecuritySettings';
import NotificationSettings from './pages/dashboard/settings/notifications/NotificationSettings';
import ActivityLogs from './pages/dashboard/settings/activity/ActivityLogs';
import NewProject from './pages/user/NewProject';
import AdminCreateProject from './pages/admin/Projects/New';


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
    <Route index element={<AdminOverview />} />
    <Route path="create-project" element={<AdminCreateProject />} />
    <Route path="projects" element={<Projects />} />
    <Route path="inquiries" element={<InquiryPipeline />} />
    <Route path="inquiries/:inquiryId" element={<InquiryDetail />} />
    <Route path="services" element={<Services />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="clients" element={<Clients />} />
    <Route path="revenue" element={<Revenue />} />
    <Route path="consulting" element={<Consulting />} />
    <Route path="deployments" element={<Deployments />} />
    <Route path="messages" element={<Messages />} />
    {/* SETTINGS NESTED ROUTES */}
    <Route path="/dashboard/settings" element={<SettingsLayout />}>
  <Route index element={<TeamManagement />} />
  <Route path="team" element={<TeamManagement />} />
  <Route path="profile" element={<ProfileSettings />} />
  <Route path="security" element={<SecuritySettings />} />
  <Route path="notifications" element={<NotificationSettings />} />
  <Route path="activity" element={<ActivityLogs />} />
</Route>

  </Route>


  {/* USER DASHBOARD */}
  <Route
    path="/user"
    element={
      <ProtectedRoute role="user">
        <UserDashboardLayout>
          <Outlet/>
        </UserDashboardLayout>
      </ProtectedRoute>
    }
  >
    <Route index element={<ErrorBoundary fallbackTitle="Overview failed to load"><UserOverview /></ErrorBoundary>} />
    <Route path="orders" element={<ErrorBoundary fallbackTitle="Orders failed to load"><UserOrders /></ErrorBoundary>} />
    <Route path="orders/:orderId" element={<ErrorBoundary fallbackTitle="Order details failed to load"><OrderDetail /></ErrorBoundary>} />
    <Route path="profile" element={<ErrorBoundary fallbackTitle="Profile failed to load"><UserProfile /></ErrorBoundary>} />
    <Route path="support" element={<ErrorBoundary fallbackTitle="Support failed to load"><UserSupport /></ErrorBoundary>} />
    <Route path="settings" element={<ErrorBoundary fallbackTitle="Settings failed to load"><UserSettings /></ErrorBoundary>} />
    <Route path="billing" element={<ErrorBoundary fallbackTitle="Billing failed to load"><Billing /></ErrorBoundary>} />
    <Route path="messages" element={<ErrorBoundary fallbackTitle="Messages failed to load"><Messages /></ErrorBoundary>} />
    <Route path="notifications" element={<ErrorBoundary fallbackTitle="Notifications failed to load"><Notifications /></ErrorBoundary>} />
    <Route path="stats" element={<ErrorBoundary fallbackTitle="Stats failed to load"><Stats /></ErrorBoundary>} />
    <Route path="new-project" element={<ErrorBoundary fallbackTitle="New Project failed to load"><NewProject /></ErrorBoundary>} />
  </Route>
      </Routes>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #475569',
          },
        }}
      />
    </>
  );
};

export default App;
