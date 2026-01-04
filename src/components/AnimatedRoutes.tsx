import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import Index from "@/pages/Index";
import Tentang from "@/pages/Tentang";
import Pelatihan from "@/pages/program/Pelatihan";
import ProgramUnggulan from "@/pages/program/ProgramUnggulan";
import Regional from "@/pages/tentang/Regional";
import FimClub from "@/pages/tentang/FimClub";
import GabungRelawan from "@/pages/GabungRelawan";
import CeritaAlumni from "@/pages/CeritaAlumni";
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import Donasi from "@/pages/Donasi";
import FAQ from "@/pages/FAQ";
import NotFound from "@/pages/NotFound";

// Admin imports
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import DashboardHome from "@/pages/admin/DashboardHome";
import ArticlesManagement from "@/pages/admin/ArticlesManagement";
import ArticleEditor from "@/pages/admin/ArticleEditor";
import AnalyticsDashboard from "@/pages/admin/AnalyticsDashboard";
import UsersManagement from "@/pages/admin/UsersManagement";
import NewsletterManagement from "@/pages/admin/NewsletterManagement";
import AuditLogs from "@/pages/admin/AuditLogs";
import ChangePassword from "@/pages/admin/ChangePassword";
import ClubsManagement from "@/pages/admin/ClubsManagement";
import RegionalsManagement from "@/pages/admin/RegionalsManagement";
import PRDDocumentation from "@/pages/admin/PRDDocumentation";
import SessionsManagement from "@/pages/admin/SessionsManagement";
import EmailSettings from "@/pages/admin/EmailSettings";
import ForgotPassword from "@/pages/admin/ForgotPassword";
import ResetPassword from "@/pages/admin/ResetPassword";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/tentang" element={<PageTransition><Tentang /></PageTransition>} />
        <Route path="/tentang/regional" element={<PageTransition><Regional /></PageTransition>} />
        <Route path="/tentang/fim-club" element={<PageTransition><FimClub /></PageTransition>} />
        <Route path="/program/pelatihan" element={<PageTransition><Pelatihan /></PageTransition>} />
        <Route path="/program/program-unggulan" element={<PageTransition><ProgramUnggulan /></PageTransition>} />
        <Route path="/gabung-relawan" element={<PageTransition><GabungRelawan /></PageTransition>} />
        <Route path="/cerita-alumni" element={<PageTransition><CeritaAlumni /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogDetail /></PageTransition>} />
        <Route path="/donasi" element={<PageTransition><Donasi /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        
        {/* Legacy routes redirect */}
        <Route path="/program/regional" element={<PageTransition><Regional /></PageTransition>} />
        <Route path="/program/fim-club" element={<PageTransition><FimClub /></PageTransition>} />

        {/* Admin routes - wrapped in AdminAuthProvider */}
        <Route path="/fim-admin-portal-2024" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
        <Route path="/fim-admin-portal-2024/forgot-password" element={<AdminAuthProvider><ForgotPassword /></AdminAuthProvider>} />
        <Route path="/fim-admin-portal-2024/reset-password" element={<AdminAuthProvider><ResetPassword /></AdminAuthProvider>} />
        <Route path="/fim-admin-portal-2024/*" element={
          <AdminAuthProvider>
            <Routes>
              <Route element={<AdminDashboard />}>
                <Route path="dashboard" element={<DashboardHome />} />
                <Route path="articles" element={<ArticlesManagement />} />
                <Route path="articles/new" element={<ArticleEditor />} />
                <Route path="articles/:id/edit" element={<ArticleEditor />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="newsletter" element={<NewsletterManagement />} />
                <Route path="clubs" element={<ClubsManagement />} />
                <Route path="regionals" element={<RegionalsManagement />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="sessions" element={<SessionsManagement />} />
                <Route path="email-settings" element={<EmailSettings />} />
                <Route path="prd" element={<PRDDocumentation />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
            </Routes>
          </AdminAuthProvider>
        } />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;