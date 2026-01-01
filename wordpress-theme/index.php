<?php
/**
 * Main Template File
 * 
 * This theme is designed for headless WordPress usage.
 * The frontend is served by a React application.
 * 
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>

<main id="main" class="site-main">
    <div class="container" style="padding: 60px 20px; text-align: center; max-width: 800px; margin: 0 auto;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">Forum Indonesia Muda</h1>
        <p style="color: #666; margin-bottom: 2rem;">
            Website ini menggunakan arsitektur Headless WordPress. 
            Frontend utama diakses melalui domain terpisah.
        </p>
        
        <div style="background: #f5f5f5; padding: 30px; border-radius: 12px; margin-bottom: 2rem;">
            <h2 style="font-size: 1.25rem; margin-bottom: 1rem;">🔧 Admin Area</h2>
            <p style="margin-bottom: 1rem;">Kelola konten website melalui dashboard WordPress.</p>
            <a href="<?php echo admin_url(); ?>" style="display: inline-block; background: #E94E1B; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Masuk ke Dashboard
            </a>
        </div>
        
        <div style="background: #e8f4fc; padding: 30px; border-radius: 12px;">
            <h2 style="font-size: 1.25rem; margin-bottom: 1rem;">🌐 REST API</h2>
            <p style="margin-bottom: 1rem;">Akses data melalui WordPress REST API.</p>
            <code style="display: block; background: #1e3a5f; color: #fff; padding: 15px; border-radius: 8px; font-size: 14px; word-break: break-all;">
                <?php echo rest_url('wp/v2/'); ?>
            </code>
        </div>
        
        <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #eee;">
            <h3 style="font-size: 1rem; color: #666; margin-bottom: 1rem;">Endpoint Tersedia:</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                <a href="<?php echo rest_url('wp/v2/posts'); ?>" target="_blank" style="background: #f0f0f0; padding: 8px 16px; border-radius: 20px; text-decoration: none; color: #333; font-size: 14px;">/posts</a>
                <a href="<?php echo rest_url('wp/v2/program'); ?>" target="_blank" style="background: #f0f0f0; padding: 8px 16px; border-radius: 20px; text-decoration: none; color: #333; font-size: 14px;">/program</a>
                <a href="<?php echo rest_url('wp/v2/alumni_story'); ?>" target="_blank" style="background: #f0f0f0; padding: 8px 16px; border-radius: 20px; text-decoration: none; color: #333; font-size: 14px;">/alumni_story</a>
                <a href="<?php echo rest_url('wp/v2/regional'); ?>" target="_blank" style="background: #f0f0f0; padding: 8px 16px; border-radius: 20px; text-decoration: none; color: #333; font-size: 14px;">/regional</a>
                <a href="<?php echo rest_url('wp/v2/faq'); ?>" target="_blank" style="background: #f0f0f0; padding: 8px 16px; border-radius: 20px; text-decoration: none; color: #333; font-size: 14px;">/faq</a>
                <a href="<?php echo rest_url('wp/v2/partner'); ?>" target="_blank" style="background: #f0f0f0; padding: 8px 16px; border-radius: 20px; text-decoration: none; color: #333; font-size: 14px;">/partner</a>
            </div>
        </div>
    </div>
</main>

<?php
get_footer();
