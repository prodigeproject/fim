<?php
/**
 * 404 Page Template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>

<main id="main" class="site-main">
    <section class="error-404">
        <div class="container">
            <div class="error-content">
                <!-- Error Icon -->
                <div class="error-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v.01"/>
                        <path d="M12 8v4"/>
                    </svg>
                </div>

                <!-- Error Number -->
                <h1 class="error-number">404</h1>
                
                <!-- Error Title -->
                <h2 class="error-title">Halaman Tidak Ditemukan</h2>
                
                <!-- Error Description -->
                <p class="error-description">
                    Maaf, halaman yang Anda cari tidak dapat ditemukan. 
                    Mungkin halaman telah dipindahkan atau URL yang Anda masukkan salah.
                </p>

                <!-- Search Form -->
                <div class="error-search">
                    <form role="search" method="get" class="search-form" action="<?php echo esc_url(home_url('/')); ?>">
                        <div class="search-input-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.3-4.3"/>
                            </svg>
                            <input type="search" class="search-field" placeholder="Cari artikel, program, atau alumni..." value="<?php echo get_search_query(); ?>" name="s">
                        </div>
                        <button type="submit" class="btn btn-primary search-submit">Cari</button>
                    </form>
                </div>

                <!-- Action Buttons -->
                <div class="error-buttons">
                    <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        Kembali ke Beranda
                    </a>
                    <a href="<?php echo esc_url(home_url('/blog')); ?>" class="btn btn-outline">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                        </svg>
                        Baca Blog
                    </a>
                </div>

                <!-- Quick Links -->
                <div class="error-links">
                    <h3>Atau kunjungi halaman populer:</h3>
                    <ul>
                        <li><a href="<?php echo esc_url(home_url('/tentang')); ?>">Tentang FIM</a></li>
                        <li><a href="<?php echo esc_url(home_url('/program/pelatihan')); ?>">Program Pelatihan</a></li>
                        <li><a href="<?php echo esc_url(home_url('/cerita-alumni')); ?>">Cerita Alumni</a></li>
                        <li><a href="<?php echo esc_url(home_url('/faq')); ?>">FAQ</a></li>
                        <li><a href="<?php echo esc_url(home_url('/gabung-relawan')); ?>">Gabung Relawan</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>
