<?php
/**
 * Plugin Name: CekKirim Shipping for WooCommerce
 * Description: Real-time shipping rates from CekKirim with markup support.
 * Version: 1.0.0
 * Author: CekKirim Team
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'woocommerce_shipping_init', 'cekkirim_shipping_init' );

function cekkirim_shipping_init() {
    class WC_CekKirim_Shipping extends WC_Shipping_Method {
        public function __construct( $instance_id = 0 ) {
            $this->id                 = 'cekkirim_shipping';
            $this->instance_id        = absint( $instance_id );
            $this->method_title       = __( 'CekKirim Shipping', 'cekkirim' );
            $this->method_description = __( 'Real-time rates from CekKirim API.', 'cekkirim' );
            $this->supports           = array( 'shipping-zones', 'instance-settings' );
            $this->init();
        }

        public function init() {
            $this->init_form_fields();
            $this->init_settings();
            $this->enabled = $this->get_option( 'enabled' );
            $this->title   = $this->get_option( 'title' );
            
            add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
        }

        public function calculate_shipping( $package = array() ) {
            // 1. Get Destination
            $destination = $package['destination'];
            $city = $destination['city'];
            $weight = 0;
            
            foreach ( $package['contents'] as $item_id => $values ) {
                $weight += $values['data']->get_weight() * $values['quantity'];
            }
            
            // 2. Call CekKirim API (Mock)
            // In real world: wp_remote_get('https://cekkirim.com/api/pricing?city=' . $city);
            
            // Mock Rates
            $rates = array(
                array(
                    'id'    => 'cekkirim_jne',
                    'label' => 'JNE REG (CekKirim)',
                    'cost'  => 10000 + 1000, // Cost + Markup
                ),
                array(
                    'id'    => 'cekkirim_sicepat',
                    'label' => 'SiCepat Halu (CekKirim)',
                    'cost'  => 8000 + 1000, // Cost + Markup
                )
            );
            
            // 3. Register Rates
            foreach ( $rates as $rate ) {
                // Verify License before showing rates (Optional implementation)
                // if (check_license()) { ... }

                $this->add_rate( $rate );
            }
        }
    }
}

add_filter( 'woocommerce_shipping_methods', 'add_cekkirim_shipping_method' );
function add_cekkirim_shipping_method( $methods ) {
    $methods['cekkirim_shipping'] = 'WC_CekKirim_Shipping';
    return $methods;
}
