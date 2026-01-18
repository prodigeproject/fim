import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Database, 
  Globe, 
  Shield, 
  Server, 
  Layout,
  BookOpen,
  Layers,
  Code,
  FileJson,
  Lock,
  RefreshCw,
  HardDrive,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GitBranch
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { generateExcelBuffer } from "@/lib/excelExport";
import { 
  MermaidDiagram, 
  architectureDiagram, 
  databaseDiagram, 
  authFlowDiagram, 
  articleFlowDiagram,
  securityDiagram 
} from "@/components/admin/MermaidDiagram";

// Data structures for documentation
const publicPages = [
  { path: "/", name: "Homepage", description: "Landing page dengan statistik, nilai-nilai FIM, testimoni, partner logos" },
  { path: "/tentang", name: "Tentang FIM", description: "Profil organisasi, visi misi, struktur pengurus" },
  { path: "/tentang/regional", name: "Regional", description: "Jaringan regional FIM di seluruh Indonesia" },
  { path: "/tentang/fim-club", name: "FIM Club", description: "Informasi dan daftar FIM Club" },
  { path: "/program/pelatihan", name: "Pelatihan", description: "Program pelatihan yang ditawarkan FIM" },
  { path: "/program/program-unggulan", name: "Program Unggulan", description: "Program unggulan FIM" },
  { path: "/gabung-relawan", name: "Gabung Relawan", description: "Form pendaftaran relawan FIM" },
  { path: "/cerita-alumni", name: "Cerita Alumni", description: "Kisah inspiratif alumni FIM dari berbagai sektor" },
  { path: "/blog", name: "Blog", description: "Daftar artikel yang dipublikasikan" },
  { path: "/blog/:slug", name: "Detail Artikel", description: "Detail artikel dengan view count dan social share" },
  { path: "/donasi", name: "Donasi", description: "Halaman donasi untuk mendukung FIM" },
  { path: "/faq", name: "FAQ", description: "Frequently Asked Questions" },
];

const adminPages = [
  { path: "/admin", name: "Login", access: "Public", description: "Halaman login admin dengan rate limiting" },
  { path: "/admin/dashboard", name: "Dashboard", access: "All Admin", description: "Statistik ringkasan, grafik artikel, quick actions" },
  { path: "/admin/articles", name: "Manajemen Artikel", access: "All Admin", description: "CRUD artikel dengan filter, search, dan bulk actions" },
  { path: "/admin/articles/new", name: "Editor Artikel", access: "All Admin", description: "Rich text editor dengan TipTap, image upload, scheduling" },
  { path: "/admin/articles/edit/:id", name: "Edit Artikel", access: "All Admin", description: "Edit artikel yang sudah ada" },
  { path: "/admin/analytics", name: "Analytics", access: "All Admin", description: "Statistik views, export PDF/XLSX, grafik trend" },
  { path: "/admin/notifications", name: "Notifikasi", access: "All Admin", description: "Halaman notifikasi lengkap" },
  { path: "/admin/profile", name: "Profile", access: "All Admin", description: "Pengaturan profil user" },
  { path: "/admin/change-password", name: "Ubah Password", access: "All Admin", description: "Halaman ubah password" },
  { path: "/admin/approvals", name: "Persetujuan Artikel", access: "Super Admin", description: "Approve/reject artikel dari moderator" },
  { path: "/admin/newsletter", name: "Newsletter", access: "Super Admin", description: "Manajemen subscriber dan broadcast email" },
  { path: "/admin/email-settings", name: "Email Settings", access: "Super Admin", description: "Konfigurasi template email" },
  { path: "/admin/clubs", name: "FIM Club", access: "Super Admin", description: "Manajemen data FIM Club" },
  { path: "/admin/regionals", name: "Regional", access: "Super Admin", description: "Manajemen data Regional" },
  { path: "/admin/alumni", name: "Alumni", access: "Super Admin", description: "Cerita alumni dan video testimonial" },
  { path: "/admin/users", name: "Users", access: "Super Admin", description: "Manajemen user admin (create, edit, roles)" },
  { path: "/admin/online", name: "Online Admins", access: "Super Admin", description: "Daftar admin yang sedang online" },
  { path: "/admin/sessions", name: "Sesi Aktif", access: "Super Admin", description: "Manajemen sesi login aktif" },
  { path: "/admin/audit-logs", name: "Audit Logs", access: "Super Admin", description: "Log aktivitas dan upaya akses ditolak" },
  { path: "/admin/prd", name: "PRD & Docs", access: "Super Admin", description: "Dokumentasi pengembangan internal" },
  { path: "/admin/documentation", name: "Technical Docs", access: "Super Admin", description: "Dokumentasi teknis lengkap (halaman ini)" },
];

