<?php
/**
 * Admin Menu and Pages for Micro JPEG Compressor
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class MicroJpegAdmin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Micro JPEG Compressor',
            'Micro JPEG',
            'manage_options',
            'micro-jpeg-compressor',
            array($this, 'admin_page'),
            'dashicons-format-image',
            25
        );
        
        add_submenu_page(
            'micro-jpeg-compressor',
            'Settings',
            'Settings',
            'manage_options',
            'micro-jpeg-settings',
            array($this, 'settings_page')
        );
        
        add_submenu_page(
            'micro-jpeg-compressor',
            'How to Use',
            'How to Use',
            'manage_options',
            'micro-jpeg-help',
            array($this, 'help_page')
        );
    }
    
    public function register_settings() {
        register_setting('micro_jpeg_settings', 'micro_jpeg_max_files');
        register_setting('micro_jpeg_settings', 'micro_jpeg_max_file_size');
        register_setting('micro_jpeg_settings', 'micro_jpeg_default_quality');
        register_setting('micro_jpeg_settings', 'micro_jpeg_cleanup_interval');
        register_setting('micro_jpeg_settings', 'micro_jpeg_enable_guest_access');
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>Micro JPEG Compressor</h1>
            
            <div class="card">
                <h2>Plugin Status</h2>
                <table class="widefat">
                    <tr>
                        <td><strong>PHP Version:</strong></td>
                        <td><?php echo PHP_VERSION; ?> <?php echo version_compare(PHP_VERSION, '7.4.0', '>=') ? '<span style="color: green;">✓</span>' : '<span style="color: red;">✗ (7.4+ required)</span>'; ?></td>
                    </tr>
                    <tr>
                        <td><strong>GD Extension:</strong></td>
                        <td><?php echo extension_loaded('gd') ? '<span style="color: green;">✓ Enabled</span>' : '<span style="color: red;">✗ Not available</span>'; ?></td>
                    </tr>
                    <tr>
                        <td><strong>ImageMagick Extension:</strong></td>
                        <td><?php echo extension_loaded('imagick') ? '<span style="color: green;">✓ Enabled</span>' : '<span style="color: orange;">⚠ Not available (GD will be used)</span>'; ?></td>
                    </tr>
                    <tr>
                        <td><strong>ZIP Extension:</strong></td>
                        <td><?php echo extension_loaded('zip') ? '<span style="color: green;">✓ Enabled</span>' : '<span style="color: red;">✗ Not available (ZIP downloads disabled)</span>'; ?></td>
                    </tr>
                    <tr>
                        <td><strong>Upload Directory:</strong></td>
                        <td><?php echo is_writable(MICRO_JPEG_UPLOAD_DIR) ? '<span style="color: green;">✓ Writable</span>' : '<span style="color: red;">✗ Not writable</span>'; ?></td>
                    </tr>
                    <tr>
                        <td><strong>Max Upload Size:</strong></td>
                        <td><?php echo ini_get('upload_max_filesize'); ?></td>
                    </tr>
                    <tr>
                        <td><strong>Max POST Size:</strong></td>
                        <td><?php echo ini_get('post_max_size'); ?></td>
                    </tr>
                </table>
            </div>
            
            <div class="card">
                <h2>Quick Start</h2>
                <p>To use the image compressor on your website, add the shortcode to any page or post:</p>
                <code>[micro_jpeg_compressor]</code>
                
                <h3>Shortcode Parameters</h3>
                <ul>
                    <li><code>max_files</code> - Maximum number of files (default: 20)</li>
                    <li><code>max_file_size</code> - Maximum file size in MB (default: 10)</li>
                    <li><code>theme</code> - Color theme: default, dark, light (default: default)</li>
                </ul>
                
                <p><strong>Example:</strong></p>
                <code>[micro_jpeg_compressor max_files="10" max_file_size="5" theme="dark"]</code>
            </div>
            
            <div class="card">
                <h2>Recent Activity</h2>
                <?php $this->show_recent_activity(); ?>
            </div>
        </div>
        <?php
    }
    
    public function settings_page() {
        if (isset($_POST['submit'])) {
            update_option('micro_jpeg_max_files', intval($_POST['micro_jpeg_max_files']));
            update_option('micro_jpeg_max_file_size', intval($_POST['micro_jpeg_max_file_size']));
            update_option('micro_jpeg_default_quality', intval($_POST['micro_jpeg_default_quality']));
            update_option('micro_jpeg_cleanup_interval', intval($_POST['micro_jpeg_cleanup_interval']));
            update_option('micro_jpeg_enable_guest_access', isset($_POST['micro_jpeg_enable_guest_access']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        $max_files = get_option('micro_jpeg_max_files', 20);
        $max_file_size = get_option('micro_jpeg_max_file_size', 10);
        $default_quality = get_option('micro_jpeg_default_quality', 75);
        $cleanup_interval = get_option('micro_jpeg_cleanup_interval', 24);
        $enable_guest_access = get_option('micro_jpeg_enable_guest_access', true);
        ?>
        
        <div class="wrap">
            <h1>Micro JPEG Settings</h1>
            
            <form method="post" action="">
                <?php wp_nonce_field('micro_jpeg_settings', 'micro_jpeg_nonce'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">Maximum Files per Upload</th>
                        <td>
                            <input type="number" name="micro_jpeg_max_files" value="<?php echo esc_attr($max_files); ?>" min="1" max="50" />
                            <p class="description">Maximum number of files users can upload at once (1-50)</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">Maximum File Size (MB)</th>
                        <td>
                            <input type="number" name="micro_jpeg_max_file_size" value="<?php echo esc_attr($max_file_size); ?>" min="1" max="100" />
                            <p class="description">Maximum file size allowed per image (1-100MB)</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">Default Compression Quality</th>
                        <td>
                            <input type="range" name="micro_jpeg_default_quality" value="<?php echo esc_attr($default_quality); ?>" min="10" max="100" 
                                   oninput="document.getElementById('quality-display').textContent = this.value + '%'" />
                            <span id="quality-display"><?php echo $default_quality; ?>%</span>
                            <p class="description">Default quality setting when users open the compressor</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">File Cleanup Interval (hours)</th>
                        <td>
                            <input type="number" name="micro_jpeg_cleanup_interval" value="<?php echo esc_attr($cleanup_interval); ?>" min="1" max="168" />
                            <p class="description">How often to clean up old compressed files (1-168 hours)</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">Enable Guest Access</th>
                        <td>
                            <label>
                                <input type="checkbox" name="micro_jpeg_enable_guest_access" <?php checked($enable_guest_access); ?> />
                                Allow non-logged-in users to use the compressor
                            </label>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
            
            <div class="card">
                <h2>Advanced Settings</h2>
                <p>For advanced configuration, you can add these constants to your wp-config.php file:</p>
                
                <h3>Custom Upload Directory</h3>
                <code>define('MICRO_JPEG_UPLOAD_DIR', '/custom/path/to/compressed/');</code>
                
                <h3>Enable Debug Mode</h3>
                <code>define('MICRO_JPEG_DEBUG', true);</code>
                
                <h3>Custom Memory Limit</h3>
                <code>define('MICRO_JPEG_MEMORY_LIMIT', '512M');</code>
            </div>
        </div>
        <?php
    }
    
    public function help_page() {
        ?>
        <div class="wrap">
            <h1>How to Use Micro JPEG Compressor</h1>
            
            <div class="card">
                <h2>Getting Started</h2>
                <ol>
                    <li>Add the shortcode <code>[micro_jpeg_compressor]</code> to any page or post</li>
                    <li>Users can drag & drop images or click to browse</li>
                    <li>Click "Compress" to open advanced settings</li>
                    <li>Choose quality, output format, and other options</li>
                    <li>Click "Compress Files" to process images</li>
                    <li>Download individual files or all as a ZIP</li>
                </ol>
            </div>
            
            <div class="card">
                <h2>Supported Formats</h2>
                <ul>
                    <li><strong>Input:</strong> JPEG, PNG, WebP, AVIF</li>
                    <li><strong>Output:</strong> JPEG, PNG, WebP, AVIF (with format conversion)</li>
                    <li><strong>Recommended:</strong> WebP for best compression, AVIF for smallest files</li>
                </ul>
            </div>
            
            <div class="card">
                <h2>Features</h2>
                <ul>
                    <li>✓ Multi-format batch processing</li>
                    <li>✓ Format conversion (any format → any format)</li>
                    <li>✓ Advanced compression algorithms</li>
                    <li>✓ Resize options for file size reduction</li>
                    <li>✓ ZIP downloads for multiple files</li>
                    <li>✓ Mobile-responsive interface</li>
                    <li>✓ No registration required</li>
                </ul>
            </div>
            
            <div class="card">
                <h2>Compression Settings Guide</h2>
                
                <h3>Quality Settings</h3>
                <ul>
                    <li><strong>High (85%):</strong> Best quality, larger files</li>
                    <li><strong>Standard (75%):</strong> Good balance (recommended)</li>
                    <li><strong>Small (60%):</strong> Smaller files, slight quality loss</li>
                    <li><strong>Tiny (50%):</strong> Smallest files, noticeable quality loss</li>
                </ul>
                
                <h3>Output Formats</h3>
                <ul>
                    <li><strong>Keep Original:</strong> Maintains input format</li>
                    <li><strong>JPEG:</strong> Best for photos with many colors</li>
                    <li><strong>PNG:</strong> Best for images with transparency</li>
                    <li><strong>WebP:</strong> Better compression than JPEG/PNG</li>
                    <li><strong>AVIF:</strong> Smallest file sizes (newest format)</li>
                </ul>
                
                <h3>Resize Options</h3>
                <ul>
                    <li><strong>Keep Original:</strong> No resizing</li>
                    <li><strong>50%/75%:</strong> Proportional reduction</li>
                    <li><strong>Max Width 1920px:</strong> Web standard</li>
                    <li><strong>Max Width 1280px:</strong> Mobile optimized</li>
                </ul>
            </div>
            
            <div class="card">
                <h2>Troubleshooting</h2>
                
                <h3>Images not compressing?</h3>
                <ul>
                    <li>Check file format is supported (JPEG, PNG, WebP, AVIF)</li>
                    <li>Ensure file size is under the limit</li>
                    <li>Verify GD or ImageMagick extension is installed</li>
                </ul>
                
                <h3>ZIP downloads not working?</h3>
                <ul>
                    <li>Enable the ZIP extension in PHP</li>
                    <li>Check upload directory permissions</li>
                    <li>Increase PHP memory limit if needed</li>
                </ul>
                
                <h3>Upload errors?</h3>
                <ul>
                    <li>Increase <code>upload_max_filesize</code> in php.ini</li>
                    <li>Increase <code>post_max_size</code> in php.ini</li>
                    <li>Check server disk space</li>
                </ul>
            </div>
            
            <div class="card">
                <h2>Performance Tips</h2>
                <ul>
                    <li>Use WebP format for best compression-to-quality ratio</li>
                    <li>Enable ImageMagick for better performance</li>
                    <li>Set up automatic cleanup of old files</li>
                    <li>Consider CDN for serving compressed images</li>
                    <li>Monitor server resources during peak usage</li>
                </ul>
            </div>
        </div>
        <?php
    }
    
    private function show_recent_activity() {
        // Show recent compressed files (this would be expanded with actual data)
        echo '<p>Recent activity tracking will be implemented in future versions.</p>';
        echo '<p>Currently, files are automatically cleaned up after 24 hours.</p>';
        
        // Show disk usage
        $upload_dir_size = $this->get_directory_size(MICRO_JPEG_UPLOAD_DIR);
        echo '<p><strong>Current storage usage:</strong> ' . $this->format_bytes($upload_dir_size) . '</p>';
    }
    
    private function get_directory_size($directory) {
        $size = 0;
        if (is_dir($directory)) {
            foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory)) as $file) {
                $size += $file->getSize();
            }
        }
        return $size;
    }
    
    private function format_bytes($bytes) {
        $units = array('B', 'KB', 'MB', 'GB');
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}

// Initialize admin
if (is_admin()) {
    new MicroJpegAdmin();
}