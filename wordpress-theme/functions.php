<?php
/**
 * FIM Theme Functions
 *
 * @package FIM_Theme
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Theme Setup
 */
function fim_theme_setup() {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
    
    // Set thumbnail sizes
    add_image_size('fim-card', 400, 225, true);
    add_image_size('fim-hero', 1920, 600, true);
    add_image_size('fim-avatar', 200, 200, true);
}
add_action('after_setup_theme', 'fim_theme_setup');

/**
 * Include theme files
 */
require_once get_template_directory() . '/inc/custom-post-types.php';
require_once get_template_directory() . '/inc/rest-api.php';

// Only include ACF fields if ACF is active
if (class_exists('ACF')) {
    require_once get_template_directory() . '/inc/acf-fields.php';
}

/**
 * Enqueue scripts and styles
 */
function fim_enqueue_assets() {
    wp_enqueue_style('fim-style', get_stylesheet_uri(), array(), '1.0.0');
    
    // Theme CSS
    wp_enqueue_style(
        'fim-theme-css',
        get_template_directory_uri() . '/assets/css/theme.css',
        array(),
        '1.0.0'
    );
    
    // Google Fonts
    wp_enqueue_style(
        'fim-fonts',
        'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap',
        array(),
        null
    );
}
add_action('wp_enqueue_scripts', 'fim_enqueue_assets');

/**
 * Get sector icon SVG
 */
function fim_get_sector_icon($sector) {
    $icons = array(
        'Pendidikan' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
        'Sosial' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
        'Teknologi' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        'Kesehatan' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
        'Lingkungan' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
        'Bisnis' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
        'Internasional' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    );
    
    return isset($icons[$sector]) ? $icons[$sector] : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
}

/**
 * Admin notice for required plugins
 */
function fim_admin_notices() {
    if (!class_exists('ACF')) {
        ?>
        <div class="notice notice-error">
            <p><strong>FIM Theme:</strong> Plugin <a href="https://www.advancedcustomfields.com/" target="_blank">Advanced Custom Fields</a> diperlukan untuk fitur lengkap theme ini.</p>
        </div>
        <?php
    }
    
    if (!function_exists('acf_to_rest_api')) {
        ?>
        <div class="notice notice-warning">
            <p><strong>FIM Theme:</strong> Plugin <a href="https://wordpress.org/plugins/acf-to-rest-api/" target="_blank">ACF to REST API</a> disarankan untuk expose ACF fields ke REST API.</p>
        </div>
        <?php
    }
}
add_action('admin_notices', 'fim_admin_notices');

/**
 * Customize admin columns for custom post types
 */
function fim_program_columns($columns) {
    $new_columns = array(
        'cb' => $columns['cb'],
        'title' => __('Nama Program', 'fim-theme'),
        'fim_tanggal' => __('Tanggal', 'fim-theme'),
        'fim_lokasi' => __('Lokasi', 'fim-theme'),
        'fim_status' => __('Status', 'fim-theme'),
        'date' => $columns['date'],
    );
    return $new_columns;
}
add_filter('manage_program_posts_columns', 'fim_program_columns');

function fim_program_column_content($column, $post_id) {
    switch ($column) {
        case 'fim_tanggal':
            $start = get_field('tanggal_mulai', $post_id);
            $end = get_field('tanggal_selesai', $post_id);
            if ($start) {
                echo esc_html($start);
                if ($end) {
                    echo ' - ' . esc_html($end);
                }
            } else {
                echo '—';
            }
            break;
            
        case 'fim_lokasi':
            $lokasi = get_field('lokasi', $post_id);
            echo $lokasi ? esc_html($lokasi) : '—';
            break;
            
        case 'fim_status':
            $status = get_field('status', $post_id);
            $class = 'fim-status-' . sanitize_title($status);
            echo $status ? '<span class="' . esc_attr($class) . '" style="padding: 4px 8px; border-radius: 4px; font-size: 12px;">' . esc_html($status) . '</span>' : '—';
            break;
    }
}
add_action('manage_program_posts_custom_column', 'fim_program_column_content', 10, 2);

/**
 * Alumni Story columns
 */
function fim_alumni_columns($columns) {
    $new_columns = array(
        'cb' => $columns['cb'],
        'title' => __('Nama Alumni', 'fim-theme'),
        'fim_batch' => __('Batch', 'fim-theme'),
        'fim_sektor' => __('Sektor', 'fim-theme'),
        'fim_jabatan' => __('Jabatan', 'fim-theme'),
        'date' => $columns['date'],
    );
    return $new_columns;
}
add_filter('manage_alumni_story_posts_columns', 'fim_alumni_columns');

function fim_alumni_column_content($column, $post_id) {
    switch ($column) {
        case 'fim_batch':
            $batch = get_field('batch', $post_id);
            echo $batch ? esc_html($batch) : '—';
            break;
            
        case 'fim_sektor':
            $sektor = get_field('sektor', $post_id);
            echo $sektor ? esc_html($sektor) : '—';
            break;
            
        case 'fim_jabatan':
            $jabatan = get_field('jabatan', $post_id);
            echo $jabatan ? esc_html($jabatan) : '—';
            break;
    }
}
add_action('manage_alumni_story_posts_custom_column', 'fim_alumni_column_content', 10, 2);

/**
 * Regional columns
 */
function fim_regional_columns($columns) {
    $new_columns = array(
        'cb' => $columns['cb'],
        'title' => __('Nama Regional', 'fim-theme'),
        'fim_provinsi' => __('Provinsi', 'fim-theme'),
        'fim_pulau' => __('Pulau', 'fim-theme'),
        'fim_koordinator' => __('Koordinator', 'fim-theme'),
        'date' => $columns['date'],
    );
    return $new_columns;
}
add_filter('manage_regional_posts_columns', 'fim_regional_columns');

function fim_regional_column_content($column, $post_id) {
    switch ($column) {
        case 'fim_provinsi':
            $provinsi = get_field('provinsi', $post_id);
            echo $provinsi ? esc_html($provinsi) : '—';
            break;
            
        case 'fim_pulau':
            $pulau = get_field('pulau', $post_id);
            echo $pulau ? esc_html($pulau) : '—';
            break;
            
        case 'fim_koordinator':
            $koordinator = get_field('koordinator', $post_id);
            echo $koordinator ? esc_html($koordinator) : '—';
            break;
    }
}
add_action('manage_regional_posts_custom_column', 'fim_regional_column_content', 10, 2);

/**
 * Disable Gutenberg for custom post types (optional)
 */
function fim_disable_gutenberg($use_block_editor, $post_type) {
    $disabled_post_types = array('faq', 'partner');
    
    if (in_array($post_type, $disabled_post_types)) {
        return false;
    }
    
    return $use_block_editor;
}
add_filter('use_block_editor_for_post_type', 'fim_disable_gutenberg', 10, 2);
