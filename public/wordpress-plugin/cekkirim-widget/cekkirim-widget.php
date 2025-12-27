<?php
/**
 * Plugin Name: CekKirim - Widget Cek Resi & Ongkir
 * Plugin URI:  https://cekkirim.com/tools/widget-generator
 * Description: Plugin resmi CekKirim.com untuk menampilkan widget pelacakan paket dan cek ongkir di website WordPress/WooCommerce Anda. Mendukung 60+ Kurir (JNE, J&T, SiCepat, Shopee Express, dll).
 * Version:     1.0.0
 * Author:      CekKirim.com
 * Author URI:  https://cekkirim.com
 * License:     GPLv2 or later
 * Text Domain: cekkirim-widget
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Register Shortcode [cekkirim_widget]
 * 
 * Usage:
 * [cekkirim_widget color="blue" height="450"]
 */
function cekkirim_widget_shortcode( $atts ) {
    // Attributes defaults
    $atts = shortcode_atts( array(
        'color'  => 'blue', // Options: blue, red, green, purple, orange, black
        'height' => '450',
    ), $atts, 'cekkirim_widget' );

    // Sanitize inputs
    $color  = sanitize_text_field( $atts['color'] );
    $height = intval( $atts['height'] );

    // Construct Widget URL (Production)
    // Ensure this points to the correct domain of your Next.js app
    $widget_url = 'https://cekkirim.com/widget/search';
    
    // Add query params
    $final_url = add_query_arg( array(
        'color' => $color,
    ), $widget_url );

    // Return HTML (Iframe)
    // Using inline styles to ensure it looks good immediately
    $html = sprintf(
        '<div class="cekkirim-widget-wrapper" style="width: 100%%; max-width: 600px; margin: 0 auto;">
            <iframe 
                src="%s" 
                width="100%%" 
                height="%d" 
                frameborder="0" 
                scrolling="no" 
                style="border:none; overflow:hidden; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
                title="CekKirim Widget">
            </iframe>
            <div style="text-align: center; margin-top: 8px; font-size: 12px; color: #666;">
                Powered by <a href="https://cekkirim.com" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #666;">CekKirim.com</a>
            </div>
        </div>',
        esc_url( $final_url ),
        esc_attr( $height )
    );

    return $html;
}
add_shortcode( 'cekkirim_widget', 'cekkirim_widget_shortcode' );
