<?php
/**
 * Template Name: Program Unggulan
 * 
 * Featured programs page template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

$programs = array(
    array(
        'icon' => 'star',
        'title' => 'Leadership Camp',
        'description' => 'Program pelatihan kepemimpinan intensif selama satu minggu dengan berbagai aktivitas outdoor dan indoor yang dirancang untuk membentuk karakter pemimpin.',
        'details' => array(
            'Durasi: 5-7 hari intensif',
            'Lokasi: Berbagai lokasi di Indonesia',
            'Peserta: Kader terpilih dari seluruh regional',
            'Aktivitas: Outbound, workshop, diskusi kelompok, simulasi kepemimpinan',
        ),
        'images' => array(
            'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=250&fit=crop',
        ),
    ),
    array(
        'icon' => 'zap',
        'title' => 'Social Project',
        'description' => 'Program aksi nyata di masyarakat yang dirancang dan dilaksanakan oleh kader FIM. Setiap kader wajib menyelesaikan proyek sosial sebagai syarat kelulusan.',
        'details' => array(
            'Durasi: 3-6 bulan pelaksanaan',
            'Cakupan: Pendidikan, kesehatan, lingkungan, ekonomi',
            'Mentoring: Didampingi mentor alumni berpengalaman',
            'Dampak: Ribuan penerima manfaat setiap tahun',
        ),
        'images' => array(
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop',
        ),
    ),
    array(
        'icon' => 'heart',
        'title' => 'Tanggap Bencana & Kemanusiaan',
        'description' => 'Program respons cepat dan bantuan kemanusiaan untuk korban bencana alam. FIM berkoordinasi dengan berbagai lembaga untuk menyalurkan bantuan.',
        'details' => array(
            'Respons: Dalam 24-48 jam setelah bencana',
            'Koordinasi: Bekerjasama dengan MER-C, TNI, BNPB',
            'Relawan: Jaringan alumni di seluruh Indonesia',
            'Bantuan: Logistik, medis, psikososial, rehabilitasi',
        ),
        'images' => array(
            'https://images.unsplash.com/photo-1559223607-180d0c79a8db?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=250&fit=crop',
        ),
    ),
    array(
        'icon' => 'globe',
        'title' => 'FIM Goes International',
        'description' => 'Program pertukaran dan kerjasama dengan organisasi pemuda internasional untuk memperluas wawasan global alumni FIM.',
        'details' => array(
            'Kerjasama: Organisasi pemuda Asia Tenggara dan global',
            'Program: Exchange program, conference, joint project',
            'Networking: Membangun jaringan internasional',
            'Pengembangan: Skill bahasa dan budaya global',
        ),
        'images' => array(
            'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=400&h=250&fit=crop',
        ),
    ),
    array(
        'icon' => 'book-open',
        'title' => 'FIM Mengajar',
        'description' => 'Program pengabdian di bidang pendidikan untuk anak-anak di daerah terpencil. Alumni FIM mengajar dan menginspirasi generasi muda Indonesia.',
        'details' => array(
            'Lokasi: Daerah 3T (Terdepan, Terluar, Tertinggal)',
            'Durasi: Program reguler dan intensif',
            'Kurikulum: Soft skill, motivasi, literasi digital',
            'Impact: Ratusan sekolah dan ribuan siswa',
        ),
        'images' => array(
            'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop',
        ),
    ),
);
?>

<main id="main" class="site-main">
    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <h1 class="page-title">5 Program Unggulan FIM</h1>
            <p class="page-subtitle">Program-program utama yang menjadi andalan Forum Indonesia Muda dalam membentuk pemimpin muda Indonesia</p>
        </div>
    </section>

    <!-- WA Channel Banner -->
    <section class="wa-banner">
        <div class="container">
            <a href="https://whatsapp.com/channel/0029VbAqbD78PgsCdYd6hK2T" target="_blank" rel="noopener noreferrer" class="wa-banner-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                📢 Ikuti Channel WA <strong>FIMers Update</strong> untuk info terbaru!
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
            </a>
        </div>
    </section>

    <!-- Intro -->
    <section class="section bg-secondary">
        <div class="container text-center">
            <p class="intro-text">
                Selain program kaderisasi tahunan, FIM memiliki 5 program unggulan yang 
                menjadi wadah bagi alumni untuk terus berkontribusi dan mengembangkan diri. 
                Program-program ini telah berjalan bertahun-tahun dan memberikan dampak nyata 
                bagi masyarakat Indonesia.
            </p>
        </div>
    </section>

    <!-- Programs Detail -->
    <section class="section">
        <div class="container">
            <div class="programs-list">
                <?php foreach ($programs as $index => $program): ?>
                <div class="program-item <?php echo $index % 2 === 1 ? 'reversed' : ''; ?>">
                    <div class="program-content">
                        <div class="program-header">
                            <div class="program-icon bg-primary-light">
                                <?php echo fim_get_icon($program['icon']); ?>
                            </div>
                            <h2><?php echo esc_html($program['title']); ?></h2>
                        </div>
                        
                        <p class="program-description"><?php echo esc_html($program['description']); ?></p>
                        
                        <ul class="program-details">
                            <?php foreach ($program['details'] as $detail): ?>
                            <li>
                                <span class="bullet">•</span>
                                <?php echo esc_html($detail); ?>
                            </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>

                    <div class="program-images">
                        <?php foreach ($program['images'] as $imgIndex => $img): ?>
                        <div class="program-image">
                            <img src="<?php echo esc_url($img); ?>" alt="<?php echo esc_attr($program['title']); ?> <?php echo $imgIndex + 1; ?>">
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="section bg-secondary">
        <div class="container text-center">
            <h2>Tertarik Bergabung?</h2>
            <p class="section-subtitle">Ikuti program kaderisasi FIM dan jadilah bagian dari program-program unggulan ini.</p>
            <div class="cta-buttons">
                <a href="<?php echo esc_url(home_url('/pelatihan')); ?>" class="btn btn-primary">
                    Daftar Kaderisasi
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a href="<?php echo esc_url(home_url('/donasi')); ?>" class="btn btn-outline">Dukung Program FIM</a>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>
