
# Rencana Implementasi: Menu Admin Dinamis Sesuai Role Permission

## Ringkasan
Implementasi menu admin panel yang sepenuhnya dinamis berdasarkan permission dari database, dengan real-time update dan mode view-only untuk user yang hanya memiliki privilege lihat.

---

## Permasalahan Saat Ini

### 1. Menu Navigation Hybrid
- `AdminDashboard.tsx` masih menggunakan kombinasi hardcoded flags (`superAdminOnly`, `adminOnly`, `hideFromModerator`) bersama dengan `permissionKey`
- Ini membuat perubahan permission di database tidak selalu tercermin di menu

### 2. Permission Check Tidak Konsisten
- Beberapa halaman tidak memiliki permission check sama sekali
- Tombol CRUD (tambah/edit/hapus) muncul untuk semua user yang bisa akses halaman

### 3. Real-time Belum Optimal
- `staleTime` 30 detik dan `refetchInterval` 1 menit masih lambat
- Tidak ada Supabase Realtime subscription untuk perubahan permission

### 4. Mapping Permission Key Tidak Lengkap
Permission keys di database sudah lengkap (30 keys), tapi mapping di navItems belum complete:
- `article_scheduling` - sudah ada
- `article_collaboration` - belum dimapping ke menu
- `seo_settings` - belum dimapping (sekarang pakai `tools_settings`)
- `partners` - sudah ada

---

## Solusi Teknis

### Fase 1: Refactor Navigation Filter (AdminDashboard.tsx)

**Perubahan utama:**
1. Hapus flag legacy (`superAdminOnly`, `adminOnly`, `hideFromModerator`) 
2. Gunakan HANYA `permissionKey` untuk filtering
3. Tambahkan fallback: menu tanpa `permissionKey` = akses semua (default dashboard)
4. Super admin tetap bypass semua check

**Mapping permissionKey yang diupdate:**
```text
Menu                     | permissionKey
-------------------------|------------------
Dashboard                | (tidak ada - default akses)
Manajemen Artikel        | articles
Persetujuan              | article_approvals
Kalender Jadwal          | article_scheduling  
Analytics                | article_analytics
Newsletter Subscribers   | newsletter
Email Settings           | email_settings
FIM Club                 | clubs
Regional                 | regionals  
Alumni                   | alumni
Mitra                    | partners
Video Featured           | featured_videos
Data Pendaftar           | registrations
Penugasan Rekruter       | recruiter_assignments
Kalender Wawancara       | interview_calendar
Pengaturan Batch         | registration_settings
Statistik                | registration_stats
Template Email           | email_templates
Manajemen User           | users
Manajemen Role           | roles
Admin Online             | online_admins
Login Monitoring         | login_monitoring
Sesi Aktif               | sessions
Audit Log                | audit_logs
Security                 | security
PRD & Docs               | prd_docs
Technical Docs           | technical_docs
SEO & reCAPTCHA          | tools_settings + seo_settings
```

### Fase 2: Real-time Permission Updates (usePermission.ts)

**Perubahan:**
1. Tambahkan Supabase Realtime subscription ke tabel `role_permissions`
2. Kurangi `staleTime` menjadi 10 detik
3. Refetch otomatis saat ada perubahan di database
4. Cleanup subscription saat komponen unmount

```typescript
// Pseudo-code untuk realtime subscription
useEffect(() => {
  if (!user?.id || isSuperAdmin) return;
  
  const channel = supabase
    .channel('role-permissions-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'role_permissions' },
      () => refetch()
    )
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, [user?.id]);
```

### Fase 3: View-Only Mode di Halaman Admin

Buat reusable component `PermissionGuard` dan update setiap halaman admin untuk menyembunyikan tombol CRUD berdasarkan permission.

**Pola implementasi:**
```tsx
// Di setiap halaman admin
const { canView, canCreate, canEdit, canDelete } = usePermission("clubs");

// Tombol Tambah
{canCreate && (
  <Button><Plus /> Tambah Club</Button>
)}

// Tombol Edit 
{canEdit && (
  <Button><Pencil /> Edit</Button>
)}

// Tombol Hapus
{canDelete && (
  <AlertDialog>...</AlertDialog>
)}
```

