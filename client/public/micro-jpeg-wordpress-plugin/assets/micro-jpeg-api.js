/* Micro JPEG API WordPress Plugin JavaScript */

(function($) {
    'use strict';

    let selectedFiles = [];
    let compressionResults = [];

    $(document).ready(function() {
        initializePlugin();
        bindEvents();
    });

    function initializePlugin() {
        // Check if API key is configured
        if (!microJpegApiAjax.hasApiKey) {
            $('.micro-jpeg-api-compressor').prepend(
                '<div class="micro-jpeg-error">' +
                'API key is not configured. Please configure your API key in WordPress Admin > Media > Micro JPEG API.' +
                '</div>'
            );
            return;
        }
    }

    function bindEvents() {
        // File upload events
        $('.upload-area').on('click', function() {
            $('#file-input').click();
        });

        $('#file-input').on('change', function(e) {
            handleFileSelection(e.target.files);
        });

        // Drag and drop events
        $('.upload-area').on('dragover', function(e) {
            e.preventDefault();
            $(this).addClass('dragover');
        });

        $('.upload-area').on('dragleave', function(e) {
            e.preventDefault();
            $(this).removeClass('dragover');
        });

        $('.upload-area').on('drop', function(e) {
            e.preventDefault();
            $(this).removeClass('dragover');
            handleFileSelection(e.originalEvent.dataTransfer.files);
        });

        // Compression controls
        $('#quality-slider').on('input', function() {
            $('#quality-display').text($(this).val());
        });

        $('#compress-button').on('click', function() {
            compressImages();
        });

        $('#download-all').on('click', function() {
            downloadAllImages();
        });

        // Admin page events
        bindAdminEvents();
    }

    function bindAdminEvents() {
        // Test API key
        $(document).on('click', '#test-api-key', function() {
            testApiKey();
        });

        // Bulk optimization
        $(document).on('click', '#start-bulk-optimize', function() {
            startBulkOptimization();
        });

        $(document).on('click', '#stop-bulk-optimize', function() {
            stopBulkOptimization();
        });

        // Single image optimization from media library
        $(document).on('click', '.micro-jpeg-optimize-single', function(e) {
            e.preventDefault();
            var attachmentId = $(this).data('id');
            optimizeSingleImage(attachmentId, $(this));
        });
    }

    function handleFileSelection(files) {
        selectedFiles = Array.from(files);
        
        if (selectedFiles.length === 0) {
            return;
        }

        // Validate files
        const maxFiles = parseInt($('.micro-jpeg-api-compressor').data('max-files')) || 10;
        const maxSize = parseInt($('.micro-jpeg-api-compressor').data('max-size')) || 10;
        
        if (selectedFiles.length > maxFiles) {
            showError('Too many files selected. Maximum: ' + maxFiles);
            return;
        }

        let validFiles = [];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        selectedFiles.forEach(function(file) {
            if (!allowedTypes.includes(file.type)) {
                showError('Unsupported file type: ' + file.name);
                return;
            }

            if (file.size > maxSize * 1024 * 1024) {
                showError('File too large: ' + file.name + ' (max: ' + maxSize + 'MB)');
                return;
            }

            validFiles.push(file);
        });

        if (validFiles.length === 0) {
            return;
        }

        selectedFiles = validFiles;
        
        // Show settings
        $('.compression-settings').show();
        $('.upload-area').hide();
        
        // Update UI
        updateFileList();
    }

    function updateFileList() {
        if (selectedFiles.length === 0) {
            return;
        }

        let fileListHtml = '<div class="selected-files"><h4>Selected Files (' + selectedFiles.length + '):</h4><ul>';
        
        selectedFiles.forEach(function(file, index) {
            const sizeText = formatFileSize(file.size);
            fileListHtml += '<li>' + file.name + ' (' + sizeText + ')</li>';
        });
        
        fileListHtml += '</ul></div>';
        
        $('.compression-settings').append(fileListHtml);
    }

    function compressImages() {
        if (selectedFiles.length === 0) {
            showError('No files selected');
            return;
        }

        $('.compress-button').prop('disabled', true).text('Compressing...');
        $('.results-area').show();

        const settings = {
            quality: parseInt($('#quality-slider').val()),
            outputFormat: $('#output-format').val(),
            resizeOption: 'keep-original' // Can be extended
        };

        const formData = new FormData();
        formData.append('action', 'micro_jpeg_api_compress');
        formData.append('nonce', microJpegApiAjax.nonce);
        formData.append('settings', JSON.stringify(settings));

        selectedFiles.forEach(function(file, index) {
            formData.append('files[]', file);
        });

        $.ajax({
            url: microJpegApiAjax.ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    compressionResults = response.data;
                    displayResults(compressionResults);
                } else {
                    showError('Compression failed: ' + response.data);
                }
            },
            error: function() {
                showError('Network error occurred during compression');
            },
            complete: function() {
                $('.compress-button').prop('disabled', false).text('Compress Images');
            }
        });
    }

    function displayResults(results) {
        let resultsHtml = '';
        let totalSavings = 0;
        let successCount = 0;

        results.forEach(function(result) {
            if (result.error) {
                resultsHtml += '<div class="result-item error">';
                resultsHtml += '<div class="result-info">';
                resultsHtml += '<div class="result-name">' + result.originalName + '</div>';
                resultsHtml += '<div class="result-stats error">Error: ' + result.errorMessage + '</div>';
                resultsHtml += '</div>';
                resultsHtml += '</div>';
            } else {
                successCount++;
                totalSavings += (result.originalSize - result.compressedSize);
                
                resultsHtml += '<div class="result-item">';
                resultsHtml += '<div class="result-info">';
                resultsHtml += '<div class="result-name">' + result.originalName + '</div>';
                resultsHtml += '<div class="result-stats">';
                resultsHtml += formatFileSize(result.originalSize) + ' → ' + formatFileSize(result.compressedSize);
                resultsHtml += ' <span class="result-savings">(' + result.compressionRatio + '% savings)</span>';
                if (result.wasConverted) {
                    resultsHtml += ' <span class="format-conversion">' + result.originalFormat + ' → ' + result.outputFormat + '</span>';
                }
                resultsHtml += '</div>';
                resultsHtml += '</div>';
                resultsHtml += '<div class="result-actions">';
                resultsHtml += '<a href="' + result.downloadUrl + '" class="download-single" download>Download</a>';
                resultsHtml += '</div>';
                resultsHtml += '</div>';
            }
        });

        $('#results-list').html(resultsHtml);

        if (successCount > 0) {
            $('#download-all').show();
            
            // Show summary
            const summaryHtml = '<div class="compression-summary">' +
                '<strong>Summary:</strong> ' + successCount + ' images compressed, ' +
                formatFileSize(totalSavings) + ' total savings' +
                '</div>';
            $('#results-list').prepend(summaryHtml);
        }
    }

    function downloadAllImages() {
        // Create and trigger download for each compressed image
        compressionResults.forEach(function(result) {
            if (!result.error) {
                const link = document.createElement('a');
                link.href = result.downloadUrl;
                link.download = result.originalName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }

    function testApiKey() {
        const apiKey = $('input[name="micro_jpeg_api_key"]').val();
        
        if (!apiKey) {
            showError('Please enter an API key first.');
            return;
        }

        $('#test-api-key').prop('disabled', true).text('Testing...');

        $.post(microJpegApiAjax.ajaxurl, {
            action: 'micro_jpeg_api_test_key',
            api_key: apiKey,
            nonce: microJpegApiAjax.nonce
        }, function(response) {
            if (response.success) {
                showSuccess('✅ API key is valid! You can now use the compression features.');
            } else {
                showError('❌ API key is invalid: ' + response.data);
            }
        }).always(function() {
            $('#test-api-key').prop('disabled', false).text('Test API Key');
        });
    }

    function startBulkOptimization() {
        $('#start-bulk-optimize').hide();
        $('#stop-bulk-optimize').show();
        $('#bulk-progress').show();

        // Get unoptimized images count
        $.post(microJpegApiAjax.ajaxurl, {
            action: 'micro_jpeg_api_get_unoptimized_count',
            nonce: microJpegApiAjax.nonce
        }, function(response) {
            if (response.success) {
                const totalImages = response.data.total;
                const unoptimized = response.data.unoptimized;
                
                $('#total-images').text(totalImages);
                $('#unoptimized-images').text(unoptimized);
                $('#progress-total').text(unoptimized);
                
                if (unoptimized > 0) {
                    processBulkOptimization(0, unoptimized);
                } else {
                    showSuccess('All images are already optimized!');
                    resetBulkInterface();
                }
            } else {
                showError('Failed to get image count: ' + response.data);
                resetBulkInterface();
            }
        });
    }

    function processBulkOptimization(processed, total) {
        if (processed >= total) {
            showSuccess('Bulk optimization completed! Processed ' + processed + ' images.');
            resetBulkInterface();
            return;
        }

        $.post(microJpegApiAjax.ajaxurl, {
            action: 'micro_jpeg_api_bulk_optimize',
            nonce: microJpegApiAjax.nonce,
            batch_size: 5, // Process 5 images at a time
            offset: processed
        }, function(response) {
            if (response.success) {
                const newProcessed = processed + response.data.processed;
                const percent = Math.round((newProcessed / total) * 100);
                
                $('#progress-current').text(newProcessed);
                $('#progress-percent').text(percent);
                $('.progress-fill').css('width', percent + '%');
                
                // Continue processing
                setTimeout(function() {
                    processBulkOptimization(newProcessed, total);
                }, 1000); // 1 second delay between batches
            } else {
                showError('Bulk optimization error: ' + response.data);
                resetBulkInterface();
            }
        });
    }

    function stopBulkOptimization() {
        resetBulkInterface();
        showSuccess('Bulk optimization stopped.');
    }

    function resetBulkInterface() {
        $('#start-bulk-optimize').show();
        $('#stop-bulk-optimize').hide();
        $('#bulk-progress').hide();
    }

    function optimizeSingleImage(attachmentId, button) {
        const originalText = button.text();
        button.text('Optimizing...');

        $.post(microJpegApiAjax.ajaxurl, {
            action: 'micro_jpeg_api_optimize_single',
            attachment_id: attachmentId,
            nonce: microJpegApiAjax.nonce
        }, function(response) {
            if (response.success) {
                button.parent().html('<span class="micro-jpeg-compressed">Saved ' + response.data.savings + '%</span>');
                showSuccess('Image optimized successfully!');
            } else {
                showError('Optimization failed: ' + response.data);
                button.text(originalText);
            }
        }).fail(function() {
            showError('Network error during optimization');
            button.text(originalText);
        });
    }

    // Utility functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function showError(message) {
        const errorHtml = '<div class="micro-jpeg-error">' + message + '</div>';
        $('.micro-jpeg-api-compressor').prepend(errorHtml);
        
        // Auto-remove after 5 seconds
        setTimeout(function() {
            $('.micro-jpeg-error').fadeOut();
        }, 5000);
    }

    function showSuccess(message) {
        const successHtml = '<div class="micro-jpeg-success">' + message + '</div>';
        $('.micro-jpeg-api-compressor').prepend(successHtml);
        
        // Auto-remove after 5 seconds
        setTimeout(function() {
            $('.micro-jpeg-success').fadeOut();
        }, 5000);
    }

    // Reset form function
    function resetForm() {
        selectedFiles = [];
        compressionResults = [];
        $('.compression-settings').hide();
        $('.results-area').hide();
        $('.upload-area').show();
        $('#file-input').val('');
        $('.selected-files').remove();
    }

    // Add reset button functionality
    $(document).on('click', '.reset-button', resetForm);

})(jQuery);