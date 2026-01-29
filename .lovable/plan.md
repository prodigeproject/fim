
# Rencana Perbaikan Komprehensif

Berdasarkan analisis mendalam kode dan database, berikut adalah masalah yang ditemukan beserta solusinya:

---

## 1. Perbaikan Fitur Import XLSX, Tambah Pengguna, dan Bulk Tambah

### Masalah Ditemukan
1. **Fitur "Bulk Tambah"** (`UsersManagement.tsx` baris 703-816) menggunakan format teks manual yang tidak praktis
2. **Import XLSX** (`BulkUserImport.tsx`) sudah ada dan berfungsi dengan baik
3. Ada tumpang tindih karena keduanya memiliki fungsi yang sama

### Solusi
1. **Hapus tombol "Bulk Tambah" secara terpisah** - gunakan hanya "Import XLSX" untuk bulk operations
2. **Pertahankan tombol "Tambah Pengguna"** untuk menambah satu user saja
3. **Perbaiki BulkUserImport** untuk menambahkan opsi "Role per Baris" agar lebih fleksibel

### Perubahan File

| File | Perubahan |
|------|-----------|
| `src/pages/admin/UsersManagement.tsx` | Hapus tombol "Bulk Tambah" dan dialog terkait (baris 703-830); hanya tampilkan "Import XLSX" dan "Tambah Pengguna" |
| `src/components/admin/BulkUserImport.tsx` | Tambahkan kolom opsional untuk Role per baris di template XLSX |

---

## 2. Perbaikan Halaman Penugasan Rekruter dengan Checklist Table

### Masalah Ditemukan
Halaman `/admin/recruiter-assignments` saat ini hanya support:
- Menambah 1 penugasan per aksi (1 rekruter + 1 pendaftar)
- Tidak ada bulk assignment
- Sulit untuk mengelola puluhan rekruter dengan ratusan peserta

### Solusi: Redesign dengan Bulk Assignment Matrix

#### Komponen Baru
1. **Recruiter Selection Panel** - Pilih satu rekruter terlebih dahulu
2. **Assignment Type Selection** - Pilih tahap (Administrasi/Wawancara/Keduanya)
3. **Participant Checklist Table** - Tabel dengan checkbox untuk memilih multiple peserta sekaligus
4. **Bulk Actions** - Assign/Unassign semua peserta yang dipilih ke rekruter tersebut

#### UI Layout
```
┌───────────────────────────────────────────────────────────┐
│ Penugasan Rekruter                                        │
├───────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌──────────────────────────────┐  │
│ │ Pilih Rekruter:     │ │ Tahap: [Administrasi ▼]      │  │
│ │ [Select Dropdown ▼] │ └──────────────────────────────┘  │
│ └─────────────────────┘                                   │
├───────────────────────────────────────────────────────────┤
│ [✓] Pilih Semua  │  3 peserta dipilih  │ [Assign] [Hapus] │
├───────────────────────────────────────────────────────────┤
│ │ ✓ │ Nama Peserta    │ Email           │ Stage   │Status│ │
│ │ ✓ │ Ahmad Fauzi     │ ahmad@...       │ Admin   │  ✓   │ │
│ │   │ Budi Santoso    │ budi@...        │ -       │      │ │
│ │ ✓ │ Citra Dewi      │ citra@...       │ Wawanc. │  ✓   │ │
│ └───┴─────────────────┴─────────────────┴─────────┴──────┘ │
└───────────────────────────────────────────────────────────┘
```

### Perubahan File

| File | Perubahan |
|------|-----------|
| `src/pages/admin/RecruiterAssignmentsManagement.tsx` | Redesign total dengan checklist table, bulk select, dan matrix view |

---

## 3. Perbaikan Login Akun Terverifikasi

### Masalah Ditemukan
Berdasarkan query database, akun dengan `email_verified: true` seharusnya bisa login. Namun:
1. **Data sudah benar** - ada 5+ akun dengan `email_verified: true`
2. **Kemungkinan masalah**: Password yang salah ATAU auth user tidak terinkronisasi dengan registration

### Root Cause Analysis
Setelah cek `RegistrationAuthContext.tsx`:
1. Login flow sudah benar - cek `email_verified` sebelum `signInWithPassword`
2. Error handling sudah ada untuk "Invalid login credentials"
3. **Kemungkinan besar**: User lupa password karena di-set saat signup dan tidak dicatat

### Solusi
1. **Tambahkan fitur "Forgot Password"** yang sudah ada link-nya di login page
2. **Pastikan error message lebih jelas** - sudah dilakukan
3. **Test login dengan akun yang password-nya diketahui**

Untuk memastikan login benar-benar bisa berfungsi, perlu ditambahkan **logging sementara** untuk debugging:

### Perubahan File
| File | Perubahan |
|------|-----------|
| `src/contexts/RegistrationAuthContext.tsx` | Sudah benar, tidak perlu perubahan |
| `src/pages/registration/RegistrationLogin.tsx` | Tambahkan visual feedback lebih jelas saat login gagal |

**Catatan**: Jika user tetap tidak bisa login meskipun akun terverifikasi, kemungkinan besar masalahnya adalah **lupa password**. Solusinya adalah menggunakan fitur "Forgot Password".

---

## 4. Penjadwalan Ulang Wawancara Langsung di Detail Pendaftar

### Masalah Ditemukan
Di halaman detail pendaftar (`RegistrationsManagement.tsx`), untuk mengubah jadwal wawancara yang sudah terjadwal, admin harus:
1. Membatalkan jadwal saat ini → status otomatis "Tidak Lolos"
2. Membuat jadwal baru

Ini tidak praktis karena pembatalan = Tidak Lolos.

