<?php
/**
 * Header Template
 * Forum Indonesia Muda WordPress Theme
 *
 * @package FIM_Theme
 * @version 2.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Get site settings
$site_logo = get_theme_mod('custom_logo');
$logo_url = $site_logo ? wp_get_attachment_image_url($site_logo, 'full') : get_template_directory_uri() . '/assets/images/logo-fim.png';
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php bloginfo('description'); ?>">
    <meta name="theme-color" content="#E60012">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    
    <!-- Preconnect to Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="<?php echo get_template_directory_uri(); ?>/assets/images/favicon.png">
    
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<!-- Scroll Progress Bar -->
<div class="fim-scroll-progress"></div>

<div id="page" class="site">
    <!-- Navigation -->
    <nav class="fim-navbar">
        <div class="fim-container">
            <div class="fim-navbar-inner">
                <!-- Logo -->
                <a href="<?php echo esc_url(home_url('/')); ?>" class="fim-logo">
                    <img src="<?php echo esc_url($logo_url); ?>" alt="<?php bloginfo('name'); ?>">
                    <span class="fim-logo-text"><?php bloginfo('name'); ?></span>
                </a>

                <!-- Desktop Navigation -->
                <div class="fim-nav-desktop">
                    <!-- Beranda -->
                    <a href="<?php echo esc_url(home_url('/')); ?>" class="fim-nav-link <?php echo is_front_page() ? 'active' : ''; ?>">
                        Beranda
                    </a>

                    <!-- Tentang Dropdown -->
                    <div class="fim-dropdown">
                        <button class="fim-nav-link fim-dropdown-trigger <?php echo is_page(array('tentang', 'regional', 'fim-club')) ? 'active' : ''; ?>">
                            Tentang
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m6 9 6 6 6-6"/>
                            </svg>
                        </button>
                        <div class="fim-dropdown-menu">
                            <a href="<?php echo esc_url(home_url('/tentang')); ?>" class="fim-dropdown-item">Tentang FIM</a>
                            <a href="<?php echo esc_url(home_url('/tentang/regional')); ?>" class="fim-dropdown-item">Regional FIM</a>
                            <a href="<?php echo esc_url(home_url('/tentang/fim-club')); ?>" class="fim-dropdown-item">FIM Club</a>
                        </div>
                    </div>

                    <!-- Program Dropdown -->
                    <div class="fim-dropdown">
                        <button class="fim-nav-link fim-dropdown-trigger <?php echo is_page(array('pelatihan', 'program-unggulan')) ? 'active' : ''; ?>">
                            Program
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m6 9 6 6 6-6"/>
                            </svg>
                        </button>
                        <div class="fim-dropdown-menu">
                            <a href="<?php echo esc_url(home_url('/program/pelatihan')); ?>" class="fim-dropdown-item">Pelatihan FIM</a>
                            <a href="<?php echo esc_url(home_url('/program/program-unggulan')); ?>" class="fim-dropdown-item">Program Unggulan</a>
                        </div>
                    </div>

                    <!-- Other Links -->
                    <a href="<?php echo esc_url(home_url('/cerita-alumni')); ?>" class="fim-nav-link <?php echo is_page('cerita-alumni') ? 'active' : ''; ?>">
                        Cerita Alumni
                    </a>
                    <a href="<?php echo esc_url(home_url('/blog')); ?>" class="fim-nav-link <?php echo is_page('blog') || is_single() ? 'active' : ''; ?>">
                        Blog
                    </a>
                    <a href="<?php echo esc_url(home_url('/faq')); ?>" class="fim-nav-link <?php echo is_page('faq') ? 'active' : ''; ?>">
                        FAQ
                    </a>
                    <a href="<?php echo esc_url(home_url('/gabung-relawan')); ?>" class="fim-nav-link <?php echo is_page('gabung-relawan') ? 'active' : ''; ?>">
                        Gabung Relawan
                    </a>
                </div>

                <!-- CTA Buttons -->
                <div class="fim-nav-actions">
                    <!-- Search Toggle -->
                    <button class="fim-search-toggle fim-btn fim-btn-ghost fim-btn-icon" aria-label="Cari">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.3-4.3"/>
                        </svg>
                    </button>

                    <!-- Donasi Button -->
                    <a href="<?php echo esc_url(home_url('/donasi')); ?>" class="fim-btn fim-btn-primary fim-nav-cta">
                        Donasi
                    </a>

                    <!-- Mobile Menu Toggle -->
                    <button class="fim-nav-toggle" aria-label="Toggle menu" aria-expanded="false">
                        <span></span>
                    </button>
                </div>
            </div>

            <!-- Search Form -->
            <div class="fim-search-form" data-target=".fim-card">
                <form role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>">
                    <svg class="fim-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.3-4.3"/>
                    </svg>
                    <input type="search" class="fim-search-input" name="s" placeholder="Cari artikel, program, atau alumni..." value="<?php echo get_search_query(); ?>">
                </form>
            </div>
        </div>

        <!-- Mobile Navigation -->
        <div class="fim-nav-mobile">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="fim-nav-link <?php echo is_front_page() ? 'active' : ''; ?>">
                Beranda
            </a>

            <!-- Tentang Dropdown Mobile -->
            <div class="fim-dropdown">
                <button class="fim-nav-link fim-dropdown-trigger">
                    Tentang
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
                <div class="fim-dropdown-menu">
                    <a href="<?php echo esc_url(home_url('/tentang')); ?>" class="fim-dropdown-item">Tentang FIM</a>
                    <a href="<?php echo esc_url(home_url('/tentang/regional')); ?>" class="fim-dropdown-item">Regional FIM</a>
                    <a href="<?php echo esc_url(home_url('/tentang/fim-club')); ?>" class="fim-dropdown-item">FIM Club</a>
                </div>
            </div>

            <!-- Program Dropdown Mobile -->
            <div class="fim-dropdown">
                <button class="fim-nav-link fim-dropdown-trigger">
                    Program
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
                <div class="fim-dropdown-menu">
                    <a href="<?php echo esc_url(home_url('/program/pelatihan')); ?>" class="fim-dropdown-item">Pelatihan FIM</a>
                    <a href="<?php echo esc_url(home_url('/program/program-unggulan')); ?>" class="fim-dropdown-item">Program Unggulan</a>
                </div>
            </div>

            <a href="<?php echo esc_url(home_url('/cerita-alumni')); ?>" class="fim-nav-link">Cerita Alumni</a>
            <a href="<?php echo esc_url(home_url('/blog')); ?>" class="fim-nav-link">Blog</a>
            <a href="<?php echo esc_url(home_url('/faq')); ?>" class="fim-nav-link">FAQ</a>
            <a href="<?php echo esc_url(home_url('/gabung-relawan')); ?>" class="fim-nav-link">Gabung Relawan</a>

            <div class="fim-nav-mobile-cta">
                <a href="<?php echo esc_url(home_url('/donasi')); ?>" class="fim-btn fim-btn-primary" style="width: 100%;">
                    Donasi
                </a>
            </div>
        </div>
    </nav>

    <main id="content" class="site-content">
