

# Audit Keamanan OWASP Top 10 — Forum Indonesia Muda

---

## Ringkasan Eksekutif

Dari analisis kode sumber, konfigurasi backend, dan edge functions, ditemukan **8 kerentanan** dengan tingkat risiko bervariasi. Mayoritas temuan berada pada area Broken Access Control dan Security Misconfiguration.

---

## Daftar Kerentanan

### 1. [CRITICAL] Broken Access Control — `delete-registrant-auth-user` Tanpa Autentikasi

**File:** `supabase/functions/delete-registrant-auth-user/index.ts` + `supabase/config.toml`

**Masalah:** Edge function ini memiliki `verify_jwt = false` dan **tidak melakukan pengecekan autentikasi atau role sama sekali**. Siapapun yang mengetahui `auth_user_id` dan `registration_id` dapat menghapus data pendaftar dan akun auth secara langsung.

**Eksploitasi:** Penyerang mengirim POST request dengan body `{ auth_user_id: "...", registration_id: "..." }` ke endpoint `/functions/v1/delete-registrant-auth-user`. Tidak ada validasi JWT, tidak ada pengecekan role. Semua data terkait (interview, training, activity logs) ikut terhapus.

**Rekomendasi:**
- Tambahkan validasi JWT dari Authorization header
- Verifikasi pemanggil memiliki role `super_admin` atau `admin` menggunakan `has_role` / `is_admin` RPC (seperti yang dilakukan di `reset-registrant-password`)

---

### 2. [CRITICAL] Broken Access Control — `confirm-auth-email` Tanpa Autentikasi

**File:** `supabase/functions/confirm-auth-email/index.ts`

**Masalah:** Function ini `verify_jwt = false` dan tidak ada pengecekan autentikasi. Siapapun dapat mengirim `registration_id` atau `email` untuk mengkonfirmasi email pengguna di sistem auth, mem-bypass proses verifikasi email.

**Eksploitasi:** Penyerang mendaftar dengan email korban, lalu langsung memanggil endpoint ini untuk mengkonfirmasi email tanpa memiliki akses ke inbox. Akun langsung bisa digunakan login.

**Rekomendasi:**
- Tambahkan validasi: hanya boleh dipanggil oleh admin (cek JWT + role), atau
- Validasi bahwa `email_verified = true` di `fim_registrations` sebelum mengkonfirmasi di auth (mencegah bypass verifikasi)

---

### 3. [HIGH] Broken Access Control — `reset-registrant-password` Mengembalikan Temporary Password

**File:** `supabase/functions/reset-registrant-password/index.ts` (line 159)

**Masalah:** Meskipun function ini sudah memvalidasi role admin, response body mengandung `temporary_password` dalam plaintext. Ini berarti password sementara terekspos di network response dan berpotensi ter-log.

**Eksploitasi:** Jika ada MITM, proxy logging, atau browser extension yang mencatat network requests, password sementara dapat terekspos.

**Rekomendasi:**
- Kirim password sementara langsung via email ke pendaftar alih-alih mengembalikannya dalam response
- Atau gunakan mekanisme password reset link (one-time token)

---

### 4. [HIGH] Security Misconfiguration — Seluruh Edge Functions `verify_jwt = false`

**File:** `supabase/config.toml`

**Masalah:** **Semua 24 edge functions** dikonfigurasi dengan `verify_jwt = false`. Beberapa function memang perlu publik (seperti `newsletter-subscribe`, `admin-auth-login`, `verify-turnstile`), tetapi function sensitif seperti `delete-registrant-auth-user`, `confirm-auth-email`, `notify-unauthorized-access` seharusnya memerlukan JWT.

