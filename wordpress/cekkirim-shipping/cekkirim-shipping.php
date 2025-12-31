<?php
/**
 * Plugin Name: CekKirim Shipping
 * Plugin URI: https://cekkirim.com/integrations/woocommerce
 * Description: Real-time shipping rates for JNE, J&T, SiCepat via CekKirim API.
 * Version: 1.0.0
 * Author: CekKirim Team
 * Author URI: https://cekkirim.com
 * License: GPL2
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Init Plugin
add_action( 'woocommerce_shipping_init', 'cekkirim_shipping_init' );

function cekkirim_shipping_init() {
    if ( ! class_exists( 'WC_CekKirim_Shipping' ) ) {
        require_once 'class-cekkirim-shipping.php';
    }
}

// Add Method
add_filter( 'woocommerce_shipping_methods', 'add_cekkirim_shipping_method' );
function add_cekkirim_shipping_method( $methods ) {
    $methods['cekkirim_shipping'] = 'WC_CekKirim_Shipping';
    return $methods;
}
