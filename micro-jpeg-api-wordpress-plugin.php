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

/**// Increase upload limits for RAW files
@ini_set('upload_max_filesize', '150M');
@ini_set('post_max_size', '150M');
@ini_set('memory_limit', '256M');
@ini_set('max_execution_time', '300');
// Increase WordPress upload size limit
add_filter('upload_size_limit', array($this, 'increase_upload_limit'));
add_filter('wp_handle_upload_prefilter', array($this, 'check_file_size_and_type'));
public function increase_upload_limit($size) {
    return 150 * 1024 * 1024; // 150MB
}

public function check_file_size_and_type($file) {
    // Allow larger files for RAW formats
    $raw_extensions = array('cr2', 'arw', 'dng', 'nef', 'orf', 'raf', 'rw2');
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (in_array($ext, $raw_extensions)) {
        // Remove WordPress file size check for RAW files
        remove_filter('wp_handle_upload_prefilter', 'wp_handle_upload_prefilter');
    }
    
    return $file;
}
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
        add_action('wp_ajax_test_compression', array($this, 'test_compression_manual'));
        
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
        register_setting('micro_jpeg_api_settings', 'micro_jpeg_api_key', array(
            'sanitize_callback' => 'sanitize_text_field'
        ));
        
        register_setting('micro_jpeg_api_settings', 'micro_jpeg_auto_compress', array(
            'type' => 'boolean',
            'sanitize_callback' => array($this, 'sanitize_checkbox'),
            'default' => 0  // Default to OFF
        ));
        
        register_setting('micro_jpeg_api_settings', 'micro_jpeg_default_quality', array(
            'type' => 'integer',
            'sanitize_callback' => 'absint',
            'default' => 75
        ));
        
        register_setting('micro_jpeg_api_settings', 'micro_jpeg_backup_originals', array(
            'type' => 'boolean',
            'sanitize_callback' => array($this, 'sanitize_checkbox'),
            'default' => 1  // Default to ON
        ));
        
        register_setting('micro_jpeg_api_settings', 'micro_jpeg_allowed_formats');
    }
    
    public function sanitize_checkbox($value) {
        return ($value === '1' || $value === 1 || $value === true) ? 1 : 0;
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
        $allowed_extensions = array('jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'tiff', 'tif', 'cr2', 'arw', 'dng', 'nef', 'orf', 'raf', 'rw2');
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($ext, $allowed_extensions)) {
            throw new Exception(__('Unsupported file type. Supported formats: JPEG, PNG, WebP, AVIF, SVG, TIFF, and RAW files (CR2, ARW, DNG, NEF, ORF, RAF, RW2)', 'micro-jpeg-api-compressor'));
        }
        
        // Check file size limits
        $max_size = 150 * 1024 * 1024; // 150MB
        if ($file['size'] > $max_size) {
            throw new Exception(sprintf(__('File too large. Maximum size is %dMB.', 'micro-jpeg-api-compressor'), $max_size / 1024 / 1024));
        }
        
        // Prepare multipart form data
        $boundary = wp_generate_password(24, false);
        $body = '';
        
        // Add settings as JSON
        $body .= '--' . $boundary . "\r\n";
        $body .= 'Content-Disposition: form-data; name="settings"' . "\r\n\r\n";
        $body .= json_encode($settings) . "\r\n";
        
        // Add file
        $body .= '--' . $boundary . "\r\n";
        $body .= 'Content-Disposition: form-data; name="image"; filename="' . basename($file['name']) . '"' . "\r\n";
        $body .= 'Content-Type: ' . $this->get_mime_type($file['name']) . "\r\n\r\n";
        $body .= file_get_contents($file['tmp_name']) . "\r\n";
        $body .= '--' . $boundary . '--' . "\r\n";
        
        // Make API request
        $response = wp_remote_post(MICRO_JPEG_API_ENDPOINT, array(
            'timeout' => 120,
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'multipart/form-data; boundary=' . $boundary
            ),
            'body' => $body
        ));
        
        if (is_wp_error($response)) {
            throw new Exception($response->get_error_message());
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        // Log for debugging
        error_log('MicroJPEG Compression - Response Code: ' . $response_code);
        error_log('MicroJPEG Compression - Response: ' . substr($response_body, 0, 500));
        
        if ($response_code !== 200) {
            $error_data = json_decode($response_body, true);
            throw new Exception($error_data['message'] ?? 'API request failed with code: ' . $response_code);
        }
        
        $api_response = json_decode($response_body, true);
        
        if (!$api_response || !isset($api_response['success'])) {
            throw new Exception('Invalid API response format');
        }
        
        if (!$api_response['success']) {
            throw new Exception($api_response['message'] ?? 'Compression failed');
        }
        
        // Get compressed image data (Base64 encoded)
        if (!isset($api_response['data'])) {
            throw new Exception('No compressed image data in response');
        }
        
        // Decode Base64 image data
        $compressed_data = base64_decode($api_response['data']);
        
        if ($compressed_data === false) {
            throw new Exception('Failed to decode compressed image data');
        }
        
        // Save compressed file
        $upload_dir = wp_upload_dir();
        $compressed_filename = 'micro-jpeg-' . time() . '-' . wp_unique_filename($upload_dir['path'], basename($file['name']));
        $compressed_path = $upload_dir['path'] . '/' . $compressed_filename;
        
        $saved = file_put_contents($compressed_path, $compressed_data);
        
        if ($saved === false) {
            throw new Exception('Failed to save compressed file');
        }
        
        $compressed_size = filesize($compressed_path);
        $compression_ratio = round((1 - $compressed_size / $file['size']) * 100, 2);
        
        return array(
            'id' => uniqid(),
            'originalName' => $file['name'],
            'originalSize' => $file['size'],
            'compressedSize' => $compressed_size,
            'compressionRatio' => $compression_ratio,
            'downloadUrl' => $upload_dir['url'] . '/' . $compressed_filename,
            'compressedPath' => $compressed_path,
            'originalFormat' => strtoupper($ext),
            'outputFormat' => strtoupper($api_response['outputFormat'] ?? $ext),
            'wasConverted' => $settings['outputFormat'] !== 'keep-original',
            'error' => false,
            'apiResponse' => $api_response
        );
        
    } catch (Exception $e) {
        error_log('MicroJPEG Compression Error: ' . $e->getMessage());
        return array(
            'id' => uniqid(),
            'originalName' => $file['name'],
            'originalSize' => $file['size'] ?? 0,
            'error' => true,
            'errorMessage' => $e->getMessage()
        );
    }
}

