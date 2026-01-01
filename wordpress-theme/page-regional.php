<?php
/**
 * Template Name: Regional FIM
 * 
 * Regional listing page template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

// Static regional data from React
$regions = array(
    array('name' => 'FIM Denpasar', 'province' => 'Bali', 'island' => 'Bali & Nusa Tenggara', 'instagram' => 'fimdenpasar', 'email' => 'fimdenpasar@forumindonesiamuda.org'),
    array('name' => 'FIM Rote', 'province' => 'Nusa Tenggara Timur', 'island' => 'Bali & Nusa Tenggara', 'instagram' => 'fimrote', 'email' => 'fimrote@forumindonesiamuda.org'),
    array('name' => 'FIM Kupang', 'province' => 'Nusa Tenggara Timur', 'island' => 'Bali & Nusa Tenggara', 'instagram' => '', 'email' => 'fimkupang@forumindonesiamuda.org'),
    array('name' => 'FIM Ambon', 'province' => 'Maluku', 'island' => 'Bali & Nusa Tenggara', 'instagram' => 'fimambon', 'email' => 'fimambon@forumindonesiamuda.org'),
    array('name' => 'FIM Bandung', 'province' => 'Jawa Barat', 'island' => 'Jawa', 'instagram' => 'fimbandung', 'email' => 'fimbandung@forumindonesiamuda.org'),
    array('name' => 'FIM Jakarta', 'province' => 'DKI Jakarta', 'island' => 'Jawa', 'instagram' => 'fimjakarta', 'email' => 'fimjakarta@forumindonesiamuda.org'),
    array('name' => 'FIM Surabaya', 'province' => 'Jawa Timur', 'island' => 'Jawa', 'instagram' => 'fimsurabaya', 'email' => 'fimsurabaya@forumindonesiamuda.org'),
    array('name' => 'FIM Yogyakarta', 'province' => 'DI Yogyakarta', 'island' => 'Jawa', 'instagram' => 'fimyogyakarta', 'email' => 'fimyogyakarta@forumindonesiamuda.org'),
    array('name' => 'FIM Semarang', 'province' => 'Jawa Tengah', 'island' => 'Jawa', 'instagram' => 'fimsemarang', 'email' => 'fimsemarang@forumindonesiamuda.org'),
    array('name' => 'FIM Malang', 'province' => 'Jawa Timur', 'island' => 'Jawa', 'instagram' => 'fimmalang', 'email' => 'fimmalang@forumindonesiamuda.org'),
    array('name' => 'FIM Balikpapan', 'province' => 'Kalimantan Timur', 'island' => 'Kalimantan', 'instagram' => 'fimbalikpapan', 'email' => 'fimbalikpapan@forumindonesiamuda.org'),
    array('name' => 'FIM Pontianak', 'province' => 'Kalimantan Barat', 'island' => 'Kalimantan', 'instagram' => 'fimpontianak', 'email' => 'fimpontianak@forumindonesiamuda.org'),
    array('name' => 'FIM Makassar', 'province' => 'Sulawesi Selatan', 'island' => 'Sulawesi', 'instagram' => 'fimmakassar', 'email' => 'fimmakassar@forumindonesiamuda.org'),
    array('name' => 'FIM Manado', 'province' => 'Sulawesi Utara', 'island' => 'Sulawesi', 'instagram' => 'fimmanado', 'email' => 'fimmanado@forumindonesiamuda.org'),
    array('name' => 'FIM Medan', 'province' => 'Sumatera Utara', 'island' => 'Sumatra', 'instagram' => 'fimmedan', 'email' => 'fimmedan@forumindonesiamuda.org'),
    array('name' => 'FIM Palembang', 'province' => 'Sumatera Selatan', 'island' => 'Sumatra', 'instagram' => 'fimpalembang', 'email' => 'fimpalembang@forumindonesiamuda.org'),
    array('name' => 'FIM Banda Aceh', 'province' => 'Aceh', 'island' => 'Sumatra', 'instagram' => 'fimbandaaceh', 'email' => 'fimbandaaceh@forumindonesiamuda.org'),
    array('name' => 'FIM Jayapura', 'province' => 'Papua', 'island' => 'Papua', 'instagram' => '', 'email' => 'fimjayapura@forumindonesiamuda.org'),
);

// Try to get regionals from WordPress
$wp_regionals = new WP_Query(array(
    'post_type' => 'regional',
    'posts_per_page' => -1,
    'post_status' => 'publish',
    'orderby' => 'title',
    'order' => 'ASC',
));

$islands = array('Semua', 'Bali & Nusa Tenggara', 'Jawa', 'Kalimantan', 'Papua', 'Sulawesi', 'Sumatra');

// Count unique provinces
$provinces = array_unique(array_column($regions, 'province'));
?>

<main id="main" class="site-main">
    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <h1 class="page-title">Regional FIM</h1>
            <p class="page-subtitle">Jaringan alumni FIM yang tersebar di seluruh Indonesia</p>
        </div>
    </section>

    <!-- Stats -->
    <section class="section bg-secondary">
        <div class="container">
            <div class="regional-stats">
                <div class="stat-item">
                    <div class="stat-value"><?php echo $wp_regionals->have_posts() ? $wp_regionals->found_posts : count($regions); ?></div>
                    <div class="stat-label">Regional</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value"><?php echo count($provinces); ?></div>
                    <div class="stat-label">Provinsi</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Filter -->
    <section class="filter-section">
        <div class="container">
            <div class="search-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" id="searchInput" placeholder="Cari regional atau provinsi..." onkeyup="filterRegionals()">
            </div>
            
            <div class="filter-buttons" id="islandFilters">
                <?php foreach ($islands as $island): ?>
                <button class="filter-btn <?php echo $island === 'Semua' ? 'active' : ''; ?>" onclick="filterByIsland('<?php echo esc_attr($island); ?>', this)">
                    <?php echo esc_html($island); ?>
                </button>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Regional Grid -->
    <section class="section">
        <div class="container">
            <div class="regional-grid" id="regionalGrid">
                <?php if ($wp_regionals->have_posts()): ?>
                    <?php while ($wp_regionals->have_posts()): $wp_regionals->the_post(); 
                        $provinsi = get_field('provinsi') ?: '';
                        $pulau = get_field('pulau') ?: '';
                        $instagram = get_field('instagram') ?: '';
                        $email = get_field('email') ?: '';
                    ?>
                    <div class="regional-card" data-island="<?php echo esc_attr($pulau); ?>" data-name="<?php echo esc_attr(strtolower(get_the_title() . ' ' . $provinsi)); ?>">
                        <div class="regional-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <div class="regional-info">
                            <h3><?php the_title(); ?></h3>
                            <p><?php echo esc_html($provinsi); ?></p>
                            <div class="regional-links">
                                <?php if ($instagram): ?>
                                <a href="https://instagram.com/<?php echo esc_attr($instagram); ?>" target="_blank" rel="noopener noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                    @<?php echo esc_html($instagram); ?>
                                </a>
                                <?php endif; ?>
                                <?php if ($email): ?>
                                <a href="mailto:<?php echo esc_attr($email); ?>">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                    Email
                                </a>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                    <?php endwhile; wp_reset_postdata(); ?>
                <?php else: ?>
                    <!-- Fallback to static data -->
                    <?php foreach ($regions as $region): ?>
                    <div class="regional-card" data-island="<?php echo esc_attr($region['island']); ?>" data-name="<?php echo esc_attr(strtolower($region['name'] . ' ' . $region['province'])); ?>">
                        <div class="regional-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <div class="regional-info">
                            <h3><?php echo esc_html($region['name']); ?></h3>
                            <p><?php echo esc_html($region['province']); ?></p>
                            <div class="regional-links">
                                <?php if ($region['instagram']): ?>
                                <a href="https://instagram.com/<?php echo esc_attr($region['instagram']); ?>" target="_blank" rel="noopener noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                    @<?php echo esc_html($region['instagram']); ?>
                                </a>
                                <?php endif; ?>
                                <a href="mailto:<?php echo esc_attr($region['email']); ?>">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                    Email
                                </a>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <div class="no-results" id="noResults" style="display: none;">
                <p>Tidak ada regional yang ditemukan.</p>
            </div>
        </div>
    </section>
</main>

<script>
let currentIsland = 'Semua';

function filterRegionals() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.regional-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const name = card.dataset.name;
        const island = card.dataset.island;
        const matchesSearch = name.includes(searchValue);
        const matchesIsland = currentIsland === 'Semua' || island === currentIsland;
        
        if (matchesSearch && matchesIsland) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    document.getElementById('noResults').style.display = visibleCount === 0 ? 'block' : 'none';
}

function filterByIsland(island, btn) {
    currentIsland = island;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    filterRegionals();
}
</script>

<?php get_footer(); ?>
