# FIM WordPress Theme

Theme WordPress lengkap untuk Forum Indonesia Muda (FIM) yang dapat digunakan dalam dua mode:
1. **Headless Mode**: Sebagai CMS backend untuk React frontend (REST API)
2. **Standalone Mode**: Sebagai website WordPress lengkap dengan styling

---

## 📁 Struktur Folder

```
wordpress-theme/
├── assets/
│   ├── css/
│   │   └── theme.css              # Complete CSS styling (~3200 lines)
│   ├── js/
│   │   └── theme.js               # Interactive JavaScript (scroll, menu, etc)
│   └── images/                    # Logo, favicon, etc
├── inc/
│   ├── custom-post-types.php      # Register CPT: program, alumni_story, regional, faq, partner
│   ├── acf-fields.php             # ACF field groups configuration
│   └── rest-api.php               # REST API customization & CORS
├── functions.php                  # Main theme functions, helpers & icons
├── style.css                      # Theme metadata
├── index.php                      # Default template
├── header.php                     # Header template with navigation
├── footer.php                     # Footer template
├── sidebar.php                    # Sidebar template
├── comments.php                   # Comments template
│
├── # Page Templates
├── front-page.php                 # Homepage dengan 7 Pilar, statistik, partners
├── page.php                       # Default page template
├── page-tentang.php               # Tentang FIM: Visi, Misi, Timeline, Struktur
├── page-blog.php                  # Blog listing dengan filter kategori
├── page-alumni.php                # Cerita Alumni dengan filter sektor
├── page-faq.php                   # FAQ dengan accordion
├── page-donasi.php                # Informasi donasi dan rekening
├── page-gabung-relawan.php        # Pendaftaran relawan
├── page-pelatihan.php             # Program pelatihan FIM
├── page-program-unggulan.php      # 5 Program unggulan FIM
├── page-regional.php              # Daftar regional dengan filter pulau
├── page-fim-club.php              # Daftar FIM Club dengan filter kategori
│
├── # Post Templates
├── single.php                     # Template single post/artikel
├── archive.php                    # Archive/category template
├── search.php                     # Search results template
├── 404.php                        # 404 error page
│
├── acf-export.json                # ACF fields untuk import otomatis
├── screenshot.png                 # Theme screenshot (1200x900)
└── README.md                      # Dokumentasi ini
```

---

## 📋 Daftar Page Templates

| Template | File | Deskripsi |
|----------|------|-----------|
| **Homepage** | `front-page.php` | Landing page dengan hero, 7 Pilar FIM, statistik, latest news, partners, dan CTA |
| **Tentang** | `page-tentang.php` | Halaman tentang: Visi & Misi, Timeline sejarah, Struktur organisasi lengkap |
| **Blog** | `page-blog.php` | Grid blog posts dengan filter kategori dan pagination |
| **Cerita Alumni** | `page-alumni.php` | Testimonial alumni dengan filter sektor (Pendidikan, Sosial, Teknologi, dll) |
| **FAQ** | `page-faq.php` | Frequently Asked Questions dengan accordion interaktif |
| **Donasi** | `page-donasi.php` | Informasi donasi, rekening bank, transparansi penggunaan dana |
| **Gabung Relawan** | `page-gabung-relawan.php` | Panduan menjadi relawan FIM dan manfaatnya |
| **Pelatihan** | `page-pelatihan.php` | Program pelatihan: tahapan, timeline, dokumentasi |
| **Program Unggulan** | `page-program-unggulan.php` | 5 Program utama FIM dengan detail lengkap |
| **Regional** | `page-regional.php` | Daftar 34 regional FIM dengan filter pulau dan search |
| **FIM Club** | `page-fim-club.php` | Daftar FIM Club dengan filter kategori |
| **Single Post** | `single.php` | Template artikel: featured image, content, tags, share, related posts |

---

## 🚀 Panduan Instalasi

### Step 1: Persiapan

1. Pastikan WordPress versi 6.0 atau lebih baru
2. PHP versi 7.4 atau lebih baru
3. MySQL 5.7 atau lebih baru

### Step 2: Upload Theme

```bash
# Zip folder wordpress-theme
cd path/to/project
zip -r fim-theme.zip wordpress-theme

# Atau rename folder sebelum zip
mv wordpress-theme fim-theme
zip -r fim-theme.zip fim-theme
```

