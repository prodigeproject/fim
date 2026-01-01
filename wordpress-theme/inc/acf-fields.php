<?php
/**
 * ACF Field Groups Configuration
 *
 * This file contains documentation and programmatic registration of ACF fields.
 * You can either:
 * 1. Use this code to auto-register fields
 * 2. Or create fields manually in ACF admin and export to JSON
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register ACF Field Groups programmatically
 * 
 * Note: This requires ACF Pro for the acf_add_local_field_group function.
 * For ACF Free, create these fields manually in the admin.
 */
function fim_register_acf_fields() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }
    
    // =========================================================================
    // Program Fields
    // =========================================================================
    acf_add_local_field_group(array(
        'key' => 'group_fim_program',
        'title' => 'Detail Program',
        'fields' => array(
            array(
                'key' => 'field_program_tanggal_mulai',
                'label' => 'Tanggal Mulai',
                'name' => 'tanggal_mulai',
                'type' => 'date_picker',
                'display_format' => 'd/m/Y',
                'return_format' => 'Y-m-d',
            ),
            array(
                'key' => 'field_program_tanggal_selesai',
                'label' => 'Tanggal Selesai',
                'name' => 'tanggal_selesai',
                'type' => 'date_picker',
                'display_format' => 'd/m/Y',
                'return_format' => 'Y-m-d',
            ),
            array(
                'key' => 'field_program_lokasi',
                'label' => 'Lokasi',
                'name' => 'lokasi',
                'type' => 'text',
                'placeholder' => 'Contoh: Jakarta, Indonesia',
            ),
            array(
                'key' => 'field_program_kuota',
                'label' => 'Kuota Peserta',
                'name' => 'kuota',
                'type' => 'number',
                'min' => 1,
            ),
            array(
                'key' => 'field_program_pendaftaran_url',
                'label' => 'URL Pendaftaran',
                'name' => 'pendaftaran_url',
                'type' => 'url',
                'placeholder' => 'https://...',
            ),
            array(
                'key' => 'field_program_status',
                'label' => 'Status',
                'name' => 'status',
                'type' => 'select',
                'choices' => array(
                    'Dibuka' => 'Dibuka',
                    'Ditutup' => 'Ditutup',
                    'Segera' => 'Segera Dibuka',
                ),
                'default_value' => 'Dibuka',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'program',
                ),
            ),
        ),
        'position' => 'normal',
        'style' => 'default',
    ));
    
    // =========================================================================
    // Alumni Story Fields
    // =========================================================================
    acf_add_local_field_group(array(
        'key' => 'group_fim_alumni',
        'title' => 'Detail Alumni',
        'fields' => array(
            array(
                'key' => 'field_alumni_nama',
                'label' => 'Nama Lengkap',
                'name' => 'nama',
                'type' => 'text',
                'required' => 1,
            ),
            array(
                'key' => 'field_alumni_batch',
                'label' => 'Batch/Angkatan',
                'name' => 'batch',
                'type' => 'text',
                'placeholder' => 'Contoh: FIM 15',
                'required' => 1,
            ),
            array(
                'key' => 'field_alumni_foto',
                'label' => 'Foto',
                'name' => 'foto_url',
                'type' => 'image',
                'return_format' => 'url',
                'preview_size' => 'thumbnail',
            ),
            array(
                'key' => 'field_alumni_quote',
                'label' => 'Quote',
                'name' => 'quote',
                'type' => 'textarea',
                'rows' => 3,
                'placeholder' => 'Kutipan inspiratif dari alumni',
            ),
            array(
                'key' => 'field_alumni_sektor',
                'label' => 'Sektor',
                'name' => 'sektor',
                'type' => 'select',
                'choices' => array(
                    'Pendidikan' => 'Pendidikan',
                    'Sosial' => 'Sosial',
                    'Teknologi' => 'Teknologi',
                    'Kesehatan' => 'Kesehatan',
                    'Lingkungan' => 'Lingkungan',
                    'Bisnis' => 'Bisnis',
                    'Internasional' => 'Internasional',
                    'Pemerintahan' => 'Pemerintahan',
                ),
            ),
            array(
                'key' => 'field_alumni_jabatan',
                'label' => 'Jabatan',
                'name' => 'jabatan',
                'type' => 'text',
                'placeholder' => 'Contoh: CEO, Founder, Director',
            ),
            array(
                'key' => 'field_alumni_perusahaan',
                'label' => 'Perusahaan/Organisasi',
                'name' => 'perusahaan',
                'type' => 'text',
            ),
            array(
                'key' => 'field_alumni_linkedin',
                'label' => 'LinkedIn URL',
                'name' => 'linkedin_url',
                'type' => 'url',
            ),
            array(
                'key' => 'field_alumni_video',
                'label' => 'Video Testimoni URL',
                'name' => 'video_url',
                'type' => 'url',
                'placeholder' => 'YouTube atau Vimeo URL',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'alumni_story',
                ),
            ),
        ),
        'position' => 'normal',
        'style' => 'default',
    ));
    
    // =========================================================================
    // Regional Fields
    // =========================================================================
    acf_add_local_field_group(array(
        'key' => 'group_fim_regional',
        'title' => 'Detail Regional',
        'fields' => array(
            array(
                'key' => 'field_regional_provinsi',
                'label' => 'Provinsi',
                'name' => 'provinsi',
                'type' => 'text',
                'required' => 1,
            ),
            array(
                'key' => 'field_regional_pulau',
                'label' => 'Pulau',
                'name' => 'pulau',
                'type' => 'select',
                'choices' => array(
                    'Sumatera' => 'Sumatera',
                    'Jawa' => 'Jawa',
                    'Kalimantan' => 'Kalimantan',
                    'Sulawesi' => 'Sulawesi',
                    'Bali & Nusa Tenggara' => 'Bali & Nusa Tenggara',
                    'Maluku & Papua' => 'Maluku & Papua',
                ),
            ),
            array(
                'key' => 'field_regional_koordinator',
                'label' => 'Nama Koordinator',
                'name' => 'koordinator',
                'type' => 'text',
            ),
            array(
                'key' => 'field_regional_email',
                'label' => 'Email',
                'name' => 'email',
                'type' => 'email',
            ),
            array(
                'key' => 'field_regional_instagram',
                'label' => 'Instagram',
                'name' => 'instagram',
                'type' => 'text',
                'placeholder' => '@fimregional_xxx',
            ),
            array(
                'key' => 'field_regional_jumlah_anggota',
                'label' => 'Jumlah Anggota',
                'name' => 'jumlah_anggota',
                'type' => 'number',
                'min' => 0,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'regional',
                ),
            ),
        ),
        'position' => 'normal',
        'style' => 'default',
    ));
    
    // =========================================================================
    // FAQ Fields
    // =========================================================================
    acf_add_local_field_group(array(
        'key' => 'group_fim_faq',
        'title' => 'Detail FAQ',
        'fields' => array(
            array(
                'key' => 'field_faq_kategori',
                'label' => 'Kategori',
                'name' => 'kategori',
                'type' => 'select',
                'choices' => array(
                    'Umum' => 'Umum',
                    'Pendaftaran' => 'Pendaftaran',
                    'Program' => 'Program',
                    'Alumni' => 'Alumni',
                    'Regional' => 'Regional',
                    'Teknis' => 'Teknis',
                ),
                'default_value' => 'Umum',
            ),
            array(
                'key' => 'field_faq_urutan',
                'label' => 'Urutan',
                'name' => 'urutan',
                'type' => 'number',
                'default_value' => 0,
                'instructions' => 'Nomor urut untuk pengurutan FAQ (angka kecil tampil lebih dulu)',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'faq',
                ),
            ),
        ),
        'position' => 'side',
        'style' => 'default',
    ));
    
    // =========================================================================
    // Partner Fields
    // =========================================================================
    acf_add_local_field_group(array(
        'key' => 'group_fim_partner',
        'title' => 'Detail Partner',
        'fields' => array(
            array(
                'key' => 'field_partner_website',
                'label' => 'Website URL',
                'name' => 'website_url',
                'type' => 'url',
            ),
            array(
                'key' => 'field_partner_kategori',
                'label' => 'Kategori Partner',
                'name' => 'kategori',
                'type' => 'select',
                'choices' => array(
                    'Sponsor' => 'Sponsor',
                    'Media Partner' => 'Media Partner',
                    'Supporting Partner' => 'Supporting Partner',
                    'Community Partner' => 'Community Partner',
                    'Government' => 'Government',
                ),
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'partner',
                ),
            ),
        ),
        'position' => 'side',
        'style' => 'default',
    ));
}
add_action('acf/init', 'fim_register_acf_fields');

