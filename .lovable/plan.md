
# Rencana Implementasi Perbaikan

## Ringkasan Masalah yang Ditemukan

Berdasarkan analisis mendalam kode dan database, berikut adalah masalah yang perlu diperbaiki:

---

## 1. Bulk Add Account untuk Admin/Moderator

### Status: SUDAH DIPERBAIKI (edge function)
Edge function `admin-create-user` sudah diupdate untuk menerima role "admin" pada edit sebelumnya. Perlu verifikasi apakah sudah di-deploy.

### Tindakan
- Deploy ulang edge function `admin-create-user` untuk memastikan perubahan aktif

---

## 2. Akun Pendaftaran Terverifikasi Tidak Bisa Login

### Masalah Ditemukan
Berdasarkan kode di `RegistrationAuthContext.tsx` (baris 221-294), flow login sudah benar:
1. Cek registration exists
2. Cek email_verified
3. Sign in dengan password
4. Cek bukan admin
5. Fetch registration data

### Kemungkinan Masalah
- **Password salah** - User mungkin lupa password
- **Supabase auth error** - Error dari `signInWithPassword` tidak di-handle dengan benar

### Solusi
1. Tambahkan handling error yang lebih spesifik untuk `Invalid login credentials`
2. Perbaiki pesan error agar user tahu pasti penyebabnya (password salah vs email tidak ditemukan)

### Perubahan File
**File:** `src/contexts/RegistrationAuthContext.tsx`
```typescript
// Di signIn function, setelah signInWithPassword
if (error) {
  if (error.message.includes("Invalid login credentials")) {
    throw new Error("Email atau password salah. Silakan periksa kembali.");
  }
  throw error;
}
```

---

## 3. Bulk Delete Tidak Menghapus Auth User

### Masalah Kritis
**File:** `src/pages/admin/RegistrationsManagement.tsx` (baris 632-667)

`bulkDeleteMutation` hanya menghapus:
- `fim_training_registrations`
- `interview_schedules`
- `fim_registrations`

**TIDAK** menghapus auth user, sehingga email tidak bisa didaftarkan ulang.

### Solusi
Update `bulkDeleteMutation` untuk memanggil edge function `delete-registrant-auth-user` per registrasi (sama seperti `deleteRegistrationMutation`).

### Perubahan File
**File:** `src/pages/admin/RegistrationsManagement.tsx`
```typescript
// Update bulkDeleteMutation
const bulkDeleteMutation = useMutation({
  mutationFn: async (ids: string[]) => {
    // Get registrations with auth_user_id
    const { data: regs } = await supabase
      .from("fim_registrations")
      .select("id, auth_user_id, full_name")
      .in("id", ids);
    
    if (!regs || regs.length === 0) {
      throw new Error("No registrations found");
    }

    let successCount = 0;
    for (const reg of regs) {
      try {
        // Call edge function to properly delete auth user and all data
        const { data, error } = await supabase.functions.invoke("delete-registrant-auth-user", {
          body: {
            auth_user_id: reg.auth_user_id,
            registration_id: reg.id,
          },
        });

        if (error) {
          console.error(`Failed to delete ${reg.full_name}:`, error);
          continue;
        }
        successCount++;
      } catch (err) {
        console.error(`Error deleting ${reg.full_name}:`, err);
      }
    }
    
    return successCount;
  },
  onSuccess: (count) => {
    toast.success(`${count} data pendaftar berhasil dihapus. Email dapat digunakan untuk pendaftaran baru.`);
    queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
    setSelectedIds(new Set());
    setIsBulkDeleteDialogOpen(false);
  },
  onError: (error: any) => {
    toast.error(`Gagal menghapus data: ${error.message}`);
  },
});
```

---

## 4. Menu Admin Panel Autoscroll

### Masalah
Menu admin di sidebar autoscroll saat toggle dropdown, menyulitkan navigasi.

### Akar Masalah
Saat `CollapsibleContent` expand/collapse, konten berubah tinggi dan browser mungkin auto-scroll untuk menjaga focus.

### Solusi
1. Simpan posisi scroll sebelum toggle
2. Restore posisi scroll setelah toggle menggunakan `requestAnimationFrame`
3. Tambahkan CSS `overscroll-behavior: contain` untuk mencegah scroll propagation

### Perubahan File
**File:** `src/pages/admin/AdminDashboard.tsx`

```typescript
import { useEffect, useState, useCallback, useRef } from "react";

// Dalam komponen AdminDashboard:
const sidebarScrollRef = useRef<HTMLDivElement>(null);
const scrollPositionRef = useRef(0);

const toggleMenu = (name: string) => {
  // Simpan posisi scroll sebelum toggle
  if (sidebarScrollRef.current) {
    scrollPositionRef.current = sidebarScrollRef.current.scrollTop;
  }
  
  setOpenMenus(prev => 
    prev.includes(name) 
      ? prev.filter(n => n !== name)
      : [...prev, name]
  );
  
  // Restore scroll position setelah DOM update
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (sidebarScrollRef.current) {
        sidebarScrollRef.current.scrollTop = scrollPositionRef.current;
      }
    });
  });
};

// Update div container navigasi:
<div 
  ref={sidebarScrollRef}
  className="flex-1 overflow-y-auto overscroll-contain"
  onScroll={(e) => e.stopPropagation()}
>
```

---

## 5. Validasi Re-registrasi dengan Data Blocked

### Status: SUDAH BENAR
Berdasarkan analisis:
- Signup di `RegistrationSignup.tsx` sudah mengecek `blocked_registrations` table
- Block registrant di `RegistrationsManagement.tsx` memasukkan data ke `blocked_registrations`
- Edge function `delete-registrant-auth-user` menghapus auth user sehingga email bisa digunakan ulang

### Tidak Perlu Perubahan
Sistem sudah benar - akun yang dihapus (tanpa block) bisa re-register, akun yang di-block tidak bisa.

---

## Ringkasan Perubahan

| No | File | Perubahan |
|----|------|-----------|
| 1 | `src/contexts/RegistrationAuthContext.tsx` | Perbaiki error message untuk password salah |
| 2 | `src/pages/admin/RegistrationsManagement.tsx` | Update bulkDeleteMutation untuk menghapus auth user |
| 3 | `src/pages/admin/AdminDashboard.tsx` | Perbaiki autoscroll dengan save/restore scroll position |
| 4 | Edge Function | Deploy ulang `admin-create-user` |

---

## Testing Checklist

- [ ] Test bulk add user dengan role admin, moderator, super_admin di /admin/users
- [ ] Test login dengan akun pendaftar yang sudah terverifikasi manual
- [ ] Test bulk delete registrant → coba daftar ulang dengan email yang sama (harus bisa)
- [ ] Test blokir registrant → coba daftar ulang dengan email yang sama (harus gagal)
- [ ] Test menu admin dengan semua dropdown terbuka (tidak boleh autoscroll)

---

## Urutan Implementasi

1. **Fase 1**: Update `RegistrationAuthContext.tsx` - perbaiki error message login
2. **Fase 2**: Update `RegistrationsManagement.tsx` - perbaiki bulkDeleteMutation
3. **Fase 3**: Update `AdminDashboard.tsx` - perbaiki autoscroll
4. **Fase 4**: Deploy edge function `admin-create-user`
