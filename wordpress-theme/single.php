<?php
/**
 * Single Post Template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>

<main id="main" class="site-main">
    <?php while (have_posts()): the_post(); ?>
    
    <!-- Article Header -->
    <article id="post-<?php the_ID(); ?>" <?php post_class('single-post'); ?>>
        <header class="post-header">
            <div class="container">
                <div class="post-meta">
                    <?php 
                    $categories = get_the_category();
                    if ($categories): 
                    ?>
                    <a href="<?php echo esc_url(get_category_link($categories[0]->term_id)); ?>" class="post-category">
                        <?php echo esc_html($categories[0]->name); ?>
                    </a>
                    <?php endif; ?>
                    <span class="post-date"><?php echo get_the_date('d F Y'); ?></span>
                </div>
                
                <h1 class="post-title"><?php the_title(); ?></h1>
                
                <?php if (has_excerpt()): ?>
                <p class="post-excerpt"><?php echo get_the_excerpt(); ?></p>
                <?php endif; ?>

                <div class="post-author">
                    <?php echo get_avatar(get_the_author_meta('ID'), 48); ?>
                    <div>
                        <span class="author-name"><?php the_author(); ?></span>
                        <span class="read-time"><?php echo fim_reading_time(); ?> menit baca</span>
                    </div>
                </div>
            </div>
        </header>

        <?php if (has_post_thumbnail()): ?>
        <div class="post-featured-image">
            <div class="container">
                <?php the_post_thumbnail('fim-hero'); ?>
            </div>
        </div>
        <?php endif; ?>

        <!-- Article Content -->
        <div class="post-content">
            <div class="container container-narrow">
                <?php the_content(); ?>
            </div>
        </div>

        <!-- Tags -->
        <?php 
        $tags = get_the_tags();
        if ($tags): 
        ?>
        <div class="post-tags">
            <div class="container container-narrow">
                <div class="tags-list">
                    <?php foreach ($tags as $tag): ?>
                    <a href="<?php echo esc_url(get_tag_link($tag->term_id)); ?>" class="tag">
                        #<?php echo esc_html($tag->name); ?>
                    </a>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Share -->
        <div class="post-share">
            <div class="container container-narrow">
                <h4>Bagikan artikel ini:</h4>
                <div class="share-buttons">
                    <a href="https://twitter.com/intent/tweet?url=<?php echo urlencode(get_permalink()); ?>&text=<?php echo urlencode(get_the_title()); ?>" target="_blank" rel="noopener noreferrer" class="share-btn twitter">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode(get_permalink()); ?>" target="_blank" rel="noopener noreferrer" class="share-btn facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    <a href="https://wa.me/?text=<?php echo urlencode(get_the_title() . ' - ' . get_permalink()); ?>" target="_blank" rel="noopener noreferrer" class="share-btn whatsapp">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    </a>
                    <button onclick="copyLink()" class="share-btn copy">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Author Box -->
        <div class="author-box">
            <div class="container container-narrow">
                <div class="author-card">
                    <?php echo get_avatar(get_the_author_meta('ID'), 80); ?>
                    <div class="author-info">
                        <h4><?php the_author(); ?></h4>
                        <p><?php the_author_meta('description'); ?></p>
                    </div>
                </div>
            </div>
        </div>
    </article>

    <!-- Related Posts -->
    <?php
    $related = new WP_Query(array(
        'post_type' => 'post',
        'posts_per_page' => 3,
        'post__not_in' => array(get_the_ID()),
        'category__in' => wp_get_post_categories(get_the_ID()),
    ));
    
    if ($related->have_posts()):
    ?>
    <section class="related-posts">
        <div class="container">
            <h3>Artikel Terkait</h3>
            <div class="news-grid">
                <?php while ($related->have_posts()): $related->the_post(); ?>
                <a href="<?php the_permalink(); ?>" class="news-card">
                    <?php if (has_post_thumbnail()): ?>
                    <img src="<?php the_post_thumbnail_url('fim-card'); ?>" alt="<?php the_title_attribute(); ?>" class="news-image">
                    <?php endif; ?>
                    <div class="news-content">
                        <span class="news-date"><?php echo get_the_date('d F Y'); ?></span>
                        <h4 class="news-title"><?php the_title(); ?></h4>
                        <p class="news-excerpt"><?php echo wp_trim_words(get_the_excerpt(), 12); ?></p>
                    </div>
                </a>
                <?php endwhile; wp_reset_postdata(); ?>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <?php endwhile; ?>
</main>

<script>
function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(function() {
        alert('Link berhasil disalin!');
    });
}
</script>

<?php get_footer(); ?>
