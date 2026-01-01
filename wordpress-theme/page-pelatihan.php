<?php
/**
 * Template Name: Program Pelatihan
 * 
 * Training program page template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

$stats = array(
    array('icon' => 'calendar', 'value' => '> 34', 'label' => 'Angkatan'),
    array('icon' => 'users', 'value' => '4000+', 'label' => 'Alumni'),
    array('icon' => 'map-pin', 'value' => '61', 'label' => 'Regional'),
    array('icon' => 'award', 'value' => '100+', 'label' => 'Proyek Sosial/Tahun'),
);

$tahapan = array(
    array('phase' => 'Tahap 1', 'title' => 'Seleksi Nasional', 'duration' => '2 bulan', 'description' => 'Proses seleksi ketat untuk menemukan calon kader terbaik dari seluruh Indonesia', 'activities' => array('Pendaftaran online', 'Seleksi administrasi', 'Wawancara', 'Pengumuman')),
    array('phase' => 'Tahap 2', 'title' => 'Pelatihan FIM 27: Kebijakan Publik', 'duration' => '3 hari', 'description' => 'Pelatihan intensif untuk membangun keterampilan dan jaringan', 'activities' => array('Seminar', 'Workshop', 'FGD', 'Networking')),
    array('phase' => 'Tahap 3', 'title' => 'Mentorship', 'duration' => null, 'description' => 'Program mentoring berkelanjutan untuk pengembangan diri', 'activities' => array('Networking dengan tokoh', 'Workshop lanjutan', 'Training', 'Coaching', 'Mentoring')),
    array('phase' => 'Tahap 4', 'title' => 'Aksi Nyata', 'duration' => null, 'description' => 'Implementasi dan kontribusi masing-masing alumni melalui instansi tempat bekerja dan/atau ekosistem FIM', 'activities' => array('Kontribusi di instansi', 'Proyek ekosistem FIM', 'Kolaborasi alumni', 'Dampak sosial')),
);

$timeline = array(
    array('date' => 'Desember', 'event' => 'Pelaksanaan pelatihan intensif di Jakarta', 'status' => 'ongoing'),
    array('date' => 'November', 'event' => 'Seleksi dilakukan oleh pengurus FIM', 'status' => 'completed'),
    array('date' => 'Oktober', 'event' => 'Pendaftaran FIM 27: Kebijakan Publik dibuka', 'status' => 'completed'),
    array('date' => 'Juli-Agustus', 'event' => 'Persiapan', 'status' => 'completed'),
);

$dokumentasi = array(
    array('title' => 'Leadership Camp 2025', 'image' => 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=600&fit=crop'),
    array('title' => 'Outbound Training', 'image' => 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop'),
    array('title' => 'Workshop Kepemimpinan', 'image' => 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'),
    array('title' => 'Diskusi Kelompok', 'image' => 'https://images.unsplash.com/photo-1559223607-180d0c79a8db?w=800&h=600&fit=crop'),
    array('title' => 'Proyek Sosial Alumni', 'image' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop'),
    array('title' => 'Networking Session', 'image' => 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop'),
);
?>

<main id="main" class="site-main">
    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <h1 class="page-title">Program Pelatihan FIM</h1>
            <p class="page-subtitle">Program kaderisasi tahunan untuk membentuk pemimpin muda Indonesia yang berkarakter dan berdampak</p>
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

    <!-- Stats Section -->
    <section class="section bg-secondary">
        <div class="container">
            <div class="stats-grid">
                <?php foreach ($stats as $stat): ?>
                <div class="stat-card">
                    <div class="stat-icon">
                        <?php echo fim_get_icon($stat['icon']); ?>
                    </div>
                    <div class="stat-value"><?php echo esc_html($stat['value']); ?></div>
                    <div class="stat-label"><?php echo esc_html($stat['label']); ?></div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- About Program -->
    <section class="section">
        <div class="container">
            <div class="program-intro">
                <h2 class="section-title">Apa itu Kaderisasi FIM?</h2>
                <p>Program Kaderisasi FIM adalah program pelatihan kepemimpinan tahunan yang telah berjalan sejak 2003. Program ini dirancang untuk membentuk karakter, mengembangkan potensi, dan membangun jaringan pemuda Indonesia dari berbagai latar belakang.</p>
            </div>

            <div class="benefits-grid-4">
                <?php 
                $program_benefits = array(
                    array('title' => 'Pengembangan Karakter', 'desc' => 'Membangun integritas, kepedulian, dan nilai-nilai kepemimpinan'),
                    array('title' => 'Pengembangan Kompetensi', 'desc' => 'Meningkatkan kompetensi kepemimpinan, kebijakan publik, manajerial, dan soft skills lainnya'),
                    array('title' => 'Jaringan Nasional', 'desc' => 'Terhubung dengan ribuan alumni dari 61 regional di Indonesia'),
                    array('title' => 'Dampak Nyata', 'desc' => 'Kesempatan untuk berkontribusi melalui proyek sosial'),
                );
                foreach ($program_benefits as $benefit): 
                ?>
                <div class="benefit-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <div>
                        <h4><?php echo esc_html($benefit['title']); ?></h4>
                        <p><?php echo esc_html($benefit['desc']); ?></p>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Tahapan Program -->
    <section class="section bg-secondary">
        <div class="container">
            <h2 class="section-title">Tahapan Program Kaderisasi</h2>
            
            <div class="tahapan-list">
                <?php foreach ($tahapan as $index => $tahap): ?>
                <div class="tahapan-card">
                    <div class="tahapan-number">
                        <span>Tahap</span>
                        <strong><?php echo $index + 1; ?></strong>
                    </div>
                    <div class="tahapan-content">
                        <div class="tahapan-header">
                            <h3><?php echo esc_html($tahap['title']); ?></h3>
                            <?php if ($tahap['duration']): ?>
                            <span class="duration-badge"><?php echo esc_html($tahap['duration']); ?></span>
                            <?php endif; ?>
                        </div>
                        <p><?php echo esc_html($tahap['description']); ?></p>
                        <div class="tahapan-activities">
                            <?php foreach ($tahap['activities'] as $activity): ?>
                            <span class="activity-tag"><?php echo esc_html($activity); ?></span>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Timeline -->
    <section class="section">
        <div class="container">
            <h2 class="section-title">Timeline FIM 27: Kebijakan Publik</h2>
            <p class="section-subtitle">Jadwal dan update kegiatan pelatihan FIM terbaru</p>

            <div class="program-timeline">
                <?php foreach ($timeline as $index => $item): ?>
                <div class="timeline-item-horizontal">
                    <div class="timeline-dot <?php echo $item['status'] === 'ongoing' ? 'ongoing' : ''; ?>"></div>
                    <?php if ($index < count($timeline) - 1): ?>
                    <div class="timeline-line-h"></div>
                    <?php endif; ?>
                    <div class="timeline-content-h">
                        <span class="timeline-date <?php echo $item['status'] === 'ongoing' ? 'ongoing' : ''; ?>">
                            <?php echo esc_html($item['date']); ?>
                            <?php if ($item['status'] === 'ongoing'): ?>
                            <span class="status-badge">Sedang Berlangsung</span>
                            <?php endif; ?>
                        </span>
                        <p><?php echo esc_html($item['event']); ?></p>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Dokumentasi -->
    <section class="section bg-secondary">
        <div class="container">
            <h2 class="section-title">Dokumentasi Kegiatan</h2>
            <p class="section-subtitle">Momen-momen berharga dari program pelatihan FIM</p>

            <div class="dokumentasi-grid">
                <?php foreach ($dokumentasi as $doc): ?>
                <div class="dokumentasi-item">
                    <img src="<?php echo esc_url($doc['image']); ?>" alt="<?php echo esc_attr($doc['title']); ?>">
                    <div class="dokumentasi-overlay">
                        <span><?php echo esc_html($doc['title']); ?></span>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="section">
        <div class="container text-center">
            <h2>Siap Menjadi Bagian dari FIM?</h2>
            <p class="section-subtitle">Pendaftaran dibuka setiap tahun. Jangan lewatkan kesempatan untuk mengembangkan diri dan berkontribusi bagi Indonesia.</p>
            <div class="cta-buttons">
                <a href="#" class="btn btn-primary">
                    Daftar Sekarang
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a href="<?php echo esc_url(home_url('/program-unggulan')); ?>" class="btn btn-outline">Lihat Program Unggulan</a>
                <a href="<?php echo esc_url(home_url('/faq')); ?>" class="btn btn-outline">Lihat FAQ</a>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>
