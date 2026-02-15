import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Mail,
  MapPin,
  UsersRound,
  Monitor,
  Settings,
  BookOpen,
  ClipboardList,
  ShieldAlert,
  Video,
  Handshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permissionKey?: string;
  badgeKey?: string;
  children?: NavItem[];
}

export const adminNavConfig: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Artikel",
    href: "/admin/articles",
    icon: FileText,
    permissionKey: "articles",
    children: [
      { label: "Manajemen Artikel", href: "/admin/articles", icon: FileText, permissionKey: "articles" },
      { label: "Persetujuan", href: "/admin/approvals", icon: ClipboardList, badgeKey: "pendingArticles", permissionKey: "article_approvals" },
      { label: "Kalender Jadwal", href: "/admin/article-calendar", icon: ClipboardList, permissionKey: "article_scheduling" },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3, permissionKey: "article_analytics" },
    ],
  },
  {
    label: "Newsletter",
    href: "/admin/newsletter",
    icon: Mail,
    permissionKey: "newsletter",
    children: [
      { label: "Subscribers", href: "/admin/newsletter", icon: Mail, permissionKey: "newsletter" },
      { label: "Email Settings", href: "/admin/email-settings", icon: Settings, permissionKey: "email_settings" },
    ],
  },
  {
    label: "Data Organisasi",
    href: "/admin/clubs",
    icon: UsersRound,
    children: [
      { label: "FIM Club", href: "/admin/clubs", icon: UsersRound, permissionKey: "clubs" },
      { label: "Regional", href: "/admin/regionals", icon: MapPin, permissionKey: "regionals" },
      { label: "Alumni", href: "/admin/alumni", icon: Users, permissionKey: "alumni" },
      { label: "Mitra", href: "/admin/partners", icon: Handshake, permissionKey: "partners" },
      { label: "Pengurus (About)", href: "/admin/about-profiles", icon: Users, permissionKey: "about_profiles" },
    ],
  },
  { label: "Video Featured", href: "/admin/featured-videos", icon: Video, permissionKey: "featured_videos" },
  {
    label: "Registrasi FIM",
    href: "/admin/registrations",
    icon: ClipboardList,
    badgeKey: "newRegistrations",
    permissionKey: "registrations",
    children: [
      { label: "Data Pendaftar", href: "/admin/registrations", icon: ClipboardList, badgeKey: "newRegistrations", permissionKey: "registrations" },
      { label: "Penugasan Rekruter", href: "/admin/recruiter-assignments", icon: Users, permissionKey: "recruiter_assignments" },
      { label: "Kalender Wawancara", href: "/admin/interview-calendar", icon: ClipboardList, permissionKey: "interview_calendar" },
      { label: "Pengaturan Batch", href: "/admin/registration-settings", icon: Settings, permissionKey: "registration_settings" },
      { label: "Statistik", href: "/admin/registration-stats", icon: BarChart3, permissionKey: "registration_stats" },
    ],
  },
  { label: "Template Email", href: "/admin/email-templates", icon: Mail, permissionKey: "email_templates" },
  {
    label: "Pengguna",
    href: "/admin/users",
    icon: Users,
    permissionKey: "users",
    children: [
      { label: "Manajemen User", href: "/admin/users", icon: Users, permissionKey: "users" },
      { label: "Manajemen Role", href: "/admin/roles", icon: ShieldAlert, permissionKey: "roles" },
      { label: "Admin Online", href: "/admin/online", icon: Monitor, permissionKey: "online_admins" },
      { label: "Login Monitoring", href: "/admin/login-monitoring", icon: ShieldAlert, permissionKey: "login_monitoring" },
    ],
  },
  { label: "Sesi Aktif", href: "/admin/sessions", icon: Monitor, permissionKey: "sessions" },
  {
    label: "Logs",
    href: "/admin/audit-logs",
    icon: ClipboardList,
    permissionKey: "audit_logs",
    children: [
      { label: "Audit Log", href: "/admin/audit-logs", icon: ClipboardList, permissionKey: "audit_logs" },
      { label: "Security", href: "/admin/security-dashboard", icon: ShieldAlert, permissionKey: "security" },
      { label: "PRD & Docs", href: "/admin/prd", icon: BookOpen, permissionKey: "prd_docs" },
      { label: "Technical Docs", href: "/admin/documentation", icon: FileText, permissionKey: "technical_docs" },
    ],
  },
  {
    label: "Tools",
    href: "/admin/tools",
    icon: Settings,
    permissionKey: "tools_settings",
    children: [
      { label: "SEO & reCAPTCHA", href: "/admin/tools", icon: Settings, permissionKey: "tools_settings" },
    ],
  },
];
