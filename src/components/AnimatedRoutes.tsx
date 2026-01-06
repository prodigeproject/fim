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
import AlumniManagement from "@/pages/admin/AlumniManagement";
import PRDDocumentation from "@/pages/admin/PRDDocumentation";
import TechnicalDocumentation from "@/pages/admin/TechnicalDocumentation";
import SessionsManagement from "@/pages/admin/SessionsManagement";
import EmailSettings from "@/pages/admin/EmailSettings";
import ForgotPassword from "@/pages/admin/ForgotPassword";
import ResetPassword from "@/pages/admin/ResetPassword";
import ProfileSettings from "@/pages/admin/ProfileSettings";
import OnlineAdminsDashboard from "@/pages/admin/OnlineAdminsDashboard";
import ArticleApprovals from "@/pages/admin/ArticleApprovals";
import NotificationsPage from "@/pages/admin/NotificationsPage";
import { RequireSuperAdmin } from "@/components/admin/RequireSuperAdmin";
import SecurityDashboard from "@/pages/admin/SecurityDashboard";
import AdminNotFound from "@/pages/admin/AdminNotFound";
import RegistrationsManagement from "@/pages/admin/RegistrationsManagement";
import RegistrationStatsDashboard from "@/pages/admin/RegistrationStatsDashboard";
import { RegistrationAuthProvider } from "@/contexts/RegistrationAuthContext";
import RegistrationLogin from "@/pages/registration/RegistrationLogin";
import RegistrationSignup from "@/pages/registration/RegistrationSignup";
import RegistrationDashboard from "@/pages/registration/RegistrationDashboard";
import TrainingRegistration from "@/pages/registration/TrainingRegistration";
import RegistrationSuccess from "@/pages/registration/RegistrationSuccess";
import RegistrationForgotPassword from "@/pages/registration/RegistrationForgotPassword";
import RegistrationResetPassword from "@/pages/registration/RegistrationResetPassword";
import RegistrationProfile from "@/pages/registration/RegistrationProfile";
import VerifyEmail from "@/pages/registration/VerifyEmail";

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

        {/* Registration routes */}
        <Route path="/daftar" element={<RegistrationAuthProvider><RegistrationLogin /></RegistrationAuthProvider>} />
        <Route path="/daftar/signup" element={<RegistrationAuthProvider><RegistrationSignup /></RegistrationAuthProvider>} />
        <Route path="/daftar/success" element={<RegistrationSuccess />} />
        <Route path="/daftar/verify" element={<VerifyEmail />} />
        <Route path="/daftar/forgot-password" element={<RegistrationForgotPassword />} />
        <Route path="/daftar/reset-password" element={<RegistrationResetPassword />} />
        <Route path="/daftar/dashboard" element={<RegistrationAuthProvider><RegistrationDashboard /></RegistrationAuthProvider>} />
        <Route path="/daftar/profile" element={<RegistrationAuthProvider><RegistrationProfile /></RegistrationAuthProvider>} />
        <Route path="/daftar/pelatihan" element={<RegistrationAuthProvider><TrainingRegistration /></RegistrationAuthProvider>} />
        {/* Admin routes - wrapped in AdminAuthProvider */}
        <Route path="/admin" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
        <Route path="/admin/forgot-password" element={<AdminAuthProvider><ForgotPassword /></AdminAuthProvider>} />
        <Route path="/admin/reset-password" element={<AdminAuthProvider><ResetPassword /></AdminAuthProvider>} />
        <Route path="/admin/*" element={
          <AdminAuthProvider>
            <Routes>
              <Route element={<AdminDashboard />}>
                {/* Routes accessible by all admins (moderator + super_admin) */}
                <Route path="dashboard" element={<DashboardHome />} />
                <Route path="articles" element={<ArticlesManagement />} />
                <Route path="articles/new" element={<ArticleEditor />} />
                <Route path="articles/edit/:id" element={<ArticleEditor />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="profile" element={<ProfileSettings />} />
                
                {/* Super Admin only routes */}
                <Route path="approvals" element={<RequireSuperAdmin><ArticleApprovals /></RequireSuperAdmin>} />
                <Route path="newsletter" element={<RequireSuperAdmin><NewsletterManagement /></RequireSuperAdmin>} />
                <Route path="clubs" element={<RequireSuperAdmin><ClubsManagement /></RequireSuperAdmin>} />
                <Route path="regionals" element={<RequireSuperAdmin><RegionalsManagement /></RequireSuperAdmin>} />
                <Route path="alumni" element={<RequireSuperAdmin><AlumniManagement /></RequireSuperAdmin>} />
                <Route path="users" element={<RequireSuperAdmin><UsersManagement /></RequireSuperAdmin>} />
                <Route path="online" element={<OnlineAdminsDashboard />} />
                <Route path="audit-logs" element={<RequireSuperAdmin><AuditLogs /></RequireSuperAdmin>} />
                <Route path="sessions" element={<SessionsManagement />} />
                <Route path="email-settings" element={<RequireSuperAdmin><EmailSettings /></RequireSuperAdmin>} />
                <Route path="prd" element={<RequireSuperAdmin><PRDDocumentation /></RequireSuperAdmin>} />
                <Route path="documentation" element={<RequireSuperAdmin><TechnicalDocumentation /></RequireSuperAdmin>} />
                <Route path="security-dashboard" element={<RequireSuperAdmin><SecurityDashboard /></RequireSuperAdmin>} />
                <Route path="registrations" element={<RequireSuperAdmin><RegistrationsManagement /></RequireSuperAdmin>} />
                <Route path="registration-stats" element={<RequireSuperAdmin><RegistrationStatsDashboard /></RequireSuperAdmin>} />
                <Route path="*" element={<AdminNotFound />} />
              </Route>
            </Routes>
          </AdminAuthProvider>
        } />
        
        {/* Legacy admin route redirect */}
        <Route path="/fim-admin-portal-2024/*" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;