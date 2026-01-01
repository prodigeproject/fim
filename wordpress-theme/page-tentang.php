<?php
/**
 * Template Name: Tentang FIM
 * 
 * About page template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

// Sejarah FIM
$sejarah = array(
    array('year' => '2003', 'event' => 'Forum Indonesia Muda didirikan oleh sepasang suami istri Elmir Amien dan Tatty Elmir, yang disupport pakar leadership Buchori Nasution, dan rekan-rekannya sesama jurnalis di Jakarta News FM. Pelatihan pertama di Graha Pemuda Cibodas Jakarta.'),
    array('year' => '2004', 'event' => 'FIM ke-2 kegiatan dipindahkan ke Wiladatika Jakarta, agar mudah diakses para mentor dan undangan.'),
    array('year' => '2005', 'event' => 'Pelatihan FIM dibarengi dengan pemberangkatan relawan FIM ke Nias saat bencana gempa besar bekerjasama dengan TNI AL.'),
    array('year' => '2007', 'event' => 'FIM telah ekspansi di 10 kota besar di Indonesia dan dibentuknya Koordinator Nasional.'),
    array('year' => '2010', 'event' => 'Transformasi kurikulum program kaderisasi kepemimpinan FIM (FIM 9) dan peluncuran FIM tematik Rescue bekerjasama dengan MER-C.'),
    array('year' => '2015', 'event' => 'Dibentuknya FIM Club untuk basis keminatan alumni FIM di bidang-bidang tertentu.'),
    array('year' => '2018', 'event' => 'Dilaksanakan pelatihan FIM di 5 wilayah sekaligus (FIM 20) untuk melakukan ekspansi kaderisasi kepemimpinan di setiap wilayah di Indonesia.'),
    array('year' => '2023', 'event' => 'Momentum 2 dekade FIM, telah menghasilkan 30 lebih angkatan pelatihan FIM, lebih dari 60 regional, dan hampir 4000 alumni.'),
    array('year' => '2025', 'event' => 'Perdana pelatihan FIM tematik Kebijakan Publik bekerjasama dengan Nalar Institute untuk menghasilkan ahli kebijakan publik di level intermediate & advance.'),
);

// Struktur Yayasan
$struktur_yayasan = array(
    array('name' => 'Elmir Amien', 'position' => 'Founder / Ketua Dewan Pembina'),
    array('name' => 'Tatty Elmir', 'position' => 'Founder / Anggota Dewan Pembina'),
    array('name' => 'Maghleb Elmir', 'position' => 'Ketua Dewan Pengawas'),
    array('name' => 'JetC Elmir', 'position' => 'Anggota Dewan Pengawas'),
    array('name' => 'Mandira Bienna Elmir', 'position' => 'Ketua Pengurus Yayasan'),
    array('name' => 'Ivan Ahda', 'position' => 'Sekretaris Pengurus Yayasan'),
    array('name' => 'Ferly Ferdyant', 'position' => 'Bendahara Pengurus Yayasan'),
);

// BPH
$bph = array(
    array('name' => 'Dicky Adra Pratama', 'position' => 'Direktur Eksekutif'),
    array('name' => 'Anisah Fitriana Rakhman', 'position' => 'Sekretaris Bendahara'),
    array('name' => 'M Rafif Quthronada', 'position' => 'Sekretaris Jenderal'),
    array('name' => 'Umi Rif\'atus S', 'position' => 'Wakil Sekretaris Jenderal'),
);

// Biro Internal
$biro_internal = array('Chairul Sinaga', 'Aisyah Hasim', 'Arian Handika', 'Dita Amallya');

// Divisi
$divisi = array(
    array('name' => 'Nurul Aini', 'position' => 'Kepala Biro Media & Komunikasi'),
    array('name' => 'Ayu Rahma Dania', 'position' => 'Kepala Divisi Pelatihan'),
    array('name' => 'Mutia Intan Permana G', 'position' => 'Kepala Divisi Partnership & Eksternal'),
    array('name' => 'M Aridha Firdaus', 'position' => 'Wakil Kepala Divisi Partnership & Eksternal'),
    array('name' => 'Ilham Ramodhan', 'position' => 'Kepala Divisi Pengembangan Regional'),
    array('name' => 'RM Agung Dian Perdana', 'position' => 'Wakil Kepala Divisi Pengembangan Regional'),
    array('name' => 'Ulfa Rodiah', 'position' => 'Kepala Divisi Pengembangan Komunitas'),
    array('name' => 'Arif Setiawan', 'position' => 'Kepala Divisi Tanggap Bencana dan Kemanusiaan'),
    array('name' => 'Helmi Anwar R.W.', 'position' => 'Wakil Kepala Divisi Tanggap Bencana dan Kemanusiaan'),
    array('name' => 'RM Kuncoro Probojati', 'position' => 'Kepala Bisnis Usaha'),
);
?>

<main id="main" class="site-main">
    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <h1 class="page-title">Tentang Forum Indonesia Muda</h1>
            <p class="page-subtitle">Lebih dari dua dekade membangun generasi muda Indonesia yang berkarakter dan berjiwa pemimpin</p>
        </div>
    </section>

    <!-- Visi Misi Section -->
    <section class="section bg-secondary">
        <div class="container">
            <div class="visi-misi-grid">
                <!-- Visi -->
                <div class="card">
                    <div class="card-icon bg-primary-light">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    </div>
                    <h2>Visi</h2>
                    <p>Hadirnya para pemimpin bangsa yang memiliki semangat nasionalisme dan patriotisme tinggi, berakhlak mulia, sehat dan cerdas paripurna baik secara fisik, rohani, spiritual maupun intelektual. Terwujudnya Indonesia sebagai bangsa yang mandiri dalam ekonomi, berdaulat dalam politik dan berkepribadian dalam kebudayaan.</p>
                </div>

                <!-- Misi -->
                <div class="card">
                    <div class="card-icon bg-supporting-light">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                    </div>
                    <h2>Misi</h2>
                    <ol class="misi-list">
                        <li>Pembinaan pemuda dan mahasiswa untuk diarahkan kepada gagasan jiwa mandiri (entrepreneurship) dan collective leadership.</li>
                        <li>Meningkatkan pemahaman akan pentingnya arti kompetensi bagi generasi muda yang berbasis pada soft skill (7 pilar dasar kepemimpinan dan 7 pilar karakter) dan hard skill (teknologi dan profesionalisme).</li>
                        <li>Menyatukan dan mengoptimalkan berbagai potensi pemuda dan mahasiswa dalam forum silaturahim dengan berbagai latar belakang.</li>
                        <li>Membuhul solidaritas sosial untuk saling menguatkan antar sesama saudara sebangsa dan setanah air.</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <!-- Kunang-kunang Quote -->
    <section class="section quote-section-alt">
        <div class="container">
            <div class="quote-box">
                <div class="quote-mark">"</div>
                <blockquote>
                    Seperti kunang-kunang yang kecil namun mampu menerangi kegelapan, 
                    kami percaya setiap pemuda Indonesia memiliki cahaya yang dapat 
                    menerangi jalan bagi sesama dan bangsa.
                </blockquote>
                <div class="quote-divider"></div>
                <p class="quote-author">Filosofi Kunang-Kunang FIM</p>
            </div>
        </div>
    </section>

    <!-- Sejarah Timeline -->
    <section class="section bg-secondary">
        <div class="container">
            <h2 class="section-title">Perjalanan Kami</h2>
            
            <div class="timeline">
                <?php foreach ($sejarah as $index => $item): ?>
                <div class="timeline-item">
                    <div class="timeline-marker">
                        <div class="timeline-year"><?php echo esc_html($item['year']); ?></div>
                        <?php if ($index < count($sejarah) - 1): ?>
                        <div class="timeline-line"></div>
                        <?php endif; ?>
                    </div>
                    <div class="timeline-content card">
                        <p><?php echo esc_html($item['event']); ?></p>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Struktur Pengurus Section -->
    <section class="section">
        <div class="container">
            <h2 class="section-title">Struktur Pengurus</h2>
            <p class="section-subtitle">Organisasi yang menggerakkan Forum Indonesia Muda</p>

            <!-- Struktur Yayasan -->
            <div class="org-section">
                <div class="org-header">
                    <div class="org-icon bg-primary-light">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                    </div>
                    <h3>Struktur Yayasan</h3>
                </div>
                
                <div class="org-chart">
                    <!-- Founders -->
                    <div class="org-level org-level-top">
                        <?php foreach (array_slice($struktur_yayasan, 0, 2) as $person): ?>
                        <div class="org-card org-card-primary">
                            <div class="org-avatar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <h4><?php echo esc_html($person['name']); ?></h4>
                            <p><?php echo esc_html($person['position']); ?></p>
                        </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="org-connector"></div>

                    <!-- Dewan -->
                    <div class="org-level">
                        <?php foreach (array_slice($struktur_yayasan, 2, 2) as $person): ?>
                        <div class="org-card org-card-supporting">
                            <div class="org-avatar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <h4><?php echo esc_html($person['name']); ?></h4>
                            <p><?php echo esc_html($person['position']); ?></p>
                        </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="org-connector"></div>

                    <!-- Pengurus -->
                    <div class="org-level org-level-bottom">
                        <?php foreach (array_slice($struktur_yayasan, 4) as $person): ?>
                        <div class="org-card">
                            <div class="org-avatar-small">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <h4><?php echo esc_html($person['name']); ?></h4>
                            <p><?php echo esc_html($person['position']); ?></p>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- Struktur Pengurus FIM -->
            <div class="org-section">
                <div class="org-header">
                    <div class="org-icon bg-supporting-light">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <h3>Struktur Pengurus FIM</h3>
                </div>

                <div class="org-chart">
                    <!-- Direktur Eksekutif -->
                    <div class="org-level org-level-single">
                        <div class="org-card org-card-primary org-card-large">
                            <div class="org-avatar-large">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <h4><?php echo esc_html($bph[0]['name']); ?></h4>
                            <p><?php echo esc_html($bph[0]['position']); ?></p>
                        </div>
                    </div>

                    <div class="org-connector"></div>

                    <!-- Sekretaris Bendahara -->
                    <div class="org-level org-level-single">
                        <div class="org-card org-card-supporting">
                            <div class="org-avatar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <h4><?php echo esc_html($bph[1]['name']); ?></h4>
                            <p><?php echo esc_html($bph[1]['position']); ?></p>
                        </div>
                    </div>

                    <div class="org-connector"></div>

                    <!-- Sekjend & Wasekjend -->
                    <div class="org-level">
                        <?php foreach (array_slice($bph, 2) as $person): ?>
                        <div class="org-card org-card-accent">
                            <div class="org-avatar-small">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <h4><?php echo esc_html($person['name']); ?></h4>
                            <p><?php echo esc_html($person['position']); ?></p>
                        </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="org-connector"></div>

                    <!-- Biro Internal -->
                    <div class="org-subsection">
                        <h4 class="org-subsection-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
                            Biro Internal
                        </h4>
                        <div class="org-level org-level-small">
                            <?php foreach ($biro_internal as $name): ?>
                            <div class="org-card org-card-small">
                                <div class="org-avatar-mini">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <h5><?php echo esc_html($name); ?></h5>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="org-divider"></div>

                    <!-- Kepala Divisi -->
                    <h4 class="org-subsection-title-center">Kepala Divisi & Biro</h4>
                    <div class="divisi-grid">
                        <?php foreach ($divisi as $person): ?>
                        <div class="org-card">
                            <div class="org-card-row">
                                <div class="org-avatar-small bg-accent-light">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <div>
                                    <h5><?php echo esc_html($person['name']); ?></h5>
                                    <p><?php echo esc_html($person['position']); ?></p>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Note -->
                <div class="org-note">
                    <p>Di bawah struktur FIM Pusat terdapat <strong>60 Regional + 1 Diaspora</strong> dan <strong>18 FIM Club</strong></p>
                </div>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>