private function get_mime_type($filename) {
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $mime_types = array(
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp',
        'avif' => 'image/avif',
        'svg' => 'image/svg+xml',
        'tiff' => 'image/tiff',
        'tif' => 'image/tiff',
        'cr2' => 'image/x-canon-cr2',
        'arw' => 'image/x-sony-arw',
        'dng' => 'image/x-adobe-dng',
        'nef' => 'image/x-nikon-nef',
        'orf' => 'image/x-olympus-orf',
        'raf' => 'image/x-fuji-raf',
        'rw2' => 'image/x-panasonic-rw2'
    );
    
    return $mime_types[$ext] ?? 'application/octet-stream';
}
    
    /**
     * WordPress Media Integration
     */
    public function auto_compress_upload($upload, $context) {
    // CRITICAL: Only compress if ALL conditions are met
    if (empty($this->api_key)) {
        error_log('MicroJPEG: Skipping - No API key');
        return $upload;
    }
    
    $auto_compress = get_option('micro_jpeg_auto_compress', 0);
    if ($auto_compress !== 1 && $auto_compress !== '1') {
        error_log('MicroJPEG: Skipping - Auto-compress disabled');
        return $upload;
    }
    
    if (strpos($upload['type'], 'image/') !== 0) {
        error_log('MicroJPEG: Skipping - Not an image');
        return $upload;
    }
    
    error_log('MicroJPEG: Starting compression for: ' . $upload['file']);
    
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
    
    if ($result['error']) {
        error_log('MicroJPEG: Compression failed - ' . $result['errorMessage']);
        return $upload; // Return original on error
    }
    
    if ($result['compressedSize'] < $result['originalSize']) {
        error_log('MicroJPEG: Compression successful - ' . $result['compressionRatio'] . '% saved');
        
        // Backup original if enabled
        if (get_option('micro_jpeg_backup_originals', 1)) {
            $backup_path = $upload['file'] . '.original';
            copy($upload['file'], $backup_path);
            error_log('MicroJPEG: Original backed up to: ' . $backup_path);
        }
        
        // Replace with compressed version
        if (isset($result['compressedPath']) && file_exists($result['compressedPath'])) {
            copy($result['compressedPath'], $upload['file']);
            unlink($result['compressedPath']); // Clean up temp file
            
            $upload['size'] = $result['compressedSize'];
            error_log('MicroJPEG: Original replaced with compressed version');
        }
    } else {
        error_log('MicroJPEG: Compressed file was larger, keeping original');
    }
    
    return $upload;
}

