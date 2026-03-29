# Laporan Audit Keamanan — Website Forum Indonesia Muda (FIM)

**Tanggal Audit:** 28 Maret 2026
**Auditor:** Claude (Cowork Mode) menggunakan Anthropic Cybersecurity Skills
**Metodologi:** OWASP WSTG, OWASP Top 10 2023, Static Code Analysis
**Target:** Source code `fim-main` (React + TypeScript + Supabase)
**Skills digunakan:**
- `performing-web-application-penetration-test`
- `performing-security-headers-audit`
- `testing-for-xss-vulnerabilities`
- `exploiting-idor-vulnerabilities`
- `testing-api-authentication-weaknesses`
- `testing-for-json-web-token-vulnerabilities`
- `testing-for-business-logic-vulnerabilities`
- `performing-cryptographic-audit-of-application`

---

## Ringkasan Eksekutif

| Severity | Jumlah |
|----------|--------|
| 🔴 Kritis | 1 |
| 🟠 Tinggi | 3 |
| 🟡 Sedang | 4 |
| 🔵 Rendah | 3 |
| ✅ Praktik Baik | 7 |

---

## 🔴 KRITIS

### [CRIT-01] File `.env` Tidak Ada di `.gitignore`

**Lokasi:** `.gitignore`, `.env`
**OWASP:** A02:2021 – Cryptographic Failures / Sensitive Data Exposure

**Temuan:**
File `.gitignore` hanya mengecualikan `*.local` (pattern Vite), tetapi **tidak mengecualikan `.env`** secara eksplisit. File `.env` mengandung kredensial nyata:

```
VITE_SUPABASE_PROJECT_ID="atfrjhydmhpdwfepbkij"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://atfrjhydmhpdwfepbkij.supabase.co"
```

Jika repository di-push ke GitHub/GitLab, seluruh kredensial ini akan terpublikasi. Meskipun `VITE_SUPABASE_PUBLISHABLE_KEY` adalah anon key yang memang bersifat publik, project ID dan URL Supabase sebaiknya tidak ada di version control bersama konfigurasi lainnya.

**Rekomendasi:**
Tambahkan baris berikut ke `.gitignore`:
```
.env
.env.*
!.env.example
```

Kemudian jalankan `git rm --cached .env` jika file sudah pernah di-commit.

---

## 🟠 TINGGI

### [HIGH-01] `Math.random()` untuk Generate Password — Tidak Kriptografis

**Lokasi:** `src/components/admin/BulkUserImport.tsx` (fungsi `generateSecurePassword`)
**OWASP:** A02:2021 – Cryptographic Failures

**Temuan:**
Fungsi yang diberi nama "secure" ini menggunakan `Math.random()` — sebuah PRNG (Pseudo-Random Number Generator) yang **tidak kriptografis** dan dapat diprediksi oleh penyerang dengan informasi cukup.

Selain itu, terdapat fixed suffix `'A1!x'` yang selalu ditambahkan di akhir, sehingga semua password yang di-generate selalu berakhir dengan karakter yang sama:

```typescript
// BERMASALAH
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length)); // ← Math.random() insecure
  }
  return password.slice(0, 8) + 'A1!x'; // ← suffix tetap, mengurangi entropy
}
```

**Rekomendasi:**
Gunakan `crypto.getRandomValues()` (Web Crypto API, tersedia di semua browser modern):

```typescript
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const array = new Uint32Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join('').slice(0, 16);
}
```

---

### [HIGH-02] Missing HTTP Security Headers

**Lokasi:** `vite.config.ts`, `index.html`
**OWASP:** A05:2021 – Security Misconfiguration

**Temuan:**
Tidak ada satu pun security header yang dikonfigurasi di aplikasi. Server tidak mengirimkan:

| Header | Status | Risiko |
|--------|--------|--------|
| `Content-Security-Policy` | ❌ Tidak ada | XSS escalation |
| `X-Frame-Options` | ❌ Tidak ada | Clickjacking |
| `X-Content-Type-Options` | ❌ Tidak ada | MIME sniffing |
| `Strict-Transport-Security` | ❌ Tidak ada | Downgrade attacks |
| `Referrer-Policy` | ❌ Tidak ada | Data leakage |
| `Permissions-Policy` | ❌ Tidak ada | Feature abuse |

**Rekomendasi:**
Jika deploy menggunakan Netlify, buat file `public/_headers`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

/index.html
  Cache-Control: no-cache
