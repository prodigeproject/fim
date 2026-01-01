<?php
/**
 * Footer Template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

    <footer id="colophon" class="site-footer" style="background: #1E3A5F; color: white; padding: 40px 0; margin-top: 60px;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px; text-align: center;">
            <p style="margin: 0 0 10px;">
                &copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. All rights reserved.
            </p>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                Headless WordPress Theme for FIM
            </p>
        </div>
    </footer>

</div><!-- #page -->

<?php wp_footer(); ?>
</body>
</html>
