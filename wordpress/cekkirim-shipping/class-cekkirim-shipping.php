<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WC_CekKirim_Shipping extends WC_Shipping_Method {

    public function __construct( $instance_id = 0 ) {
        $this->id                 = 'cekkirim_shipping';
        $this->instance_id        = absint( $instance_id );
        $this->method_title       = __( 'CekKirim Shipping', 'cekkirim' );
        $this->method_description = __( 'Ongkos kirim otomatis JNE, J&T, SiCepat via CekKirim.', 'cekkirim' );
        $this->supports           = array( 'shipping-zones', 'instance-settings' );

        $this->init();
    }

    public function init() {
        $this->init_form_fields();
        $this->init_settings();

        $this->enabled = $this->get_option( 'enabled' );
        $this->title   = $this->get_option( 'title' );
        
        // Save Settings Hook
        add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
    }

    public function init_form_fields() {
        $this->form_fields = array(
            'enabled' => array(
                'title'   => __( 'Enable/Disable', 'cekkirim' ),
                'type'    => 'checkbox',
                'label'   => __( 'Enable CekKirim Shipping', 'cekkirim' ),
                'default' => 'yes',
            ),
            'title' => array(
                'title'       => __( 'Method Title', 'cekkirim' ),
                'type'        => 'text',
                'description' => __( 'This controls the title which the user sees during checkout.', 'cekkirim' ),
                'default'     => __( 'CekKirim (JNE/J&T/SiCepat)', 'cekkirim' ),
            ),
            'api_key' => array(
                'title'       => __( 'API Key', 'cekkirim' ),
                'type'        => 'text',
                'description' => __( 'Dapatkan API Key di <a href="https://cekkirim.com/dashboard/api-keys" target="_blank">Dashboard CekKirim</a>.', 'cekkirim' ),
            ),
            'origin_city' => array(
                'title'       => __( 'Kota Asal (Origin)', 'cekkirim' ),
                'type'        => 'text',
                'description' => __( 'Masukkan nama kota pengiriman (Contoh: Jakarta Selatan).', 'cekkirim' ),
            ),
        );
    }

    public function calculate_shipping( $package = array() ) {
        $api_key = $this->get_option( 'api_key' );
        $origin  = $this->get_option( 'origin_city' );

        if ( empty( $api_key ) || empty( $origin ) ) {
            return;
        }

        // 1. Calculate Weight
        $weight = 0;
        foreach ( $package['contents'] as $item_id => $values ) {
            $weight += $values['data']->get_weight() * $values['quantity'];
        }
        // Normalize weight to kg if needed, assuming CekKirim needs grams or kg. 
        // Assuming user input in WC is kg, CekKirim takes grams:
        // $weight = $weight * 1000; 

        // 2. Prepare API Request
        $api_url = 'https://cekkirim.com/api/integration/woocommerce/rates';
        
        $destination = $package['destination'];
        $payload = array(
            'origin_city'          => $origin,
            'destination_district' => $destination['city'] . ', ' . $destination['state'], // Simple concatenation for example
            'weight'               => $weight
        );

        // 3. Remote Post with Timeout
        $response = wp_remote_post( $api_url, array(
            'headers' => array(
                'x-api-key'    => $api_key,
                'Content-Type' => 'application/json',
            ),
            'body'    => json_encode( $payload ),
            'timeout' => 5, // 5 seconds timeout prevention
        ) );

        if ( is_wp_error( $response ) ) {
            return;
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        if ( ! empty( $data['success'] ) && ! empty( $data['rates'] ) ) {
            foreach ( $data['rates'] as $rate ) {
                $this->add_rate( array(
                    'id'    => $this->id . ':' . $rate['id'],
                    'label' => $rate['label'],
                    'cost'  => $rate['cost'],
                ) );
            }
        }
    }
}