```

Untuk CSP, tambahkan bertahap setelah testing agar tidak memblokir fitur yang sah.

---

### [HIGH-03] ALLOWED_URI_REGEXP Berpotensi Dibypass pada DOMPurify (BlogDetail)

**Lokasi:** `src/pages/BlogDetail.tsx` (baris ~317)
**OWASP:** A03:2021 – Injection (XSS)

**Temuan:**
Regex yang digunakan untuk memvalidasi URL `iframe src` tidak memiliki proper domain boundary:

```typescript
ALLOWED_URI_REGEXP: /^(?:(?:https?):\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)/i,
```

URL seperti `https://youtube.com.evil-site.com/video` akan **lolos validasi** karena regex hanya mengecek bahwa string mengandung `youtube.com` setelah awalan, tanpa memvalidasi bahwa domain benar-benar berakhir di sana.

**Rekomendasi:**
Tambahkan path separator sebagai anchor:

```typescript
ALLOWED_URI_REGEXP: /^https?:\/\/(?:www\.)?(youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)(\/|$)/i,
```

---

## 🟡 SEDANG

### [MED-01] CORS Wildcard pada Sensitive Edge Functions

**Lokasi:** `supabase/functions/admin-create-user/index.ts` (dan beberapa fungsi lain)
**OWASP:** A05:2021 – Security Misconfiguration

**Temuan:**
Semua edge function menggunakan `"Access-Control-Allow-Origin": "*"`:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",  // ← terlalu permisif
  ...
};
```

Fungsi-fungsi yang terdampak: `admin-create-user`, `verify-recaptcha`, `verify-turnstile`, dll.

Meskipun fungsi admin memerlukan JWT (sehingga tidak bisa dieksploitasi tanpa token), penggunaan wildcard pada semua endpoint termasuk yang publik tidak mengikuti prinsip least privilege.

**Rekomendasi:**
Batasi origin ke domain produksi:

```typescript
const allowedOrigins = ["https://forumindonesiamuda.org", "http://localhost:8080"];
const origin = req.headers.get("Origin") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

---

### [MED-02] Token Auth Disimpan di `localStorage` (Rentan XSS)

**Lokasi:** `src/integrations/supabase/client.ts`
**OWASP:** A02:2021 – Cryptographic Failures / A07:2021 – Identification and Auth Failures

**Temuan:**
Supabase client dikonfigurasi untuk menyimpan session di `localStorage`:

```typescript
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage, // ← rentan terhadap XSS theft
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

Jika terjadi serangan XSS, token dapat dicuri karena `localStorage` dapat diakses oleh JavaScript. Token ini berumur panjang (access token + refresh token).

**Rekomendasi:**
Pertimbangkan menggunakan `sessionStorage` untuk mengurangi window exposure, atau implementasi custom storage menggunakan `HttpOnly` cookie melalui server-side session. Minimal, pastikan mitigasi XSS sangat kuat (sudah ada DOMPurify, bagus).

---

### [MED-03] DOMPurify EmailSettings Mengizinkan Tag `<style>` dan `<meta>`

**Lokasi:** `src/pages/admin/EmailSettings.tsx` (baris ~603)
**OWASP:** A03:2021 – Injection

**Temuan:**
DOMPurify untuk preview email template mengizinkan tag berbahaya:

```typescript
ALLOWED_TAGS: ['p','b','i','em','strong','a','ul','ol','li','h1',
  'h2','h3','h4','h5','h6','blockquote','code','pre','img','br','hr',
  'span','div','table','thead','tbody','tr','td','th',
  'style',   // ← bisa digunakan untuk CSS injection / data exfiltration
  'head','body','html',
  'meta',    // ← potensi redirect melalui meta refresh
  'title','center'],
