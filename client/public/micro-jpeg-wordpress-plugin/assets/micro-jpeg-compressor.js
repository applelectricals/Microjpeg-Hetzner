/**
 * Micro JPEG Compressor WordPress Plugin JavaScript
 * Handles drag & drop, compression settings, and UI interactions
 */

(function($) {
    'use strict';

    // Global variables
    let selectedFiles = [];
    let isCompressing = false;
    let currentSettings = {
        quality: 75,
        outputFormat: 'keep-original',
        resizeOption: 'keep-original',
        compressionAlgorithm: 'standard',
        webOptimization: 'optimize-web'
    };
    let compressionResults = [];
    let zipDownloadPath = '';

    // Initialize when DOM is ready
    $(document).ready(function() {
        initializeCompressor();
    });

    function initializeCompressor() {
        // Check if the compressor container exists
        if ($('#micro-jpeg-compressor').length === 0) {
            return;
        }

        initializeDragDrop();
        initializeFileInput();
        initializeButtons();
        initializeSettings();
        initializeModals();
        updateUI();
    }

    function initializeDragDrop() {
        const $dragZone = $('#drag-drop-zone');
        const $title = $('#drag-drop-title');

        // Prevent default drag behaviors
        $(document).on('dragenter dragover drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        // Drag enter
        $dragZone.on('dragenter', function(e) {
            e.preventDefault();
            $(this).addClass('drag-over');
            $title.text('Drop images here!');
        });

        // Drag over
        $dragZone.on('dragover', function(e) {
            e.preventDefault();
            $(this).addClass('drag-over');
        });

        // Drag leave
        $dragZone.on('dragleave', function(e) {
            e.preventDefault();
            if (!$(e.target).closest('#drag-drop-zone').length) {
                $(this).removeClass('drag-over');
                $title.text('Drop your images here');
            }
        });

        // Drop
        $dragZone.on('drop', function(e) {
            e.preventDefault();
            $(this).removeClass('drag-over');
            $title.text('Drop your images here');

            const files = e.originalEvent.dataTransfer.files;
            handleFiles(files);
        });

        // Click to browse
        $dragZone.on('click', function() {
            if (!isCompressing) {
                $('#file-input').trigger('click');
            }
        });
    }

    function initializeFileInput() {
        $('#file-input').on('change', function() {
            const files = this.files;
            handleFiles(files);
            $(this).val(''); // Clear input for reuse
        });
    }

    function initializeButtons() {
        // Clear files button
        $('#clear-files-btn').on('click', function(e) {
            e.stopPropagation();
            selectedFiles = [];
            updateUI();
            showToast('Files cleared', 'All files have been removed.');
        });

        // Compress button
        $('#compress-btn').on('click', function(e) {
            e.stopPropagation();
            if (selectedFiles.length > 0 && !isCompressing) {
                showSettingsModal();
            }
        });
    }

    function initializeSettings() {
        // Quality slider
        $('#quality-slider').on('input', function() {
            const value = parseInt($(this).val());
            currentSettings.quality = value;
            updateQualityDisplay(value);
            updatePresetButtons(value);
        });

        // Quality preset buttons
        $('.preset-btn').on('click', function() {
            const quality = parseInt($(this).data('quality'));
            currentSettings.quality = quality;
            $('#quality-slider').val(quality);
            updateQualityDisplay(quality);
            updatePresetButtons(quality);
        });

        // Output format
        $('#output-format').on('change', function() {
            currentSettings.outputFormat = $(this).val();
        });

        // Resize option
        $('#resize-option').on('change', function() {
            currentSettings.resizeOption = $(this).val();
        });

        // Compression algorithm
        $('#compression-algorithm').on('change', function() {
            currentSettings.compressionAlgorithm = $(this).val();
            updateAlgorithmDescription();
        });

        // Web optimization
        $('input[name="webOptimization"]').on('change', function() {
            currentSettings.webOptimization = $(this).val();
        });

        // Initialize displays
        updateQualityDisplay(currentSettings.quality);
        updatePresetButtons(currentSettings.quality);
        updateAlgorithmDescription();
    }

    function initializeModals() {
        // Settings modal actions
        $('#cancel-settings').on('click', function() {
            hideSettingsModal();
        });

        $('#apply-compression').on('click', function() {
            if (selectedFiles.length > 0 && !isCompressing) {
                hideSettingsModal();
                performCompression();
            }
        });

        // Completion modal actions
        $('#close-completion').on('click', function() {
            hideCompletionModal();
        });

        $('#download-all-zip').on('click', function() {
            if (zipDownloadPath) {
                downloadZip();
            }
        });

        // Click outside modal to close
        $('.modal-overlay').on('click', function(e) {
            if ($(e.target).hasClass('modal-overlay')) {
                hideAllModals();
            }
        });
    }

    function handleFiles(files) {
        const fileArray = Array.from(files);
        const validFiles = [];
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        const maxFiles = 20;
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

        if (fileArray.length > maxFiles) {
            showToast('Too many files', `Please select up to ${maxFiles} images at once.`, 'error');
            return;
        }

        fileArray.forEach(file => {
            if (!supportedTypes.includes(file.type.toLowerCase())) {
                showToast('Invalid file type', `${file.name} is not a supported image format.`, 'error');
                return;
            }

            if (file.size > maxFileSize) {
                showToast('File too large', `${file.name} exceeds the ${maxFileSize / 1024 / 1024}MB limit.`, 'error');
                return;
            }

            // Check for duplicates
            const isDuplicate = selectedFiles.some(existing => 
                existing.name === file.name && existing.size === file.size
            );

            if (!isDuplicate) {
                validFiles.push(file);
            }
        });

        if (validFiles.length > 0) {
            selectedFiles = selectedFiles.concat(validFiles);
            updateUI();
            showToast('Files added', `${validFiles.length} image(s) added. Total: ${selectedFiles.length}`);
        }
    }

    function updateUI() {
        const hasFiles = selectedFiles.length > 0;
        
        // Update file count
        $('#file-count').text(selectedFiles.length);
        $('#file-count-display').toggle(hasFiles);
        
        // Update buttons
        $('#clear-files-btn').toggle(hasFiles);
        $('#compress-btn').toggle(hasFiles);
        
        if (hasFiles) {
            $('#compress-btn').prop('disabled', isCompressing);
            $('#compress-btn-text').text(isCompressing ? 'Compressing...' : 'Compress');
        }
        
        // Update compress modal button text
        $('#compress-modal-btn-text').text(`Compress ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`);
        
        // Update selected files display
        updateSelectedFilesDisplay();
    }

    function updateSelectedFilesDisplay() {
        const $container = $('#selected-files');
        const $list = $('#files-list');
        
        if (selectedFiles.length === 0) {
            $container.hide();
            return;
        }
        
        $container.show();
        $list.empty();
        
        selectedFiles.forEach((file, index) => {
            const $item = $(`
                <div class="file-item">
                    <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21,15 16,10 5,21"></polyline>
                    </svg>
                    <div class="file-info">
                        <div class="file-name">${escapeHtml(file.name)}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                </div>
            `);
            $list.append($item);
        });
    }

    function updateQualityDisplay(value) {
        let description, sizeEstimate;
        
        if (value <= 30) {
            description = "Low (10%) - Smallest";
            sizeEstimate = "~30KB per 100KB";
        } else if (value <= 50) {
            description = "Small Files - 60% Compact";
            sizeEstimate = "~50KB per 100KB";
        } else if (value <= 70) {
            description = "Standard - 75% Recommended";
            sizeEstimate = "~70KB per 100KB";
        } else if (value <= 85) {
            description = "High Quality - 85% Good balance";
            sizeEstimate = "~85KB per 100KB";
        } else {
            description = "High (100%) - Largest";
            sizeEstimate = "~95KB per 100KB";
        }
        
        $('#quality-description').text(description);
        $('#estimated-size').text(sizeEstimate);
    }

    function updatePresetButtons(value) {
        $('.preset-btn').removeClass('active');
        $('.preset-btn').each(function() {
            const presetValue = parseInt($(this).data('quality'));
            if (Math.abs(presetValue - value) <= 5) {
                $(this).addClass('active');
            }
        });
    }

    function updateAlgorithmDescription() {
        const algorithm = $('#compression-algorithm').val();
        let description = '';
        
        switch (algorithm) {
            case 'standard':
                description = 'Optimized settings applied per file type';
                break;
            case 'progressive':
                description = 'Applied only to JPEG/WebP files';
                break;
            case 'mozjpeg':
                description = 'Only for JPEG output format';
                break;
            case 'webp-lossless':
                description = 'Only for WebP output format';
                break;
        }
        
        $('#algorithm-description').text(description);
    }

    function showSettingsModal() {
        $('#settings-modal').fadeIn(300);
        $('body').addClass('modal-open');
    }

    function hideSettingsModal() {
        $('#settings-modal').fadeOut(300);
        $('body').removeClass('modal-open');
    }

    function showCompletionModal(results, zipPath) {
        compressionResults = results;
        zipDownloadPath = zipPath;
        
        const successfulResults = results.filter(r => !r.error);
        const totalOriginalSize = successfulResults.reduce((sum, r) => sum + r.originalSize, 0);
        const totalCompressedSize = successfulResults.reduce((sum, r) => sum + r.compressedSize, 0);
        const totalSavings = totalOriginalSize > 0 ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100) : 0;
        
        // Update summary stats
        $('#files-compressed').text(successfulResults.length);
        $('#space-saved').text(totalSavings + '%');
        $('#size-reduction').text(
            `${formatFileSize(totalOriginalSize)} → ${formatFileSize(totalCompressedSize)}`
        );
        
        // Update download button text
        $('#download-all-zip').text(zipPath ? 'Download All as ZIP' : 'Download All Files');
        
        // Populate results
        updateCompressionResults(results);
        
        // Setup social sharing buttons
        setupSocialSharing(successfulResults);
        
        $('#completion-modal').fadeIn(300);
        $('body').addClass('modal-open');
    }

    function hideCompletionModal() {
        $('#completion-modal').fadeOut(300);
        $('body').removeClass('modal-open');
    }

    function hideAllModals() {
        $('.modal-overlay').fadeOut(300);
        $('body').removeClass('modal-open');
    }

    function updateCompressionResults(results) {
        const $container = $('#compression-results');
        $container.empty();
        
        results.forEach(result => {
            const $item = $(`
                <div class="result-item ${result.error ? 'result-error' : ''}">
                    <div class="result-info">
                        <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21,15 16,10 5,21"></polyline>
                        </svg>
                        <div class="result-details">
                            <div class="result-name">${escapeHtml(result.originalName)}</div>
                            ${result.error ? 
                                `<div class="error-message">${escapeHtml(result.error)}</div>` :
                                `<div class="result-stats">
                                    <span>Original: ${formatFileSize(result.originalSize)}</span>
                                    <span>Compressed: ${formatFileSize(result.compressedSize)}</span>
                                    <span class="compression-ratio">${result.compressionRatio}% smaller</span>
                                </div>
                                ${result.wasConverted ? 
                                    `<div class="result-conversion">
                                        <span class="conversion-badge">${result.originalFormat} → ${result.outputFormat}</span>
                                        <span>Format converted</span>
                                    </div>` : ''
                                }`
                            }
                        </div>
                    </div>
                    ${!result.error ? 
                        `<button class="btn btn-outline btn-sm download-single-btn" data-url="${result.downloadPath}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7,10 12,15 17,10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download
                        </button>` : ''
                    }
                </div>
            `);
            
            $container.append($item);
        });
        
        // Bind download buttons
        $('.download-single-btn').on('click', function() {
            const url = $(this).data('url');
            downloadFile(url);
        });
    }

    function showProgressOverlay() {
        $('#progress-overlay').fadeIn(300);
    }

    function hideProgressOverlay() {
        $('#progress-overlay').fadeOut(300);
    }

    function performCompression() {
        if (selectedFiles.length === 0 || isCompressing) {
            return;
        }
        
        isCompressing = true;
        showProgressOverlay();
        updateUI();
        
        // Create FormData
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files[]', file);
        });
        
        formData.append('settings', JSON.stringify(currentSettings));
        formData.append('action', 'micro_jpeg_compress');
        formData.append('nonce', microJpegAjax.nonce);
        
        // Make AJAX request
        $.ajax({
            url: microJpegAjax.ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    selectedFiles = []; // Clear files
                    updateUI();
                    hideProgressOverlay();
                    showCompletionModal(response.data.results, response.data.zipDownloadPath);
                } else {
                    handleCompressionError(response.data || 'Compression failed');
                }
            },
            error: function(xhr, status, error) {
                handleCompressionError('Network error: ' + error);
            }
        });
    }

    function handleCompressionError(message) {
        isCompressing = false;
        hideProgressOverlay();
        updateUI();
        showToast('Compression Failed', message, 'error');
    }

    function downloadFile(url) {
        const link = document.createElement('a');
        link.href = url;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function downloadZip() {
        if (zipDownloadPath) {
            downloadFile(zipDownloadPath);
        }
    }

    function showToast(title, message, type = 'info') {
        // Create toast notification
        const toastClass = type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : 'toast-info';
        
        const $toast = $(`
            <div class="micro-jpeg-toast ${toastClass}" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? '#fee2e2' : type === 'success' ? '#d1fae5' : '#eff6ff'};
                color: ${type === 'error' ? '#991b1b' : type === 'success' ? '#065f46' : '#1e40af'};
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                z-index: 20000;
                max-width: 400px;
                border-left: 4px solid ${type === 'error' ? '#dc2626' : type === 'success' ? '#10b981' : '#3b82f6'};
            ">
                <div style="font-weight: 600; margin-bottom: 0.25rem;">${escapeHtml(title)}</div>
                <div style="font-size: 0.875rem;">${escapeHtml(message)}</div>
            </div>
        `);
        
        $('body').append($toast);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            $toast.fadeOut(300, () => $toast.remove());
        }, 5000);
        
        // Click to close
        $toast.on('click', () => {
            $toast.fadeOut(300, () => $toast.remove());
        });
    }

    // Utility functions
    function setupSocialSharing(successfulResults) {
        if (successfulResults.length === 0) {
            $('#social-sharing-buttons').hide();
            return;
        }
        
        $('#social-sharing-buttons').show();
        
        // Calculate stats for sharing
        const totalOriginalSize = successfulResults.reduce((sum, r) => sum + r.originalSize, 0);
        const totalCompressedSize = successfulResults.reduce((sum, r) => sum + r.compressedSize, 0);
        const compressionPercentage = totalOriginalSize > 0 ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100) : 0;
        const savedSpace = ((totalOriginalSize - totalCompressedSize) / 1024 / 1024).toFixed(1);
        
        // Generate sharing text
        let shareText;
        if (successfulResults.length === 1) {
            const originalMB = (successfulResults[0].originalSize / 1024 / 1024).toFixed(1);
            const compressedMB = (successfulResults[0].compressedSize / 1024 / 1024).toFixed(1);
            shareText = `Just compressed a ${originalMB}MB image down to ${compressedMB}MB (${compressionPercentage}% smaller) using Micro JPEG! 🚀 #ImageCompression #WebOptimization #MicroJPEG`;
        } else {
            const originalMB = (totalOriginalSize / 1024 / 1024).toFixed(1);
            const compressedMB = (totalCompressedSize / 1024 / 1024).toFixed(1);
            shareText = `Just compressed ${successfulResults.length} images from ${originalMB}MB to ${compressedMB}MB (saved ${savedSpace}MB, ${compressionPercentage}% reduction) using Micro JPEG! 🚀 #ImageCompression #WebOptimization`;
        }
        
        const siteUrl = window.location.origin;
        
        // Setup Twitter sharing
        $('#share-twitter').off('click').on('click', function(e) {
            e.preventDefault();
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
            window.open(twitterUrl, '_blank', 'width=550,height=420');
            trackSocialShare('twitter');
        });
        
        // Setup LinkedIn sharing
        $('#share-linkedin').off('click').on('click', function(e) {
            e.preventDefault();
            const linkedInText = shareText.replace(/🚀/g, '').trim() + '\n\nPerfect for web optimization and faster loading times. Check it out!';
            const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}&summary=${encodeURIComponent(linkedInText)}`;
            window.open(linkedInUrl, '_blank', 'width=550,height=420');
            trackSocialShare('linkedin');
        });
        
        // Setup Facebook sharing
        $('#share-facebook').off('click').on('click', function(e) {
            e.preventDefault();
            const facebookText = shareText.replace(/🚀/g, '').trim() + `\n\nSaved ${savedSpace}MB of bandwidth! Great for websites and social media.`;
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(facebookText)}`;
            window.open(facebookUrl, '_blank', 'width=550,height=420');
            trackSocialShare('facebook');
        });
        
        // Setup Instagram copy (since Instagram doesn't support direct sharing URLs)
        $('#share-instagram').off('click').on('click', function(e) {
            e.preventDefault();
            const instagramText = shareText.replace(/🚀/g, '📸✨').replace(/#ImageCompression #WebOptimization #MicroJPEG/g, '#ImageCompression #WebOptimization #MicroJPEG #Photography #WebDesign #Optimization');
            
            // Copy to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(instagramText).then(() => {
                    showToast('Copied!', 'Instagram post text copied to clipboard. Open Instagram and paste!', 'success');
                }).catch(() => {
                    fallbackCopyText(instagramText);
                });
            } else {
                fallbackCopyText(instagramText);
            }
            trackSocialShare('instagram');
        });
    }
    
    function fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Copied!', 'Instagram post text copied to clipboard. Open Instagram and paste!', 'success');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            showToast('Copy Failed', 'Unable to copy automatically. Please copy this text manually for Instagram: ' + text, 'error');
        }
        document.body.removeChild(textArea);
    }
    
    function trackSocialShare(platform) {
        // Track social sharing for rewards system
        $.ajax({
            url: '/api/social-share',
            type: 'POST',
            data: {
                platform: platform,
                timestamp: new Date().toISOString()
            },
            success: function(response) {
                if (response.points) {
                    let platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
                    showToast('Points Earned!', `+${response.points} points for sharing on ${platformName}!`, 'success');
                }
            },
            error: function() {
                // Silently fail - don't interrupt user experience
                console.log('Social share tracking failed');
            }
        });
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add modal-open class styles
    const style = document.createElement('style');
    style.textContent = `
        body.modal-open {
            overflow: hidden;
        }
        .micro-jpeg-toast {
            animation: slideInRight 0.3s ease;
        }
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

})(jQuery);