const databaseTables = [
  { name: "articles", columns: 25, description: "Artikel blog dengan status, kategori, views, scheduling", rls: true },
  { name: "profiles", columns: 10, description: "Profil user admin dengan avatar dan status", rls: true },
  { name: "user_roles", columns: 5, description: "Role assignment (super_admin, moderator)", rls: true },
  { name: "admin_sessions", columns: 10, description: "Sesi login aktif dengan device info", rls: true },
  { name: "admin_notifications", columns: 7, description: "Notifikasi untuk admin", rls: true },
  { name: "audit_logs", columns: 9, description: "Log audit semua aktivitas sistem", rls: true },
  { name: "login_attempts", columns: 5, description: "Rate limiting untuk login attempts", rls: true },
  { name: "fim_clubs", columns: 13, description: "Data FIM Club dengan logo dan kegiatan", rls: true },
  { name: "fim_regionals", columns: 11, description: "Data Regional FIM per provinsi/pulau", rls: true },
  { name: "alumni_stories", columns: 13, description: "Cerita inspiratif alumni FIM", rls: true },
  { name: "alumni_other", columns: 9, description: "Daftar alumni lainnya", rls: true },
  { name: "video_testimonials", columns: 9, description: "Video testimoni YouTube", rls: true },
  { name: "newsletter_subscribers", columns: 9, description: "Subscriber newsletter", rls: true },
  { name: "scheduled_broadcasts", columns: 12, description: "Email broadcast terjadwal", rls: true },
  { name: "article_comments", columns: 6, description: "Komentar internal untuk artikel", rls: true },
  { name: "prd_documents", columns: 14, description: "Dokumentasi PRD pengembangan", rls: true },
  { name: "prd_changelog", columns: 8, description: "Changelog versi aplikasi", rls: true },
  { name: "translations", columns: 7, description: "Terjemahan multi-bahasa (ID/EN)", rls: true },
];

const edgeFunctions = [
  { name: "admin-create-user", description: "Membuat user admin baru dengan email dan password" },
  { name: "admin-reset-password", description: "Reset password admin ke password sementara" },
  { name: "newsletter-broadcast", description: "Kirim broadcast email ke semua subscriber aktif" },
  { name: "newsletter-subscribe", description: "Handle subscription newsletter dengan konfirmasi" },
  { name: "notify-article-status", description: "Kirim notifikasi status artikel (approved/rejected)" },
  { name: "notify-first-login", description: "Notifikasi ke super admin saat login pertama user baru" },
  { name: "notify-login", description: "Notifikasi login untuk audit" },
  { name: "notify-revision", description: "Notifikasi permintaan revisi artikel" },
  { name: "process-scheduled-broadcasts", description: "Proses dan kirim broadcast yang dijadwalkan" },
];

const securityFeatures = [
  { name: "Row Level Security (RLS)", description: "Semua tabel dilindungi dengan kebijakan RLS yang ketat" },
  { name: "Role-Based Access Control", description: "Dua role: Super Admin (akses penuh) dan Moderator (akses terbatas)" },
  { name: "Rate Limiting Login", description: "Maksimal 5 percobaan login per 15 menit per email/IP" },
  { name: "Session Management", description: "Sesi login dengan timeout otomatis dan tracking device" },
  { name: "Audit Logging", description: "Semua aktivitas penting dicatat untuk audit trail" },
  { name: "Unauthorized Access Logging", description: "Upaya akses halaman terlarang dicatat di audit log" },
  { name: "Password Policy", description: "First login wajib ganti password default" },
  { name: "Secure Storage", description: "File upload ke Supabase Storage dengan bucket policies" },
];

