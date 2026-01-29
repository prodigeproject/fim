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
import NewsletterUnsubscribe from "@/pages/NewsletterUnsubscribe";

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
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import SecurityDashboard from "@/pages/admin/SecurityDashboard";
import AdminNotFound from "@/pages/admin/AdminNotFound";
import RegistrationsManagement from "@/pages/admin/RegistrationsManagement";
import RegistrationStatsDashboard from "@/pages/admin/RegistrationStatsDashboard";
import LoginMonitoringDashboard from "@/pages/admin/LoginMonitoringDashboard";
import RolesManagement from "@/pages/admin/RolesManagement";
import RegistrationSettingsManagement from "@/pages/admin/RegistrationSettingsManagement";
import PartnersManagement from "@/pages/admin/PartnersManagement";
import FeaturedVideosManagement from "@/pages/admin/FeaturedVideosManagement";
import EmailTemplatesManagement from "@/pages/admin/EmailTemplatesManagement";
import InterviewCalendar from "@/pages/admin/InterviewCalendar";
import RecruiterAssignmentsManagement from "@/pages/admin/RecruiterAssignmentsManagement";
import ToolsSettings from "@/pages/admin/ToolsSettings";
import ArticleSchedulingCalendar from "@/pages/admin/ArticleSchedulingCalendar";
import { RegistrationAuthProvider } from "@/contexts/RegistrationAuthContext";
import RegistrationLanding from "@/pages/registration/RegistrationLanding";
import RegistrationLogin from "@/pages/registration/RegistrationLogin";
import RegistrationSignup from "@/pages/registration/RegistrationSignup";
import RegistrationDashboard from "@/pages/registration/RegistrationDashboard";
import TrainingRegistration from "@/pages/registration/TrainingRegistration";
import RegistrationSuccess from "@/pages/registration/RegistrationSuccess";
import RegistrationForgotPassword from "@/pages/registration/RegistrationForgotPassword";
import RegistrationResetPassword from "@/pages/registration/RegistrationResetPassword";
import RegistrationProfile from "@/pages/registration/RegistrationProfile";
import VerifyEmail from "@/pages/registration/VerifyEmail";
import RegistrationClosed from "@/pages/registration/RegistrationClosed";
import RegistrationGate from "@/components/RegistrationGate";

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
        <Route path="/unsubscribe" element={<PageTransition><NewsletterUnsubscribe /></PageTransition>} />
        
        {/* Legacy routes redirect */}
        <Route path="/program/regional" element={<PageTransition><Regional /></PageTransition>} />
        <Route path="/program/fim-club" element={<PageTransition><FimClub /></PageTransition>} />

        {/* Registration routes - /portal */}
        <Route path="/portal" element={<RegistrationLanding />} />
        <Route path="/portal/login" element={<RegistrationGate><RegistrationAuthProvider><RegistrationLogin /></RegistrationAuthProvider></RegistrationGate>} />
        <Route path="/portal/signup" element={<RegistrationGate><RegistrationAuthProvider><RegistrationSignup /></RegistrationAuthProvider></RegistrationGate>} />
        <Route path="/portal/closed" element={<RegistrationClosed />} />
        <Route path="/portal/success" element={<RegistrationSuccess />} />
        <Route path="/portal/verify" element={<VerifyEmail />} />
        <Route path="/portal/forgot-password" element={<RegistrationForgotPassword />} />
        <Route path="/portal/reset-password" element={<RegistrationResetPassword />} />
        <Route path="/portal/dashboard" element={<RegistrationAuthProvider><RegistrationDashboard /></RegistrationAuthProvider>} />
        <Route path="/portal/profile" element={<RegistrationAuthProvider><RegistrationProfile /></RegistrationAuthProvider>} />
        <Route path="/portal/pelatihan" element={<RegistrationAuthProvider><TrainingRegistration /></RegistrationAuthProvider>} />
        
        {/* Legacy /daftar routes - redirect to /portal */}
        <Route path="/daftar" element={<RegistrationLanding />} />
        <Route path="/daftar/*" element={<RegistrationLanding />} />
        {/* Admin routes - wrapped in AdminAuthProvider */}
        <Route path="/admin" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
        <Route path="/admin/forgot-password" element={<AdminAuthProvider><ForgotPassword /></AdminAuthProvider>} />
        <Route path="/admin/reset-password" element={<AdminAuthProvider><ResetPassword /></AdminAuthProvider>} />
        <Route path="/admin/*" element={
          <AdminAuthProvider>
            <Routes>
              <Route element={<AdminDashboard />}>
                {/* Routes accessible by all admins (moderator, admin, super_admin) */}
                <Route path="dashboard" element={<DashboardHome />} />
                <Route path="articles" element={<ArticlesManagement />} />
                <Route path="articles/new" element={<ArticleEditor />} />
                <Route path="articles/edit/:id" element={<ArticleEditor />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="approvals" element={<ArticleApprovals />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="sessions" element={<SessionsManagement />} />
                <Route path="online" element={<OnlineAdminsDashboard />} />
                
                {/* Routes accessible by admin and super_admin (not moderator) */}
                <Route path="newsletter" element={<RequireAdmin><NewsletterManagement /></RequireAdmin>} />
                <Route path="email-settings" element={<RequireAdmin><EmailSettings /></RequireAdmin>} />
                <Route path="clubs" element={<RequireAdmin><ClubsManagement /></RequireAdmin>} />
                <Route path="regionals" element={<RequireAdmin><RegionalsManagement /></RequireAdmin>} />
                <Route path="alumni" element={<RequireAdmin><AlumniManagement /></RequireAdmin>} />
                <Route path="audit-logs" element={<RequireAdmin><AuditLogs /></RequireAdmin>} />
                <Route path="security-dashboard" element={<RequireAdmin><SecurityDashboard /></RequireAdmin>} />
                <Route path="registrations" element={<RequireAdmin><RegistrationsManagement /></RequireAdmin>} />
                <Route path="registration-settings" element={<RequireAdmin><RegistrationSettingsManagement /></RequireAdmin>} />
                <Route path="registration-stats" element={<RequireAdmin><RegistrationStatsDashboard /></RequireAdmin>} />
                <Route path="partners" element={<RequireAdmin><PartnersManagement /></RequireAdmin>} />
                <Route path="featured-videos" element={<RequireAdmin><FeaturedVideosManagement /></RequireAdmin>} />
                <Route path="email-templates" element={<RequireAdmin><EmailTemplatesManagement /></RequireAdmin>} />
                <Route path="interview-calendar" element={<RequireAdmin><InterviewCalendar /></RequireAdmin>} />
                <Route path="recruiter-assignments" element={<RequireAdmin><RecruiterAssignmentsManagement /></RequireAdmin>} />
                
                {/* Super Admin only routes */}
                <Route path="users" element={<RequireSuperAdmin><UsersManagement /></RequireSuperAdmin>} />
                <Route path="roles" element={<RequireSuperAdmin><RolesManagement /></RequireSuperAdmin>} />
                <Route path="login-monitoring" element={<RequireSuperAdmin><LoginMonitoringDashboard /></RequireSuperAdmin>} />
                <Route path="prd" element={<RequireSuperAdmin><PRDDocumentation /></RequireSuperAdmin>} />
                <Route path="documentation" element={<RequireSuperAdmin><TechnicalDocumentation /></RequireSuperAdmin>} />
                <Route path="tools" element={<RequireSuperAdmin><ToolsSettings /></RequireSuperAdmin>} />
                <Route path="article-calendar" element={<RequireAdmin><ArticleSchedulingCalendar /></RequireAdmin>} />
                
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