### Solusi
Tambahkan tombol **"Ubah Jadwal"** yang langsung memperbarui tanggal/waktu tanpa membatalkan (sama seperti di `InterviewCalendar.tsx` yang sudah punya `rescheduleMutation`).

#### Fitur Baru di Detail View
1. Tombol "Ubah Jadwal" di sebelah info jadwal wawancara
2. Dialog reschedule dengan form tanggal/waktu baru
3. Opsi kirim notifikasi email jadwal baru
4. Tidak mengubah status interview

### Perubahan File

| File | Perubahan |
|------|-----------|
| `src/pages/admin/RegistrationsManagement.tsx` | Tambah state, mutation, dan UI untuk reschedule interview langsung |

---

## 5. Perbaikan reCAPTCHA Tidak Muncul

### Masalah Ditemukan
Berdasarkan analisis:
1. **Database sudah benar** - `recaptcha_settings` sudah ada dengan:
   - `site_key`: "6Lf9kFMsAAAAAKpNUXjDFZ1ngh03qOLUOIWG7ELj"
   - `secret_key_encrypted`: sudah terisi
   - `enabled_signup/login/forgot_password/admin_login`: semua `true`

2. **Komponen `ReCaptcha.tsx`** sudah dibuat dengan benar

3. **MASALAH UTAMA**: reCAPTCHA **TIDAK DIINTEGRASIKAN** ke halaman login/signup!
   - `RegistrationLogin.tsx`: Tidak ada import atau penggunaan `ReCaptcha` component
   - `RegistrationSignup.tsx`: Tidak ada import atau penggunaan `ReCaptcha` component
   - `AdminLogin.tsx`: Tidak ada import atau penggunaan `ReCaptcha` component
   - `RegistrationForgotPassword.tsx`: Tidak ada import atau penggunaan `ReCaptcha` component

### Solusi
Integrasikan komponen `ReCaptcha` ke semua halaman yang dikonfigurasi.

### Implementasi per Halaman

#### A. Registration Signup (`/daftar/signup`)
```typescript
import { ReCaptcha } from "@/components/ReCaptcha";
import { useRecaptchaConfig } from "@/hooks/useRecaptchaConfig";

// Di dalam komponen:
const { data: recaptchaConfig } = useRecaptchaConfig();
const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

// Di form, sebelum tombol submit:
{recaptchaConfig?.enabled_signup && recaptchaConfig?.site_key && (
  <ReCaptcha
    siteKey={recaptchaConfig.site_key}
    onVerify={(token) => setRecaptchaToken(token)}
    onExpire={() => setRecaptchaToken(null)}
  />
)}

// Di handleSubmit, validasi token sebelum signup:
if (recaptchaConfig?.enabled_signup && !recaptchaToken) {
  toast.error("Silakan verifikasi reCAPTCHA");
  return;
}

// Kirim token ke backend untuk verifikasi:
await supabase.functions.invoke("verify-recaptcha", {
  body: { token: recaptchaToken }
});
```

#### B. Registration Login (`/daftar`)
Logika sama dengan signup, menggunakan `enabled_login`

#### C. Forgot Password (`/daftar/forgot-password`)
Logika sama, menggunakan `enabled_forgot_password`

#### D. Admin Login (`/admin`)
Logika sama, menggunakan `enabled_admin_login`

### Perubahan File

| File | Perubahan |
|------|-----------|
| `src/pages/registration/RegistrationSignup.tsx` | Import dan integrasikan ReCaptcha component |
| `src/pages/registration/RegistrationLogin.tsx` | Import dan integrasikan ReCaptcha component |
| `src/pages/registration/RegistrationForgotPassword.tsx` | Import dan integrasikan ReCaptcha component |
| `src/pages/admin/AdminLogin.tsx` | Import dan integrasikan ReCaptcha component |

---

## Ringkasan Perubahan

| No | File | Perubahan | Kompleksitas |
|----|------|-----------|--------------|
| 1 | `UsersManagement.tsx` | Hapus Bulk Tambah dialog, hanya gunakan Import XLSX | Rendah |
| 2 | `BulkUserImport.tsx` | Tambah kolom Role per baris di template | Sedang |
| 3 | `RecruiterAssignmentsManagement.tsx` | Redesign dengan bulk checklist table | Tinggi |
| 4 | `RegistrationsManagement.tsx` | Tambah tombol reschedule di detail view | Sedang |
| 5 | `RegistrationSignup.tsx` | Integrasikan ReCaptcha | Sedang |
| 6 | `RegistrationLogin.tsx` | Integrasikan ReCaptcha | Sedang |
| 7 | `RegistrationForgotPassword.tsx` | Integrasikan ReCaptcha | Sedang |
| 8 | `AdminLogin.tsx` | Integrasikan ReCaptcha | Sedang |

---

## Urutan Implementasi

1. **Fase 1**: Integrasi reCAPTCHA (paling mendesak karena security feature)
2. **Fase 2**: Perbaikan UsersManagement (hapus Bulk Tambah, perbaiki Import XLSX)
3. **Fase 3**: Tambah fitur reschedule di RegistrationsManagement
4. **Fase 4**: Redesign RecruiterAssignmentsManagement

---

## Testing Checklist

- [ ] Test Import XLSX dengan file berisi email, nama, dan role
- [ ] Test penambahan satu user baru
- [ ] Test login dengan akun terverifikasi (gunakan forgot password jika lupa)
- [ ] Test reCAPTCHA muncul di semua halaman yang dikonfigurasi
- [ ] Test reschedule wawancara langsung dari detail pendaftar
- [ ] Test bulk assignment rekruter dengan multiple peserta