**Functions yang seharusnya `verify_jwt = true`:**
- `delete-registrant-auth-user` (sudah dibahas di #1)
- `confirm-auth-email` (sudah dibahas di #2)
- `notify-unauthorized-access`
- `notify-revision`
- `notify-article-status`
- `notify-registration-status`
- `notify-selection-stage`
- `notify-first-login`
- `notify-interview-completed`

**Catatan:** Beberapa function di atas sudah melakukan validasi JWT secara manual via header, tetapi mematikan `verify_jwt` menghilangkan lapisan pertahanan pertama dari Supabase gateway.

**Rekomendasi:**
- Aktifkan `verify_jwt = true` untuk semua function yang hanya boleh diakses oleh authenticated user
- Biarkan `verify_jwt = false` hanya untuk: `admin-auth-login`, `portal-login-precheck`, `newsletter-subscribe`, `verify-turnstile`, `verify-recaptcha`, `log-error`, `send-verification-email`

---

### 5. [MEDIUM] Security Misconfiguration — CORS Wildcard `*` di Semua Edge Functions

**Masalah:** Semua edge functions menggunakan `Access-Control-Allow-Origin: "*"`. Ini memungkinkan domain manapun memanggil API.

**Eksploitasi:** Penyerang bisa membuat website phishing yang memanggil edge functions dari domain mereka, misalnya melakukan login brute force via `admin-auth-login`.

**Rekomendasi:**
- Batasi CORS origin ke domain yang diizinkan saja: `https://fim.lovable.app` dan preview URL
- Minimal untuk function sensitif seperti `admin-auth-login`, `delete-registrant-auth-user`, `admin-create-user`

---

### 6. [MEDIUM] Insecure Design — Turnstile Guard Bypass via State

**File:** `src/components/TurnstileGuard.tsx`

**Masalah:** Guard Turnstile hanya menyimpan status `verified` di React state (`useState(false)`). Setelah verifikasi berhasil, tidak ada token yang diteruskan atau divalidasi ulang di backend saat user melakukan aksi selanjutnya. Refresh halaman akan memaksa verifikasi ulang (bukan masalah keamanan), tetapi setelah verified, token tidak digunakan lagi.

**Catatan:** Ini bukan vulnerability kritis karena form login/signup memiliki Turnstile validasi sendiri. Guard ini hanya sebagai lapisan tambahan.

---

### 7. [MEDIUM] Identification & Authentication — Portal Login Tanpa Rate Limiting

**File:** `src/contexts/RegistrationAuthContext.tsx`

**Masalah:** Login portal (`signIn`) langsung memanggil `supabase.auth.signInWithPassword` tanpa melalui rate limiting server-side. Berbeda dengan admin login yang menggunakan `admin-auth-login` edge function dengan rate limiting, portal login tidak memiliki perlindungan brute force.

**Eksploitasi:** Penyerang dapat melakukan brute force pada akun pendaftar karena tidak ada pembatasan percobaan login.

**Rekomendasi:**
- Buat edge function `portal-auth-login` serupa dengan `admin-auth-login` yang melakukan rate limiting sebelum autentikasi
- Atau tambahkan pengecekan `check_rate_limit` RPC di `portal-login-precheck`

---

### 8. [LOW] Software & Data Integrity — Deno Import Tanpa Pinned Version Hash

**File:** Semua edge functions

**Masalah:** Import menggunakan URL tanpa integrity hash:
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
```
Beberapa import bahkan tidak pin versi minor (`@2` bukan `@2.49.1`).

**Rekomendasi:**
- Pin semua dependency ke versi spesifik
- Gunakan lock file atau import map Deno untuk integrity checking

---

## Temuan Positif (Sudah Baik)

| Area | Status |
|------|--------|
| Password hashing | Ditangani oleh Supabase Auth (bcrypt) |
| SQL Injection | Menggunakan Supabase SDK (parameterized queries), RPC functions dengan parameter typed |
| XSS | `dangerouslySetInnerHTML` selalu menggunakan DOMPurify dengan whitelist tag |
| RLS | Diterapkan di semua tabel dengan granular policies |
| Audit logging | Komprehensif — login, logout, unauthorized access, CRUD actions |
| Idle timeout | Admin session auto-logout setelah 30 menit inaktif |
| Role separation | Admin vs Portal terisolasi, role checking server-side di edge functions sensitif |
| Brute force (admin) | Rate limiting 5 percobaan / 15 menit dengan IP tracking |
| SSRF | Tidak ditemukan endpoint yang menerima URL eksternal dari user untuk di-fetch server-side |

---

## Prioritas Perbaikan

| # | Kerentanan | Risiko | Effort |
|---|-----------|--------|--------|
| 1 | `delete-registrant-auth-user` tanpa auth | CRITICAL | Rendah |
| 2 | `confirm-auth-email` tanpa auth | CRITICAL | Rendah |
| 3 | `verify_jwt = false` massal | HIGH | Rendah |
| 4 | Password plaintext di response | HIGH | Sedang |
| 5 | Portal login tanpa rate limit | MEDIUM | Sedang |
| 6 | CORS wildcard | MEDIUM | Rendah |
| 7 | Turnstile guard design | MEDIUM | — (info) |
| 8 | Deno import integrity | LOW | Rendah |

---

## Rencana Implementasi

### Langkah 1: Fix `delete-registrant-auth-user` (Critical)
Tambahkan validasi JWT + role check `is_admin` di awal handler, identik dengan pola di `reset-registrant-password`.

### Langkah 2: Fix `confirm-auth-email` (Critical)
Tambahkan validasi: cek bahwa `email_verified = true` di tabel `fim_registrations` sebelum mengkonfirmasi di auth system. Atau tambahkan auth check jika dipanggil oleh admin.

### Langkah 3: Update `config.toml`
Set `verify_jwt = true` untuk 9 function yang hanya boleh diakses authenticated user.

### Langkah 4: Secure password response
Modifikasi `reset-registrant-password` dan `admin-reset-password` untuk mengirim password via email, bukan mengembalikan di HTTP response.

### Langkah 5: Portal rate limiting
Tambahkan rate limiting di `portal-login-precheck` atau buat edge function login terpisah untuk portal.

### Langkah 6: CORS restriction
Ganti `*` dengan daftar domain yang diizinkan di function sensitif.

Apakah Anda ingin saya mengimplementasikan perbaikan ini?

