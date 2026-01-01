# FIM WordPress Theme

Theme WordPress lengkap untuk Forum Indonesia Muda (FIM) yang didesain untuk mendukung arsitektur Headless WordPress + React Frontend.

## Struktur Folder

```
wordpress-theme/
├── style.css                 # Theme metadata & styles
├── functions.php             # Custom post types, REST API, CORS
├── inc/
│   ├── custom-post-types.php # Register CPT: program, alumni_story, regional, faq, partner
│   ├── acf-fields.php        # ACF field groups configuration
│   └── rest-api.php          # REST API customization & CORS
├── templates/
│   └── (page templates jika diperlukan)
└── README.md
```

## Instalasi

### 1. Upload Theme
1. Zip folder `wordpress-theme` menjadi `fim-theme.zip`
2. Login ke WordPress Admin
3. Navigasi ke **Appearance > Themes > Add New > Upload Theme**
4. Upload `fim-theme.zip` dan aktivasi

### 2. Install Plugin Wajib
- **Advanced Custom Fields (ACF)** - Free atau Pro
- **ACF to REST API** - Expose ACF fields ke REST API

### 3. Import ACF Fields
1. Buka **Custom Fields > Tools**
2. Import file `acf-export.json` (jika disertakan)
3. Atau buat field groups secara manual sesuai dokumentasi di `inc/acf-fields.php`

## Custom Post Types

| Post Type | Slug | Deskripsi |
|-----------|------|-----------|
| Program | `program` | Program pelatihan FIM |
| Cerita Alumni | `alumni_story` | Kisah inspiratif alumni |
| Regional | `regional` | Data regional FIM |
| FAQ | `faq` | Pertanyaan yang sering diajukan |
| Partner | `partner` | Logo dan info partner |

## REST API Endpoints

Base URL: `https://your-domain.com/wp-json/wp/v2/`

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/posts` | GET | Blog posts |
| `/program` | GET | Daftar program |
| `/alumni_story` | GET | Cerita alumni |
| `/regional` | GET | Data regional |
| `/faq` | GET | Daftar FAQ |
| `/partner` | GET | Daftar partner |
| `/categories` | GET | Kategori post |

### Query Parameters
- `per_page` - Jumlah item per halaman (default: 10)
- `page` - Nomor halaman
- `search` - Pencarian
- `_embed` - Sertakan data embedded (author, featured image)

## ACF Fields

### Program
- `tanggal_mulai` - Date
- `tanggal_selesai` - Date  
- `lokasi` - Text
- `kuota` - Number
- `pendaftaran_url` - URL
- `status` - Select (Dibuka/Ditutup/Segera)

### Alumni Story
- `nama` - Text
- `batch` - Text (e.g., "FIM 15")
- `foto_url` - Image
- `quote` - Textarea
- `sektor` - Select
- `jabatan` - Text
- `perusahaan` - Text
- `linkedin_url` - URL
- `video_url` - URL

### Regional
- `provinsi` - Text
- `pulau` - Select
- `koordinator` - Text
- `email` - Email
- `instagram` - Text
- `jumlah_anggota` - Number

### FAQ
- `kategori` - Select
- `urutan` - Number

### Partner
- `website_url` - URL
- `kategori` - Select

## Konfigurasi CORS

Theme otomatis mengaktifkan CORS untuk mengizinkan request dari frontend React. Edit di `inc/rest-api.php` jika perlu membatasi origin tertentu.

## Environment

Set environment variable di React frontend:
```
VITE_WP_API_URL=https://your-domain.com/wp-json/wp/v2
```

## Support

Untuk bantuan teknis, hubungi tim developer FIM.
