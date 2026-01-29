import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import PageTransition from "./PageTransition";

// Eagerly load Index for initial render performance
import Index from "@/pages/Index";

// Lazy load all other pages to reduce initial bundle size
const Tentang = lazy(() => import("@/pages/Tentang"));
const Pelatihan = lazy(() => import("@/pages/program/Pelatihan"));
const ProgramUnggulan = lazy(() => import("@/pages/program/ProgramUnggulan"));
const Regional = lazy(() => import("@/pages/tentang/Regional"));
const FimClub = lazy(() => import("@/pages/tentang/FimClub"));
const GabungRelawan = lazy(() => import("@/pages/GabungRelawan"));
const CeritaAlumni = lazy(() => import("@/pages/CeritaAlumni"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const Donasi = lazy(() => import("@/pages/Donasi"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const NewsletterUnsubscribe = lazy(() => import("@/pages/NewsletterUnsubscribe"));

// Admin imports - lazy loaded
const AdminAuthProvider = lazy(() => import("@/contexts/AdminAuthContext").then(m => ({ default: m.AdminAuthProvider })));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const DashboardHome = lazy(() => import("@/pages/admin/DashboardHome"));
const ArticlesManagement = lazy(() => import("@/pages/admin/ArticlesManagement"));
const ArticleEditor = lazy(() => import("@/pages/admin/ArticleEditor"));
const AnalyticsDashboard = lazy(() => import("@/pages/admin/AnalyticsDashboard"));
const UsersManagement = lazy(() => import("@/pages/admin/UsersManagement"));
const NewsletterManagement = lazy(() => import("@/pages/admin/NewsletterManagement"));
const AuditLogs = lazy(() => import("@/pages/admin/AuditLogs"));
const ChangePassword = lazy(() => import("@/pages/admin/ChangePassword"));
const ClubsManagement = lazy(() => import("@/pages/admin/ClubsManagement"));
const RegionalsManagement = lazy(() => import("@/pages/admin/RegionalsManagement"));
const AlumniManagement = lazy(() => import("@/pages/admin/AlumniManagement"));
const PRDDocumentation = lazy(() => import("@/pages/admin/PRDDocumentation"));
const TechnicalDocumentation = lazy(() => import("@/pages/admin/TechnicalDocumentation"));
const SessionsManagement = lazy(() => import("@/pages/admin/SessionsManagement"));
const EmailSettings = lazy(() => import("@/pages/admin/EmailSettings"));
const ForgotPassword = lazy(() => import("@/pages/admin/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/admin/ResetPassword"));
const ProfileSettings = lazy(() => import("@/pages/admin/ProfileSettings"));
const OnlineAdminsDashboard = lazy(() => import("@/pages/admin/OnlineAdminsDashboard"));
const ArticleApprovals = lazy(() => import("@/pages/admin/ArticleApprovals"));
const NotificationsPage = lazy(() => import("@/pages/admin/NotificationsPage"));
const RequireSuperAdmin = lazy(() => import("@/components/admin/RequireSuperAdmin").then(m => ({ default: m.RequireSuperAdmin })));
const RequireAdmin = lazy(() => import("@/components/admin/RequireAdmin").then(m => ({ default: m.RequireAdmin })));
const SecurityDashboard = lazy(() => import("@/pages/admin/SecurityDashboard"));
const AdminNotFound = lazy(() => import("@/pages/admin/AdminNotFound"));
const RegistrationsManagement = lazy(() => import("@/pages/admin/RegistrationsManagement"));
const RegistrationStatsDashboard = lazy(() => import("@/pages/admin/RegistrationStatsDashboard"));
const LoginMonitoringDashboard = lazy(() => import("@/pages/admin/LoginMonitoringDashboard"));
const RolesManagement = lazy(() => import("@/pages/admin/RolesManagement"));
const RegistrationSettingsManagement = lazy(() => import("@/pages/admin/RegistrationSettingsManagement"));
const PartnersManagement = lazy(() => import("@/pages/admin/PartnersManagement"));
const FeaturedVideosManagement = lazy(() => import("@/pages/admin/FeaturedVideosManagement"));
const EmailTemplatesManagement = lazy(() => import("@/pages/admin/EmailTemplatesManagement"));
const InterviewCalendar = lazy(() => import("@/pages/admin/InterviewCalendar"));
const RecruiterAssignmentsManagement = lazy(() => import("@/pages/admin/RecruiterAssignmentsManagement"));
const ToolsSettings = lazy(() => import("@/pages/admin/ToolsSettings"));
const ArticleSchedulingCalendar = lazy(() => import("@/pages/admin/ArticleSchedulingCalendar"));

// Registration imports - lazy loaded
const RegistrationAuthProvider = lazy(() => import("@/contexts/RegistrationAuthContext").then(m => ({ default: m.RegistrationAuthProvider })));
const RegistrationLogin = lazy(() => import("@/pages/registration/RegistrationLogin"));
const RegistrationSignup = lazy(() => import("@/pages/registration/RegistrationSignup"));
const RegistrationDashboard = lazy(() => import("@/pages/registration/RegistrationDashboard"));
const TrainingRegistration = lazy(() => import("@/pages/registration/TrainingRegistration"));
const RegistrationSuccess = lazy(() => import("@/pages/registration/RegistrationSuccess"));
const RegistrationForgotPassword = lazy(() => import("@/pages/registration/RegistrationForgotPassword"));
const RegistrationResetPassword = lazy(() => import("@/pages/registration/RegistrationResetPassword"));
const RegistrationProfile = lazy(() => import("@/pages/registration/RegistrationProfile"));
const VerifyEmail = lazy(() => import("@/pages/registration/VerifyEmail"));
const RegistrationClosed = lazy(() => import("@/pages/registration/RegistrationClosed"));
const RegistrationGate = lazy(() => import("@/components/RegistrationGate"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />}>
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

          {/* Registration routes */}
          <Route path="/daftar" element={<RegistrationGate><RegistrationAuthProvider><RegistrationLogin /></RegistrationAuthProvider></RegistrationGate>} />
          <Route path="/daftar/signup" element={<RegistrationGate><RegistrationAuthProvider><RegistrationSignup /></RegistrationAuthProvider></RegistrationGate>} />
          <Route path="/daftar/closed" element={<RegistrationClosed />} />
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
      </Suspense>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;