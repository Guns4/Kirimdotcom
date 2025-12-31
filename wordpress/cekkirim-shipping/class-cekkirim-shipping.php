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
        
        add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
        
        // Inject Ad Banner
        add_action( 'woocommerce_settings_before_' . $this->id, array( $this, 'render_admin_banner' ) );
    }

    public function render_admin_banner() {
        // Fetch Ad from CekKirim API
        $response = wp_remote_get( 'https://cekkirim.com/api/ads/plugin-banner', array( 'timeout' => 2 ) );
        if ( is_wp_error( $response ) ) return;
        
        $body = wp_remote_retrieve_body( $response );
        $ad = json_decode( $body, true );

        if ( ! empty( $ad['show'] ) ) {
            echo '<div style="background: #fff; padding: 15px; border-left: 5px solid #f59e0b; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 style="margin: 0 0 5px; color: #d97706;">📢 ' . esc_html( $ad['text'] ) . '</h3>
                        <a href="' . esc_url( $ad['link'] ) . '" target="_blank" class="button button-primary" style="background: #f59e0b; border-color: #d97706;">' . esc_html( $ad['cta_text'] ) . '</a>
                    </div>
                    <img src="' . esc_url( $ad['image_url'] ) . '" style="max-height: 80px; border-radius: 4px;">
                </div>
            </div>';
        }
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

        // 2. Prepare API Request
        $api_url = 'https://cekkirim.com/api/integration/woocommerce/rates';
        
        $destination = $package['destination'];
        $payload = array(
            'origin_city'          => $origin,
            'destination_district' => $destination['city'] . ', ' . $destination['state'],
            'weight'               => $weight
        );

        // 3. Remote Post with Timeout & Fail-Safe
        $response = wp_remote_post( $api_url, array(
            'headers' => array(
                'x-api-key'    => $api_key,
                'Content-Type' => 'application/json',
            ),
            'body'    => json_encode( $payload ),
            'timeout' => 5, // 5 seconds timeout
        ) );

        // Fail-Safe: If API fails, silently continue (don't show rates)
        if ( is_wp_error( $response ) ) {
            error_log( 'CekKirim API Error: ' . $response->get_error_message() );
            return; // Graceful degradation - no rates shown
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        // Handle API errors gracefully
        if ( empty( $data['success'] ) ) {
            error_log( 'CekKirim API Response Error: ' . ( $data['error'] ?? 'Unknown' ) );
            return; // Don't crash checkout
        }

        if ( ! empty( $data['rates'] ) ) {
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
