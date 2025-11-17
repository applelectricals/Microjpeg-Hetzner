/**
 * Advanced Compression Settings WordPress Plugin JavaScript
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
        if ($('#advanced-compression-container').length === 0) {
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
        const $dragZone = $('#acs-drag-drop-zone');
        const $title = $('#acs-drag-drop-title');

        // Prevent default drag behaviors
        $(document).on('dragenter dragover drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        // Drag enter
        $dragZone.on('dragenter', function(e) {
            e.preventDefault();
            $(this).addClass('acs-drag-over');
            $title.text('Drop images here!');
        });

        // Drag over
        $dragZone.on('dragover', function(e) {
            e.preventDefault();
            $(this).addClass('acs-drag-over');
        });

        // Drag leave
        $dragZone.on('dragleave', function(e) {
            e.preventDefault();
            if (!$(e.target).closest('#acs-drag-drop-zone').length) {
                $(this).removeClass('acs-drag-over');
                $title.text('Drop your images here');
            }
        });

        // Drop
        $dragZone.on('drop', function(e) {
            e.preventDefault();
            $(this).removeClass('acs-drag-over');
            $title.text('Drop your images here');

            const files = e.originalEvent.dataTransfer.files;
            handleFiles(files);
        });

        // Click to browse
        $dragZone.on('click', function() {
            if (!isCompressing) {
                $('#acs-file-input').trigger('click');
            }
        });
    }

    function initializeFileInput() {
        $('#acs-file-input').on('change', function() {
            const files = this.files;
            handleFiles(files);
            $(this).val(''); // Clear input for reuse
        });
    }

    function initializeButtons() {
        // Clear files button
        $('#acs-clear-files-btn').on('click', function(e) {
            e.stopPropagation();
            selectedFiles = [];
            updateUI();
            showToast('Files cleared', 'All files have been removed.');
        });

        // Compress button
        $('#acs-compress-btn').on('click', function(e) {
            e.stopPropagation();
            if (selectedFiles.length > 0 && !isCompressing) {
                showSettingsModal();
            }
        });
    }

    function initializeSettings() {
        // Quality slider
        $('#acs-quality-slider').on('input', function() {
            const value = parseInt($(this).val());
            currentSettings.quality = value;
            updateQualityDisplay(value);
            updatePresetButtons(value);
        });

        // Quality preset buttons
        $('.acs-preset-btn').on('click', function() {
            const quality = parseInt($(this).data('quality'));
            currentSettings.quality = quality;
            $('#acs-quality-slider').val(quality);
            updateQualityDisplay(quality);
            updatePresetButtons(quality);
        });

        // Output format
        $('#acs-output-format').on('change', function() {
            currentSettings.outputFormat = $(this).val();
            updateFormatDescription();
        });

        // Resize option
        $('#acs-resize-option').on('change', function() {
            currentSettings.resizeOption = $(this).val();
        });

        // Compression algorithm
        $('#acs-compression-algorithm').on('change', function() {
            currentSettings.compressionAlgorithm = $(this).val();
            updateAlgorithmDescription();
        });

        // Web optimization
        $('input[name="acsWebOptimization"]').on('change', function() {
            currentSettings.webOptimization = $(this).val();
        });

        // Initialize displays
        updateQualityDisplay(currentSettings.quality);
        updatePresetButtons(currentSettings.quality);
        updateFormatDescription();
        updateAlgorithmDescription();
    }

    function initializeModals() {
        // Settings modal actions
        $('#acs-cancel-settings').on('click', function() {
            hideSettingsModal();
        });

        $('#acs-apply-compression').on('click', function() {
            if (selectedFiles.length > 0 && !isCompressing) {
                hideSettingsModal();
                performCompression();
            }
        });

        // Completion modal actions
        $('#acs-close-completion').on('click', function() {
            hideCompletionModal();
        });

        $('#acs-download-all-zip').on('click', function() {
            if (zipDownloadPath) {
                downloadZip();
            }
        });

        // Click outside modal to close
        $('.acs-modal-overlay').on('click', function(e) {
            if ($(e.target).hasClass('acs-modal-overlay')) {
                hideAllModals();
            }
        });

        // Escape key to close modals
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
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
            showToast('Files added', `${validFiles.length} file(s) added successfully.`);
        }
    }

    function updateUI() {
        const fileCount = selectedFiles.length;
        
        // Update file count display
        $('#acs-file-count').text(fileCount);
        
        if (fileCount > 0) {
            $('#acs-file-count-display').show();
            $('#acs-clear-files-btn').show();
            $('#acs-compress-btn').show().prop('disabled', false);
            $('#acs-selected-files').show();
            
            // Update compress button text
            $('#acs-compress-btn-text').text(`Compress ${fileCount} File${fileCount !== 1 ? 's' : ''} with Advanced Settings`);
            $('#acs-compress-modal-btn-text').text(`Compress ${fileCount} File${fileCount !== 1 ? 's' : ''}`);
            
            // Update files list
            updateFilesList();
        } else {
            $('#acs-file-count-display').hide();
            $('#acs-clear-files-btn').hide();
            $('#acs-compress-btn').hide();
            $('#acs-selected-files').hide();
        }
    }

    function updateFilesList() {
        const $filesList = $('#acs-files-list');
        $filesList.empty();

        selectedFiles.forEach((file, index) => {
            const fileExt = file.name.split('.').pop().toUpperCase();
            const fileSize = formatFileSize(file.size);
            
            const $fileItem = $(`
                <div class="acs-file-item">
                    <div class="acs-file-icon">${fileExt}</div>
                    <div class="acs-file-info">
                        <div class="acs-file-name">${file.name}</div>
                        <div class="acs-file-details">${fileSize} • ${file.type}</div>
                    </div>
                    <button class="acs-btn acs-btn-outline acs-btn-sm" onclick="removeFile(${index})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `);
            $filesList.append($fileItem);
        });
    }

    // Make removeFile globally accessible
    window.removeFile = function(index) {
        selectedFiles.splice(index, 1);
        updateUI();
        showToast('File removed', 'File has been removed from the list.');
    };

    function updateQualityDisplay(value) {
        $('#acs-quality-value').text(`${value}% Quality`);
        $('#acs-quality-description').text(getQualityDescription(value));
        $('#acs-estimated-size').text(getEstimatedSize(value));
    }

    function updatePresetButtons(value) {
        $('.acs-preset-btn').removeClass('acs-active');
        $(`.acs-preset-btn[data-quality="${value}"]`).addClass('acs-active');
    }

    function updateFormatDescription() {
        const format = currentSettings.outputFormat;
        const $desc = $('#acs-format-description');
        
        if (format === 'keep-original') {
            $desc.text('Each file keeps its original format');
        } else {
            $desc.text(`All uploaded files will be converted to ${format.toUpperCase()}`);
        }
    }

    function updateAlgorithmDescription() {
        const algorithm = currentSettings.compressionAlgorithm;
        const $desc = $('#acs-algorithm-description');
        
        const descriptions = {
            'standard': 'Optimized settings applied per file type',
            'progressive': 'Applied only to JPEG/WebP files',
            'mozjpeg': 'Only for JPEG output format',
            'webp-lossless': 'Only for WebP output format'
        };
        
        $desc.text(descriptions[algorithm] || descriptions.standard);
    }

    function getQualityDescription(value) {
        if (value <= 30) return "Low Quality - Smallest files";
        if (value <= 50) return "Small Files - 60% Compact";
        if (value <= 70) return "Standard - 75% Recommended";
        if (value <= 85) return "High Quality - 85% Good balance";
        return "Highest Quality - Largest files";
    }

    function getEstimatedSize(value) {
        const baseSize = 100; // Assuming 100KB base
        const factor = value / 100;
        return `~${Math.round(baseSize * factor)}KB per 100KB`;
    }

    function showSettingsModal() {
        $('#acs-settings-modal').fadeIn(300);
        $('body').addClass('acs-modal-open');
    }

    function hideSettingsModal() {
        $('#acs-settings-modal').fadeOut(300);
        $('body').removeClass('acs-modal-open');
    }

    function showCompletionModal() {
        $('#acs-completion-modal').fadeIn(300);
        $('body').addClass('acs-modal-open');
    }

    function hideCompletionModal() {
        $('#acs-completion-modal').fadeOut(300);
        $('body').removeClass('acs-modal-open');
        
        // Reset for next compression
        selectedFiles = [];
        compressionResults = [];
        zipDownloadPath = '';
        updateUI();
    }

    function hideAllModals() {
        $('.acs-modal-overlay').fadeOut(300);
        $('body').removeClass('acs-modal-open');
    }

    function showProgressOverlay() {
        $('#acs-progress-overlay').fadeIn(300);
    }

    function hideProgressOverlay() {
        $('#acs-progress-overlay').fadeOut(300);
    }

    function performCompression() {
        if (selectedFiles.length === 0 || isCompressing) {
            return;
        }

        isCompressing = true;
        showProgressOverlay();

        const formData = new FormData();
        
        selectedFiles.forEach(file => {
            formData.append('files[]', file);
        });
        
        formData.append('settings', JSON.stringify(currentSettings));
        formData.append('action', 'acs_compress_images');
        formData.append('nonce', acsAjax.nonce);

        $.ajax({
            url: acsAjax.ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                hideProgressOverlay();
                isCompressing = false;

                if (response.success) {
                    compressionResults = response.data.results;
                    zipDownloadPath = response.data.zipDownloadPath;
                    
                    displayCompletionResults();
                    showCompletionModal();
                    
                    showToast('Compression complete', `${compressionResults.length} files compressed successfully.`);
                } else {
                    showToast('Compression failed', response.data || 'An error occurred during compression.', 'error');
                }
            },
            error: function(xhr, status, error) {
                hideProgressOverlay();
                isCompressing = false;
                showToast('Network error', 'Failed to communicate with server. Please try again.', 'error');
                console.error('Compression error:', error);
            }
        });
    }

    function displayCompletionResults() {
        const validResults = compressionResults.filter(r => !r.error);
        const totalOriginalSize = validResults.reduce((sum, r) => sum + r.originalSize, 0);
        const totalCompressedSize = validResults.reduce((sum, r) => sum + r.compressedSize, 0);
        const totalSavings = totalOriginalSize > 0 ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100) : 0;

        // Update summary stats
        $('#acs-files-compressed').text(validResults.length);
        $('#acs-space-saved').text(`${totalSavings}%`);
        $('#acs-size-reduction').text(`${formatFileSize(totalOriginalSize)} → ${formatFileSize(totalCompressedSize)}`);

        // Update results list
        const $results = $('#acs-compression-results');
        $results.empty();

        compressionResults.forEach(result => {
            if (result.error) {
                const $errorItem = $(`
                    <div class="acs-result-item">
                        <div class="acs-result-info">
                            <div class="acs-result-name">${result.originalName}</div>
                            <div class="acs-result-details" style="color: #ef4444;">${result.error}</div>
                        </div>
                    </div>
                `);
                $results.append($errorItem);
            } else {
                const savings = Math.round((1 - result.compressedSize / result.originalSize) * 100);
                const $resultItem = $(`
                    <div class="acs-result-item">
                        <div class="acs-result-info">
                            <div class="acs-result-name">${result.originalName}</div>
                            <div class="acs-result-details">
                                ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)} (${savings}% saved)
                                ${result.wasConverted ? ` • ${result.originalFormat} → ${result.outputFormat}` : ''}
                            </div>
                        </div>
                        <div class="acs-result-actions">
                            <a href="${result.downloadPath}" class="acs-btn acs-btn-outline acs-btn-sm" target="_blank">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7,10 12,15 17,10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download
                            </a>
                        </div>
                    </div>
                `);
                $results.append($resultItem);
            }
        });
    }

    function downloadZip() {
        if (zipDownloadPath) {
            window.open(zipDownloadPath, '_blank');
            showToast('Download started', 'Your ZIP file download has started.');
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showToast(title, message, type = 'success') {
        const toastClass = type === 'error' ? 'acs-toast-error' : 'acs-toast-success';
        
        const $toast = $(`
            <div class="acs-toast ${toastClass}">
                <div class="acs-toast-title">${title}</div>
                <div class="acs-toast-message">${message}</div>
            </div>
        `);
        
        $('body').append($toast);
        
        setTimeout(() => {
            $toast.fadeOut(300, function() {
                $(this).remove();
            });
        }, 4000);
    }

    // Add CSS for modal body lock
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            body.acs-modal-open {
                overflow: hidden;
            }
        `)
        .appendTo('head');

})(jQuery);