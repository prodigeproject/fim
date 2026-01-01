<?php
/**
 * Template Name: Gabung Relawan
 * 
 * Volunteer page template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

$volunteer_info = array(
    array('icon' => 'users', 'title' => 'Siapa Relawan FIM?', 'description' => 'Relawan FIM adalah individu yang secara sukarela membantu FIM melalui kepengurusan regional dan/atau kegiatan tertentu.'),
    array('icon' => 'calendar', 'title' => 'Masa Aktif Relawan', 'description' => 'Masa aktif relawan di regional bergantung pada masa kepengurusan, sementara relawan kegiatan hanya berlaku untuk kegiatan tertentu.'),
    array('icon' => 'award', 'title' => 'Pengakuan Nasional', 'description' => 'Relawan FIM diakui secara nasional dan didata oleh pengurus FIM sebagai bagian dari ekosistem FIM.'),
    array('icon' => 'shield', 'title' => 'Keterlibatan Regional', 'description' => 'Relawan FIM bisa terlibat sebagai pengurus regional, tetapi individu relawan tidak mewakili FIM secara keseluruhan.'),
    array('icon' => 'book-open', 'title' => 'Terikat Aturan FIM', 'description' => 'Relawan FIM terikat pada peraturan, norma, dan tata tertib yang sama dengan alumni FIM.'),
);

$join_steps = array(
    array('step' => 1, 'title' => 'Rekrutmen Regional', 'description' => 'Ikuti kegiatan rekrutmen dan pelatihan volunteer yang diadakan oleh regional FIM di kotamu.'),
    array('step' => 2, 'title' => 'Rekrutmen FIM Pusat', 'description' => 'Atau ikuti rekrutmen yang diadakan oleh FIM Pusat untuk kegiatan nasional tertentu.'),
    array('step' => 3, 'title' => 'Pelatihan Volunteer', 'description' => 'Setelah diterima, kamu akan mengikuti pelatihan volunteer untuk memahami nilai-nilai dan cara kerja FIM.'),
    array('step' => 4, 'title' => 'Bergabung & Berkontribusi', 'description' => 'Mulai berkontribusi dalam kegiatan regional atau nasional bersama komunitas FIM.'),
);

$benefits = array(
    'Pengalaman organisasi dan kepemimpinan',
    'Jaringan luas dengan alumni FIM se-Indonesia',
    'Sertifikat pengakuan dari FIM',
    'Kesempatan mengikuti kegiatan nasional',
    'Pengembangan soft skill dan hard skill',
    'Dampak nyata bagi masyarakat',
);
?>

<main id="main" class="site-main">
    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <h1 class="page-title">Gabung Relawan FIM</h1>
            <p class="page-subtitle">Jadilah bagian dari gerakan pemuda Indonesia yang berkontribusi untuk kemajuan bangsa</p>
        </div>
    </section>

    <!-- Intro -->
    <section class="section bg-secondary">
        <div class="container text-center">
            <div class="volunteer-intro">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="intro-icon"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <h2>Apa itu Relawan FIM?</h2>
                <p>Relawan FIM adalah individu yang dengan sukarela mendedikasikan waktu dan 
                tenaganya untuk membantu kegiatan FIM, baik di tingkat regional maupun nasional. 
                Menjadi relawan adalah langkah awal untuk mengenal dan berkontribusi dalam 
                ekosistem FIM sebelum atau tanpa mengikuti program kaderisasi.</p>
            </div>
        </div>
    </section>

    <!-- About Volunteers -->
    <section class="section">
        <div class="container">
            <h2 class="section-title">Tentang Relawan FIM</h2>

            <div class="volunteer-info-grid">
                <?php foreach ($volunteer_info as $info): ?>
                <div class="card volunteer-card">
                    <div class="card-icon bg-primary-light">
                        <?php echo fim_get_icon($info['icon']); ?>
                    </div>
                    <h3><?php echo esc_html($info['title']); ?></h3>
                    <p><?php echo esc_html($info['description']); ?></p>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- How to Join -->
    <section class="section bg-secondary">
        <div class="container">
            <h2 class="section-title">Cara Bergabung</h2>
            <p class="section-subtitle">Ada dua jalur utama untuk menjadi relawan FIM</p>

            <div class="join-steps-grid">
                <?php foreach ($join_steps as $step): ?>
                <div class="card join-step-card">
                    <div class="step-number"><?php echo esc_html($step['step']); ?></div>
                    <div class="step-content">
                        <h3><?php echo esc_html($step['title']); ?></h3>
                        <p><?php echo esc_html($step['description']); ?></p>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Benefits -->
    <section class="section">
        <div class="container">
            <div class="benefits-grid">
                <div class="benefits-content">
                    <h2>Manfaat Menjadi Relawan</h2>
                    <p>Bergabung sebagai relawan FIM tidak hanya memberikan pengalaman berharga, 
                    tetapi juga membuka pintu untuk berbagai kesempatan pengembangan diri.</p>

                    <ul class="benefits-list">
                        <?php foreach ($benefits as $benefit): ?>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                            <?php echo esc_html($benefit); ?>
                        </li>
                        <?php endforeach; ?>
                    </ul>
                </div>

                <div class="benefits-stats">
                    <div class="stats-highlight">
                        <div class="big-number">500+</div>
                        <p>Relawan aktif di seluruh Indonesia</p>
                    </div>
                    
                    <div class="stats-mini-grid">
                        <div class="stats-mini">
                            <div class="number">60+</div>
                            <p>Regional</p>
                        </div>
                        <div class="stats-mini">
                            <div class="number">100+</div>
                            <p>Kegiatan/Tahun</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
        <div class="container text-center">
            <h2>Siap Bergabung?</h2>
            <p>Hubungi kami untuk informasi lebih lanjut tentang rekrutmen relawan 
            di regional terdekat atau kegiatan nasional.</p>
            <div class="cta-buttons">
                <a href="https://wa.me/6285213580323?text=Halo,%20saya%20ingin%20bergabung%20menjadi%20relawan%20FIM" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    Hubungi via WhatsApp
                </a>
                <a href="mailto:relawan@forumindonesiamuda.org" class="btn btn-outline-light">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    Email Kami
                </a>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>
