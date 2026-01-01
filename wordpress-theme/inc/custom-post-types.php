<?php
/**
 * Custom Post Types Registration
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register Custom Post Types
 */
function fim_register_post_types() {
    
    // Program
    register_post_type('program', array(
        'labels' => array(
            'name'               => __('Program', 'fim-theme'),
            'singular_name'      => __('Program', 'fim-theme'),
            'menu_name'          => __('Program', 'fim-theme'),
            'add_new'            => __('Tambah Program', 'fim-theme'),
            'add_new_item'       => __('Tambah Program Baru', 'fim-theme'),
            'edit_item'          => __('Edit Program', 'fim-theme'),
            'new_item'           => __('Program Baru', 'fim-theme'),
            'view_item'          => __('Lihat Program', 'fim-theme'),
            'search_items'       => __('Cari Program', 'fim-theme'),
            'not_found'          => __('Tidak ada program ditemukan', 'fim-theme'),
            'not_found_in_trash' => __('Tidak ada program di sampah', 'fim-theme'),
        ),
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array('slug' => 'program'),
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => false,
        'menu_position'      => 5,
        'menu_icon'          => 'dashicons-welcome-learn-more',
        'supports'           => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'show_in_rest'       => true, // Enable REST API
        'rest_base'          => 'program',
    ));
    
    // Alumni Story
    register_post_type('alumni_story', array(
        'labels' => array(
            'name'               => __('Cerita Alumni', 'fim-theme'),
            'singular_name'      => __('Cerita Alumni', 'fim-theme'),
            'menu_name'          => __('Cerita Alumni', 'fim-theme'),
            'add_new'            => __('Tambah Cerita', 'fim-theme'),
            'add_new_item'       => __('Tambah Cerita Alumni Baru', 'fim-theme'),
            'edit_item'          => __('Edit Cerita Alumni', 'fim-theme'),
            'new_item'           => __('Cerita Alumni Baru', 'fim-theme'),
            'view_item'          => __('Lihat Cerita Alumni', 'fim-theme'),
            'search_items'       => __('Cari Cerita Alumni', 'fim-theme'),
            'not_found'          => __('Tidak ada cerita alumni ditemukan', 'fim-theme'),
            'not_found_in_trash' => __('Tidak ada cerita alumni di sampah', 'fim-theme'),
        ),
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array('slug' => 'cerita-alumni'),
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => false,
        'menu_position'      => 6,
        'menu_icon'          => 'dashicons-groups',
        'supports'           => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'show_in_rest'       => true,
        'rest_base'          => 'alumni_story',
    ));
    
    // Regional
    register_post_type('regional', array(
        'labels' => array(
            'name'               => __('Regional', 'fim-theme'),
            'singular_name'      => __('Regional', 'fim-theme'),
            'menu_name'          => __('Regional', 'fim-theme'),
            'add_new'            => __('Tambah Regional', 'fim-theme'),
            'add_new_item'       => __('Tambah Regional Baru', 'fim-theme'),
            'edit_item'          => __('Edit Regional', 'fim-theme'),
            'new_item'           => __('Regional Baru', 'fim-theme'),
            'view_item'          => __('Lihat Regional', 'fim-theme'),
            'search_items'       => __('Cari Regional', 'fim-theme'),
            'not_found'          => __('Tidak ada regional ditemukan', 'fim-theme'),
            'not_found_in_trash' => __('Tidak ada regional di sampah', 'fim-theme'),
        ),
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array('slug' => 'regional'),
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => false,
        'menu_position'      => 7,
        'menu_icon'          => 'dashicons-location-alt',
        'supports'           => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'show_in_rest'       => true,
        'rest_base'          => 'regional',
    ));
    
    // FAQ
    register_post_type('faq', array(
        'labels' => array(
            'name'               => __('FAQ', 'fim-theme'),
            'singular_name'      => __('FAQ', 'fim-theme'),
            'menu_name'          => __('FAQ', 'fim-theme'),
            'add_new'            => __('Tambah FAQ', 'fim-theme'),
            'add_new_item'       => __('Tambah FAQ Baru', 'fim-theme'),
            'edit_item'          => __('Edit FAQ', 'fim-theme'),
            'new_item'           => __('FAQ Baru', 'fim-theme'),
            'view_item'          => __('Lihat FAQ', 'fim-theme'),
            'search_items'       => __('Cari FAQ', 'fim-theme'),
            'not_found'          => __('Tidak ada FAQ ditemukan', 'fim-theme'),
            'not_found_in_trash' => __('Tidak ada FAQ di sampah', 'fim-theme'),
        ),
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array('slug' => 'faq'),
        'capability_type'    => 'post',
        'has_archive'        => false,
        'hierarchical'       => false,
        'menu_position'      => 8,
        'menu_icon'          => 'dashicons-editor-help',
        'supports'           => array('title', 'editor', 'custom-fields'),
        'show_in_rest'       => true,
        'rest_base'          => 'faq',
    ));
    
    // Partner
    register_post_type('partner', array(
        'labels' => array(
            'name'               => __('Partner', 'fim-theme'),
            'singular_name'      => __('Partner', 'fim-theme'),
            'menu_name'          => __('Partner', 'fim-theme'),
            'add_new'            => __('Tambah Partner', 'fim-theme'),
            'add_new_item'       => __('Tambah Partner Baru', 'fim-theme'),
            'edit_item'          => __('Edit Partner', 'fim-theme'),
            'new_item'           => __('Partner Baru', 'fim-theme'),
            'view_item'          => __('Lihat Partner', 'fim-theme'),
            'search_items'       => __('Cari Partner', 'fim-theme'),
            'not_found'          => __('Tidak ada partner ditemukan', 'fim-theme'),
            'not_found_in_trash' => __('Tidak ada partner di sampah', 'fim-theme'),
        ),
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array('slug' => 'partner'),
        'capability_type'    => 'post',
        'has_archive'        => false,
        'hierarchical'       => false,
        'menu_position'      => 9,
        'menu_icon'          => 'dashicons-networking',
        'supports'           => array('title', 'thumbnail', 'custom-fields'),
        'show_in_rest'       => true,
        'rest_base'          => 'partner',
    ));
}
add_action('init', 'fim_register_post_types');

/**
 * Flush rewrite rules on theme activation
 */
function fim_rewrite_flush() {
    fim_register_post_types();
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'fim_rewrite_flush');
