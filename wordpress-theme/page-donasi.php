<?php
/**
 * Template Name: Donasi
 * 
 * Donation page template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

$bank_account = array(
    'bank' => 'Bank Mandiri',
    'number' => '006 00 1059 3089',
    'name' => 'Forum Indonesia Muda',
);

$donation_steps = array(
    array('step' => 1, 'title' => 'Transfer ke Rekening Mandiri', 'description' => 'Transfer donasi ke rekening Bank Mandiri 006 00 1059 3089 a.n. Forum Indonesia Muda'),
    array('step' => 2, 'title' => 'Cantumkan Kode Unik', 'description' => 'Tambahkan kode unik 99 di akhir nominal transfer (contoh: Rp 100.099)'),
    array('step' => 3, 'title' => 'Tambahkan Catatan', 'description' => 'Sertakan catatan tujuan donasi pada keterangan transfer (opsional)'),
    array('step' => 4, 'title' => 'Konfirmasi Donasi', 'description' => 'Kirimkan bukti transfer ke WhatsApp +62 852-1358-0323 untuk konfirmasi'),
);

$usages = array(
    array('title' => 'Program Beasiswa', 'percentage' => 40, 'description' => 'Beasiswa untuk calon kader dari keluarga kurang mampu'),
    array('title' => 'Pelatihan & Workshop', 'percentage' => 30, 'description' => 'Biaya operasional program kaderisasi tahunan'),
    array('title' => 'Proyek Sosial', 'percentage' => 20, 'description' => 'Pendanaan proyek sosial alumni di berbagai daerah'),
    array('title' => 'Operasional', 'percentage' => 10, 'description' => 'Biaya administrasi dan operasional organisasi'),
);
?>

<main id="main" class="site-main">
    <!-- Page Hero -->
    <section class="page-hero">
        <div class="container">
            <h1 class="page-title">Dukung Forum Indonesia Muda</h1>
            <p class="page-subtitle">Kontribusi Anda membantu kami mencetak lebih banyak pemimpin muda untuk Indonesia</p>
        </div>
    </section>

    <!-- Main Content -->
    <section class="section">
        <div class="container">
            <div class="donasi-grid">
                <!-- LEFT: Main FIM Donations -->
                <div class="donasi-main">
                    <!-- Why Donate -->
                    <div class="donasi-section">
                        <h2>Mengapa Mendukung FIM?</h2>
                        <p class="section-text">
                            Selama lebih dari 20 tahun, FIM telah mencetak ribuan pemimpin muda yang 
                            kini berkontribusi di berbagai sektor. Dukungan Anda membantu kami 
                            menjangkau lebih banyak pemuda dari berbagai latar belakang.
                        </p>

                        <div class="impact-cards">
                            <div class="impact-card">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                <h4>4000+ Alumni</h4>
                                <p>Pemimpin muda sejak 2003</p>
                            </div>
                            <div class="impact-card">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                                <h4>60+ Regional</h4>
                                <p>Dari Sabang sampai Merauke</p>
                            </div>
                            <div class="impact-card">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                                <h4>100+ Proyek/Tahun</h4>
                                <p>Proyek sosial berdampak</p>
                            </div>
                        </div>
                    </div>

                    <!-- Donation Method -->
                    <div class="donasi-section">
                        <h2>Cara Berdonasi</h2>

                        <!-- Bank Account -->
                        <div class="bank-card">
                            <div class="bank-header">
                                <div class="bank-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                                </div>
                                <h3>Rekening Donasi</h3>
                            </div>

                            <div class="bank-info">
                                <p class="bank-name"><?php echo esc_html($bank_account['bank']); ?></p>
                                <p class="bank-number" id="bankNumber"><?php echo esc_html($bank_account['number']); ?></p>
                                <p class="bank-holder">a.n. <?php echo esc_html($bank_account['name']); ?></p>
                                <button class="btn btn-outline btn-sm" onclick="copyToClipboard('<?php echo esc_attr(str_replace(' ', '', $bank_account['number'])); ?>')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                    Salin
                                </button>
                            </div>
                        </div>

                        <!-- Donation Steps -->
                        <div class="steps-card">
                            <h3>Langkah-langkah</h3>
                            <div class="steps-list">
                                <?php foreach ($donation_steps as $step): ?>
                                <div class="step-item">
                                    <div class="step-number"><?php echo esc_html($step['step']); ?></div>
                                    <div class="step-content">
                                        <h4><?php echo esc_html($step['title']); ?></h4>
                                        <p><?php echo esc_html($step['description']); ?></p>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </div>

                            <div class="step-note">
                                <p>💡 <strong>Penting:</strong> Kode unik (99) membantu kami mengidentifikasi donasi Anda.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Transparency -->
                    <div class="donasi-section">
                        <h2>Transparansi Penggunaan Dana</h2>
                        <p class="section-text">Kami berkomitmen menggunakan setiap donasi secara bertanggung jawab dan transparan.</p>

                        <div class="usage-list">
                            <?php foreach ($usages as $usage): ?>
                            <div class="usage-item">
                                <div class="usage-header">
                                    <h4><?php echo esc_html($usage['title']); ?></h4>
                                    <span class="usage-percentage"><?php echo esc_html($usage['percentage']); ?>%</span>
                                </div>
                                <p><?php echo esc_html($usage['description']); ?></p>
                                <div class="usage-bar">
                                    <div class="usage-bar-fill" style="width: <?php echo esc_attr($usage['percentage']); ?>%"></div>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <!-- Confirmation CTA -->
                    <div class="confirm-card">
                        <h3>Sudah Berdonasi?</h3>
                        <p>Kirimkan bukti transfer ke WhatsApp kami untuk konfirmasi.</p>
                        <a href="https://wa.me/6285213580323?text=Halo,%20saya%20ingin%20konfirmasi%20donasi%20ke%20FIM" target="_blank" rel="noopener noreferrer" class="btn btn-supporting">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                            Konfirmasi via WhatsApp
                        </a>
                    </div>
                </div>

                <!-- Divider -->
                <div class="donasi-divider"></div>

                <!-- RIGHT: Disaster Relief -->
                <div class="donasi-sidebar">
                    <div class="disaster-card">
                        <div class="disaster-header">
                            <div class="disaster-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                            </div>
                            <h2>🆘 Donasi Bencana</h2>
                        </div>
                        
                        <p>FIM aktif dalam tanggap darurat bencana melalui program FIM Tanggap Bencana.</p>

                        <div class="disaster-info">
                            <p><em>Update penggalangan donasi untuk bencana kemanusiaan dapat diikuti melalui:</em></p>
                            
                            <a href="https://instagram.com/fimtanggapbencana" target="_blank" rel="noopener noreferrer" class="social-link instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                <div>
                                    <strong>@fimtanggapbencana</strong>
                                    <span>Instagram Resmi</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                            </a>

                            <a href="https://instagram.com/fimnews" target="_blank" rel="noopener noreferrer" class="social-link instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                <div>
                                    <strong>@fimnews</strong>
                                    <span>Media Resmi FIM</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                            </a>
                        </div>

                        <div class="disaster-transparency">
                            <h4>📋 Transparansi</h4>
                            <p>Laporan penggunaan dana donasi bencana diinformasikan secara spesifik di akun Instagram @fimtanggapbencana dan @fimnews.</p>
                        </div>

                        <p class="disaster-note"><em>Cara berdonasi untuk bencana akan diinformasikan saat ada penggalangan aktif.</em></p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>

<script>
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        alert('Nomor rekening berhasil disalin!');
    }).catch(function(err) {
        console.error('Gagal menyalin: ', err);
    });
}
</script>

<?php get_footer(); ?>
