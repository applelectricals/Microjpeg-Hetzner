<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div id="micro-jpeg-compressor" class="micro-jpeg-container">
    <!-- Header -->
    <header class="micro-jpeg-header">
        <div class="micro-jpeg-logo">
            <div class="logo-icon">M</div>
            <span class="logo-text">Micro JPEG</span>
        </div>
        <div class="micro-jpeg-subtitle">
            Advanced Image Compression & Format Conversion
        </div>
    </header>

    <!-- Main Content -->
    <main class="micro-jpeg-main">
        <!-- Hero Section -->
        <section class="micro-jpeg-hero">
            <div class="hero-content">
                <div class="hero-text">
                    <h1>Compress & Convert Images</h1>
                    <p class="hero-subtitle">
                        Professional image optimization with advanced compression algorithms.
                        Support for JPEG, PNG, WebP, and AVIF formats.
                    </p>
                </div>

                <!-- Drag & Drop Zone -->
                <div id="drag-drop-zone" class="drag-drop-zone">
                    <div class="drag-drop-content">
                        <div class="drag-drop-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17,8 12,3 7,8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <h3 id="drag-drop-title">Drop your images here</h3>
                        <p class="drag-drop-subtitle">
                            or <span class="browse-link">click to browse</span>
                        </p>
                        <p class="drag-drop-info">
                            JPEG, PNG, WebP, AVIF • Up to <?php echo $atts['max_files']; ?> files • Max <?php echo $atts['max_file_size']; ?>MB each
                        </p>

                        <!-- File Count Display -->
                        <div id="file-count-display" class="file-count-display" style="display: none;">
                            <span id="file-count">0</span> file(s) selected
                        </div>

                        <!-- Action Buttons -->
                        <div class="action-buttons">
                            <button id="clear-files-btn" class="btn btn-outline btn-sm" style="display: none;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                Clear
                            </button>
                            
                            <button id="compress-btn" class="btn btn-primary btn-sm" style="display: none;" disabled>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                                <span id="compress-btn-text">Compress</span>
                            </button>
                        </div>

                        <input type="file" id="file-input" accept="image/jpeg,image/jpg,image/png,image/webp,image/avif" multiple style="display: none;">
                    </div>
                </div>

                <!-- Selected Files Display -->
                <div id="selected-files" class="selected-files" style="display: none;">
                    <h3>Selected Files</h3>
                    <div id="files-list" class="files-list"></div>
                </div>
            </div>
        </section>
    </main>

    <!-- Compression Settings Modal -->
    <div id="settings-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h2>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Advanced Compression Settings
                </h2>
                <span class="badge badge-success">Web Optimized</span>
            </div>

            <!-- Multi-Format Info -->
            <div class="format-info">
                <div class="format-info-header">
                    <span class="format-info-title">How Multi-Format Processing Works</span>
                    <span class="badge badge-secondary">Smart Engine</span>
                </div>
                <div class="format-features">
                    <div class="format-feature">
                        <div class="feature-title">✓ Universal Format Support</div>
                        <div class="feature-desc">JPEG, PNG, WebP, AVIF files processed simultaneously with one settings profile</div>
                    </div>
                    <div class="format-feature">
                        <div class="feature-title">✓ Smart Format Conversion</div>
                        <div class="feature-desc">Any format → Any format (e.g., PNG → WebP, JPEG → AVIF)</div>
                    </div>
                    <div class="format-feature">
                        <div class="feature-title">✓ Intelligent Algorithm Mapping</div>
                        <div class="feature-desc">Algorithms automatically matched to compatible formats</div>
                    </div>
                    <div class="format-feature">
                        <div class="feature-title">✓ Universal Resize & Quality</div>
                        <div class="feature-desc">Resize and quality settings work across all file types uniformly</div>
                    </div>
                </div>
            </div>

            <div class="settings-grid">
                <!-- Quality Settings -->
                <div class="setting-group">
                    <label class="setting-label">Quality Settings</label>
                    
                    <!-- Preset Buttons -->
                    <div class="quality-presets">
                        <button type="button" class="preset-btn" data-quality="85">High (85%)</button>
                        <button type="button" class="preset-btn active" data-quality="75">Standard (75%)</button>
                        <button type="button" class="preset-btn" data-quality="60">Small (60%)</button>
                        <button type="button" class="preset-btn" data-quality="50">Tiny (50%)</button>
                    </div>

                    <!-- Quality Slider -->
                    <div class="slider-container">
                        <input type="range" id="quality-slider" min="10" max="100" value="75" class="quality-slider">
                        <div class="slider-labels">
                            <span>10%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <div class="quality-info">
                        <div id="quality-description" class="quality-description">Standard - 75% Recommended</div>
                        <div id="estimated-size" class="estimated-size">~75KB per 100KB</div>
                    </div>
                </div>

                <!-- Output Format -->
                <div class="setting-group">
                    <label class="setting-label">Output Format</label>
                    <select id="output-format" class="setting-select">
                        <option value="keep-original">Keep Original Format</option>
                        <option value="jpeg">Convert to JPEG</option>
                        <option value="png">Convert to PNG</option>
                        <option value="webp">Convert to WebP (Recommended)</option>
                        <option value="avif">Convert to AVIF (Smallest)</option>
                    </select>
                    <div class="setting-description">
                        WebP and AVIF offer better compression than JPEG/PNG
                    </div>
                </div>

                <!-- Advanced Options -->
                <div class="setting-group">
                    <label class="setting-label">Advanced Options</label>
                    
                    <div class="advanced-options">
                        <div class="option-group">
                            <label class="option-label">Resize Option (Optional)</label>
                            <select id="resize-option" class="setting-select">
                                <option value="keep-original">Keep Original Size</option>
                                <option value="resize-50">Resize to 50% (Reduces file size)</option>
                                <option value="resize-75">Resize to 75% (Moderate reduction)</option>
                                <option value="max-width-1920">Max Width 1920px (Web standard)</option>
                                <option value="max-width-1280">Max Width 1280px (Mobile optimized)</option>
                            </select>
                            <div class="option-description">
                                Resize is optional but greatly reduces file size. Works with all formats.
                            </div>
                        </div>

                        <div class="option-group">
                            <label class="option-label">Compression Algorithm</label>
                            <select id="compression-algorithm" class="setting-select">
                                <option value="standard">Universal (Works with all formats)</option>
                                <option value="progressive">Progressive (JPEG/WebP only)</option>
                                <option value="mozjpeg">MozJPEG (JPEG output only)</option>
                                <option value="webp-lossless">WebP Lossless (WebP output only)</option>
                            </select>
                            <div id="algorithm-description" class="option-description">
                                Optimized settings applied per file type
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Web Optimization -->
                <div class="setting-group">
                    <label class="setting-label">Web Optimization</label>
                    <div class="web-optimization-options">
                        <label class="radio-option">
                            <input type="radio" name="webOptimization" value="optimize-web" checked>
                            <span class="radio-custom"></span>
                            <div class="radio-content">
                                <div class="radio-title">Optimize for Web</div>
                                <div class="radio-desc">Strip metadata, optimize color space</div>
                            </div>
                        </label>
                        
                        <label class="radio-option">
                            <input type="radio" name="webOptimization" value="progressive">
                            <span class="radio-custom"></span>
                            <div class="radio-content">
                                <div class="radio-title">Progressive JPEG</div>
                                <div class="radio-desc">Loads progressively for faster perception</div>
                            </div>
                        </label>
                        
                        <label class="radio-option">
                            <input type="radio" name="webOptimization" value="optimize-scans">
                            <span class="radio-custom"></span>
                            <div class="radio-content">
                                <div class="radio-title">Optimize Scans</div>
                                <div class="radio-desc">Better compression with optimized scan order</div>
                            </div>
                        </label>
                        
                        <label class="radio-option">
                            <input type="radio" name="webOptimization" value="arithmetic">
                            <span class="radio-custom"></span>
                            <div class="radio-content">
                                <div class="radio-title">Arithmetic Coding</div>
                                <div class="radio-desc">Better compression (limited browser support)</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="modal-actions">
                <button type="button" id="cancel-settings" class="btn btn-outline">Cancel</button>
                <button type="button" id="apply-compression" class="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    <span id="compress-modal-btn-text">Compress Files</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Completion Modal -->
    <div id="completion-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content completion-modal-content">
            <div class="modal-header">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <h2>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="success-icon">
                            <path d="22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22,4 12,14.01 9,11.01"></polyline>
                        </svg>
                        Compression Complete!
                    </h2>
                    
                    <!-- Social Sharing Buttons -->
                    <div id="social-sharing-buttons" style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 14px; color: #666; margin-right: 8px;">Share your results:</span>
                        <div style="display: flex; gap: 4px;">
                            <a id="share-twitter" href="#" target="_blank" rel="noopener noreferrer"
                               style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; 
                                      border: 1px solid #ccc; border-radius: 6px; background: #fff; text-decoration: none;
                                      transition: background-color 0.2s;"
                               onmouseover="this.style.backgroundColor='#ebf8ff'"
                               onmouseout="this.style.backgroundColor='#fff'"
                               data-testid="share-twitter">
                                <svg width="16" height="16" fill="#1DA1F2" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                            </a>
                            <a id="share-linkedin" href="#" target="_blank" rel="noopener noreferrer"
                               style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; 
                                      border: 1px solid #ccc; border-radius: 6px; background: #fff; text-decoration: none;
                                      transition: background-color 0.2s;"
                               onmouseover="this.style.backgroundColor='#ebf8ff'"
                               onmouseout="this.style.backgroundColor='#fff'"
                               data-testid="share-linkedin">
                                <svg width="16" height="16" fill="#0077B5" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </a>
                            <a id="share-facebook" href="#" target="_blank" rel="noopener noreferrer"
                               style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; 
                                      border: 1px solid #ccc; border-radius: 6px; background: #fff; text-decoration: none;
                                      transition: background-color 0.2s;"
                               onmouseover="this.style.backgroundColor='#ebf8ff'"
                               onmouseout="this.style.backgroundColor='#fff'"
                               data-testid="share-facebook">
                                <svg width="16" height="16" fill="#1877F2" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <span id="share-instagram" 
                                  style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; 
                                         border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer;
                                         transition: background-color 0.2s;"
                                  onmouseover="this.style.backgroundColor='#fdf2f8'"
                                  onmouseout="this.style.backgroundColor='#fff'"
                                  title="Copy text for Instagram sharing"
                                  data-testid="share-instagram">
                                <svg width="16" height="16" fill="#E4405F" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Stats -->
            <div class="completion-summary">
                <div class="stat-item">
                    <div id="files-compressed" class="stat-number">0</div>
                    <div class="stat-label">Files Compressed</div>
                </div>
                <div class="stat-item">
                    <div id="space-saved" class="stat-number">0%</div>
                    <div class="stat-label">Total Space Saved</div>
                </div>
                <div class="stat-item">
                    <div id="size-reduction" class="stat-number">0MB → 0MB</div>
                    <div class="stat-label">Size Reduction</div>
                </div>
            </div>

            <!-- Download Actions -->
            <div id="download-actions" class="download-actions">
                <button type="button" id="download-all-zip" class="btn btn-primary btn-large">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download All as ZIP
                </button>
                <button type="button" id="close-completion" class="btn btn-outline">Close</button>
            </div>

            <!-- Individual Results -->
            <div id="compression-results" class="compression-results"></div>
        </div>
    </div>

    <!-- Progress Overlay -->
    <div id="progress-overlay" class="progress-overlay" style="display: none;">
        <div class="progress-content">
            <div class="progress-spinner">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
            </div>
            <div class="progress-text">
                <div id="progress-title">Compressing images...</div>
                <div id="progress-subtitle">Please wait while we optimize your files</div>
            </div>
        </div>
    </div>
</div>