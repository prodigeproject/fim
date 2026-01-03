<?php
/**
 * Archive Template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

// Get archive title and description
$archive_title = '';
$archive_description = '';

if (is_category()) {
    $archive_title = single_cat_title('', false);
    $archive_description = category_description();
} elseif (is_tag()) {
    $archive_title = single_tag_title('', false);
    $archive_description = tag_description();
} elseif (is_author()) {
    $archive_title = get_the_author();
    $archive_description = get_the_author_meta('description');
} elseif (is_date()) {
    if (is_day()) {
        $archive_title = get_the_date();
    } elseif (is_month()) {
        $archive_title = get_the_date('F Y');
    } elseif (is_year()) {
        $archive_title = get_the_date('Y');
    }
} elseif (is_post_type_archive()) {
    $archive_title = post_type_archive_title('', false);
    $post_type = get_queried_object();
    if ($post_type && isset($post_type->description)) {
        $archive_description = $post_type->description;
    }
} else {
    $archive_title = 'Arsip';
}
?>

<main id="main" class="site-main">
    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <h1 class="page-title"><?php echo esc_html($archive_title); ?></h1>
            <?php if ($archive_description): ?>
            <p class="page-subtitle"><?php echo wp_kses_post($archive_description); ?></p>
            <?php endif; ?>
        </div>
    </section>

    <!-- Archive Content -->
    <section class="section">
        <div class="container">
            <?php if (have_posts()): ?>
            
            <!-- Posts Grid -->
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
                            <!-- Categories -->
                            <?php
                            $categories = get_the_category();
                            if (!empty($categories)):
                            ?>
                            <span class="post-category"><?php echo esc_html($categories[0]->name); ?></span>
                            <?php endif; ?>
                            
                            <!-- Title -->
                            <h2 class="post-title"><?php the_title(); ?></h2>
                            
                            <!-- Excerpt -->
                            <p class="post-excerpt"><?php echo wp_trim_words(get_the_excerpt(), 20); ?></p>
                            
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
                                <span class="post-reading-time">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    <?php echo fim_reading_time(); ?> menit baca
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
            
            <!-- No Posts Found -->
            <div class="no-posts">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                    <path d="M9 10h6"/>
                    <path d="M9 14h6"/>
                </svg>
                <h2>Tidak Ada Artikel</h2>
                <p>Belum ada artikel yang diterbitkan untuk arsip ini.</p>
                <a href="<?php echo esc_url(home_url('/blog')); ?>" class="btn btn-primary">Lihat Semua Artikel</a>
            </div>

            <?php endif; ?>
        </div>
    </section>
</main>

<?php get_footer(); ?>