const migrationSteps = [
  { step: 1, title: "Export Database", description: "Gunakan fitur backup di halaman ini untuk mengunduh semua data dalam format XLSX" },
  { step: 2, title: "Clone Repository", description: "Clone repository dari GitHub ke local machine" },
  { step: 3, title: "Setup Supabase Project", description: "Buat project baru di Supabase dan jalankan semua migration SQL" },
  { step: 4, title: "Import Data", description: "Import data dari file backup ke database baru menggunakan Supabase dashboard" },
  { step: 5, title: "Configure Environment", description: "Set environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)" },
  { step: 6, title: "Deploy Edge Functions", description: "Deploy semua edge functions dari folder supabase/functions" },
  { step: 7, title: "Configure Secrets", description: "Set secrets (RESEND_API_KEY, dll) di Supabase dashboard" },
  { step: 8, title: "Deploy Frontend", description: "Deploy ke hosting (Vercel, Netlify, atau VPS)" },
  { step: 9, title: "Configure DNS", description: "Point domain ke hosting baru dan setup SSL" },
  { step: 10, title: "Testing", description: "Test semua fitur: login, CRUD, email, dll" },
];

const developmentSuggestions = [
  { category: "Fitur", title: "Scheduling Artikel Lanjutan", description: "Calendar view, bulk scheduling, recurring articles" },
  { category: "Fitur", title: "Media Library", description: "Manajemen gambar terpusat dengan resize dan optimize" },
  { category: "Fitur", title: "Multi-author Collaboration", description: "Co-authoring, review inline, version history" },
  { category: "SEO", title: "SEO Tools Lanjutan", description: "Meta description generator AI, keyword analysis" },
  { category: "Integrasi", title: "Social Media Integration", description: "Auto-post ke Instagram/Twitter/Facebook" },
  { category: "Mobile", title: "Mobile App", description: "React Native app untuk admin dengan push notification" },
  { category: "API", title: "Public API", description: "RESTful API dengan dokumentasi dan rate limiting" },
  { category: "Analytics", title: "Advanced Analytics", description: "Heatmap pengunjung, conversion tracking, A/B testing" },
  { category: "Backup", title: "Automated Backup", description: "Scheduled daily backup ke cloud storage (S3/GCS)" },
  { category: "Integrasi", title: "Webhooks", description: "Event-driven notifications ke Slack/Discord" },
];

