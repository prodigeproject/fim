<?php
/**
 * Template Name: Alumni Stories Page
 * Template Post Type: page
 * 
 * Alumni stories listing page template for FIM Theme
 *
 * @package FIM_Theme
 */

get_header();

// Get sector filter
$selected_sector = isset($_GET['sector']) ? sanitize_text_field($_GET['sector']) : '';

// Get all unique sectors from alumni stories
$all_stories = get_posts(array(
    'post_type' => 'alumni_story',
    'posts_per_page' => -1,
    'post_status' => 'publish',
));

$sectors = array();
foreach ($all_stories as $story) {
    $sector = get_field('sector', $story->ID);
    if ($sector && !in_array($sector, $sectors)) {
        $sectors[] = $sector;
    }
}
sort($sectors);

// Get alumni stories with filter
$args = array(
    'post_type' => 'alumni_story',
    'posts_per_page' => -1,
    'post_status' => 'publish',
    'orderby' => 'menu_order',
    'order' => 'ASC',
);

if ($selected_sector) {
    $args['meta_query'] = array(
        array(
            'key' => 'sector',
            'value' => $selected_sector,
            'compare' => '=',
        ),
    );
}

$alumni_query = new WP_Query($args);

// Video testimonials (can be managed via ACF Repeater on this page)
$video_testimonials = get_field('video_testimonials');
?>

<main class="fim-alumni-page">
    <!-- Hero Section -->
    <section class="fim-hero">
        <div class="fim-container">
            <h1 class="fim-hero-title">Cerita Alumni</h1>
            <p class="fim-hero-subtitle">Kisah inspiratif dari ribuan alumni FIM yang telah berkontribusi di berbagai sektor untuk kemajuan Indonesia</p>
        </div>
    </section>

    <!-- Quote Section -->
    <section class="fim-quote-section">
        <div class="fim-container">
            <div class="fim-quote-box">
                <svg class="fim-quote-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z"/>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                </svg>
                <blockquote>"Setiap alumni FIM adalah kunang-kunang yang menerangi sudut Indonesia dengan caranya masing-masing."</blockquote>
                <p class="fim-quote-author">— Filosofi Alumni FIM</p>
            </div>
        </div>
    </section>

    <!-- Video Testimonials -->
    <?php if ($video_testimonials) : ?>
    <section class="fim-video-section">
        <div class="fim-container">
            <h2>Video Testimoni Alumni</h2>
            <p class="fim-section-subtitle">Dengarkan langsung cerita inspiratif dari alumni FIM</p>
            
            <div class="fim-video-grid">
                <?php foreach ($video_testimonials as $video) : ?>
                    <div class="fim-video-card" data-video-id="<?php echo esc_attr($video['youtube_id']); ?>">
                        <div class="fim-video-thumbnail">
                            <img src="<?php echo esc_url($video['thumbnail']['url']); ?>" alt="<?php echo esc_attr($video['title']); ?>">
                            <div class="fim-video-overlay">
                                <div class="fim-play-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="5 3 19 12 5 21 5 3"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="fim-video-info">
                            <h3><?php echo esc_html($video['title']); ?></h3>
                            <p><?php echo esc_html($video['speaker']); ?></p>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <!-- Stories Section -->
    <section class="fim-stories-section">
        <div class="fim-container">
            <h2>Kisah Mereka, Inspirasi Kita</h2>
            <p class="fim-section-subtitle">Dari Sabang sampai Merauke, alumni FIM telah memberikan dampak nyata di berbagai bidang.</p>

            <!-- Sector Filter -->
            <div class="fim-sector-filter">
                <a href="<?php echo esc_url(get_permalink()); ?>" 
                   class="fim-sector-btn <?php echo empty($selected_sector) ? 'active' : ''; ?>">
                    Semua
                </a>
                <?php foreach ($sectors as $sector) : ?>
                    <a href="<?php echo esc_url(add_query_arg('sector', $sector, get_permalink())); ?>" 
                       class="fim-sector-btn <?php echo $selected_sector === $sector ? 'active' : ''; ?>">
                        <?php echo esc_html($sector); ?>
                    </a>
                <?php endforeach; ?>
            </div>

            <!-- Stories Grid -->
            <?php if ($alumni_query->have_posts()) : ?>
                <div class="fim-stories-grid">
                    <?php while ($alumni_query->have_posts()) : $alumni_query->the_post(); 
                        $name = get_field('alumni_name') ?: get_the_title();
                        $batch = get_field('batch');
                        $sector = get_field('sector');
                        $position = get_field('position');
                        $company = get_field('company');
                        $quote = get_field('quote');
                        $impact = get_field('impact');
                    ?>
                        <article class="fim-story-card">
                            <div class="fim-story-header">
                                <div class="fim-story-avatar">
                                    <?php if (has_post_thumbnail()) : ?>
                                        <?php the_post_thumbnail('thumbnail'); ?>
                                    <?php else : ?>
                                        <span class="fim-avatar-initials">
                                            <?php 
                                            $words = explode(' ', $name);
                                            echo strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : '')); 
                                            ?>
                                        </span>
                                    <?php endif; ?>
                                </div>
                                <div class="fim-story-info">
                                    <h3><?php echo esc_html($name); ?></h3>
                                    <p class="fim-story-batch"><?php echo esc_html($batch); ?></p>
                                    <p class="fim-story-position"><?php echo esc_html($position); ?></p>
                                    <p class="fim-story-company"><?php echo esc_html($company); ?></p>
                                </div>
                                <div class="fim-story-sector-icon">
                                    <?php echo fim_get_sector_icon($sector); ?>
                                </div>
                            </div>
                            
                            <?php if ($quote) : ?>
                                <blockquote class="fim-story-quote">"<?php echo esc_html($quote); ?>"</blockquote>
                            <?php endif; ?>
                            
                            <?php if ($impact) : ?>
                                <div class="fim-story-impact">
                                    <span class="fim-impact-label">Dampak:</span>
                                    <span class="fim-impact-value"><?php echo esc_html($impact); ?></span>
                                </div>
                            <?php endif; ?>
                        </article>
                    <?php endwhile; ?>
                </div>
            <?php else : ?>
                <div class="fim-no-stories">
                    <p>Tidak ada cerita di sektor ini.</p>
                </div>
            <?php endif; ?>
            
            <?php wp_reset_postdata(); ?>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="fim-cta-section">
        <div class="fim-container">
            <h3>Punya Cerita untuk Dibagikan?</h3>
            <p>Jika Anda alumni FIM dan ingin berbagi cerita perjalanan Anda, hubungi kami.</p>
            <div class="fim-cta-buttons">
                <a href="mailto:alumni@forumindonesiamuda.org" class="fim-btn-primary">
                    Kirim Cerita Anda
                </a>
            </div>
        </div>
    </section>
</main>

<!-- Video Modal -->
<div class="fim-video-modal" id="videoModal">
    <div class="fim-modal-content">
        <button class="fim-modal-close" onclick="closeVideoModal()">×</button>
        <div class="fim-modal-video">
            <iframe id="videoFrame" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    </div>
</div>

<script>
document.querySelectorAll('.fim-video-card').forEach(function(card) {
    card.addEventListener('click', function() {
        var videoId = this.getAttribute('data-video-id');
        document.getElementById('videoFrame').src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
        document.getElementById('videoModal').classList.add('active');
    });
});

function closeVideoModal() {
    document.getElementById('videoFrame').src = '';
    document.getElementById('videoModal').classList.remove('active');
}

document.getElementById('videoModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeVideoModal();
    }
});
</script>

<?php get_footer(); ?>
