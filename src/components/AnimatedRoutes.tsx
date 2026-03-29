import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import PageTransition from "./PageTransition";
import { Loader2 } from "lucide-react";
import BackToTop from "./BackToTop";
import ScrollProgress from "./ScrollProgress";
import MobileStickyCTA from "./MobileStickyCtA";

// Critical: Load Index synchronously for fast initial render
import Index from "@/pages/Index";

// Lazy load all other pages
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
const Install = lazy(() => import("@/pages/Install"));

// Lazy load Admin imports
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
const SecurityDashboard = lazy(() => import("@/pages/admin/SecurityDashboard"));
const AdminNotFound = lazy(() => import("@/pages/admin/AdminNotFound"));
const RegistrationsManagement = lazy(() => import("@/pages/admin/RegistrationsManagement"));
const RegistrationStatsDashboard = lazy(() => import("@/pages/admin/RegistrationStatsDashboard"));
const LoginMonitoringDashboard = lazy(() => import("@/pages/admin/LoginMonitoringDashboard"));
const RolesManagement = lazy(() => import("@/pages/admin/RolesManagement"));
const RegistrationSettingsManagement = lazy(() => import("@/pages/admin/RegistrationSettingsManagement"));
const PartnersManagement = lazy(() => import("@/pages/admin/PartnersManagement"));
const FeaturedVideosManagement = lazy(() => import("@/pages/admin/FeaturedVideosManagement"));

const InterviewCalendar = lazy(() => import("@/pages/admin/InterviewCalendar"));
const RecruiterAssignmentsManagement = lazy(() => import("@/pages/admin/RecruiterAssignmentsManagement"));
const ToolsSettings = lazy(() => import("@/pages/admin/ToolsSettings"));
const ArticleSchedulingCalendar = lazy(() => import("@/pages/admin/ArticleSchedulingCalendar"));
const AboutProfilesManagement = lazy(() => import("@/pages/admin/AboutProfilesManagement"));

// Lazy load Registration imports
const RegistrationLanding = lazy(() => import("@/pages/registration/RegistrationLanding"));
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

