<?php
/**
 * Default Page Template
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
    
    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <h1 class="page-title"><?php the_title(); ?></h1>
            <?php if (has_excerpt()): ?>
            <p class="page-subtitle"><?php the_excerpt(); ?></p>
            <?php endif; ?>
        </div>
    </section>

    <!-- Page Content -->
    <section class="section">
        <div class="container">
            <article <?php post_class('page-content'); ?>>
                <?php if (has_post_thumbnail()): ?>
                <div class="page-featured-image">
                    <?php the_post_thumbnail('fim-hero'); ?>
                </div>
                <?php endif; ?>
                
                <div class="page-body">
                    <?php the_content(); ?>
                </div>

                <?php
                // If comments are open or we have at least one comment, load up the comment template.
                if (comments_open() || get_comments_number()):
                    comments_template();
                endif;
                ?>
            </article>
        </div>
    </section>

    <?php endwhile; ?>
</main>

<?php get_footer(); ?>
