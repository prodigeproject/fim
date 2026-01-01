<?php
/**
 * Front Page Template (Homepage)
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

// Stats
$stats = array(
    array('icon' => 'calendar', 'value' => '2003', 'label' => 'Berdiri Sejak'),
    array('icon' => 'users', 'value' => '> 34', 'label' => 'Angkatan'),
    array('icon' => 'map-pin', 'value' => '61', 'label' => 'Regional'),
    array('icon' => 'award', 'value' => '4000+', 'label' => 'Alumni'),
);

// 7 Pilar Karakter
$pilar_karakter = array(
    array('icon' => 'heart', 'name' => 'Cinta Kasih', 'desc' => 'Mencintai sesama dan berbagi kebaikan'),
    array('icon' => 'shield', 'name' => 'Integritas', 'desc' => 'Konsisten dalam nilai dan tindakan'),
    array('icon' => 'star', 'name' => 'Kebersahajaan', 'desc' => 'Sederhana namun bermakna'),
    array('icon' => 'target', 'name' => 'Totalitas', 'desc' => 'Memberikan yang terbaik dalam segala hal'),
    array('icon' => 'handshake', 'name' => 'Solidaritas', 'desc' => 'Bersatu dan saling mendukung'),
    array('icon' => 'scale', 'name' => 'Keadilan', 'desc' => 'Menegakkan kebenaran dan kesetaraan'),
    array('icon' => 'user-check', 'name' => 'Keteladanan', 'desc' => 'Menjadi contoh yang baik bagi sesama'),
);

// 7 Pilar Kepemimpinan
$pilar_kepemimpinan = array(
    array('icon' => 'users', 'name' => 'Mengenal Diri', 'desc' => 'Memahami kekuatan dan kelemahan diri'),
    array('icon' => 'message-square', 'name' => 'Komunikasi', 'desc' => 'Menyampaikan pesan dengan efektif'),
    array('icon' => 'heart', 'name' => 'Akhlak', 'desc' => 'Berperilaku mulia dalam setiap tindakan'),
    array('icon' => 'book-open', 'name' => 'Kekuatan Belajar', 'desc' => 'Terus mengembangkan ilmu dan wawasan'),
    array('icon' => 'brain', 'name' => 'Proses Pengambilan Keputusan', 'desc' => 'Membuat keputusan yang bijak'),
    array('icon' => 'clipboard', 'name' => 'Manajerial', 'desc' => 'Mengelola sumber daya dengan efisien'),
    array('icon' => 'network', 'name' => 'Pengorganisasian', 'desc' => 'Membangun tim dan sistem yang solid'),
);

// Get latest posts for Kabar Terkini
$latest_posts = new WP_Query(array(
    'post_type' => 'post',
    'posts_per_page' => 3,
    'post_status' => 'publish',
));

// Get partners
$partners = new WP_Query(array(
    'post_type' => 'partner',
    'posts_per_page' => 30,
    'post_status' => 'publish',
));
?>

<main id="main" class="site-main">
    <!-- Hero Section -->
    <section class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
        </div>
        <div class="container hero-content">
            <?php 
            $logo = get_template_directory_uri() . '/assets/images/logo-fim.png';
            if (has_custom_logo()) {
                $logo_id = get_theme_mod('custom_logo');
                $logo = wp_get_attachment_image_url($logo_id, 'full');
            }
            ?>
            <img src="<?php echo esc_url($logo); ?>" alt="<?php bloginfo('name'); ?>" class="hero-logo">
            <h1 class="hero-title">Forum Indonesia Muda</h1>
            <p class="hero-subtitle">
                Wadah bagi pemuda Indonesia untuk bertumbuh, berkolaborasi, dan menjadi 
                <span class="highlight">cahaya kunang-kunang</span> yang menerangi masa depan bangsa.
            </p>
            <div class="hero-buttons">
                <a href="<?php echo esc_url(home_url('/pelatihan')); ?>" class="btn btn-accent">
                    Bergabung Sekarang
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a href="<?php echo esc_url(home_url('/tentang')); ?>" class="btn btn-outline-light">
                    Pelajari Lebih Lanjut
                </a>
            </div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
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

    <!-- Kunang-kunang Quote -->
    <section class="quote-section">
        <div class="container">
            <div class="quote-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="quote-icon"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                <blockquote>
                    "Seperti kunang-kunang yang kecil namun mampu menerangi kegelapan, setiap pemuda Indonesia memiliki cahaya yang dapat menerangi jalan bagi sesama dan bangsa."
                </blockquote>
                <div class="quote-divider"></div>
            </div>
        </div>
    </section>

    <!-- 7 Pilar Section -->
    <section class="pilar-section bg-secondary">
        <div class="container">
            <div class="pilar-grid">
                <!-- 7 Pilar Karakter -->
                <div class="pilar-column">
                    <h2 class="pilar-title">7 Pilar Karakter FIM</h2>
                    <p class="pilar-subtitle">Fondasi karakter yang ditanamkan kepada setiap kader FIM</p>
                    <div class="pilar-list">
                        <?php foreach ($pilar_karakter as $pilar): ?>
                        <div class="pilar-item">
                            <div class="pilar-icon bg-primary-light">
                                <?php echo fim_get_icon($pilar['icon']); ?>
                            </div>
                            <div class="pilar-content">
                                <h3><?php echo esc_html($pilar['name']); ?></h3>
                                <p><?php echo esc_html($pilar['desc']); ?></p>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- 7 Pilar Kepemimpinan -->
                <div class="pilar-column">
                    <h2 class="pilar-title">7 Pilar Kepemimpinan FIM</h2>
                    <p class="pilar-subtitle">Prinsip kepemimpinan yang menjadi panduan alumni FIM</p>
                    <div class="pilar-list">
                        <?php foreach ($pilar_kepemimpinan as $pilar): ?>
                        <div class="pilar-item">
                            <div class="pilar-icon bg-supporting-light">
                                <?php echo fim_get_icon($pilar['icon']); ?>
                            </div>
                            <div class="pilar-content">
                                <h3><?php echo esc_html($pilar['name']); ?></h3>
                                <p><?php echo esc_html($pilar['desc']); ?></p>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Kabar Terkini Section -->
    <section class="news-section">
        <div class="container">
            <h2 class="section-title">Kabar Terkini</h2>
            <p class="section-subtitle">Berita dan informasi terbaru dari Forum Indonesia Muda</p>
            
            <div class="news-grid">
                <?php if ($latest_posts->have_posts()): ?>
                    <?php while ($latest_posts->have_posts()): $latest_posts->the_post(); ?>
                    <a href="<?php the_permalink(); ?>" class="news-card">
                        <?php if (has_post_thumbnail()): ?>
                        <img src="<?php the_post_thumbnail_url('fim-card'); ?>" alt="<?php the_title_attribute(); ?>" class="news-image">
                        <?php else: ?>
                        <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=250&fit=crop" alt="<?php the_title_attribute(); ?>" class="news-image">
                        <?php endif; ?>
                        <div class="news-content">
                            <span class="news-date"><?php echo get_the_date('d F Y'); ?></span>
                            <h3 class="news-title"><?php the_title(); ?></h3>
                            <p class="news-excerpt"><?php echo wp_trim_words(get_the_excerpt(), 15); ?></p>
                        </div>
                    </a>
                    <?php endwhile; wp_reset_postdata(); ?>
                <?php else: ?>
                    <!-- Placeholder news -->
                    <?php
                    $placeholder_news = array(
                        array('title' => 'FIM Batch 34 Sukses Dilaksanakan', 'excerpt' => 'Lebih dari 200 peserta dari seluruh Indonesia mengikuti program kaderisasi FIM angkatan ke-34.', 'date' => '20 Desember 2025'),
                        array('title' => 'Kolaborasi FIM dengan Nalar Institute', 'excerpt' => 'FIM menjalin kerjasama dengan Nalar Institute untuk pelatihan kebijakan publik.', 'date' => '15 Desember 2025'),
                        array('title' => 'Alumni FIM Raih Penghargaan Nasional', 'excerpt' => 'Beberapa alumni FIM mendapatkan penghargaan dari berbagai lembaga atas kontribusinya.', 'date' => '10 Desember 2025'),
                    );
                    foreach ($placeholder_news as $news):
                    ?>
                    <div class="news-card">
                        <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=250&fit=crop" alt="<?php echo esc_attr($news['title']); ?>" class="news-image">
                        <div class="news-content">
                            <span class="news-date"><?php echo esc_html($news['date']); ?></span>
                            <h3 class="news-title"><?php echo esc_html($news['title']); ?></h3>
                            <p class="news-excerpt"><?php echo esc_html($news['excerpt']); ?></p>
                        </div>
                    </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <div class="section-cta">
                <a href="<?php echo esc_url(home_url('/blog')); ?>" class="btn btn-outline">
                    Lihat Semua Berita
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
            </div>
        </div>
    </section>

    <!-- Partners Section -->
    <section class="partners-section bg-secondary">
        <div class="container">
            <h2 class="section-title">Mitra Kami</h2>
            <p class="section-subtitle">Kolaborator yang telah bekerjasama dengan FIM</p>
            
            <div class="partners-grid">
                <?php if ($partners->have_posts()): ?>
                    <?php while ($partners->have_posts()): $partners->the_post(); ?>
                    <div class="partner-logo">
                        <?php if (has_post_thumbnail()): ?>
                        <img src="<?php the_post_thumbnail_url('thumbnail'); ?>" alt="<?php the_title_attribute(); ?>">
                        <?php endif; ?>
                    </div>
                    <?php endwhile; wp_reset_postdata(); ?>
                <?php else: ?>
                    <!-- Placeholder partners -->
                    <?php for ($i = 1; $i <= 10; $i++): ?>
                    <div class="partner-logo">
                        <div style="width: 100px; height: 50px; background: var(--muted); border-radius: 8px;"></div>
                    </div>
                    <?php endfor; ?>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="container">
            <h2 class="cta-title">Siap Menjadi Bagian dari Perubahan?</h2>
            <p class="cta-subtitle">Bergabunglah dengan ribuan pemuda Indonesia dalam membangun masa depan yang lebih baik.</p>
            <div class="cta-buttons">
                <a href="<?php echo esc_url(home_url('/pelatihan')); ?>" class="btn btn-accent">
                    Daftar Sekarang
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a href="<?php echo esc_url(home_url('/donasi')); ?>" class="btn btn-outline-light">
                    Dukung FIM
                </a>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>
