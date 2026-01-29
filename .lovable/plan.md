

# Rencana Debugging dan Perbaikan Fitur

Berdasarkan analisis mendalam, berikut adalah temuan masalah dan rencana perbaikannya:

---

## Ringkasan Temuan

### 1. ✅ Fitur yang Sudah Berfungsi dengan Baik
- **Newsletter Subscription** - Log menunjukkan berhasil subscribe dan kirim email (contoh: `tlaganga@gasa.co` berhasil subscribe)
- **Email Verification** - Sistem verifikasi email berjalan dengan baik
- **Registration Flow to Success Page** - User diarahkan ke `/daftar/success` setelah signup

### 2. ❌ Bug Kritis #1: Role "admin" Tidak Valid di Edge Function
**File:** `supabase/functions/admin-create-user/index.ts` (Baris 10-11, 19-21)

**Masalah:**
```typescript
type AppRole = "super_admin" | "moderator"; // ❌ TIDAK termasuk "admin"

function isValidRole(role: unknown): role is AppRole {
  return role === "super_admin" || role === "moderator"; // ❌ TIDAK termasuk "admin"
}
```

**Dampak:** Bulk create dengan role "admin" akan SELALU gagal dengan error "Role tidak valid"

**Solusi:**
```typescript
type AppRole = "super_admin" | "admin" | "moderator";

function isValidRole(role: unknown): role is AppRole {
  return role === "super_admin" || role === "admin" || role === "moderator";
}
```

### 3. ❌ Bug Kritis #2: AdminAuthContext Tidak Mengenali Role "admin"
**File:** `src/contexts/AdminAuthContext.tsx` (Baris 6, 79)

**Masalah:**
```typescript
type AppRole = "super_admin" | "moderator"; // ❌ TIDAK termasuk "admin"

// Pada baris 79:
setRole(isSuper ? "super_admin" : isModerator ? "moderator" : null); // ❌ admin diabaikan
```

**Dampak:** User dengan role "admin" akan terdeteksi sebagai `role: null` dan tidak bisa akses fitur

**Solusi:**
```typescript
type AppRole = "super_admin" | "admin" | "moderator";

// Tambahkan pengecekan role admin:
const { data: isAdmin } = await supabase.rpc("has_role", {
  _user_id: userId,
  _role: "admin",
});

setRole(isSuper ? "super_admin" : isAdmin ? "admin" : isModerator ? "moderator" : null);
```

### 4. ⚠️ Potensi Masalah: Session Isolation
**File:** `src/contexts/RegistrationAuthContext.tsx` dan `src/contexts/AdminAuthContext.tsx`

**Masalah:** Keduanya menggunakan Supabase client yang sama (`supabase` dari `client.ts`), yang berarti session bisa saling overlap.

**Dampak Potensial:** 
- Login sebagai admin di `/admin` bisa mempengaruhi session pendaftar
- Login sebagai pendaftar bisa mempengaruhi session admin

**Catatan:** Berdasarkan memori, seharusnya sudah ada session isolation dengan storage key berbeda, tetapi kode saat ini tidak menunjukkan implementasi tersebut.

### 5. ❌ Bug: Signup Auto-Login Race Condition
**File:** `src/contexts/RegistrationAuthContext.tsx`

**Status:** Sudah ada perbaikan dengan `isSigningUp` flag, tetapi berdasarkan auth logs, terlihat pattern:
```
signup -> login (immediate_login_after_signup: true) -> logout
```

Ini menunjukkan Supabase auto-confirm menyebabkan login otomatis sebelum signOut dipanggil. Perlu dipastikan timing signOut sudah benar.

---

## Rencana Perbaikan

### Fase 1: Perbaikan Role "admin" di Edge Function
1. Update `supabase/functions/admin-create-user/index.ts`:
   - Tambahkan "admin" ke type `AppRole`
   - Tambahkan "admin" ke fungsi `isValidRole()`

### Fase 2: Perbaikan Role "admin" di Frontend
2. Update `src/contexts/AdminAuthContext.tsx`:
   - Tambahkan "admin" ke type `AppRole`
   - Tambahkan pengecekan `has_role` untuk "admin"
   - Update logic `setRole()` untuk include admin

### Fase 3: Perbaikan Properti `isAdmin`
3. Tambahkan `isAdmin` computed property di AdminAuthContext:
```typescript
const value = {
  // ...existing
  isAdmin: role === "admin",
};
```

### Fase 4: Verifikasi Registration Flow
4. Review dan pastikan signup flow:
   - `signUp()` → create registration → send verification → `signOut()` → redirect ke `/daftar/success`
   - Tidak ada auto-login yang tersisa

---

## Detail Teknis

### File yang Perlu Dimodifikasi

| File | Perubahan |
|------|-----------|
| `supabase/functions/admin-create-user/index.ts` | Tambah "admin" ke AppRole dan isValidRole |
| `src/contexts/AdminAuthContext.tsx` | Tambah "admin" role detection dan isAdmin property |

### Testing yang Diperlukan
1. Test bulk create user dengan role "admin" di Admin → Manajemen Pengguna
2. Test login dengan akun role "admin" dan verifikasi akses dashboard
3. Test signup baru di `/daftar/signup` → pastikan redirect ke success page, bukan dashboard
4. Test login dengan akun yang sudah terverifikasi manual

---

## Prioritas Perbaikan

1. **TINGGI** - Bug role "admin" di edge function (menyebabkan bulk add gagal)
2. **TINGGI** - Bug role "admin" di AdminAuthContext (user admin tidak bisa akses)
3. **SEDANG** - Verifikasi registration flow (memastikan tidak auto-login)

