<?php
/**
 * Header Template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="page" class="site">
    <header id="masthead" class="site-header" style="background: #1E3A5F; color: white; padding: 20px 0;">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center;">
            <div class="site-branding">
                <h1 class="site-title" style="margin: 0; font-size: 1.5rem;">
                    <a href="<?php echo esc_url(home_url('/')); ?>" style="color: white; text-decoration: none;">
                        <?php bloginfo('name'); ?>
                    </a>
                </h1>
            </div>
            
            <nav class="main-navigation">
                <?php if (is_user_logged_in()): ?>
                    <a href="<?php echo admin_url(); ?>" style="color: white; text-decoration: none; margin-right: 20px;">Dashboard</a>
                    <a href="<?php echo wp_logout_url(home_url()); ?>" style="color: white; text-decoration: none;">Logout</a>
                <?php else: ?>
                    <a href="<?php echo wp_login_url(); ?>" style="color: white; text-decoration: none;">Login</a>
                <?php endif; ?>
            </nav>
        </div>
    </header>
