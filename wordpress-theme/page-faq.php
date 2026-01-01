<?php
/**
 * Template Name: FAQ
 * 
 * FAQ page template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

// FAQ Categories from React data
$faq_categories = array(
    array(
        'category' => 'Tentang FIM',
        'questions' => array(
            array('q' => 'Apa itu Forum Indonesia Muda (FIM)?', 'a' => 'Forum Indonesia Muda adalah organisasi pemuda yang berdiri sejak 2003. FIM bertujuan untuk membentuk pemimpin muda Indonesia yang berkarakter, memiliki jiwa kepemimpinan, dan berkontribusi bagi bangsa. Dengan filosofi \'kunang-kunang\', FIM percaya setiap pemuda bisa menjadi cahaya yang menerangi Indonesia.'),
            array('q' => 'Berapa usia FIM saat ini?', 'a' => 'FIM telah berdiri sejak tahun 2003, yang berarti sudah lebih dari 20 tahun berkontribusi dalam pembentukan pemimpin muda Indonesia. Hingga saat ini, FIM telah meluluskan lebih dari 34 angkatan kader.'),
            array('q' => 'Apa filosofi \'kunang-kunang\' FIM?', 'a' => 'Filosofi kunang-kunang menggambarkan bahwa seperti kunang-kunang yang kecil namun mampu menerangi kegelapan, setiap pemuda Indonesia memiliki cahaya (potensi) yang dapat menerangi jalan bagi sesama dan bangsa, sekecil apapun kontribusinya.'),
        ),
    ),
    array(
        'category' => 'Program & Pendaftaran',
        'questions' => array(
            array('q' => 'Siapa yang bisa mendaftar program FIM?', 'a' => 'Program FIM terbuka untuk pemuda Indonesia berusia 17-25 tahun dari berbagai latar belakang. Yang paling penting adalah semangat untuk belajar, berkembang, dan berkontribusi bagi masyarakat.'),
            array('q' => 'Kapan pendaftaran FIM dibuka?', 'a' => 'Pendaftaran program kaderisasi FIM biasanya dibuka setiap tahun pada bulan Januari-Februari. Informasi pendaftaran akan diumumkan melalui website resmi dan media sosial FIM.'),
            array('q' => 'Apakah ada biaya untuk mengikuti program FIM?', 'a' => 'Program FIM memerlukan biaya partisipasi yang terjangkau untuk mendukung operasional pelatihan. Namun, FIM menyediakan beasiswa penuh bagi calon kader dari keluarga kurang mampu.'),
            array('q' => 'Bagaimana proses seleksi FIM?', 'a' => 'Proses seleksi meliputi: (1) Pendaftaran online dengan pengisian formulir dan esai, (2) Seleksi administrasi, (3) Tes tertulis atau online, (4) Wawancara oleh tim regional.'),
            array('q' => 'Apa saja yang akan dipelajari di FIM?', 'a' => 'Program FIM mencakup: pengembangan karakter (7 Pilar Karakter), kepemimpinan (7 Pilar Kepemimpinan), public speaking, project management, networking, dan implementasi proyek sosial.'),
        ),
    ),
    array(
        'category' => 'Regional & FIM Club',
        'questions' => array(
            array('q' => 'Ada berapa regional FIM di Indonesia?', 'a' => 'Saat ini FIM memiliki 60 regional + 1 diaspora yang tersebar di 34 provinsi Indonesia, dari Aceh hingga Papua.'),
            array('q' => 'Apa itu FIM Club?', 'a' => 'FIM Club adalah komunitas alumni FIM yang dikelompokkan berdasarkan bidang minat dan keahlian, seperti FC Policy, FC Pendidikan, FC IT, dll. Saat ini ada 18 FIM Club aktif.'),
            array('q' => 'Bagaimana cara bergabung dengan FIM Club?', 'a' => 'Setelah lulus dari program kaderisasi FIM, alumni secara otomatis dapat bergabung dengan FIM Club sesuai minat.'),
        ),
    ),
    array(
        'category' => 'Alumni & Jaringan',
        'questions' => array(
            array('q' => 'Berapa jumlah alumni FIM saat ini?', 'a' => 'FIM telah meluluskan lebih dari 4.000 alumni dari lebih dari 34 angkatan yang tersebar di berbagai sektor.'),
            array('q' => 'Apakah alumni tetap terhubung setelah lulus?', 'a' => 'Ya! Alumni FIM tetap terhubung melalui FIM Club, kegiatan regional, reunion tahunan, dan berbagai platform komunikasi.'),
            array('q' => 'Bagaimana alumni FIM berkontribusi?', 'a' => 'Alumni berkontribusi melalui berbagai cara: menjadi mentor, mendukung proyek sosial, berbagi pengalaman, memberikan donasi, dan menginisiasi program kolaboratif.'),
        ),
    ),
    array(
        'category' => 'Donasi & Dukungan',
        'questions' => array(
            array('q' => 'Bagaimana cara berdonasi ke FIM?', 'a' => 'Anda dapat berdonasi melalui transfer bank ke rekening Mandiri 006 00 1059 3089 a.n. Forum Indonesia Muda. Cantumkan kode unik (99) di akhir nominal transfer.'),
            array('q' => 'Untuk apa donasi digunakan?', 'a' => 'Donasi digunakan untuk: beasiswa calon kader (40%), operasional pelatihan (30%), proyek sosial (20%), dan biaya administrasi (10%).'),
            array('q' => 'Apakah FIM menerima donasi untuk bencana?', 'a' => 'Ya, FIM aktif dalam tanggap darurat bencana. Ketika ada bencana, kami membuka donasi khusus dan mengkoordinasikan relawan alumni.'),
        ),
    ),
    array(
        'category' => 'Kerjasama & Partnership',
        'questions' => array(
            array('q' => 'Bagaimana jika ingin bekerjasama dengan FIM?', 'a' => 'Silakan hubungi kami melalui WhatsApp +62 852-1358-0323 atau email halo@forumindonesiamuda.org.'),
        ),
    ),
);

// Get FAQs from WordPress if available
$wp_faqs = new WP_Query(array(
    'post_type' => 'faq',
    'posts_per_page' => -1,
    'post_status' => 'publish',
    'orderby' => 'menu_order',
    'order' => 'ASC',
));
?>

<main id="main" class="site-main">
    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <h1 class="page-title">Pertanyaan yang Sering Diajukan</h1>
            <p class="page-subtitle">Temukan jawaban untuk pertanyaan umum tentang Forum Indonesia Muda</p>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="section">
        <div class="container">
            <div class="faq-container">
                <?php if ($wp_faqs->have_posts()): ?>
                    <!-- FAQs from WordPress -->
                    <?php
                    $current_category = '';
                    while ($wp_faqs->have_posts()): $wp_faqs->the_post();
                        $category = get_field('kategori') ?: 'Umum';
                        if ($category !== $current_category):
                            if ($current_category !== ''): ?>
                                </div>
                            <?php endif; ?>
                            <div class="faq-category">
                                <h2 class="faq-category-title"><?php echo esc_html($category); ?></h2>
                            <?php $current_category = $category;
                        endif;
                    ?>
                        <div class="faq-item">
                            <button class="faq-question" onclick="toggleFaq(this)">
                                <span><?php the_title(); ?></span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="faq-chevron"><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                            <div class="faq-answer">
                                <div class="faq-answer-content">
                                    <?php the_content(); ?>
                                </div>
                            </div>
                        </div>
                    <?php endwhile; wp_reset_postdata(); ?>
                    </div>
                <?php else: ?>
                    <!-- Fallback to static FAQs -->
                    <?php foreach ($faq_categories as $category): ?>
                    <div class="faq-category">
                        <h2 class="faq-category-title"><?php echo esc_html($category['category']); ?></h2>
                        <?php foreach ($category['questions'] as $faq): ?>
                        <div class="faq-item">
                            <button class="faq-question" onclick="toggleFaq(this)">
                                <span><?php echo esc_html($faq['q']); ?></span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="faq-chevron"><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                            <div class="faq-answer">
                                <div class="faq-answer-content">
                                    <p><?php echo esc_html($faq['a']); ?></p>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Contact CTA -->
    <section class="section bg-secondary">
        <div class="container text-center">
            <h3 class="cta-subtitle-title">Pertanyaan Lain?</h3>
            <p class="section-subtitle">Jika pertanyaan Anda belum terjawab, jangan ragu untuk menghubungi kami.</p>
            <div class="cta-buttons">
                <a href="mailto:halo@forumindonesiamuda.org" class="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    Email Kami
                </a>
                <a href="https://wa.me/6285213580323" target="_blank" rel="noopener noreferrer" class="btn btn-supporting">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    WhatsApp
                </a>
            </div>
        </div>
    </section>

    <!-- Quick Links -->
    <section class="section">
        <div class="container text-center">
            <h3>Link Cepat</h3>
            <div class="quick-links">
                <a href="<?php echo esc_url(home_url('/tentang')); ?>" class="btn btn-outline">Tentang FIM</a>
                <a href="<?php echo esc_url(home_url('/pelatihan')); ?>" class="btn btn-outline">Program Pelatihan</a>
                <a href="<?php echo esc_url(home_url('/regional')); ?>" class="btn btn-outline">Regional FIM</a>
                <a href="<?php echo esc_url(home_url('/donasi')); ?>" class="btn btn-outline">Donasi</a>
            </div>
        </div>
    </section>
</main>

<script>
function toggleFaq(button) {
    const item = button.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
            openItem.classList.remove('open');
            openItem.querySelector('.faq-answer').style.maxHeight = null;
        }
    });
    
    // Toggle current FAQ
    if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
    } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
    }
}
</script>

<?php get_footer(); ?>