```

Tag `<style>` dapat digunakan untuk CSS-based data exfiltration. Tag `<meta>` dengan `http-equiv="refresh"` dapat melakukan redirect. Ini hanya area admin, tetapi tetap berisiko jika konten email template bersumber dari input tidak terpercaya.

**Rekomendasi:**
Hapus `style`, `meta`, `head`, `body`, `html` dari `ALLOWED_TAGS` untuk preview. Gunakan inline style yang sudah di-sanitize jika diperlukan untuk email rendering.

---

### [MED-04] Google Analytics Measurement ID Terekspos di `index.html`

**Lokasi:** `index.html` (baris ~12)
**OWASP:** A02:2021 – Information Exposure

**Temuan:**
GA Measurement ID `G-7NPLPNCN77` tertulis langsung di HTML dan terbaca publik. Meskipun ini umum dan bukan secret yang sesungguhnya, ID ini dapat digunakan oleh pihak tidak bertanggung jawab untuk:
- Mengirim event palsu ke analytics akun
- Mengidentifikasi property GA akun

**Rekomendasi:**
Pindahkan ke environment variable meskipun bersifat publik, agar mudah dirotasi: `VITE_GA_MEASUREMENT_ID`.

---

## 🔵 RENDAH

### [LOW-01] Turnstile Site Key Hardcoded di Source Code

**Lokasi:** `src/components/TurnstileWidget.tsx` (baris 22)
**OWASP:** A02:2021 – Sensitive Data Exposure

**Temuan:**
```typescript
const SITE_KEY = "0x4AAAAAACcEav43Nv2f2v0g"; // ← hardcoded
```

Turnstile site key memang bersifat publik (didesain untuk tampil di browser), namun mengeksposnya di source code membuat rotasi key memerlukan rebuild dan redeploy.

**Rekomendasi:**
Pindahkan ke `VITE_TURNSTILE_SITE_KEY` di `.env.example` untuk konsistensi dan kemudahan rotasi.

---

### [LOW-02] Password Bulk Import Ditampilkan di UI (Plaintext)

**Lokasi:** `src/components/admin/BulkUserImport.tsx` (baris ~508)
**OWASP:** A02:2021 – Sensitive Data Exposure

**Temuan:**
Setelah bulk import berhasil, password yang di-generate ditampilkan secara plaintext di tabel hasil:
```tsx
{result.password}  {/* password user tampil di layar admin */}
```
Password juga bisa di-export ke file TSV yang tidak dienkripsi.

**Rekomendasi:**
- Tampilkan password hanya sekali dan berikan tombol "Copy" (bukan tabel yang bisa di-screenshot)
- Hapus password dari state React setelah ditampilkan
- Pertimbangkan alur "kirim password via email" langsung ke user daripada tampil di UI admin

---

### [LOW-03] `console.log` Berisi User ID di Edge Functions

**Lokasi:** `supabase/functions/admin-create-user/index.ts`
**OWASP:** A09:2021 – Security Logging and Monitoring Failures

**Temuan:**
```typescript
console.log("admin-create-user: User authenticated:", user.id);
```

Log yang mengandung user ID dapat terekspos di Supabase Logs Dashboard yang mungkin diakses lebih dari satu admin.

**Rekomendasi:**
Gunakan level debug yang dapat dikontrol dengan environment variable, atau hash/mask identifier sensitif di log production.

---

## ✅ Praktik Keamanan yang Sudah Baik

Berikut adalah implementasi keamanan yang sudah dilakukan dengan benar dan patut dipertahankan:

1. **DOMPurify digunakan konsisten** — Setiap penggunaan `dangerouslySetInnerHTML` (6 lokasi ditemukan) selalu diikuti dengan `DOMPurify.sanitize()`. Sangat bagus.

2. **Verifikasi role di server (Edge Function)** — Fungsi `admin-create-user` memvalidasi pemanggil adalah `super_admin` via RPC `has_role()` sebelum mengeksekusi operasi. Ini mencegah privilege escalation dari client.

3. **Turnstile diverifikasi di server** — Token Turnstile tidak hanya dicek di client (`TurnstileGuard.tsx`) tetapi juga diverifikasi ke Cloudflare API melalui Supabase Edge Function `verify-turnstile`. Ini mencegah bypass client-side.

4. **Idle timeout admin session** — `AdminAuthContext` menerapkan idle timeout 30 menit (`IDLE_TIMEOUT = 30 * 60 * 1000`) yang secara otomatis sign-out admin yang tidak aktif.

5. **Tidak ada `eval()` atau `new Function()`** — Tidak ditemukan penggunaan dynamic code execution di seluruh source code. Bagus.

6. **Service role key hanya di Edge Functions** — Kunci `SUPABASE_SERVICE_ROLE_KEY` tidak pernah muncul di sisi client. Selalu diambil dari `Deno.env.get()` di server-side Supabase Functions.

7. **Input validation pada email di Bulk Import** — Ada validasi format email sebelum diproses (`!u.email.includes("@")`), meskipun bisa diperkuat dengan regex yang lebih ketat.

---

## Prioritas Perbaikan

| Prioritas | ID | Aksi |
|-----------|-----|------|
| **Segera** | CRIT-01 | Tambahkan `.env` ke `.gitignore` |
| **Minggu ini** | HIGH-01 | Ganti `Math.random()` dengan `crypto.getRandomValues()` |
| **Minggu ini** | HIGH-02 | Tambahkan security headers via `_headers` atau Netlify config |
| **Minggu ini** | HIGH-03 | Perbaiki regex URI DOMPurify di BlogDetail |
| **Bulan ini** | MED-01 | Batasi CORS origin di edge functions |
| **Bulan ini** | MED-02 | Review strategi token storage |
| **Bulan ini** | MED-03 | Hapus `<style>` dan `<meta>` dari DOMPurify EmailSettings |
| **Backlog** | MED-04, LOW-01, LOW-02, LOW-03 | Perbaikan bertahap |

---

*Laporan ini dihasilkan melalui static code analysis. Pengujian dinamis (penetration testing aktif terhadap server) direkomendasikan dilakukan secara terpisah oleh tim keamanan yang berwenang.*
