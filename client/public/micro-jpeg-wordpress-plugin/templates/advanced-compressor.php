<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div id="advanced-compression-container" class="acs-container">
    <!-- Header -->
    <header class="acs-header">
        <div class="acs-logo">
            <div class="logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </div>
            <span class="logo-text">Advanced Compression</span>
        </div>
        <div class="acs-subtitle">
            Professional Image Compression with Advanced Settings
        </div>
    </header>

    <!-- Main Content -->
    <main class="acs-main">
        <!-- Drag & Drop Zone -->
        <section class="acs-upload-section">
            <div id="acs-drag-drop-zone" class="acs-drag-drop-zone">
                <div class="acs-drag-drop-content">
                    <div class="acs-drag-drop-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17,8 12,3 7,8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                    </div>
                    <h3 id="acs-drag-drop-title">Drop your images here</h3>
                    <p class="acs-drag-drop-subtitle">
                        or <span class="acs-browse-link">click to browse</span>
                    </p>
                    <p class="acs-drag-drop-info">
                        JPEG, PNG, WebP, AVIF • Up to <?php echo $atts['max_files']; ?> files • Max <?php echo $atts['max_file_size']; ?>MB each
                    </p>

                    <!-- File Count Display -->
                    <div id="acs-file-count-display" class="acs-file-count-display" style="display: none;">
                        <span id="acs-file-count">0</span> file(s) selected
                    </div>

                    <!-- Action Buttons -->
                    <div class="acs-action-buttons">
                        <button id="acs-clear-files-btn" class="acs-btn acs-btn-outline acs-btn-sm" style="display: none;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Clear
                        </button>
                        
                        <button id="acs-compress-btn" class="acs-btn acs-btn-primary acs-btn-sm" style="display: none;" disabled>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                            </svg>
                            <span id="acs-compress-btn-text">Compress with Advanced Settings</span>
                        </button>
                    </div>

                    <input type="file" id="acs-file-input" accept="image/jpeg,image/jpg,image/png,image/webp,image/avif" multiple style="display: none;">
                </div>
            </div>

            <!-- Selected Files Display -->
            <div id="acs-selected-files" class="acs-selected-files" style="display: none;">
                <h3>Selected Files</h3>
                <div id="acs-files-list" class="acs-files-list"></div>
            </div>
        </section>
    </main>

    <!-- Advanced Compression Settings Modal -->
    <div id="acs-settings-modal" class="acs-modal-overlay" style="display: none;">
        <div class="acs-modal-content acs-large-modal">
            <div class="acs-modal-header">
                <h2>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Advanced Compression Settings
                </h2>
                <span class="acs-badge acs-badge-success">Web Optimized</span>
            </div>

            <!-- Multi-Format Info Panel -->
            <div class="acs-format-info">
                <div class="acs-format-info-header">
                    <span class="acs-format-info-title">How Multi-Format Processing Works</span>
                    <span class="acs-badge acs-badge-secondary">Smart Engine</span>
                </div>
                <div class="acs-format-features">
                    <div class="acs-format-feature">
                        <div class="acs-feature-title">✓ Universal Format Support</div>
                        <div class="acs-feature-desc">JPEG, PNG, WebP, AVIF files processed simultaneously with one settings profile</div>
                    </div>
                    <div class="acs-format-feature">
                        <div class="acs-feature-title">✓ Smart Format Conversion</div>
                        <div class="acs-feature-desc">Any format → Any format (e.g., PNG → WebP, JPEG → AVIF)</div>
                    </div>
                    <div class="acs-format-feature">
                        <div class="acs-feature-title">✓ Intelligent Algorithm Mapping</div>
                        <div class="acs-feature-desc">Algorithms automatically matched to compatible formats (e.g., MozJPEG only for JPEG output)</div>
                    </div>
                    <div class="acs-format-feature">
                        <div class="acs-feature-title">✓ Universal Resize & Quality</div>
                        <div class="acs-feature-desc">Resize and quality settings work across all file types uniformly</div>
                    </div>
                </div>
            </div>

            <div class="acs-settings-grid">
                <!-- Left Column - Quality Settings -->
                <div class="acs-setting-group">
                    <label class="acs-setting-label">Quality Level</label>
                    
                    <div class="acs-quality-display">
                        <span id="acs-quality-value" class="acs-quality-value">75% Quality</span>
                    </div>
                    
                    <!-- Quality Slider -->
                    <div class="acs-slider-container">
                        <input type="range" id="acs-quality-slider" min="10" max="100" value="75" class="acs-quality-slider">
                        <div class="acs-slider-labels">
                            <span>Low (10%)</span>
                            <span>High (100%)</span>
                        </div>
                    </div>

                    <div class="acs-quality-info">
                        <div id="acs-quality-description" class="acs-quality-description">Standard - 75% Recommended</div>
                        <div id="acs-estimated-size" class="acs-estimated-size">~75KB per 100KB</div>
                    </div>

                    <!-- Quick Presets -->
                    <label class="acs-setting-label">Quick Presets</label>
                    <div class="acs-quality-presets">
                        <button type="button" class="acs-preset-btn" data-quality="85">
                            <div class="acs-preset-title">High Quality</div>
                            <div class="acs-preset-subtitle">85% - Good balance</div>
                        </button>
                        <button type="button" class="acs-preset-btn acs-active" data-quality="75">
                            <div class="acs-preset-title">Standard</div>
                            <div class="acs-preset-subtitle">75% - Recommended</div>
                        </button>
                        <button type="button" class="acs-preset-btn" data-quality="60">
                            <div class="acs-preset-title">Small Files</div>
                            <div class="acs-preset-subtitle">60% - Compact</div>
                        </button>
                        <button type="button" class="acs-preset-btn" data-quality="50">
                            <div class="acs-preset-title">Tiny Files</div>
                            <div class="acs-preset-subtitle">50% - Smallest</div>
                        </button>
                    </div>
                </div>

                <!-- Right Column - Advanced Options -->
                <div class="acs-setting-group">
                    <label class="acs-setting-label">Advanced Options</label>
                    
                    <div class="acs-advanced-options">
                        <!-- Resize Option -->
                        <div class="acs-option-group">
                            <label class="acs-option-label">Resize Option (Optional)</label>
                            <select id="acs-resize-option" class="acs-setting-select">
                                <option value="keep-original">Keep Original Size</option>
                                <option value="resize-50">Resize to 50% (Reduces file size)</option>
                                <option value="resize-75">Resize to 75% (Moderate reduction)</option>
                                <option value="max-width-1920">Max Width 1920px (Web standard)</option>
                                <option value="max-width-1280">Max Width 1280px (Mobile optimized)</option>
                            </select>
                            <div class="acs-option-description">
                                Resize is optional but greatly reduces file size. Works with all formats.
                            </div>
                        </div>

                        <!-- Output Format -->
                        <div class="acs-option-group">
                            <label class="acs-option-label">Output Format</label>
                            <select id="acs-output-format" class="acs-setting-select">
                                <option value="keep-original">Keep Original Format</option>
                                <option value="jpeg">JPEG (Universal - All formats → JPEG)</option>
                                <option value="webp">WebP (Modern - All formats → WebP)</option>
                                <option value="avif">AVIF (Next-gen - All formats → AVIF)</option>
                                <option value="png">PNG (Lossless - All formats → PNG)</option>
                            </select>
                            <div id="acs-format-description" class="acs-option-description">
                                Each file keeps its original format
                            </div>
                        </div>

                        <!-- Compression Algorithm -->
                        <div class="acs-option-group">
                            <label class="acs-option-label">Compression Algorithm</label>
                            <select id="acs-compression-algorithm" class="acs-setting-select">
                                <option value="standard">Universal (Works with all formats)</option>
                                <option value="progressive">Progressive (JPEG/WebP only)</option>
                                <option value="mozjpeg">MozJPEG (JPEG output only)</option>
                                <option value="webp-lossless">WebP Lossless (WebP output only)</option>
                            </select>
                            <div id="acs-algorithm-description" class="acs-option-description">
                                Optimized settings applied per file type
                            </div>
                        </div>
                    </div>

                    <!-- Web Optimization -->
                    <label class="acs-setting-label">Web Optimization</label>
                    <div class="acs-web-optimization-options">
                        <label class="acs-radio-option">
                            <input type="radio" name="acsWebOptimization" value="optimize-web" checked>
                            <span class="acs-radio-custom"></span>
                            <div class="acs-radio-content">
                                <div class="acs-radio-title">Optimize for Web</div>
                                <div class="acs-radio-desc">Strip metadata, optimize color space</div>
                            </div>
                        </label>
                        
                        <label class="acs-radio-option">
                            <input type="radio" name="acsWebOptimization" value="progressive">
                            <span class="acs-radio-custom"></span>
                            <div class="acs-radio-content">
                                <div class="acs-radio-title">Progressive JPEG</div>
                                <div class="acs-radio-desc">Loads progressively for faster perception</div>
                            </div>
                        </label>
                        
                        <label class="acs-radio-option">
                            <input type="radio" name="acsWebOptimization" value="optimize-scans">
                            <span class="acs-radio-custom"></span>
                            <div class="acs-radio-content">
                                <div class="acs-radio-title">Optimize Scans</div>
                                <div class="acs-radio-desc">Better compression with optimized scan order</div>
                            </div>
                        </label>
                        
                        <label class="acs-radio-option">
                            <input type="radio" name="acsWebOptimization" value="arithmetic">
                            <span class="acs-radio-custom"></span>
                            <div class="acs-radio-content">
                                <div class="acs-radio-title">Arithmetic Coding</div>
                                <div class="acs-radio-desc">Better compression (limited browser support)</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="acs-modal-actions">
                <button type="button" id="acs-cancel-settings" class="acs-btn acs-btn-outline">Cancel</button>
                <button type="button" id="acs-apply-compression" class="acs-btn acs-btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    <span id="acs-compress-modal-btn-text">Compress Files</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Completion Modal -->
    <div id="acs-completion-modal" class="acs-modal-overlay" style="display: none;">
        <div class="acs-modal-content acs-completion-modal-content">
            <div class="acs-modal-header">
                <h2>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="acs-success-icon">
                        <path d="22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22,4 12,14.01 9,11.01"></polyline>
                    </svg>
                    Compression Complete!
                </h2>
            </div>

            <!-- Summary Stats -->
            <div class="acs-completion-summary">
                <div class="acs-stat-item">
                    <div id="acs-files-compressed" class="acs-stat-number">0</div>
                    <div class="acs-stat-label">Files Compressed</div>
                </div>
                <div class="acs-stat-item">
                    <div id="acs-space-saved" class="acs-stat-number">0%</div>
                    <div class="acs-stat-label">Total Space Saved</div>
                </div>
                <div class="acs-stat-item">
                    <div id="acs-size-reduction" class="acs-stat-number">0MB → 0MB</div>
                    <div class="acs-stat-label">Size Reduction</div>
                </div>
            </div>

            <!-- Download Actions -->
            <div id="acs-download-actions" class="acs-download-actions">
                <button type="button" id="acs-download-all-zip" class="acs-btn acs-btn-primary acs-btn-large">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download All as ZIP
                </button>
                <button type="button" id="acs-close-completion" class="acs-btn acs-btn-outline">Close</button>
            </div>

            <!-- Individual Results -->
            <div id="acs-compression-results" class="acs-compression-results"></div>
        </div>
    </div>

    <!-- Progress Overlay -->
    <div id="acs-progress-overlay" class="acs-progress-overlay" style="display: none;">
        <div class="acs-progress-content">
            <div class="acs-progress-spinner">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
            </div>
            <div class="acs-progress-text">
                <div id="acs-progress-title">Compressing images...</div>
                <div id="acs-progress-subtitle">Please wait while we optimize your files</div>
            </div>
        </div>
    </div>
</div>