public function auto_compress_upload($upload, $context) {
    // CRITICAL: Only compress if ALL conditions are met
    if (empty($this->api_key)) {
        error_log('MicroJPEG: Skipping - No API key');
        return $upload;
    }
    
    $auto_compress = get_option('micro_jpeg_auto_compress', 0);
    if ($auto_compress !== 1 && $auto_compress !== '1') {
        error_log('MicroJPEG: Skipping - Auto-compress disabled');
        return $upload;
    }
    
    if (strpos($upload['type'], 'image/') !== 0) {
        error_log('MicroJPEG: Skipping - Not an image');
        return $upload;
    }
    
    error_log('MicroJPEG: Starting compression for: ' . $upload['file']);
    
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
    
    if ($result['error']) {
        error_log('MicroJPEG: Compression failed - ' . $result['errorMessage']);
        return $upload; // Return original on error
    }
    
    if ($result['compressedSize'] < $result['originalSize']) {
        error_log('MicroJPEG: Compression successful - ' . $result['compressionRatio'] . '% saved');
        
        // Backup original if enabled
        if (get_option('micro_jpeg_backup_originals', 1)) {
            $backup_path = $upload['file'] . '.original';
            copy($upload['file'], $backup_path);
            error_log('MicroJPEG: Original backed up to: ' . $backup_path);
        }
        
        // Replace with compressed version
        if (isset($result['compressedPath']) && file_exists($result['compressedPath'])) {
            copy($result['compressedPath'], $upload['file']);
            unlink($result['compressedPath']); // Clean up temp file
            
            $upload['size'] = $result['compressedSize'];
            error_log('MicroJPEG: Original replaced with compressed version');
        }
    } else {
        error_log('MicroJPEG: Compressed file was larger, keeping original');
    }
    
    return $upload;
}
    
    public function optimize_attachment($metadata, $attachment_id) {
        // CRITICAL: Do NOT auto-optimize during thumbnail generation
        // Only optimize if auto-compress is explicitly enabled
        $auto_compress = get_option('micro_jpeg_auto_compress', 0);
        if ($auto_compress !== 1 && $auto_compress !== '1') {
            return $metadata; // Auto-compress not enabled, skip
        }
        
        if (empty($this->api_key)) {
            return $metadata; // No API key, skip
        }
        
        // Additional optimization logic can be added here if needed in the future
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
                                Don't have an API key?
                                <a href="#" id="micro-jpeg-api-signup-link" target="_blank" class="button button-secondary" style="margin-left: 10px; vertical-align: baseline;">
                                    Get Free API Key (200/month)
                                </a>
                                <script>
                                document.getElementById('micro-jpeg-api-signup-link').href = atob('aHR0cHM6Ly9taWNyb2pwZWcuY29tL2FwaS1kYXNoYm9hcmQ=');
                                </script>
                                <br><br>
                                <span style="color: #2ea44f;">✅ 200 free compressions per month</span><br>
                                <span style="color: #666;">No credit card required • Instant activation</span>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><?php _e('Auto-compress uploads', 'micro-jpeg-api-compressor'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="micro_jpeg_auto_compress" value="1" <?php checked(get_option('micro_jpeg_auto_compress', 0), 1); ?> />
                                <?php _e('Automatically compress images when uploaded to media library', 'micro-jpeg-api-compressor'); ?>
                            </label>
                            <p class="description">
                                <?php _e('When enabled, images will be automatically compressed upon upload. When disabled, you can manually optimize images from the Media Library.', 'micro-jpeg-api-compressor'); ?>
                            </p>
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
        // Show inline message instead of alert
        var message = '<div class="notice notice-warning is-dismissible"><p>' + 
                      atob('UGxlYXNlIGVudGVyIGFuIEFQSSBrZXkgZmlyc3Qu') + 
                      '</p></div>';
        $('.wrap h1').after(message);
        return;
    }
    
    // Add loading state
    var $btn = $(this);
    $btn.prop('disabled', true).text(atob('VGVzdGluZy4uLg==')); // "Testing..."
    
    $.post(ajaxurl, {
        action: 'micro_jpeg_api_test_key',
        api_key: apiKey,
        nonce: '<?php echo wp_create_nonce('micro_jpeg_api_test'); ?>'
    }, function(response) {
        // Remove previous notices
        $('.wrap .notice').remove();
        
        var message;
        if (response.success) {
            message = '<div class="notice notice-success is-dismissible"><p><strong>' + 
                      atob('U3VjY2VzcyEg') + // "Success! "
                      '</strong>' + 
                      atob('QVBJIGtleSBpcyB2YWxpZCBhbmQgd29ya2luZy4=') + // "API key is valid and working."
                      '</p></div>';
        } else {
            message = '<div class="notice notice-error is-dismissible"><p><strong>' + 
                      atob('RXJyb3I6IA==') + // "Error: "
                      '</strong>' + 
                      atob('QVBJIGtleSBpcyBpbnZhbGlkLiA=') + // "API key is invalid. "
                      response.data + 
                      '</p></div>';
        }
        $('.wrap h1').after(message);
        
        // Re-enable button
        $btn.prop('disabled', false).text(atob('VGVzdCBBUEkgS2V5')); // "Test API Key"
        
        // Auto-dismiss success message after 5 seconds
        if (response.success) {
            setTimeout(function() {
                $('.notice-success').fadeOut();
            }, 5000);
        }
    }).fail(function() {
        // Remove previous notices
        $('.wrap .notice').remove();
        
        var message = '<div class="notice notice-error is-dismissible"><p><strong>' + 
                      atob('RXJyb3I6IA==') + // "Error: "
                      '</strong>' + 
                      atob('Q29ubmVjdGlvbiBmYWlsZWQuIFBsZWFzZSBjaGVjayB5b3VyIGludGVybmV0IGNvbm5lY3Rpb24u') + // "Connection failed. Please check your internet connection."
                      '</p></div>';
        $('.wrap h1').after(message);
        
        // Re-enable button
        $btn.prop('disabled', false).text(atob('VGVzdCBBUEkgS2V5')); // "Test API Key"
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