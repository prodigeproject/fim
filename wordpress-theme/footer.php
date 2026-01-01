<?php
/**
 * Footer Template
 * Forum Indonesia Muda WordPress Theme
 *
 * @package FIM_Theme
 * @version 2.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Get site settings from ACF Options (if available)
$site_phone = function_exists('get_field') ? get_field('site_phone', 'option') : '+62 852-1358-0323';
$site_email = function_exists('get_field') ? get_field('site_email', 'option') : 'halo@forumindonesiamuda.org';
$site_instagram = function_exists('get_field') ? get_field('site_instagram', 'option') : 'https://instagram.com/fimnews';
$site_facebook = function_exists('get_field') ? get_field('site_facebook', 'option') : 'https://facebook.com/forumindonesiamuda';
$site_linkedin = function_exists('get_field') ? get_field('site_linkedin', 'option') : 'https://linkedin.com/company/forum-indonesia-muda';
$site_youtube = function_exists('get_field') ? get_field('site_youtube', 'option') : 'https://www.youtube.com/ForumIndonesiaMuda';
$site_description = function_exists('get_field') ? get_field('site_description', 'option') : 'Wadah bagi pemuda Indonesia untuk bertumbuh, berkolaborasi, dan menjadi cahaya kunang-kunang yang menerangi masa depan bangsa. Berdiri sejak 2003.';

// Get logo
$site_logo = get_theme_mod('custom_logo');
$logo_url = $site_logo ? wp_get_attachment_image_url($site_logo, 'full') : get_template_directory_uri() . '/assets/images/logo-fim.png';

// Format phone for WhatsApp
$whatsapp_number = preg_replace('/[^0-9]/', '', $site_phone);
if (substr($whatsapp_number, 0, 1) === '0') {
    $whatsapp_number = '62' . substr($whatsapp_number, 1);
}
?>

    </main><!-- #content -->

    <!-- Newsletter Section -->
    <section class="fim-newsletter-section">
        <div class="fim-container">
            <div class="fim-newsletter-content">
                <h3>Dapatkan Update Terbaru</h3>
                <p>Berlangganan newsletter untuk info kegiatan, pendaftaran, dan berita terbaru dari FIM.</p>
                <form class="fim-newsletter-form" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
                    <input type="hidden" name="action" value="fim_newsletter_subscribe">
                    <?php wp_nonce_field('fim_newsletter', 'fim_newsletter_nonce'); ?>
                    <input type="email" name="email" placeholder="Masukkan email Anda" required>
                    <button type="submit" class="fim-btn fim-btn-gold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m22 2-7 20-4-9-9-4Z"/>
                            <path d="M22 2 11 13"/>
                        </svg>
                        Langganan
                    </button>
                </form>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="fim-footer">
        <div class="fim-container">
            <div class="fim-footer-grid">
                <!-- Brand Column -->
                <div class="fim-footer-brand">
                    <a href="<?php echo esc_url(home_url('/')); ?>" class="fim-footer-logo">
                        <img src="<?php echo esc_url($logo_url); ?>" alt="<?php bloginfo('name'); ?>">
                        <span><?php bloginfo('name'); ?></span>
                    </a>
                    <p><?php echo esc_html($site_description); ?></p>
                    
                    <!-- Social Links -->
                    <div class="fim-footer-social">
                        <?php if ($site_instagram): ?>
                        <a href="<?php echo esc_url($site_instagram); ?>" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                            </svg>
                        </a>
                        <?php endif; ?>
                        
                        <?php if ($site_facebook): ?>
                        <a href="<?php echo esc_url($site_facebook); ?>" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                            </svg>
                        </a>
                        <?php endif; ?>
                        
                        <?php if ($site_linkedin): ?>
                        <a href="<?php echo esc_url($site_linkedin); ?>" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                <rect width="4" height="12" x="2" y="9"/>
                                <circle cx="4" cy="4" r="2"/>
                            </svg>
                        </a>
                        <?php endif; ?>
                        
                        <?php if ($site_youtube): ?>
                        <a href="<?php echo esc_url($site_youtube); ?>" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                                <path d="m10 15 5-3-5-3z"/>
                            </svg>
                        </a>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="fim-footer-links-col">
                    <h4 class="fim-footer-title">Navigasi</h4>
                    <ul class="fim-footer-links">
                        <li><a href="<?php echo esc_url(home_url('/tentang')); ?>">Tentang Kami</a></li>
                        <li><a href="<?php echo esc_url(home_url('/tentang/regional')); ?>">Regional FIM</a></li>
                        <li><a href="<?php echo esc_url(home_url('/tentang/fim-club')); ?>">FIM Club</a></li>
                        <li><a href="<?php echo esc_url(home_url('/program/pelatihan')); ?>">Program Pelatihan</a></li>
                        <li><a href="<?php echo esc_url(home_url('/gabung-relawan')); ?>">Gabung Relawan</a></li>
                        <li><a href="<?php echo esc_url(home_url('/cerita-alumni')); ?>">Cerita Alumni</a></li>
                        <li><a href="<?php echo esc_url(home_url('/faq')); ?>">FAQ</a></li>
                    </ul>
                </div>

                <!-- Contact -->
                <div class="fim-footer-contact-col">
                    <h4 class="fim-footer-title">Hubungi Kami</h4>
                    <ul class="fim-footer-links">
                        <?php if ($site_email): ?>
                        <li>
                            <a href="mailto:<?php echo esc_attr($site_email); ?>" class="fim-contact-link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                </svg>
                                <?php echo esc_html($site_email); ?>
                            </a>
                        </li>
                        <?php endif; ?>
                        
                        <?php if ($site_phone): ?>
                        <li>
                            <a href="https://wa.me/<?php echo esc_attr($whatsapp_number); ?>" target="_blank" rel="noopener noreferrer" class="fim-contact-link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                </svg>
                                <?php echo esc_html($site_phone); ?> (WA)
                            </a>
                        </li>
                        <?php endif; ?>
                    </ul>
                    
                    <!-- Donate CTA -->
                    <div class="fim-footer-cta">
                        <a href="<?php echo esc_url(home_url('/donasi')); ?>" class="fim-btn fim-btn-gold">
                            Dukung FIM
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Bar -->
        <div class="fim-footer-bottom">
            <div class="fim-container">
                <div class="fim-footer-bottom-inner">
                    <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. Hak cipta dilindungi.</p>
                    <p class="fim-made-with">
                        Dibuat dengan <span class="fim-heart">❤</span> untuk Indonesia
                    </p>
                </div>
            </div>
        </div>
    </footer>

</div><!-- #page -->

<!-- Back to Top Button -->
<button class="fim-back-to-top" aria-label="Kembali ke atas">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m18 15-6-6-6 6"/>
    </svg>
</button>

<?php wp_footer(); ?>
</body>
</html>