export default function TechnicalDocumentation() {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState("");

  const { data: tableCounts, isFetching: isFetchingCounts, dataUpdatedAt } = useQuery({
    queryKey: ["technical-docs-table-counts"],
    queryFn: async () => {
      const entries = await Promise.all(
        databaseTables.map(async (t) => {
          const { count, error } = await supabase
            .from(t.name as any)
            .select("*", { count: "exact", head: true });

          if (error) {
            return [t.name, null] as const;
          }

          return [t.name, count ?? 0] as const;
        })
      );

      return Object.fromEntries(entries) as Record<string, number | null>;
    },
    refetchInterval: 30_000,
  });

  const generatePDF = async () => {
    setIsExportingPdf(true);
    try {
      const pdf = new jsPDF();
      let yPos = 20;
      const pageHeight = 280;
      const margin = 20;
      const lineHeight = 7;

      const addPage = () => {
        pdf.addPage();
        yPos = 20;
      };

      const checkPageBreak = (neededSpace: number) => {
        if (yPos + neededSpace > pageHeight) {
          addPage();
        }
      };

      // Cover Page
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("DOKUMENTASI TEKNIS", 105, 80, { align: "center" });
      pdf.setFontSize(20);
      pdf.text("Website Forum Indonesia Muda", 105, 95, { align: "center" });
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}`, 105, 120, { align: "center" });
      pdf.text("Versi: 1.0.0", 105, 130, { align: "center" });

      // Technology Stack
      addPage();
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("1. TEKNOLOGI YANG DIGUNAKAN", margin, yPos);
      yPos += 10;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const techStack = [
        "Frontend: React 18 + TypeScript + Vite",
        "Styling: Tailwind CSS + shadcn/ui components",
        "State Management: TanStack Query (React Query)",
        "Routing: React Router DOM v6",
        "Backend: Supabase (PostgreSQL + Auth + Storage)",
        "Edge Functions: Deno Runtime",
        "Email: Resend API",
        "PDF Export: jsPDF",
        "Excel Export: xlsx (SheetJS)",
        "Animation: Framer Motion",
        "Rich Text Editor: TipTap",
      ];
      techStack.forEach((tech) => {
        checkPageBreak(lineHeight);
        pdf.text(`• ${tech}`, margin + 5, yPos);
        yPos += lineHeight;
      });

      // Public Pages
      yPos += 10;
      checkPageBreak(20);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("2. HALAMAN PUBLIK", margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      publicPages.forEach((page) => {
        checkPageBreak(lineHeight * 2);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${page.name} (${page.path})`, margin + 5, yPos);
        yPos += 5;
        pdf.setFont("helvetica", "normal");
        pdf.text(page.description, margin + 10, yPos);
        yPos += lineHeight;
      });

      // Admin Pages
      yPos += 10;
      checkPageBreak(20);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("3. HALAMAN ADMIN", margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      adminPages.forEach((page) => {
        checkPageBreak(lineHeight * 2);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${page.name} [${page.access}]`, margin + 5, yPos);
        yPos += 5;
        pdf.setFont("helvetica", "normal");
        pdf.text(`${page.path} - ${page.description}`, margin + 10, yPos);
        yPos += lineHeight;
      });

      // Database Schema
      addPage();
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("4. SKEMA DATABASE", margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      databaseTables.forEach((table) => {
        checkPageBreak(lineHeight * 2);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${table.name} (${table.columns} kolom)`, margin + 5, yPos);
        yPos += 5;
        pdf.setFont("helvetica", "normal");
        pdf.text(`${table.description} | RLS: ${table.rls ? "Enabled" : "Disabled"}`, margin + 10, yPos);
        yPos += lineHeight;
      });

      // Edge Functions
      yPos += 10;
      checkPageBreak(20);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("5. EDGE FUNCTIONS", margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      edgeFunctions.forEach((func) => {
        checkPageBreak(lineHeight * 2);
        pdf.setFont("helvetica", "bold");
        pdf.text(func.name, margin + 5, yPos);
        yPos += 5;
        pdf.setFont("helvetica", "normal");
        pdf.text(func.description, margin + 10, yPos);
        yPos += lineHeight;
      });

      // Security Features
      addPage();
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("6. FITUR KEAMANAN", margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      securityFeatures.forEach((feature) => {
        checkPageBreak(lineHeight * 2);
        pdf.setFont("helvetica", "bold");
        pdf.text(feature.name, margin + 5, yPos);
        yPos += 5;
        pdf.setFont("helvetica", "normal");
        pdf.text(feature.description, margin + 10, yPos);
        yPos += lineHeight;
      });

      // Migration Guide
      yPos += 10;
      checkPageBreak(20);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("7. PANDUAN MIGRASI", margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      migrationSteps.forEach((step) => {
        checkPageBreak(lineHeight * 2);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${step.step}. ${step.title}`, margin + 5, yPos);
        yPos += 5;
        pdf.setFont("helvetica", "normal");
        pdf.text(step.description, margin + 10, yPos);
        yPos += lineHeight;
      });

      pdf.save("FIM-Technical-Documentation.pdf");
      toast.success("Dokumentasi PDF berhasil diunduh");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal mengunduh dokumentasi");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const generateBackup = async () => {
    setIsExportingBackup(true);
    const zip = new JSZip();
    const dataFolder = zip.folder("data");
    const docsFolder = zip.folder("docs");

    try {
      // Export each table
      const tables = [
        "articles",
        "profiles", 
        "user_roles",
        "fim_clubs",
        "fim_regionals",
        "alumni_stories",
        "alumni_other",
        "video_testimonials",
        "newsletter_subscribers",
        "prd_documents",
        "prd_changelog",
        "translations",
      ];

      for (const table of tables) {
        setBackupProgress(`Mengekspor ${table}...`);
        const { data, error } = await supabase.from(table as any).select("*");
        
        if (error) {
          console.error(`Error fetching ${table}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          const xlsxBuffer = await generateExcelBuffer(data as unknown as Record<string, unknown>[], table);
          dataFolder?.file(`${table}.xlsx`, xlsxBuffer);
        }
      }

      // Add documentation markdown
      setBackupProgress("Membuat dokumentasi...");
      const markdown = generateMarkdownDoc();
      docsFolder?.file("DOCUMENTATION.md", markdown);

      // Add README
      const readme = `# FIM Website Backup

Generated: ${new Date().toISOString()}

## Contents

### /data
Contains XLSX exports of all database tables.

### /docs
Contains technical documentation in Markdown format.

## How to Restore

1. Create a new Supabase project
2. Run the migration SQL files
3. Import the XLSX files using Supabase dashboard or scripts
4. Deploy the frontend code
5. Configure environment variables

See DOCUMENTATION.md for detailed instructions.
`;
      zip.file("README.md", readme);

      setBackupProgress("Membuat file ZIP...");
      const content = await zip.generateAsync({ type: "blob" });
      
      // Download
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FIM-Backup-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Backup berhasil diunduh");
    } catch (error) {
      console.error("Error generating backup:", error);
      toast.error("Gagal membuat backup");
    } finally {
      setIsExportingBackup(false);
      setBackupProgress("");
    }
  };

  const generateMarkdownDoc = () => {
    let md = `# Dokumentasi Teknis Website Forum Indonesia Muda

Generated: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}

## 1. Teknologi yang Digunakan

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query
- **Routing**: React Router DOM v6
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Email**: Resend API

## 2. Halaman Publik

| Route | Nama | Deskripsi |
|-------|------|-----------|
`;
    publicPages.forEach((p) => {
      md += `| \`${p.path}\` | ${p.name} | ${p.description} |\n`;
    });

    md += `\n## 3. Halaman Admin

| Route | Nama | Akses | Deskripsi |
|-------|------|-------|-----------|
`;
    adminPages.forEach((p) => {
      md += `| \`${p.path}\` | ${p.name} | ${p.access} | ${p.description} |\n`;
    });

    md += `\n## 4. Skema Database

| Tabel | Kolom | Deskripsi | RLS |
|-------|-------|-----------|-----|
`;
    databaseTables.forEach((t) => {
      md += `| ${t.name} | ${t.columns} | ${t.description} | ${t.rls ? "✅" : "❌"} |\n`;
    });

    md += `\n## 5. Edge Functions

| Function | Deskripsi |
|----------|-----------|
`;
    edgeFunctions.forEach((f) => {
      md += `| ${f.name} | ${f.description} |\n`;
    });

    md += `\n## 6. Fitur Keamanan

`;
    securityFeatures.forEach((f) => {
      md += `- **${f.name}**: ${f.description}\n`;
    });

    md += `\n## 7. Panduan Migrasi

`;
    migrationSteps.forEach((s) => {
      md += `### ${s.step}. ${s.title}\n${s.description}\n\n`;
    });

    return md;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Dokumentasi Teknis
          </h1>
          <p className="text-muted-foreground mt-1">
            Dokumentasi lengkap website FIM untuk keperluan pengembangan dan migrasi
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generatePDF} disabled={isExportingPdf}>
            {isExportingPdf ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
          <Button onClick={generateBackup} disabled={isExportingBackup} variant="outline">
            {isExportingBackup ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <HardDrive className="h-4 w-4 mr-2" />
            )}
            Backup Data
          </Button>
        </div>
      </div>

      {isExportingBackup && backupProgress && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm">{backupProgress}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto">
          <TabsTrigger value="overview" className="text-xs">
            <Layers className="h-3 w-3 mr-1" />
            Ringkasan
          </TabsTrigger>
          <TabsTrigger value="architecture" className="text-xs">
            <GitBranch className="h-3 w-3 mr-1" />
            Arsitektur
          </TabsTrigger>
          <TabsTrigger value="public" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            Publik
          </TabsTrigger>
          <TabsTrigger value="admin" className="text-xs">
            <Layout className="h-3 w-3 mr-1" />
            Admin
          </TabsTrigger>
          <TabsTrigger value="database" className="text-xs">
            <Database className="h-3 w-3 mr-1" />
            Database
          </TabsTrigger>
          <TabsTrigger value="functions" className="text-xs">
            <Server className="h-3 w-3 mr-1" />
            Functions
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Keamanan
          </TabsTrigger>
          <TabsTrigger value="migration" className="text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Migrasi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frontend</span>
                  <span>React + TypeScript + Vite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Styling</span>
                  <span>Tailwind CSS + shadcn/ui</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Backend</span>
                  <span>Supabase</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>Resend</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-primary" />
                  Statistik Codebase
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Halaman Publik</span>
                  <Badge variant="secondary">{publicPages.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Halaman Admin</span>
                  <Badge variant="secondary">{adminPages.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tabel Database</span>
                  <Badge variant="secondary">{databaseTables.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Edge Functions</span>
                  <Badge variant="secondary">{edgeFunctions.length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Keamanan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>RLS di semua tabel</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Role-based access control</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Rate limiting login</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Audit logging</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Usulan Pengembangan
              </CardTitle>
              <CardDescription>
                Fitur-fitur yang dapat dikembangkan untuk meningkatkan website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {developmentSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Badge variant="outline" className="shrink-0">{suggestion.category}</Badge>
                    <div>
                      <p className="font-medium text-sm">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Diagram Arsitektur Sistem
                </CardTitle>
                <CardDescription>
                  Visualisasi arsitektur aplikasi dan alur data
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <MermaidDiagram
                chart={architectureDiagram}
                title="🏗️ Arsitektur Aplikasi"
              />
              
              <MermaidDiagram
                chart={authFlowDiagram}
                title="🔐 Alur Autentikasi"
              />
              
              <MermaidDiagram
                chart={articleFlowDiagram}
                title="📝 Alur Artikel"
              />
              
              <MermaidDiagram
                chart={securityDiagram}
                title="🛡️ Lapisan Keamanan"
              />
            </div>

            <MermaidDiagram
              chart={databaseDiagram}
              title="🗄️ Entity Relationship Diagram"
              className="w-full"
            />
          </div>
        </TabsContent>

        <TabsContent value="public">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Halaman Publik
              </CardTitle>
              <CardDescription>
                Halaman yang dapat diakses oleh semua pengunjung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {publicPages.map((page, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{page.name}</h3>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{page.path}</code>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{page.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Halaman Admin
              </CardTitle>
              <CardDescription>
                Halaman untuk pengelolaan website (memerlukan login)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {adminPages.map((page, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{page.name}</h3>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{page.path}</code>
                          <Badge variant={page.access === "Super Admin" ? "default" : "secondary"}>
                            {page.access}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{page.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Skema Database
              </CardTitle>
              <CardDescription>
                {databaseTables.length} tabel dengan Row Level Security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {databaseTables.map((table, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono font-semibold">{table.name}</h3>
                          <Badge variant="outline">{table.columns} kolom</Badge>
                          <Badge variant="secondary">
                            {isFetchingCounts ? "…" : tableCounts?.[table.name] ?? "-"} rows
                          </Badge>
                          {table.rls && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              <Shield className="h-3 w-3 mr-1" />
                              RLS
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{table.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Edge Functions
              </CardTitle>
              <CardDescription>
                Serverless functions untuk backend logic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {edgeFunctions.map((func, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex-1">
                        <h3 className="font-mono font-semibold">{func.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{func.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Fitur Keamanan
              </CardTitle>
              <CardDescription>
                Lapisan keamanan yang diterapkan pada website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {securityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Panduan Migrasi
              </CardTitle>
              <CardDescription>
                Langkah-langkah untuk memigrasikan website ke hosting lain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {migrationSteps.map((step) => (
                    <div key={step.step} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Catatan Penting
                  </h3>
                  <ul className="mt-2 text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Pastikan backup data sebelum melakukan migrasi</li>
                    <li>• Environment variables harus dikonfigurasi dengan benar</li>
                    <li>• Edge functions perlu di-deploy ulang di Supabase baru</li>
                    <li>• Secrets (API keys) harus diset ulang di dashboard</li>
                    <li>• Test semua fitur setelah migrasi selesai</li>
                  </ul>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
