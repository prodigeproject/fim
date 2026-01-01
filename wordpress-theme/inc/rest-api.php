<?php
/**
 * REST API Customization & CORS
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Enable CORS for REST API
 */
function fim_add_cors_headers() {
    // Allow from any origin (modify for production)
    $allowed_origins = array(
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8080',
        'https://forumindonesiamuda.org',
        'https://www.forumindonesiamuda.org',
        // Add your production domain here
    );
    
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    // Check if origin is allowed or allow all for development
    if (in_array($origin, $allowed_origins) || defined('WP_DEBUG') && WP_DEBUG) {
        header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Max-Age: 86400");
    }
}
add_action('rest_api_init', 'fim_add_cors_headers', 15);

/**
 * Handle preflight OPTIONS requests
 */
function fim_handle_preflight() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        fim_add_cors_headers();
        status_header(200);
        exit();
    }
}
add_action('init', 'fim_handle_preflight');

/**
 * Modify REST API response for custom post types
 */
function fim_rest_prepare_post($response, $post, $request) {
    // Add ACF fields to response if not using ACF to REST API plugin
    if (function_exists('get_fields') && !function_exists('acf_to_rest_api')) {
        $fields = get_fields($post->ID);
        if ($fields) {
            $response->data['acf'] = $fields;
        }
    }
    
    return $response;
}
add_filter('rest_prepare_program', 'fim_rest_prepare_post', 10, 3);
add_filter('rest_prepare_alumni_story', 'fim_rest_prepare_post', 10, 3);
add_filter('rest_prepare_regional', 'fim_rest_prepare_post', 10, 3);
add_filter('rest_prepare_faq', 'fim_rest_prepare_post', 10, 3);
add_filter('rest_prepare_partner', 'fim_rest_prepare_post', 10, 3);

/**
 * Add featured image URL to REST API response
 */
function fim_add_featured_image_url() {
    $post_types = array('post', 'program', 'alumni_story', 'regional', 'partner');
    
    foreach ($post_types as $post_type) {
        register_rest_field($post_type, 'featured_image_url', array(
            'get_callback' => function($post) {
                $image_id = get_post_thumbnail_id($post['id']);
                if ($image_id) {
                    $image = wp_get_attachment_image_src($image_id, 'full');
                    return $image ? $image[0] : null;
                }
                return null;
            },
            'schema' => array(
                'description' => 'URL of featured image',
                'type' => 'string',
            ),
        ));
        
        // Also add medium size
        register_rest_field($post_type, 'featured_image_medium', array(
            'get_callback' => function($post) {
                $image_id = get_post_thumbnail_id($post['id']);
                if ($image_id) {
                    $image = wp_get_attachment_image_src($image_id, 'medium_large');
                    return $image ? $image[0] : null;
                }
                return null;
            },
            'schema' => array(
                'description' => 'URL of featured image (medium size)',
                'type' => 'string',
            ),
        ));
    }
}
add_action('rest_api_init', 'fim_add_featured_image_url');

/**
 * Add author details to REST API response
 */
function fim_add_author_details() {
    register_rest_field('post', 'author_details', array(
        'get_callback' => function($post) {
            $author_id = $post['author'];
            return array(
                'name' => get_the_author_meta('display_name', $author_id),
                'avatar' => get_avatar_url($author_id, array('size' => 96)),
                'bio' => get_the_author_meta('description', $author_id),
            );
        },
        'schema' => array(
            'description' => 'Author details including name and avatar',
            'type' => 'object',
        ),
    ));
}
add_action('rest_api_init', 'fim_add_author_details');

/**
 * Increase REST API per_page limit
 */
function fim_rest_post_collection_params($params) {
    if (isset($params['per_page'])) {
        $params['per_page']['maximum'] = 100;
    }
    return $params;
}
add_filter('rest_post_collection_params', 'fim_rest_post_collection_params');
add_filter('rest_program_collection_params', 'fim_rest_post_collection_params');
add_filter('rest_alumni_story_collection_params', 'fim_rest_post_collection_params');
add_filter('rest_regional_collection_params', 'fim_rest_post_collection_params');
add_filter('rest_faq_collection_params', 'fim_rest_post_collection_params');
add_filter('rest_partner_collection_params', 'fim_rest_post_collection_params');

/**
 * Custom REST endpoint for site info
 */
function fim_register_site_info_endpoint() {
    register_rest_route('fim/v1', '/site-info', array(
        'methods' => 'GET',
        'callback' => function() {
            return array(
                'name' => get_bloginfo('name'),
                'description' => get_bloginfo('description'),
                'url' => home_url(),
                'admin_email' => get_option('admin_email'),
                'language' => get_bloginfo('language'),
            );
        },
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'fim_register_site_info_endpoint');

/**
 * Custom REST endpoint for menu items
 */
function fim_register_menu_endpoint() {
    register_rest_route('fim/v1', '/menu/(?P<location>[a-zA-Z0-9_-]+)', array(
        'methods' => 'GET',
        'callback' => function($request) {
            $location = $request['location'];
            $locations = get_nav_menu_locations();
            
            if (!isset($locations[$location])) {
                return new WP_Error('no_menu', 'Menu not found', array('status' => 404));
            }
            
            $menu_id = $locations[$location];
            $menu_items = wp_get_nav_menu_items($menu_id);
            
            if (!$menu_items) {
                return array();
            }
            
            $formatted_items = array();
            foreach ($menu_items as $item) {
                $formatted_items[] = array(
                    'id' => $item->ID,
                    'title' => $item->title,
                    'url' => $item->url,
                    'parent' => $item->menu_item_parent,
                    'order' => $item->menu_order,
                );
            }
            
            return $formatted_items;
        },
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'fim_register_menu_endpoint');
