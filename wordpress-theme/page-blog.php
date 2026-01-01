<?php
/**
 * Template Name: Blog Page
 * Template Post Type: page
 * 
 * Blog listing page template for FIM Theme
 *
 * @package FIM_Theme
 */

get_header();

// Get categories
$categories = get_categories(array(
    'hide_empty' => true,
    'orderby' => 'name',
    'order' => 'ASC',
));

// Get posts with pagination
$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
$category_filter = isset($_GET['category']) ? sanitize_text_field($_GET['category']) : '';

$args = array(
    'post_type' => 'post',
    'posts_per_page' => 12,
    'paged' => $paged,
    'post_status' => 'publish',
);

if ($category_filter) {
    $args['category_name'] = $category_filter;
}

$blog_query = new WP_Query($args);
?>

<main class="fim-blog-page">
    <!-- Hero Section -->
    <section class="fim-hero">
        <div class="fim-container">
            <h1 class="fim-hero-title">Blog & Berita FIM</h1>
            <p class="fim-hero-subtitle">Informasi terbaru seputar kegiatan, prestasi, dan inspirasi dari Forum Indonesia Muda</p>
        </div>
    </section>

    <!-- Blog Content -->
    <section class="fim-blog-content">
        <div class="fim-container">
            
            <!-- Category Filter -->
            <div class="fim-category-filter">
                <a href="<?php echo esc_url(get_permalink()); ?>" 
                   class="fim-category-btn <?php echo empty($category_filter) ? 'active' : ''; ?>">
                    Semua
                </a>
                <?php foreach ($categories as $category) : ?>
                    <a href="<?php echo esc_url(add_query_arg('category', $category->slug, get_permalink())); ?>" 
                       class="fim-category-btn <?php echo $category_filter === $category->slug ? 'active' : ''; ?>">
                        <?php echo esc_html($category->name); ?>
                    </a>
                <?php endforeach; ?>
            </div>

            <?php if ($category_filter) : ?>
                <div class="fim-filter-indicator">
                    <p>Menampilkan hasil untuk: <strong><?php echo esc_html($category_filter); ?></strong>
                        <a href="<?php echo esc_url(get_permalink()); ?>">Hapus filter</a>
                    </p>
                </div>
            <?php endif; ?>

            <!-- Posts Grid -->
            <?php if ($blog_query->have_posts()) : ?>
                <div class="fim-blog-grid">
                    <?php while ($blog_query->have_posts()) : $blog_query->the_post(); ?>
                        <article class="fim-blog-card">
                            <div class="fim-blog-card-image">
                                <?php if (has_post_thumbnail()) : ?>
                                    <?php the_post_thumbnail('medium_large'); ?>
                                <?php else : ?>
                                    <span class="fim-blog-placeholder">📰</span>
                                <?php endif; ?>
                            </div>
                            <div class="fim-blog-card-content">
                                <?php 
                                $post_categories = get_the_category();
                                if (!empty($post_categories)) : 
                                ?>
                                    <span class="fim-blog-category">
                                        <?php echo esc_html($post_categories[0]->name); ?>
                                    </span>
                                <?php endif; ?>
                                
                                <h2 class="fim-blog-title">
                                    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                                </h2>
                                
                                <p class="fim-blog-excerpt"><?php echo wp_trim_words(get_the_excerpt(), 20); ?></p>
                                
                                <div class="fim-blog-meta">
                                    <span class="fim-blog-author">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        <?php the_author(); ?>
                                    </span>
                                    <span class="fim-blog-date">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6"/>
                                            <line x1="8" y1="2" x2="8" y2="6"/>
                                            <line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                        <?php echo get_the_date('d M Y'); ?>
                                    </span>
                                </div>
                                
                                <a href="<?php the_permalink(); ?>" class="fim-blog-readmore">
                                    Baca Selengkapnya
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                        <polyline points="12 5 19 12 12 19"/>
                                    </svg>
                                </a>
                            </div>
                        </article>
                    <?php endwhile; ?>
                </div>

                <!-- Pagination -->
                <div class="fim-pagination">
                    <?php
                    echo paginate_links(array(
                        'total' => $blog_query->max_num_pages,
                        'current' => $paged,
                        'prev_text' => '← Sebelumnya',
                        'next_text' => 'Selanjutnya →',
                    ));
                    ?>
                </div>

                <div class="fim-results-count">
                    <p>Menampilkan <?php echo $blog_query->post_count; ?> dari <?php echo $blog_query->found_posts; ?> artikel</p>
                </div>

            <?php else : ?>
                <div class="fim-no-posts">
                    <p>Tidak ada artikel yang ditemukan.</p>
                    <a href="<?php echo esc_url(get_permalink()); ?>">Lihat semua artikel</a>
                </div>
            <?php endif; ?>
            
            <?php wp_reset_postdata(); ?>
        </div>
    </section>

    <!-- Newsletter CTA -->
    <section class="fim-cta-section">
        <div class="fim-container">
            <h3>Dapatkan Update Terbaru</h3>
            <p>Ikuti media sosial resmi FIM untuk informasi terbaru seputar kegiatan dan pendaftaran.</p>
            <div class="fim-cta-buttons">
                <a href="https://instagram.com/forumindonesiamuda" target="_blank" rel="noopener noreferrer" class="fim-btn-primary">
                    Follow Instagram
                </a>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>
