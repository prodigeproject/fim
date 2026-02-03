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

import type { ComponentType } from "react";

export interface AdminNavItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  children?: AdminNavItem[];
  badgeKey?: string;
  permissionKey?: string;
}

export const adminNavItems: AdminNavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    name: "Artikel",
    href: "/admin/articles",
    icon: FileText,
    permissionKey: "articles",
    children: [
      { name: "Manajemen Artikel", href: "/admin/articles", icon: FileText, permissionKey: "articles" },
      {
        name: "Persetujuan",
        href: "/admin/approvals",
        icon: ClipboardList,
        badgeKey: "pendingArticles",
        permissionKey: "article_approvals",
      },
      { name: "Kalender Jadwal", href: "/admin/article-calendar", icon: ClipboardList, permissionKey: "article_scheduling" },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3, permissionKey: "article_analytics" },
    ],
  },
  {
    name: "Newsletter",
    href: "/admin/newsletter",
    icon: Mail,
    permissionKey: "newsletter",
    children: [
      { name: "Subscribers", href: "/admin/newsletter", icon: Mail, permissionKey: "newsletter" },
      { name: "Email Settings", href: "/admin/email-settings", icon: Settings, permissionKey: "email_settings" },
    ],
  },
  {
    name: "Data Organisasi",
    href: "/admin/clubs",
    icon: UsersRound,
    children: [
      { name: "FIM Club", href: "/admin/clubs", icon: UsersRound, permissionKey: "clubs" },
      { name: "Regional", href: "/admin/regionals", icon: MapPin, permissionKey: "regionals" },
      { name: "Alumni", href: "/admin/alumni", icon: Users, permissionKey: "alumni" },
      { name: "Mitra", href: "/admin/partners", icon: Handshake, permissionKey: "partners" },
    ],
  },
  { name: "Video Featured", href: "/admin/featured-videos", icon: Video, permissionKey: "featured_videos" },
  {
    name: "Registrasi FIM",
    href: "/admin/registrations",
    icon: ClipboardList,
    badgeKey: "newRegistrations",
    permissionKey: "registrations",
    children: [
      {
        name: "Data Pendaftar",
        href: "/admin/registrations",
        icon: ClipboardList,
        badgeKey: "newRegistrations",
        permissionKey: "registrations",
      },
      { name: "Penugasan Rekruter", href: "/admin/recruiter-assignments", icon: Users, permissionKey: "recruiter_assignments" },
      { name: "Kalender Wawancara", href: "/admin/interview-calendar", icon: ClipboardList, permissionKey: "interview_calendar" },
      { name: "Pengaturan Batch", href: "/admin/registration-settings", icon: Settings, permissionKey: "registration_settings" },
      { name: "Statistik", href: "/admin/registration-stats", icon: BarChart3, permissionKey: "registration_stats" },
    ],
  },
  { name: "Template Email", href: "/admin/email-templates", icon: Mail, permissionKey: "email_templates" },
  {
    name: "Pengguna",
    href: "/admin/users",
    icon: Users,
    permissionKey: "users",
    children: [
      { name: "Manajemen User", href: "/admin/users", icon: Users, permissionKey: "users" },
      { name: "Manajemen Role", href: "/admin/roles", icon: ShieldAlert, permissionKey: "roles" },
      { name: "Admin Online", href: "/admin/online", icon: Monitor, permissionKey: "online_admins" },
      { name: "Login Monitoring", href: "/admin/login-monitoring", icon: ShieldAlert, permissionKey: "login_monitoring" },
    ],
  },
  { name: "Sesi Aktif", href: "/admin/sessions", icon: Monitor, permissionKey: "sessions" },
  {
    name: "Logs",
    href: "/admin/audit-logs",
    icon: ClipboardList,
    permissionKey: "audit_logs",
    children: [
      { name: "Audit Log", href: "/admin/audit-logs", icon: ClipboardList, permissionKey: "audit_logs" },
      { name: "Security", href: "/admin/security-dashboard", icon: ShieldAlert, permissionKey: "security" },
      { name: "PRD & Docs", href: "/admin/prd", icon: BookOpen, permissionKey: "prd_docs" },
      { name: "Technical Docs", href: "/admin/documentation", icon: FileText, permissionKey: "technical_docs" },
    ],
  },
  {
    name: "Tools",
    href: "/admin/tools",
    icon: Settings,
    permissionKey: "tools_settings",
    children: [{ name: "SEO & reCAPTCHA", href: "/admin/tools", icon: Settings, permissionKey: "tools_settings" }],
  },
];
