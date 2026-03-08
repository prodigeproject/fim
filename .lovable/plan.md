

# Audit Visual UI Web - Forum Indonesia Muda

## Ringkasan Temuan

Setelah memeriksa seluruh halaman publik, portal pendaftaran, admin panel, dan komponen global, berikut adalah temuan dan rekomendasi perbaikan:

---

## [HIGH] 1. App.css Konflik - Membatasi Layout

File `src/App.css` berisi CSS bawaan Vite yang **membatasi `#root` ke `max-width: 1280px` dengan padding dan text-align center**. Ini berpotensi menyebabkan layout tidak full-width dan alignment yang salah pada beberapa elemen.

**Perbaikan:** Hapus seluruh isi `App.css` atau hapus file-nya (tidak diimpor di `main.tsx`, perlu dicek).

---

## [HIGH] 2. ScrollProgress Overlap dengan Navbar

`ScrollProgress` menggunakan `fixed top-0 z-50` dan `Navbar` menggunakan `sticky top-0 z-50`. Keduanya berada di z-index yang sama, sehingga progress bar bisa tertutup navbar atau menyebabkan gap visual 1px di atas navbar.

**Perbaikan:** Naikkan z-index ScrollProgress ke `z-[60]` dan tambahkan `top-0` yang jelas, atau pindahkan progress bar ke bawah navbar (inside Layout, setelah Navbar).

---

## [MEDIUM] 3. Tentang Page - Pilar Section Terlalu Kecil

Bagian "Nilai & Pilar FIM" menggunakan font `text-[10px]` yang sangat kecil dan sulit dibaca. Ini di bawah standar aksesibilitas minimum (12px).

**Perbaikan:** Naikkan ukuran font minimal ke `text-xs` (12px) dan tambahkan lebih banyak padding pada card pilar.

---

## [MEDIUM] 4. Tentang Page - Sejarah Grid Terlalu Padat

Grid sejarah menggunakan `grid-cols-3` dengan font `text-[10px]` dan `line-clamp-4`. Pada mobile, konten terlalu padat dan sulit dibaca.

**Perbaikan:** Gunakan responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) dan naikkan ukuran font ke `text-xs`.

---

## [MEDIUM] 5. Homepage Hero - Teks "Pendaftaran Angkatan Baru" Tidak Ter-internasionalisasi

Banner `🔥 Pendaftaran Angkatan Baru Segera Dibuka!` dan social proof `Dipercaya lebih dari 4000+ alumni...` hardcoded dalam Bahasa Indonesia tanpa menggunakan `t()`.

**Perbaikan:** Wrap dengan `t()` function untuk mendukung multi-bahasa.

---

## [MEDIUM] 6. Partner Logo Section - Fallback Statis Besar

Ketika data partner belum dimuat, 29 logo x 3 = 87 elemen fallback statis di-render. Ini berat dan tidak perlu.

**Perbaikan:** Tampilkan skeleton/loading state sederhana sebagai fallback, bukan triplikasi seluruh array statis.

---

## [LOW] 7. BackToTop Button - Posisi Bisa Tertutup Mobile Bottom Nav

`BackToTop` di `bottom-6 right-6` bisa overlap dengan `MobileBottomNav` pada perangkat mobile.

**Perbaikan:** Tambahkan `mb-16 sm:mb-0` atau deteksi keberadaan mobile nav dan adjust posisi.

---

## [LOW] 8. Footer Newsletter - Tidak Ada Feedback Loading State yang Jelas

Tombol "Langganan" berubah teks saat loading tapi ukurannya bisa berubah dan menyebabkan layout shift.

**Perbaikan:** Set `min-w` pada button untuk mencegah layout shift.

---

## [LOW] 9. Blog Page - Filter UI Responsif

Perlu diverifikasi bahwa komponen filter (category badges, date range picker, tags) tidak overflow pada layar kecil.

---

## [LOW] 10. Dark Mode Consistency

Beberapa elemen menggunakan hardcoded colors yang mungkin tidak optimal di dark mode:
- NotFound page: `fill-foreground` pada SVG eyes mungkin tidak kontras
- Footer: `bg-foreground text-background` pattern sudah benar
- Hero gradient: sudah menggunakan CSS variables

---

## [COSMETIC] 11. Carousel Pagination Dots - Bisa Lebih Besar

Dots carousel banner (`w-2 h-2`) sudah ada wrapper 24x24px tapi dot visual-nya kecil. Bisa dinaikkan ke `w-2.5 h-2.5` untuk visibilitas lebih baik.

---

## [COSMETIC] 12. Featured Video Section - "SEDANG DIPUTAR" Label Saat Belum Play

Label "SEDANG DIPUTAR" muncul bahkan ketika video belum di-play (hanya thumbnail). Sebaiknya ubah ke "VIDEO PILIHAN" saat belum play.

---

## Rencana Implementasi

### Batch 1 - Critical Fixes
1. **Hapus/kosongkan `App.css`** - Menghilangkan constraint layout yang tidak perlu
2. **Fix ScrollProgress z-index** - Pastikan tidak tertutup navbar
3. **Fix font size Tentang page** - Naikkan dari 10px ke minimal 12px

### Batch 2 - UX Improvements
4. **Responsive grid Sejarah** - Responsive breakpoints yang proper
5. **Internasionalisasi teks hardcoded** di Hero section
6. **BackToTop positioning** - Adjust untuk mobile bottom nav
7. **Featured Video label** - Conditional text berdasarkan play state

### Batch 3 - Polish
8. **Partner logo fallback** - Gunakan skeleton loading
9. **Newsletter button min-width** - Prevent layout shift
10. **Carousel dot size** - Sedikit lebih besar

Total: ~10 perubahan di 6 file utama.