/**
 * ACF Fields Documentation (for manual creation in ACF Free)
 * 
 * If you're using ACF Free, create these field groups manually:
 * 
 * 1. PROGRAM FIELDS
 *    Field Group: "Detail Program"
 *    Location: Post Type == program
 *    Fields:
 *    - tanggal_mulai (Date Picker)
 *    - tanggal_selesai (Date Picker)
 *    - lokasi (Text)
 *    - kuota (Number)
 *    - pendaftaran_url (URL)
 *    - status (Select: Dibuka, Ditutup, Segera)
 * 
 * 2. ALUMNI STORY FIELDS
 *    Field Group: "Detail Alumni"
 *    Location: Post Type == alumni_story
 *    Fields:
 *    - nama (Text, required)
 *    - batch (Text, required)
 *    - foto_url (Image, return URL)
 *    - quote (Textarea)
 *    - sektor (Select: Pendidikan, Sosial, Teknologi, etc.)
 *    - jabatan (Text)
 *    - perusahaan (Text)
 *    - linkedin_url (URL)
 *    - video_url (URL)
 * 
 * 3. REGIONAL FIELDS
 *    Field Group: "Detail Regional"
 *    Location: Post Type == regional
 *    Fields:
 *    - provinsi (Text, required)
 *    - pulau (Select: Sumatera, Jawa, etc.)
 *    - koordinator (Text)
 *    - email (Email)
 *    - instagram (Text)
 *    - jumlah_anggota (Number)
 * 
 * 4. FAQ FIELDS
 *    Field Group: "Detail FAQ"
 *    Location: Post Type == faq
 *    Fields:
 *    - kategori (Select: Umum, Pendaftaran, etc.)
 *    - urutan (Number)
 * 
 * 5. PARTNER FIELDS
 *    Field Group: "Detail Partner"
 *    Location: Post Type == partner
 *    Fields:
 *    - website_url (URL)
 *    - kategori (Select: Sponsor, Media Partner, etc.)
 */