// Context providers and components (keep synchronous)
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { RegistrationAuthProvider } from "@/contexts/RegistrationAuthContext";
import { RequireSuperAdmin } from "@/components/admin/RequireSuperAdmin";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import RegistrationGate from "@/components/RegistrationGate";
import TurnstileGuard from "@/components/TurnstileGuard";

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  // Keep admin/portal layout mounted across internal navigation to prevent sidebar scroll reset.
  const routeKey =
    location.pathname.startsWith("/admin")
      ? "/admin"
      : location.pathname.startsWith("/portal")
        ? "/portal"
        : location.pathname;

  const isPublicPage = !location.pathname.startsWith("/admin");
  const isPortalPage = location.pathname.startsWith("/portal");

  return (
    <>
      {isPublicPage && <ScrollProgress />}
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={routeKey}>
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
            <Route path="/install" element={<PageTransition><Install /></PageTransition>} />
            
            {/* Legacy routes redirect */}
            <Route path="/program/regional" element={<PageTransition><Regional /></PageTransition>} />
            <Route path="/program/fim-club" element={<PageTransition><FimClub /></PageTransition>} />

            {/* Registration routes - /portal */}
            <Route path="/portal" element={<TurnstileGuard title="Verifikasi Keamanan" description="Selesaikan verifikasi untuk mengakses Portal Pendaftaran FIM"><RegistrationLanding /></TurnstileGuard>} />
            <Route path="/portal/login" element={<TurnstileGuard title="Verifikasi Keamanan" description="Selesaikan verifikasi untuk masuk ke Portal Pendaftaran"><RegistrationGate><RegistrationAuthProvider><RegistrationLogin /></RegistrationAuthProvider></RegistrationGate></TurnstileGuard>} />
            <Route path="/portal/signup" element={<TurnstileGuard title="Verifikasi Keamanan" description="Selesaikan verifikasi untuk mendaftar di Portal FIM"><RegistrationGate><RegistrationAuthProvider><RegistrationSignup /></RegistrationAuthProvider></RegistrationGate></TurnstileGuard>} />
            <Route path="/portal/closed" element={<RegistrationClosed />} />
            <Route path="/portal/success" element={<RegistrationSuccess />} />
            <Route path="/portal/verify" element={<VerifyEmail />} />
            <Route path="/portal/forgot-password" element={<RegistrationForgotPassword />} />
            <Route path="/portal/reset-password" element={<RegistrationResetPassword />} />
            <Route path="/portal/dashboard" element={<RegistrationAuthProvider><RegistrationDashboard /></RegistrationAuthProvider>} />
            <Route path="/portal/profile" element={<RegistrationAuthProvider><RegistrationProfile /></RegistrationAuthProvider>} />
            <Route path="/portal/pelatihan" element={<RegistrationAuthProvider><TrainingRegistration /></RegistrationAuthProvider>} />
            
            {/* Legacy /daftar routes removed - all redirects handled by _redirects */}
            {/* Admin routes - wrapped in AdminAuthProvider */}
            <Route path="/admin" element={<TurnstileGuard title="Verifikasi Keamanan Admin" description="Selesaikan verifikasi untuk mengakses Panel Admin FIM"><AdminAuthProvider><AdminLogin /></AdminAuthProvider></TurnstileGuard>} />
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
                    
                    {/* Routes accessible based on dynamic permissions */}
                    <Route path="newsletter" element={<RequireAdmin permissionKey="newsletter"><NewsletterManagement /></RequireAdmin>} />
                    <Route path="email-settings" element={<RequireAdmin permissionKey="email_settings"><EmailSettings /></RequireAdmin>} />
                    <Route path="clubs" element={<RequireAdmin permissionKey="clubs"><ClubsManagement /></RequireAdmin>} />
                    <Route path="regionals" element={<RequireAdmin permissionKey="regionals"><RegionalsManagement /></RequireAdmin>} />
                    <Route path="alumni" element={<RequireAdmin permissionKey="alumni"><AlumniManagement /></RequireAdmin>} />
                    <Route path="audit-logs" element={<RequireAdmin permissionKey="audit_logs"><AuditLogs /></RequireAdmin>} />
                    <Route path="security-dashboard" element={<RequireAdmin permissionKey="security"><SecurityDashboard /></RequireAdmin>} />
                    <Route path="registrations" element={<RequireAdmin permissionKey="registrations"><RegistrationsManagement /></RequireAdmin>} />
                    <Route path="registration-settings" element={<RequireAdmin permissionKey="registration_settings"><RegistrationSettingsManagement /></RequireAdmin>} />
                    <Route path="registration-stats" element={<RequireAdmin permissionKey="registration_stats"><RegistrationStatsDashboard /></RequireAdmin>} />
                    <Route path="partners" element={<RequireAdmin permissionKey="partners"><PartnersManagement /></RequireAdmin>} />
                    <Route path="featured-videos" element={<RequireAdmin permissionKey="featured_videos"><FeaturedVideosManagement /></RequireAdmin>} />
                    {/* email-templates route removed - consolidated into email-settings */}
                    <Route path="interview-calendar" element={<RequireAdmin permissionKey="interview_calendar"><InterviewCalendar /></RequireAdmin>} />
                    <Route path="recruiter-assignments" element={<RequireAdmin permissionKey="recruiter_assignments"><RecruiterAssignmentsManagement /></RequireAdmin>} />
                    
                    {/* Super Admin only routes */}
                    <Route path="users" element={<RequireSuperAdmin><UsersManagement /></RequireSuperAdmin>} />
                    <Route path="roles" element={<RequireSuperAdmin><RolesManagement /></RequireSuperAdmin>} />
                    <Route path="login-monitoring" element={<RequireSuperAdmin><LoginMonitoringDashboard /></RequireSuperAdmin>} />
                    <Route path="prd" element={<RequireSuperAdmin><PRDDocumentation /></RequireSuperAdmin>} />
                    <Route path="documentation" element={<RequireSuperAdmin><TechnicalDocumentation /></RequireSuperAdmin>} />
                    <Route path="tools" element={<RequireSuperAdmin><ToolsSettings /></RequireSuperAdmin>} />
                    <Route path="about-profiles" element={<RequireAdmin permissionKey="about_profiles"><AboutProfilesManagement /></RequireAdmin>} />
                    <Route path="article-calendar" element={<RequireAdmin permissionKey="article_scheduling"><ArticleSchedulingCalendar /></RequireAdmin>} />
                    
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
      {isPublicPage && !isPortalPage && <BackToTop />}
      {isPublicPage && !isPortalPage && <MobileStickyCTA />}
    </>
  );
};

export default AnimatedRoutes;
