<?php
/**
 * Template Name: FIM Club
 * 
 * FIM Club listing page template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

$clubs = array(
    array('name' => 'Creator Community', 'category' => 'Kreativitas', 'icon' => 'palette', 'description' => 'Komunitas untuk para kreator konten dan digital creator', 'activities' => array('Content creation', 'Workshop design', 'Collaboration projects'), 'instagram' => '', 'email' => 'fccreatorcommunity@forumindonesiamuda.org'),
    array('name' => 'Dongeng', 'category' => 'Pendidikan', 'icon' => 'book-open', 'description' => 'Komunitas pecinta dongeng dan storytelling untuk anak-anak', 'activities' => array('Storytelling session', 'Kunjungan ke sekolah', 'Buku dongeng'), 'instagram' => 'fc_dongeng', 'email' => 'fcdongeng@forumindonesiamuda.org'),
    array('name' => 'Games', 'category' => 'Hiburan', 'icon' => 'gamepad', 'description' => 'Komunitas gamers dan esports enthusiast', 'activities' => array('Tournament', 'Game night', 'Streaming session'), 'instagram' => 'fcgamesindo', 'email' => 'fcgames@forumindonesiamuda.org'),
    array('name' => 'IT DK Startup', 'category' => 'Teknologi', 'icon' => 'code', 'description' => 'Komunitas untuk pengembang IT, digital, dan startup enthusiast', 'activities' => array('Hackathon', 'Tech talks', 'Startup mentoring'), 'instagram' => '', 'email' => 'fcitdkstartup@forumindonesiamuda.org'),
    array('name' => 'Literasi', 'category' => 'Pendidikan', 'icon' => 'book-open', 'description' => 'Komunitas untuk mengembangkan budaya literasi', 'activities' => array('Book review', 'Writing workshop', 'Perpustakaan keliling'), 'instagram' => 'fcliterasi', 'email' => 'fcliterasi@forumindonesiamuda.org'),
    array('name' => 'Mental Health', 'category' => 'Kesehatan', 'icon' => 'heart', 'description' => 'Komunitas untuk awareness kesehatan mental', 'activities' => array('Support group', 'Webinar kesehatan mental', 'Kampanye awareness'), 'instagram' => '', 'email' => 'fcmentalhealth@forumindonesiamuda.org'),
    array('name' => 'Parenting', 'category' => 'Keluarga', 'icon' => 'users', 'description' => 'Komunitas untuk berbagi ilmu parenting', 'activities' => array('Parenting class', 'Diskusi pengasuhan', 'Family gathering'), 'instagram' => 'fimclubparenting', 'email' => 'fcparenting@forumindonesiamuda.org'),
    array('name' => 'Pendidikan', 'category' => 'Pendidikan', 'icon' => 'graduation-cap', 'description' => 'Komunitas untuk pengembangan sektor pendidikan', 'activities' => array('Workshop guru', 'Mentoring siswa', 'Kampanye pendidikan'), 'instagram' => 'fc14_pendidikan', 'email' => 'fcpendidikan@forumindonesiamuda.org'),
    array('name' => 'Politics', 'category' => 'Politik', 'icon' => 'vote', 'description' => 'Komunitas untuk diskusi dan edukasi politik', 'activities' => array('Diskusi politik', 'Edukasi pemilu', 'Policy analysis'), 'instagram' => 'fimclubpolitics', 'email' => 'fcpolitics@forumindonesiamuda.org'),
    array('name' => 'Run', 'category' => 'Olahraga', 'icon' => 'running', 'description' => 'Komunitas pelari dan running enthusiast', 'activities' => array('Fun run', 'Marathon training', 'Running clinic'), 'instagram' => 'fim_run', 'email' => 'fcrun@forumindonesiamuda.org'),
    array('name' => 'Traventure', 'category' => 'Travel', 'icon' => 'compass', 'description' => 'Komunitas pecinta traveling dan adventure', 'activities' => array('Trip bersama', 'Travel sharing', 'Adventure challenge'), 'instagram' => 'fctraventure', 'email' => 'fctraventure@forumindonesiamuda.org'),
    array('name' => 'Energi Lingkungan', 'category' => 'Lingkungan', 'icon' => 'leaf', 'description' => 'Komunitas untuk isu energi dan lingkungan', 'activities' => array('Green campaign', 'Energy talk', 'Environmental action'), 'instagram' => 'fceneling', 'email' => 'fceneling@forumindonesiamuda.org'),
);

$categories = array_unique(array_column($clubs, 'category'));
array_unshift($categories, 'Semua');
?>

<main id="main" class="site-main">
    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <h1 class="page-title">FIM Club</h1>
            <p class="page-subtitle">Komunitas minat dan bakat alumni FIM yang tersebar di berbagai bidang</p>
        </div>
    </section>

    <!-- Stats -->
    <section class="section bg-secondary">
        <div class="container">
            <div class="regional-stats">
                <div class="stat-item">
                    <div class="stat-value"><?php echo count($clubs); ?></div>
                    <div class="stat-label">FIM Club Aktif</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value"><?php echo count($categories) - 1; ?></div>
                    <div class="stat-label">Kategori</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Filter -->
    <section class="filter-section">
        <div class="container">
            <div class="filter-buttons" id="categoryFilters">
                <?php foreach ($categories as $category): ?>
                <button class="filter-btn <?php echo $category === 'Semua' ? 'active' : ''; ?>" onclick="filterByCategory('<?php echo esc_attr($category); ?>', this)">
                    <?php echo esc_html($category); ?>
                </button>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Club Grid -->
    <section class="section">
        <div class="container">
            <div class="club-grid" id="clubGrid">
                <?php foreach ($clubs as $club): ?>
                <div class="club-card" data-category="<?php echo esc_attr($club['category']); ?>">
                    <div class="club-header">
                        <div class="club-icon bg-primary-light">
                            <?php echo fim_get_icon($club['icon']); ?>
                        </div>
                        <div>
                            <h3><?php echo esc_html($club['name']); ?></h3>
                            <span class="club-category"><?php echo esc_html($club['category']); ?></span>
                        </div>
                    </div>
                    
                    <p class="club-description"><?php echo esc_html($club['description']); ?></p>
                    
                    <div class="club-activities">
                        <h4>Kegiatan:</h4>
                        <div class="activity-tags">
                            <?php foreach ($club['activities'] as $activity): ?>
                            <span class="activity-tag"><?php echo esc_html($activity); ?></span>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="club-links">
                        <?php if ($club['instagram']): ?>
                        <a href="https://instagram.com/<?php echo esc_attr($club['instagram']); ?>" target="_blank" rel="noopener noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                            @<?php echo esc_html($club['instagram']); ?>
                        </a>
                        <?php endif; ?>
                        <a href="mailto:<?php echo esc_attr($club['email']); ?>">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                            Email
                        </a>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
</main>

<script>
function filterByCategory(category, btn) {
    const cards = document.querySelectorAll('.club-card');
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    cards.forEach(card => {
        if (category === 'Semua' || card.dataset.category === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}
</script>

<?php get_footer(); ?>