1. Login ke WordPress Admin
2. Navigasi ke **Appearance > Themes > Add New > Upload Theme**
3. Upload `fim-theme.zip`
4. Klik **Install Now** lalu **Activate**

### Step 3: Install Plugin Wajib

| Plugin | Kegunaan | Link |
|--------|----------|------|
| **Advanced Custom Fields (ACF)** | Custom fields untuk CPT | [Download](https://wordpress.org/plugins/advanced-custom-fields/) |
| **ACF to REST API** | Expose ACF ke REST API | [Download](https://wordpress.org/plugins/acf-to-rest-api/) |

### Step 4: Buat Pages

Buat halaman WordPress dengan template yang sesuai:

| Halaman | Template | Slug |
|---------|----------|------|
| Beranda | Front Page | `/` |
| Tentang FIM | Tentang | `/tentang` |
| Blog | Blog Page | `/blog` |
| Cerita Alumni | Alumni Stories Page | `/cerita-alumni` |
| FAQ | FAQ Page | `/faq` |
| Donasi | Donation Page | `/donasi` |
| Gabung Relawan | Volunteer Page | `/gabung-relawan` |
| Program Pelatihan | Pelatihan Page | `/program/pelatihan` |
| Program Unggulan | Program Unggulan Page | `/program/program-unggulan` |
| Regional | Regional Page | `/tentang/regional` |
| FIM Club | FIM Club Page | `/tentang/fim-club` |

### Step 5: Set Homepage

1. Navigasi ke **Settings > Reading**
2. Pilih **A static page**
3. Homepage: pilih halaman **Beranda**
4. Save Changes

### Step 6: Configure Permalinks

1. Navigasi ke **Settings > Permalinks**
2. Pilih **Post name** (`/%postname%/`)
3. Save Changes

---

## 📦 Custom Post Types

| Post Type | Slug | Menu Label | Deskripsi |
|-----------|------|------------|-----------|
| **Program** | `program` | Programs | Program pelatihan FIM |
| **Cerita Alumni** | `alumni_story` | Alumni Stories | Kisah inspiratif alumni |
| **Regional** | `regional` | Regionals | Data regional FIM se-Indonesia |
| **FAQ** | `faq` | FAQ | Pertanyaan yang sering diajukan |
| **Partner** | `partner` | Partners | Logo dan info partner/sponsor |

---

## 🔌 REST API Endpoints

**Base URL:** `https://your-domain.com/wp-json/wp/v2/`

### Standard Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/posts` | GET | Blog posts |
| `/pages` | GET | Static pages |
| `/categories` | GET | Post categories |
| `/tags` | GET | Post tags |
| `/media` | GET | Media files |

### Custom Post Type Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/program` | GET | Daftar program |
| `/alumni_story` | GET | Cerita alumni |
| `/regional` | GET | Data regional |
| `/faq` | GET | Daftar FAQ |
| `/partner` | GET | Daftar partner |

### Query Parameters

```
?per_page=10          # Jumlah item per halaman (max: 100)
?page=1               # Nomor halaman
?search=keyword       # Pencarian
?_embed               # Include embedded data (author, featured image)
?orderby=date         # Sort by: date, title, id, modified
?order=desc           # Order: asc, desc
?categories=1,2       # Filter by category IDs
```

### Contoh Request

```bash
# Get 10 latest posts with embedded data
curl "https://your-domain.com/wp-json/wp/v2/posts?per_page=10&_embed"

# Get alumni stories filtered by sector
curl "https://your-domain.com/wp-json/wp/v2/alumni_story?per_page=20"

# Search regionals
curl "https://your-domain.com/wp-json/wp/v2/regional?search=jakarta"
```

---

## 🎨 ACF Field Groups

### Program Fields

| Field Name | Field Type | Deskripsi |
|------------|-----------|-----------|
| `tanggal_mulai` | Date Picker | Tanggal mulai program |
| `tanggal_selesai` | Date Picker | Tanggal selesai program |
| `lokasi` | Text | Lokasi pelaksanaan |
| `kuota` | Number | Jumlah peserta maksimal |
| `pendaftaran_url` | URL | Link pendaftaran |
| `status` | Select | Dibuka / Ditutup / Segera |

### Alumni Story Fields

| Field Name | Field Type | Deskripsi |
|------------|-----------|-----------|
| `alumni_name` | Text | Nama lengkap alumni |
| `batch` | Text | Angkatan (e.g., "FIM 15") |
| `sector` | Select | Sektor: Pendidikan, Sosial, Teknologi, Kesehatan, Lingkungan |
| `position` | Text | Jabatan saat ini |
| `company` | Text | Nama perusahaan/organisasi |
| `quote` | Textarea | Quote inspiratif |
| `impact` | Text | Dampak yang dicapai |
| `video_url` | URL | Link video testimonial (YouTube) |

### Regional Fields

| Field Name | Field Type | Deskripsi |
|------------|-----------|-----------|
| `provinsi` | Text | Nama provinsi |
| `pulau` | Select | Sumatera, Jawa, Kalimantan, Sulawesi, Bali & Nusa Tenggara, Maluku & Papua |
| `koordinator` | Text | Nama koordinator regional |
| `email` | Email | Email regional |
| `instagram` | Text | Handle Instagram (tanpa @) |
| `jumlah_anggota` | Number | Jumlah anggota aktif |
| `alamat` | Textarea | Alamat sekretariat |

### FAQ Fields

| Field Name | Field Type | Deskripsi |
|------------|-----------|-----------|
| `kategori` | Select | Umum, Pendaftaran, Program, Donasi, Relawan |
| `urutan` | Number | Urutan tampil (1-99) |

### Partner Fields

| Field Name | Field Type | Deskripsi |
|------------|-----------|-----------|
| `website_url` | URL | Website partner |
| `kategori` | Select | Sponsor Utama, Partner Media, Partner Komunitas |

---

## ⚙️ Konfigurasi

### CORS Configuration

Theme otomatis mengaktifkan CORS. Untuk membatasi origin, edit `inc/rest-api.php`:

```php
// Ganti wildcard dengan domain spesifik
header('Access-Control-Allow-Origin: https://forumindonesiamuda.org');

// Atau multiple origins
$allowed_origins = array(
    'https://forumindonesiamuda.org',
    'https://www.forumindonesiamuda.org',
    'http://localhost:5173'
);

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
```

### React Frontend Integration

Set environment variable di React project:

```bash
# .env
VITE_WP_API_URL=https://cms.forumindonesiamuda.org/wp-json/wp/v2
```

Contoh fetch di React:

```typescript
// src/services/wordpress.ts
const WP_API = import.meta.env.VITE_WP_API_URL;

export async function getPosts(page = 1, perPage = 10) {
  const response = await fetch(
    `${WP_API}/posts?page=${page}&per_page=${perPage}&_embed`
  );
  return response.json();
}

export async function getAlumniStories() {
  const response = await fetch(`${WP_API}/alumni_story?per_page=100`);
  return response.json();
}
```

---

## 🎨 Customization Guide

### Mengubah Brand Colors

Edit `assets/css/theme.css`:

```css
:root {
    /* Primary - FIM Red */
    --fim-red: #E60012;
    --fim-red-light: #FF3344;
    --fim-red-dark: #CC0010;
    
    /* Secondary - FIM Gold */
    --fim-gold: #FFD700;
    --fim-gold-light: #FFE44D;
    --fim-gold-dark: #E6C200;
    
    /* Accent - FIM Green */
    --fim-green: #1B5E20;
    --fim-green-light: #2E7D32;
}
```

### Menambah Page Template Baru

1. Buat file PHP baru dengan header template:

```php
<?php
/**
 * Template Name: Nama Template
 * Description: Deskripsi template
 */

get_header();
?>

<!-- Content here -->

<?php get_footer(); ?>
```

2. Buat page baru di WordPress dan pilih template

### Menambah Custom Post Type

Edit `inc/custom-post-types.php`:

```php
// Register new CPT
register_post_type('new_cpt', array(
    'labels' => array(
        'name' => 'New CPT',
        'singular_name' => 'New CPT Item',
    ),
    'public' => true,
    'show_in_rest' => true, // Enable REST API
    'has_archive' => true,
    'supports' => array('title', 'editor', 'thumbnail'),
    'menu_icon' => 'dashicons-star-filled',
));
```

### Menambah ACF Fields

Edit `inc/acf-fields.php` atau gunakan ACF UI:

```php
if (function_exists('acf_add_local_field_group')) {
    acf_add_local_field_group(array(
        'key' => 'group_new_fields',
        'title' => 'New Fields',
        'fields' => array(
            array(
                'key' => 'field_custom',
                'label' => 'Custom Field',
                'name' => 'custom_field',
                'type' => 'text',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'new_cpt',
                ),
            ),
        ),
    ));
}
```

---

## 🐛 Troubleshooting

### REST API tidak bisa diakses

1. Periksa permalink settings (harus Post name)
2. Periksa .htaccess
3. Disable security plugins sementara
4. Test endpoint: `https://domain.com/wp-json/`

### ACF fields tidak muncul di API

1. Pastikan plugin **ACF to REST API** aktif
2. Periksa field visibility settings
3. Clear cache

### CORS Error

1. Periksa `inc/rest-api.php`
2. Pastikan origin sudah diizinkan
3. Periksa server configuration (.htaccess)

### Images tidak muncul

1. Periksa **Settings > Media** untuk URL
2. Pastikan SSL certificate valid
3. Periksa file permissions

### Custom Post Type tidak muncul di menu

1. Periksa `show_in_menu` parameter
2. Refresh permalink (Settings > Permalinks > Save)
3. Clear cache

---

## 📞 Support

- **Email**: developer@forumindonesiamuda.org
- **Website**: https://forumindonesiamuda.org
- **GitHub**: https://github.com/forum-indonesia-muda

---

## 📄 Changelog

### v2.1.0 (2025)
- Added 404.php error page
- Added archive.php template
- Added search.php template
- Added page.php default template
- Added sidebar.php template
- Added comments.php template
- Enhanced CSS with 400+ new lines for new templates
- Complete ACF export JSON for auto-import

### v2.0.0 (2024)
- Complete theme rewrite
- Added 12 page templates
- Complete CSS styling with CSS variables
- Dark mode support
- Print styles
- Responsive design
- Animation utilities
- Loading skeletons
- Interactive JavaScript (theme.js)

### v1.0.0 (Initial)
- Basic headless theme
- REST API support
- Custom post types

---

## ✅ Testing Checklist

Gunakan checklist ini untuk memverifikasi semua template berfungsi:

### Page Templates
- [ ] **Homepage** (`front-page.php`) - Hero, stats, 7 pilar, news, partners, CTA
- [ ] **Tentang** (`page-tentang.php`) - Visi/misi, timeline, struktur organisasi
- [ ] **Blog** (`page-blog.php`) - Posts grid, category filter, pagination
- [ ] **Cerita Alumni** (`page-alumni.php`) - Alumni cards, sector filter
- [ ] **FAQ** (`page-faq.php`) - Accordion berfungsi dengan klik
- [ ] **Donasi** (`page-donasi.php`) - Copy rekening button berfungsi
- [ ] **Gabung Relawan** (`page-gabung-relawan.php`) - Steps, benefits
- [ ] **Pelatihan** (`page-pelatihan.php`) - Stats, tahapan, timeline
- [ ] **Program Unggulan** (`page-program-unggulan.php`) - 5 programs detail
- [ ] **Regional** (`page-regional.php`) - Search dan filter pulau berfungsi
- [ ] **FIM Club** (`page-fim-club.php`) - Category filter berfungsi

### Post Templates
- [ ] **Single Post** (`single.php`) - Content, tags, share buttons, related posts
- [ ] **Archive** (`archive.php`) - Category/tag archives dengan pagination
- [ ] **Search** (`search.php`) - Search form, results dengan highlight
- [ ] **404** (`404.php`) - Error page dengan search dan quick links

### Global Elements
- [ ] **Header** - Logo, navigation, dropdown menus, mobile menu
- [ ] **Footer** - Links, newsletter form, social icons
- [ ] **Scroll Progress** - Bar di atas page saat scroll
- [ ] **Back to Top** - Button muncul setelah scroll
- [ ] **Mobile Menu** - Toggle berfungsi dengan animasi

### Interactive Features
- [ ] FAQ accordion expand/collapse
- [ ] Filter buttons (regional, alumni, club)
- [ ] Search functionality
- [ ] Copy to clipboard (donasi)
- [ ] Video modal (alumni)
- [ ] Counter animation (stats)
- [ ] Lazy loading images
- [ ] Smooth scroll untuk anchor links

### Responsive Design
- [ ] Desktop (1280px+)
- [ ] Tablet (768px - 1279px)
- [ ] Mobile (< 768px)

---

## 📜 License

This theme is licensed under the GPL v2 or later.

```
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.
```