**Halaman yang perlu diupdate (prioritas tinggi):**
1. `ClubsManagement.tsx` - permissionKey: `clubs`
2. `RegionalsManagement.tsx` - permissionKey: `regionals`
3. `AlumniManagement.tsx` - permissionKey: `alumni`
4. `PartnersManagement.tsx` - permissionKey: `partners`
5. `FeaturedVideosManagement.tsx` - permissionKey: `featured_videos`
6. `NewsletterManagement.tsx` - permissionKey: `newsletter`
7. `RegistrationsManagement.tsx` - permissionKey: `registrations`
8. `ArticlesManagement.tsx` - permissionKey: `articles`
9. `EmailTemplatesManagement.tsx` - permissionKey: `email_templates`
10. `SessionsManagement.tsx` - permissionKey: `sessions`
11. `AuditLogs.tsx` - permissionKey: `audit_logs`
12. `InterviewCalendar.tsx` - permissionKey: `interview_calendar`
13. `ArticleSchedulingCalendar.tsx` - permissionKey: `article_scheduling`
14. `ToolsSettings.tsx` - permissionKey: `tools_settings`

---

## File yang Akan Dimodifikasi

### 1. `src/hooks/usePermission.ts`
- Tambah Supabase Realtime subscription
- Kurangi staleTime untuk lebih responsif
- Tambah helper function `usePermissionGate`

### 2. `src/pages/admin/AdminDashboard.tsx`
- Refactor `navItems` - hapus legacy flags, tambah permissionKey di semua menu
- Simplify `filterNavItems` - hanya gunakan permissionKey
- Loading state saat permission loading

### 3. Halaman Admin (14 file)
Update untuk menggunakan `usePermission` dan menyembunyikan tombol CRUD:
- ClubsManagement.tsx
- RegionalsManagement.tsx
- AlumniManagement.tsx
- PartnersManagement.tsx
- FeaturedVideosManagement.tsx
- NewsletterManagement.tsx
- RegistrationsManagement.tsx
- ArticlesManagement.tsx
- EmailTemplatesManagement.tsx
- SessionsManagement.tsx
- AuditLogs.tsx
- InterviewCalendar.tsx
- ArticleSchedulingCalendar.tsx
- ToolsSettings.tsx

---

## Alur Permission yang Baru

```text
User Login
    │
    ▼
useAllPermissions() dipanggil
    │
    ├─── Super Admin? ──► Bypass semua, akses penuh
    │
    ▼
Query role_permissions dari database
    │
    ├─── Subscribe realtime changes
    │
    ▼
filterNavItems() di AdminDashboard
    │
    ├─── Cek permissionKey setiap menu
    ├─── can_view = true → Tampilkan menu
    ├─── can_view = false → Sembunyikan menu
    │
    ▼
User buka halaman
    │
    ▼
usePermission(permissionKey) di halaman
    │
    ├─── can_create = true → Tampilkan tombol Tambah
    ├─── can_edit = true → Tampilkan tombol Edit
    ├─── can_delete = true → Tampilkan tombol Hapus
    ├─── Semua false → View-only mode
```

---

## Detail Teknis

### Struktur Permission di Database
```text
role_permissions:
  - permission_key: "clubs"
  - can_view: boolean    → Bisa lihat menu & halaman
  - can_create: boolean  → Bisa tambah data baru
  - can_edit: boolean    → Bisa edit data
  - can_delete: boolean  → Bisa hapus data
```

### Contoh Konfigurasi Role "Rekruter"
- `registrations`: can_view=true, can_create=false, can_edit=true, can_delete=false
  - Bisa lihat data pendaftar
  - Bisa edit (update status wawancara)
  - Tidak bisa tambah/hapus

### View-Only Mode
Jika user hanya punya `can_view=true`:
- Halaman tetap bisa diakses
- Semua tombol aksi (Tambah/Edit/Hapus/Import/Export) disembunyikan
- Data bisa dilihat dalam mode read-only
- Form tidak muncul

---

## Keuntungan Implementasi

1. **Fleksibilitas** - Permission bisa diatur per-fitur tanpa deploy ulang
2. **Real-time** - Perubahan permission langsung berlaku tanpa refresh
3. **Konsistensi** - Satu sumber kebenaran (database) untuk semua access control
4. **Keamanan** - Double validation: menu tersembunyi + tombol tersembunyi + RLS di database
5. **Maintainability** - Tidak perlu update code saat menambah role baru

---

## Estimasi Perubahan

| File | Jenis Perubahan | Kompleksitas |
|------|-----------------|--------------|
| usePermission.ts | Tambah realtime subscription | Sedang |
| AdminDashboard.tsx | Refactor filterNavItems | Sedang |
| 14 halaman admin | Tambah permission checks | Rendah (repetitif) |

Total: ~16 file dimodifikasi
