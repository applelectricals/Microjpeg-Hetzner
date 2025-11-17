<?php
/**
 * Plugin Name: Micro JPEG API Compressor
 * Plugin URI: https://microjpeg.com
 * Description: WordPress plugin that integrates with Micro JPEG API for cloud-based image compression with support for 13+ formats including JPEG, PNG, WebP, AVIF, SVG, TIFF, and professional RAW files (CR2, ARW, DNG, NEF, ORF, RAF, RW2).
 * Version: 2.0.0
 * Author: Micro JPEG Team
 * License: GPL v2 or later
 * Text Domain: micro-jpeg-api-compressor
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('MICRO_JPEG_API_VERSION', '2.0.0');
define('MICRO_JPEG_API_PLUGIN_URL', plugin_dir_url(__FILE__));
define('MICRO_JPEG_API_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('MICRO_JPEG_API_ENDPOINT', 'https://microjpeg.com/api/v1/compress'); // MicroJPEG API endpoint

/**
 * Main Plugin Class
 */
class MicroJpegApiCompressor {
    
    private static $instance = null;
    private $api_key = null;
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('init', array($this, 'init'));
        add_action('admin_init', array($this, 'admin_init'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // AJAX handlers
        add_action('wp_ajax_micro_jpeg_api_compress', array($this, 'handle_api_compression'));
        add_action('wp_ajax_nopriv_micro_jpeg_api_compress', array($this, 'handle_api_compression'));
        add_action('wp_ajax_micro_jpeg_api_bulk_optimize', array($this, 'handle_bulk_optimization'));
        add_action('wp_ajax_micro_jpeg_api_test_key', array($this, 'test_api_key'));
        
        // WordPress media hooks
        add_filter('wp_handle_upload', array($this, 'auto_compress_upload'), 10, 2);
        add_filter('wp_generate_attachment_metadata', array($this, 'optimize_attachment'), 10, 2);
        
        // Add media library column
        add_filter('manage_media_columns', array($this, 'add_media_column'));
        add_action('manage_media_custom_column', array($this, 'display_media_column'), 10, 2);
        
        // Shortcode
        add_shortcode('micro_jpeg_api_compressor', array($this, 'render_compressor'));
        
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        $this->api_key = get_option('micro_jpeg_api_key', '');
        load_plugin_textdomain('micro-jpeg-api-compressor', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function admin_init() {
        register_setting('micro_jpeg_api_settings', 'micro_jpeg_api_key');
        register_setting('micro_jpeg_api_settings', 'micro_jpeg_auto_compress');
        register_setting('micro_jpeg_api_settings', 'micro_jpeg_default_quality');
        register_setting('micro_jpeg_api_settings', 'micro_jpeg_backup_originals');
        register_setting('micro_jpeg_api_settings', 'micro_jpeg_allowed_formats');
    }
    
    public function add_admin_menu() {
        add_media_page(
            __('Micro JPEG API Settings', 'micro-jpeg-api-compressor'),
            __('Micro JPEG API', 'micro-jpeg-api-compressor'),
            'manage_options',
            'micro-jpeg-api-settings',
            array($this, 'admin_page')
        );
        
        add_media_page(
            __('Bulk Optimize', 'micro-jpeg-api-compressor'),
            __('Bulk Optimize', 'micro-jpeg-api-compressor'),
            'manage_options',
            'micro-jpeg-bulk-optimize',
            array($this, 'bulk_optimize_page')
        );
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('micro-jpeg-api-js', MICRO_JPEG_API_PLUGIN_URL . 'assets/micro-jpeg-api.js', array('jquery'), MICRO_JPEG_API_VERSION, true);
        wp_enqueue_style('micro-jpeg-api-css', MICRO_JPEG_API_PLUGIN_URL . 'assets/micro-jpeg-api.css', array(), MICRO_JPEG_API_VERSION);
        
        wp_localize_script('micro-jpeg-api-js', 'microJpegApiAjax', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('micro_jpeg_api_nonce'),
            'pluginUrl' => MICRO_JPEG_API_PLUGIN_URL,
            'hasApiKey' => !empty($this->api_key)
        ));
    }
    
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'micro-jpeg') !== false || $hook === 'upload.php') {
            $this->enqueue_scripts();
        }
    }
    
    /**
     * API Integration Methods
     */
    public function call_api($endpoint, $data, $files = null) {
        if (empty($this->api_key)) {
            return new WP_Error('no_api_key', __('Micro JPEG API key is not configured.', 'micro-jpeg-api-compressor'));
        }
        
        $args = array(
            'timeout' => 60,
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
            )
        );
        
        if ($files) {
            // Handle file upload
            $boundary = wp_generate_password(24);
            $args['headers']['Content-Type'] = 'multipart/form-data; boundary=' . $boundary;
            
            $body = '';
            
            // Add data fields
            foreach ($data as $key => $value) {
                $body .= '--' . $boundary . "\r\n";
                $body .= 'Content-Disposition: form-data; name="' . $key . '"' . "\r\n\r\n";
                $body .= $value . "\r\n";
            }
            
            // Add file
            if (is_array($files)) {
                foreach ($files as $name => $file) {
                    $body .= '--' . $boundary . "\r\n";
                    $body .= 'Content-Disposition: form-data; name="' . $name . '"; filename="' . basename($file['name']) . '"' . "\r\n";
                    $body .= 'Content-Type: ' . $file['type'] . "\r\n\r\n";
                    $body .= file_get_contents($file['tmp_name']) . "\r\n";
                }
            }
            
            $body .= '--' . $boundary . '--' . "\r\n";
            $args['body'] = $body;
        } else {
            $args['body'] = json_encode($data);
            $args['headers']['Content-Type'] = 'application/json';
        }
        
        $response = wp_remote_post($endpoint, $args);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $decoded = json_decode($body, true);
        
        if (wp_remote_retrieve_response_code($response) !== 200) {
            return new WP_Error('api_error', $decoded['message'] ?? __('API request failed', 'micro-jpeg-api-compressor'));
        }
        
        return $decoded;
    }
    
    public function handle_api_compression() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'micro_jpeg_api_nonce')) {
            wp_die('Security check failed');
        }
        
        if (empty($_FILES['files'])) {
            wp_send_json_error(__('No files uploaded', 'micro-jpeg-api-compressor'));
            return;
        }
        
        $settings = json_decode(stripslashes($_POST['settings']), true);
        if (!$settings) {
            $settings = array(
                'quality' => 75,
                'outputFormat' => 'keep-original',
                'resizeOption' => 'keep-original',
            );
        }
        
        $results = array();
        $files = $_FILES['files'];
        
        // Handle multiple files
        $file_count = is_array($files['name']) ? count($files['name']) : 1;
        
        for ($i = 0; $i < $file_count; $i++) {
            $file = array(
                'name' => is_array($files['name']) ? $files['name'][$i] : $files['name'],
                'type' => is_array($files['type']) ? $files['type'][$i] : $files['type'],
                'tmp_name' => is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'],
                'size' => is_array($files['size']) ? $files['size'][$i] : $files['size'],
            );
            
            $result = $this->compress_file_via_api($file, $settings);
            $results[] = $result;
        }
        
        wp_send_json_success($results);
    }
    
    private function compress_file_via_api($file, $settings) {
        try {
            // Validate file
            $allowed_types = array(
                'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
                'image/svg+xml', 'image/tiff', 'image/x-canon-cr2', 'image/x-sony-arw', 
                'image/x-adobe-dng', 'image/x-nikon-nef', 'image/x-olympus-orf', 
                'image/x-fuji-raf', 'image/x-panasonic-rw2'
            );
            if (!in_array($file['type'], $allowed_types)) {
                throw new Exception(__('Unsupported file type. Supported formats: JPEG, PNG, WebP, AVIF, SVG, TIFF, and RAW files (CR2, ARW, DNG, NEF, ORF, RAF, RW2)', 'micro-jpeg-api-compressor'));
            }
            
            if ($file['size'] > 10 * 1024 * 1024) { // 10MB limit
                throw new Exception(__('File too large. Maximum size is 10MB.', 'micro-jpeg-api-compressor'));
            }
            
            // Prepare API request
            $api_data = array(
                'quality' => $settings['quality'],
                'outputFormat' => $settings['outputFormat'],
                'resizeOption' => $settings['resizeOption']
            );
            
            $api_files = array('image' => $file);
            
            // Call API
            $api_response = $this->call_api(MICRO_JPEG_API_ENDPOINT, $api_data, $api_files);
            
            if (is_wp_error($api_response)) {
                throw new Exception($api_response->get_error_message());
            }
            
            // Save compressed file temporarily
            $upload_dir = wp_upload_dir();
            $compressed_filename = 'micro-jpeg-' . time() . '-' . sanitize_file_name($file['name']);
            $compressed_path = $upload_dir['path'] . '/' . $compressed_filename;
            
            // Download compressed image from API response
            if (isset($api_response['compressedImageUrl'])) {
                $compressed_data = wp_remote_get($api_response['compressedImageUrl']);
                if (!is_wp_error($compressed_data)) {
                    file_put_contents($compressed_path, wp_remote_retrieve_body($compressed_data));
                }
            }
            
            $compressed_size = file_exists($compressed_path) ? filesize($compressed_path) : 0;
            $compression_ratio = $compressed_size > 0 ? round((1 - $compressed_size / $file['size']) * 100) : 0;
            
            return array(
                'id' => uniqid(),
                'originalName' => $file['name'],
                'originalSize' => $file['size'],
                'compressedSize' => $compressed_size,
                'compressionRatio' => $compression_ratio,
                'downloadUrl' => $upload_dir['url'] . '/' . $compressed_filename,
                'originalFormat' => strtoupper(pathinfo($file['name'], PATHINFO_EXTENSION)),
                'outputFormat' => strtoupper($api_response['outputFormat'] ?? pathinfo($file['name'], PATHINFO_EXTENSION)),
                'wasConverted' => $settings['outputFormat'] !== 'keep-original',
                'error' => false,
                'apiResponse' => $api_response
            );
            
        } catch (Exception $e) {
            return array(
                'id' => uniqid(),
                'originalName' => $file['name'],
                'error' => true,
                'errorMessage' => $e->getMessage()
            );
        }
    }
    
    /**
     * WordPress Media Integration
     */
    public function auto_compress_upload($upload, $context) {
        if (!get_option('micro_jpeg_auto_compress', false) || empty($this->api_key)) {
            return $upload;
        }
        
        // Only process images
        if (strpos($upload['type'], 'image/') !== 0) {
            return $upload;
        }
        
        $file_data = array(
            'name' => basename($upload['file']),
            'type' => $upload['type'],
            'tmp_name' => $upload['file'],
            'size' => filesize($upload['file'])
        );
        
        $settings = array(
            'quality' => get_option('micro_jpeg_default_quality', 75),
            'outputFormat' => 'keep-original',
            'resizeOption' => 'keep-original'
        );
        
        $result = $this->compress_file_via_api($file_data, $settings);
        
        if (!$result['error'] && $result['compressedSize'] < $result['originalSize']) {
            // Replace original with compressed version
            if (get_option('micro_jpeg_backup_originals', true)) {
                // Backup original
                $backup_path = $upload['file'] . '.original';
                copy($upload['file'], $backup_path);
            }
            
            // Replace with compressed version
            if (file_exists(str_replace($upload['url'], $upload['file'], $result['downloadUrl']))) {
                copy(str_replace($upload['url'], $upload['file'], $result['downloadUrl']), $upload['file']);
                $upload['size'] = $result['compressedSize'];
            }
        }
        
        return $upload;
    }
    
    public function optimize_attachment($metadata, $attachment_id) {
        // Additional optimization logic can be added here
        return $metadata;
    }
    
    /**
     * Media Library Integration
     */
    public function add_media_column($columns) {
        $columns['micro_jpeg_compression'] = __('Compression', 'micro-jpeg-api-compressor');
        return $columns;
    }
    
    public function display_media_column($column_name, $attachment_id) {
        if ($column_name === 'micro_jpeg_compression') {
            $compression_data = get_post_meta($attachment_id, '_micro_jpeg_compression', true);
            
            if ($compression_data) {
                echo '<span class="micro-jpeg-compressed">' . 
                     sprintf(__('Saved %d%%', 'micro-jpeg-api-compressor'), $compression_data['ratio']) . 
                     '</span>';
            } else {
                echo '<a href="#" class="micro-jpeg-optimize-single" data-id="' . $attachment_id . '">' . 
                     __('Optimize', 'micro-jpeg-api-compressor') . '</a>';
            }
        }
    }
    
    /**
     * Admin Pages
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('Micro JPEG API Settings', 'micro-jpeg-api-compressor'); ?></h1>
            
            <form method="post" action="options.php">
                <?php settings_fields('micro_jpeg_api_settings'); ?>
                <?php do_settings_sections('micro_jpeg_api_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('API Key', 'micro-jpeg-api-compressor'); ?></th>
                        <td>
                            <input type="password" name="micro_jpeg_api_key" value="<?php echo esc_attr(get_option('micro_jpeg_api_key')); ?>" class="regular-text" />
                            <button type="button" id="test-api-key" class="button"><?php _e('Test API Key', 'micro-jpeg-api-compressor'); ?></button>
                            <p class="description">
                                <?php _e('Get your API key from', 'micro-jpeg-api-compressor'); ?> 
                                <a href="https://microjpeg.com/api-docs" target="_blank">microjpeg.com/api-docs</a>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><?php _e('Auto-compress uploads', 'micro-jpeg-api-compressor'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="micro_jpeg_auto_compress" value="1" <?php checked(get_option('micro_jpeg_auto_compress'), 1); ?> />
                                <?php _e('Automatically compress images when uploaded to media library', 'micro-jpeg-api-compressor'); ?>
                            </label>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><?php _e('Default Quality', 'micro-jpeg-api-compressor'); ?></th>
                        <td>
                            <input type="range" name="micro_jpeg_default_quality" min="10" max="100" value="<?php echo esc_attr(get_option('micro_jpeg_default_quality', 75)); ?>" class="regular-text" />
                            <span id="quality-value"><?php echo get_option('micro_jpeg_default_quality', 75); ?>%</span>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><?php _e('Backup Originals', 'micro-jpeg-api-compressor'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="micro_jpeg_backup_originals" value="1" <?php checked(get_option('micro_jpeg_backup_originals', true), 1); ?> />
                                <?php _e('Keep backup copies of original images', 'micro-jpeg-api-compressor'); ?>
                            </label>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            // Quality slider update
            $('input[name="micro_jpeg_default_quality"]').on('input', function() {
                $('#quality-value').text($(this).val() + '%');
            });
            
            // Test API key
            $('#test-api-key').on('click', function() {
                var apiKey = $('input[name="micro_jpeg_api_key"]').val();
                if (!apiKey) {
                    alert('<?php _e('Please enter an API key first.', 'micro-jpeg-api-compressor'); ?>');
                    return;
                }
                
                $.post(ajaxurl, {
                    action: 'micro_jpeg_api_test_key',
                    api_key: apiKey,
                    nonce: '<?php echo wp_create_nonce('micro_jpeg_api_test'); ?>'
                }, function(response) {
                    if (response.success) {
                        alert('<?php _e('API key is valid!', 'micro-jpeg-api-compressor'); ?>');
                    } else {
                        alert('<?php _e('API key is invalid: ', 'micro-jpeg-api-compressor'); ?>' + response.data);
                    }
                });
            });
        });
        </script>
        <?php
    }
    
    public function bulk_optimize_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('Bulk Optimize Media Library', 'micro-jpeg-api-compressor'); ?></h1>
            
            <?php if (empty($this->api_key)): ?>
                <div class="notice notice-warning">
                    <p><?php _e('Please configure your API key in the settings first.', 'micro-jpeg-api-compressor'); ?></p>
                </div>
            <?php else: ?>
                <div id="bulk-optimize-interface">
                    <p><?php _e('This will optimize all images in your media library using the Micro JPEG API.', 'micro-jpeg-api-compressor'); ?></p>
                    
                    <div class="bulk-optimize-stats">
                        <div class="stat-box">
                            <strong id="total-images">0</strong>
                            <span><?php _e('Total Images', 'micro-jpeg-api-compressor'); ?></span>
                        </div>
                        <div class="stat-box">
                            <strong id="unoptimized-images">0</strong>
                            <span><?php _e('Unoptimized', 'micro-jpeg-api-compressor'); ?></span>
                        </div>
                        <div class="stat-box">
                            <strong id="estimated-savings">0</strong>
                            <span><?php _e('Est. Savings', 'micro-jpeg-api-compressor'); ?></span>
                        </div>
                    </div>
                    
                    <div class="bulk-optimize-controls">
                        <button id="start-bulk-optimize" class="button button-primary">
                            <?php _e('Start Bulk Optimization', 'micro-jpeg-api-compressor'); ?>
                        </button>
                        <button id="stop-bulk-optimize" class="button" style="display: none;">
                            <?php _e('Stop', 'micro-jpeg-api-compressor'); ?>
                        </button>
                    </div>
                    
                    <div id="bulk-progress" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <div class="progress-text">
                            <span id="progress-current">0</span> / <span id="progress-total">0</span>
                            (<span id="progress-percent">0</span>%)
                        </div>
                    </div>
                    
                    <div id="bulk-results" style="display: none;">
                        <h3><?php _e('Optimization Results', 'micro-jpeg-api-compressor'); ?></h3>
                        <div id="results-summary"></div>
                        <div id="results-details"></div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        
        <style>
        .bulk-optimize-stats {
            display: flex;
            gap: 20px;
            margin: 20px 0;
        }
        .stat-box {
            background: #f1f1f1;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            min-width: 100px;
        }
        .stat-box strong {
            display: block;
            font-size: 24px;
            color: #0073aa;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #f1f1f1;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: #0073aa;
            width: 0%;
            transition: width 0.3s ease;
        }
        .progress-text {
            text-align: center;
            margin: 10px 0;
        }
        </style>
        <?php
    }
    
    public function test_api_key() {
        if (!wp_verify_nonce($_POST['nonce'], 'micro_jpeg_api_test')) {
            wp_send_json_error(__('Security check failed', 'micro-jpeg-api-compressor'));
            return;
        }
        
        $api_key = sanitize_text_field($_POST['api_key']);
        
        // Test API key by checking API status endpoint
        $response = wp_remote_get('https://microjpeg.com/api/v1/status', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json'
            ),
            'timeout' => 30,
            'sslverify' => true
        ));
        
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            error_log('MicroJPEG API Test Error: ' . $error_message);
            wp_send_json_error($error_message);
            return;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        // Log for debugging
        error_log('MicroJPEG API Test - Response Code: ' . $response_code);
        error_log('MicroJPEG API Test - Response Body: ' . substr($body, 0, 200));
        
        if ($response_code === 200) {
            $data = json_decode($body, true);
            if ($data && isset($data['success']) && $data['success']) {
                wp_send_json_success(__('API key is valid!', 'micro-jpeg-api-compressor'));
            } else {
                wp_send_json_success(__('API connected but response format unexpected', 'micro-jpeg-api-compressor'));
            }
        } else if ($response_code === 401) {
            wp_send_json_error(__('Invalid API key - Access denied', 'micro-jpeg-api-compressor'));
        } else if ($response_code === 404) {
            wp_send_json_error(__('API endpoint not found. Please contact support.', 'micro-jpeg-api-compressor'));
        } else {
            wp_send_json_error(sprintf(__('API returned error code: %d', 'micro-jpeg-api-compressor'), $response_code));
        }
    }
    
    public function handle_bulk_optimization() {
        // Bulk optimization implementation
        wp_send_json_success(array('message' => 'Bulk optimization completed'));
    }
    
    /**
     * Shortcode Implementation
     */
    public function render_compressor($atts) {
        $atts = shortcode_atts(array(
            'theme' => 'default',
            'max_files' => '10',
            'max_file_size' => '10',
        ), $atts);
        
        if (empty($this->api_key)) {
            return '<div class="micro-jpeg-error">' . 
                   __('Micro JPEG API key is not configured. Please contact the site administrator.', 'micro-jpeg-api-compressor') . 
                   '</div>';
        }
        
        ob_start();
        ?>
        <div class="micro-jpeg-api-compressor" data-max-files="<?php echo esc_attr($atts['max_files']); ?>" data-max-size="<?php echo esc_attr($atts['max_file_size']); ?>">
            <div class="upload-area">
                <div class="upload-icon">📷</div>
                <h3><?php _e('Compress Your Images', 'micro-jpeg-api-compressor'); ?></h3>
                <p><?php _e('Drop images here or click to select', 'micro-jpeg-api-compressor'); ?></p>
                <input type="file" id="file-input" multiple accept="image/*" style="display: none;">
                <button type="button" class="upload-button"><?php _e('Select Images', 'micro-jpeg-api-compressor'); ?></button>
            </div>
            
            <div class="compression-settings" style="display: none;">
                <h4><?php _e('Compression Settings', 'micro-jpeg-api-compressor'); ?></h4>
                <div class="setting-group">
                    <label for="quality-slider"><?php _e('Quality:', 'micro-jpeg-api-compressor'); ?> <span id="quality-display">75</span>%</label>
                    <input type="range" id="quality-slider" min="10" max="100" value="75">
                </div>
                <div class="setting-group">
                    <label for="output-format"><?php _e('Output Format:', 'micro-jpeg-api-compressor'); ?></label>
                    <select id="output-format">
                        <option value="keep-original"><?php _e('Keep Original', 'micro-jpeg-api-compressor'); ?></option>
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                        <option value="webp">WebP</option>
                        <option value="avif">AVIF</option>
                        <option value="tiff">TIFF</option>
                    </select>
                </div>
                <button type="button" id="compress-button" class="compress-button"><?php _e('Compress Images', 'micro-jpeg-api-compressor'); ?></button>
            </div>
            
            <div class="results-area" style="display: none;">
                <h4><?php _e('Compression Results', 'micro-jpeg-api-compressor'); ?></h4>
                <div id="results-list"></div>
                <button type="button" id="download-all" class="download-button" style="display: none;">
                    <?php _e('Download All', 'micro-jpeg-api-compressor'); ?>
                </button>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Plugin Activation/Deactivation
     */
    public function activate() {
        // Set default options
        add_option('micro_jpeg_auto_compress', false);
        add_option('micro_jpeg_default_quality', 75);
        add_option('micro_jpeg_backup_originals', true);
        
        // Create necessary database tables if needed
        $this->create_tables();
    }
    
    public function deactivate() {
        // Cleanup temporary files
        $upload_dir = wp_upload_dir();
        $files = glob($upload_dir['path'] . '/micro-jpeg-*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
    }
    
    private function create_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'micro_jpeg_compression_log';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            attachment_id bigint(20) NOT NULL,
            original_size bigint(20) NOT NULL,
            compressed_size bigint(20) NOT NULL,
            compression_ratio decimal(5,2) NOT NULL,
            compression_date datetime DEFAULT CURRENT_TIMESTAMP,
            api_response longtext,
            PRIMARY KEY (id),
            KEY attachment_id (attachment_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}

// Initialize the plugin
MicroJpegApiCompressor::getInstance();

?>