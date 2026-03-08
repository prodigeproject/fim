

# Implementasi Perbaikan UI/UX Admin Panel & Portal Pendaftaran

## Perubahan yang Akan Dilakukan

### Batch 1 -- Critical (Login & Error Handling)

**1. Turnstile Error Recovery (AdminLogin + RegistrationLogin + RegistrationSignup)**
- Tambah state `turnstileError` dan `turnstileRetries`
- Saat error/expire, increment retry counter
- Jika retry > 3, tampilkan tombol "Muat Ulang Halaman" yang visible
- Jika retry <= 3, tampilkan tombol "Coba Lagi Verifikasi" di bawah widget

**2. Fix `setIsSubmitting` Bug di RegistrationLogin.tsx**
- Pada line 64-68, tambahkan `setIsSubmitting(false)` sebelum `return` saat `!turnstileToken`

**3. Admin Login -- Hapus/jangan tambah link Forgot Password (sesuai instruksi user)**
- Konfirmasi: TIDAK akan menambahkan link "Lupa Password" di admin login. Halaman admin sengaja tanpa link reset password.

### Batch 2 -- Admin UX

**4. Dynamic Page Title di Admin Header**
- Di `AdminSidebar.tsx` / layout admin, tambahkan judul halaman aktif berdasarkan `adminNavConfig` dan current route
- Desktop: tampilkan di area header kanan (sebelah notification)
- Mobile: tampilkan di antara hamburger icon dan notification bell

**5. Rename Duplikasi Label "Statistik Artikel" di DashboardHome**
- Section stat cards: rename dari "Statistik Artikel" ke "Ringkasan Artikel"
- Section charts (`ArticleStatsCharts`): tetap "Statistik Artikel" / "Grafik Performa Artikel"

### Batch 3 -- Portal UX

**6. Step Indicator Mobile Scroll Hint (TrainingRegistration)**
- Tambahkan gradient fade (`bg-gradient-to-l from-background`) di sisi kanan container step indicators sebagai visual scroll hint
- Atau gunakan `mask-image` CSS untuk fade effect

**7. Fix Progress Line z-index (RegistrationDashboard)**
- Ubah `-z-10` menjadi `z-0` pada progress line (line 338), dan pastikan circle icons punya `z-10` / `relative`

**8. Konfirmasi Logout di MobileBottomNav**
- Wrap logout action dalam `AlertDialog` dengan pesan "Yakin ingin keluar?"
- Import dari `@/components/ui/alert-dialog`
- Tambah state `showLogoutDialog`

**9. Internasionalisasi Countdown di RegistrationLanding**
- Ganti hardcoded "hari", "jam", "menit lagi" dengan `t('portal.countdown.days')`, dll.

---

## File yang Akan Dimodifikasi

| File | Perubahan |
|------|-----------|
| `src/pages/admin/AdminLogin.tsx` | Turnstile error recovery UI |
| `src/pages/registration/RegistrationLogin.tsx` | Fix setIsSubmitting bug + Turnstile error recovery |
| `src/pages/registration/RegistrationSignup.tsx` | Turnstile error recovery (jika ada) |
| `src/pages/admin/DashboardHome.tsx` | Rename "Statistik Artikel" -> "Ringkasan Artikel" |
| `src/components/admin/AdminSidebar.tsx` | Dynamic page title di header |
| `src/pages/registration/TrainingRegistration.tsx` | Step indicator scroll hint |
| `src/pages/registration/RegistrationDashboard.tsx` | Fix z-index progress line |
| `src/components/MobileBottomNav.tsx` | Tambah AlertDialog konfirmasi logout |
| `src/pages/registration/RegistrationLanding.tsx` | i18n countdown strings |

Total: 9 perubahan di 9 file.

