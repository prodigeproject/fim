<?php
/**
 * Search Results Template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

$search_query = get_search_query();
$found_posts = $wp_query->found_posts;
?>

<main id="main" class="site-main">
    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <h1 class="page-title">Hasil Pencarian</h1>
            <p class="page-subtitle">
                <?php if ($found_posts > 0): ?>
                Ditemukan <strong><?php echo esc_html($found_posts); ?></strong> hasil untuk "<strong><?php echo esc_html($search_query); ?></strong>"
                <?php else: ?>
                Tidak ada hasil untuk "<strong><?php echo esc_html($search_query); ?></strong>"
                <?php endif; ?>
            </p>
        </div>
    </section>

    <!-- Search Box -->
    <section class="section search-section">
        <div class="container">
            <form role="search" method="get" class="search-form-large" action="<?php echo esc_url(home_url('/')); ?>">
                <div class="search-input-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.3-4.3"/>
                    </svg>
                    <input type="search" class="search-field" placeholder="Cari artikel, program, atau alumni..." value="<?php echo esc_attr($search_query); ?>" name="s">
                </div>
                <button type="submit" class="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.3-4.3"/>
                    </svg>
                    Cari
                </button>
            </form>
        </div>
    </section>

    <!-- Search Results -->
    <section class="section">
        <div class="container">
            <?php if (have_posts()): ?>
            
            <!-- Results Grid -->
            <div class="posts-grid">
                <?php while (have_posts()): the_post(); ?>
                <article <?php post_class('post-card'); ?>>
                    <a href="<?php the_permalink(); ?>" class="post-card-link">
                        <?php if (has_post_thumbnail()): ?>
                        <div class="post-thumbnail">
                            <img src="<?php the_post_thumbnail_url('fim-card'); ?>" alt="<?php the_title_attribute(); ?>" loading="lazy">
                        </div>
                        <?php else: ?>
                        <div class="post-thumbnail post-thumbnail-placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                <circle cx="9" cy="9" r="2"/>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                        </div>
                        <?php endif; ?>
                        
                        <div class="post-content">
                            <!-- Post Type Badge -->
                            <span class="post-type-badge">
                                <?php echo esc_html(get_post_type_object(get_post_type())->labels->singular_name); ?>
                            </span>
                            
                            <!-- Title -->
                            <h2 class="post-title"><?php the_title(); ?></h2>
                            
                            <!-- Excerpt with search term highlighted -->
                            <p class="post-excerpt">
                                <?php
                                $excerpt = wp_trim_words(get_the_excerpt(), 25);
                                echo preg_replace('/(' . preg_quote($search_query, '/') . ')/i', '<mark>$1</mark>', esc_html($excerpt));
                                ?>
                            </p>
                            
                            <!-- Meta -->
                            <div class="post-meta">
                                <span class="post-date">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                                        <line x1="16" x2="16" y1="2" y2="6"/>
                                        <line x1="8" x2="8" y1="2" y2="6"/>
                                        <line x1="3" x2="21" y1="10" y2="10"/>
                                    </svg>
                                    <?php echo get_the_date('d M Y'); ?>
                                </span>
                            </div>
                        </div>
                    </a>
                </article>
                <?php endwhile; ?>
            </div>

            <!-- Pagination -->
            <div class="pagination">
                <?php
                echo paginate_links(array(
                    'prev_text' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Sebelumnya',
                    'next_text' => 'Selanjutnya <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>',
                    'type' => 'list',
                    'end_size' => 1,
                    'mid_size' => 2,
                ));
                ?>
            </div>

            <?php else: ?>
            
            <!-- No Results Found -->
            <div class="no-posts">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                    <path d="M8 8l6 6M8 14l6-6"/>
                </svg>
                <h2>Tidak Ada Hasil</h2>
                <p>Maaf, tidak ada konten yang cocok dengan pencarian Anda. Coba kata kunci lain atau telusuri halaman-halaman berikut:</p>
                
                <!-- Quick Links -->
                <div class="quick-links">
                    <a href="<?php echo esc_url(home_url('/blog')); ?>" class="quick-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                        </svg>
                        Blog
                    </a>
                    <a href="<?php echo esc_url(home_url('/program/pelatihan')); ?>" class="quick-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                        Pelatihan FIM
                    </a>
                    <a href="<?php echo esc_url(home_url('/cerita-alumni')); ?>" class="quick-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        Cerita Alumni
                    </a>
                    <a href="<?php echo esc_url(home_url('/faq')); ?>" class="quick-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <path d="M12 17h.01"/>
                        </svg>
                        FAQ
                    </a>
                </div>
            </div>

            <?php endif; ?>
        </div>
    </section>
</main>

<?php get_footer(); ?>
