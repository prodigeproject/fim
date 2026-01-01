# FIM WordPress Theme

Theme WordPress lengkap untuk Forum Indonesia Muda (FIM) yang dapat digunakan dalam dua mode:
1. **Headless Mode**: Sebagai CMS backend untuk React frontend (REST API)
2. **Standalone Mode**: Sebagai website WordPress lengkap dengan styling

## Struktur Folder

```
wordpress-theme/
├── assets/
│   └── css/
│       └── theme.css              # Main CSS styling
├── inc/
│   ├── custom-post-types.php      # Register CPT: program, alumni_story, regional, faq, partner
│   ├── acf-fields.php             # ACF field groups configuration
│   └── rest-api.php               # REST API customization & CORS
├── functions.php                  # Main theme functions & helpers
├── style.css                      # Theme metadata
├── index.php                      # Default template
├── header.php                     # Header template
├── footer.php                     # Footer template
├── page-blog.php                  # Blog page template
├── page-alumni.php                # Alumni stories page template
├── screenshot.png                 # Theme screenshot
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

### 3. Buat Page Templates
1. Buat halaman baru dengan nama "Blog"
2. Di Page Attributes, pilih Template: **Blog Page**
3. Buat halaman baru dengan nama "Cerita Alumni"
4. Di Page Attributes, pilih Template: **Alumni Stories Page**

### 4. Import ACF Fields
1. Buka **Custom Fields > Tools**
2. Import file `acf-export.json` (jika disertakan)
3. Atau fields akan otomatis terdaftar dari `inc/acf-fields.php`

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
- `per_page` - Jumlah item per halaman (default: 10, max: 100)
- `page` - Nomor halaman
- `search` - Pencarian
- `_embed` - Sertakan data embedded (author, featured image)

## ACF Fields

### Program
| Field | Type | Deskripsi |
|-------|------|-----------|
| `tanggal_mulai` | Date | Tanggal mulai program |
| `tanggal_selesai` | Date | Tanggal selesai |
| `lokasi` | Text | Lokasi pelaksanaan |
| `kuota` | Number | Jumlah peserta |
| `pendaftaran_url` | URL | Link pendaftaran |
| `status` | Select | Dibuka/Ditutup/Segera |

### Alumni Story
| Field | Type | Deskripsi |
|-------|------|-----------|
| `alumni_name` | Text | Nama alumni |
| `batch` | Text | Angkatan (e.g., "FIM 15") |
| `sector` | Select | Sektor: Pendidikan, Sosial, Teknologi, dll |
| `position` | Text | Jabatan |
| `company` | Text | Perusahaan/Lokasi |
| `quote` | Textarea | Quote inspiratif |
| `impact` | Text | Dampak yang dicapai |

### Regional
| Field | Type | Deskripsi |
|-------|------|-----------|
| `provinsi` | Text | Nama provinsi |
| `pulau` | Select | Pulau: Sumatera, Jawa, dll |
| `koordinator` | Text | Nama koordinator |
| `email` | Email | Email regional |
| `instagram` | Text | Handle Instagram |
| `jumlah_anggota` | Number | Jumlah anggota |

### FAQ
| Field | Type | Deskripsi |
|-------|------|-----------|
| `kategori` | Select | Kategori FAQ |
| `urutan` | Number | Urutan tampil |

### Partner
| Field | Type | Deskripsi |
|-------|------|-----------|
| `website_url` | URL | Website partner |
| `kategori` | Select | Kategori partner |

## Page Templates

### Blog Page (`page-blog.php`)
- Grid layout untuk blog posts
- Filter kategori
- Pagination
- Responsive design

### Alumni Stories Page (`page-alumni.php`)
- Filter berdasarkan sektor
- Video testimonial modal
- Story cards dengan quote & impact
- Responsive grid

## Konfigurasi CORS

Theme otomatis mengaktifkan CORS untuk mengizinkan request dari frontend React. Edit di `inc/rest-api.php` jika perlu membatasi origin:

```php
// Ganti wildcard dengan domain spesifik
header('Access-Control-Allow-Origin: https://forumindonesiamuda.org');
```

## Integrasi dengan React Frontend

Set environment variable di React frontend:
```bash
VITE_WP_API_URL=https://cms.forumindonesiamuda.org/wp-json/wp/v2
```

React akan otomatis fetch data dari WordPress jika env variable dikonfigurasi. Jika tidak, akan menggunakan fallback data.

## Support

Untuk bantuan teknis, hubungi tim developer FIM.
