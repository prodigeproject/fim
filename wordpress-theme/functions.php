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
    wp_enqueue_style('fim-style', get_stylesheet_uri(), array(), '2.0.0');
    
    // Theme CSS
    wp_enqueue_style(
        'fim-theme-css',
        get_template_directory_uri() . '/assets/css/theme.css',
        array(),
        '2.0.0'
    );
    
    // Google Fonts
    wp_enqueue_style(
        'fim-fonts',
        'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap',
        array(),
        null
    );
    
    // Theme JavaScript
    wp_enqueue_script(
        'fim-theme-js',
        get_template_directory_uri() . '/assets/js/theme.js',
        array(),
        '2.0.0',
        true // Load in footer
    );
    
    // Pass PHP data to JavaScript if needed
    wp_localize_script('fim-theme-js', 'fimData', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'siteUrl' => home_url('/'),
        'themeUrl' => get_template_directory_uri(),
        'nonce' => wp_create_nonce('fim_nonce'),
    ));
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
 * Get icon SVG by name
 */
function fim_get_icon($name) {
    $icons = array(
        'calendar' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
        'users' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        'map-pin' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
        'award' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
        'heart' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
        'shield' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        'star' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'target' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        'handshake' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>',
        'scale' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
        'user-check' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>',
        'message-square' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
        'book-open' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        'brain' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
        'clipboard' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
        'network' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>',
        'zap' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        'globe' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
        'palette' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>',
        'code' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        'leaf' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
        'compass' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    );
    
    return isset($icons[$name]) ? $icons[$name] : '';
}

/**
 * Calculate reading time
 */
function fim_reading_time() {
    $content = get_post_field('post_content', get_the_ID());
    $word_count = str_word_count(strip_tags($content));
    $reading_time = ceil($word_count / 200);
    return max(1, $reading_time);
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
