# Micro JPEG API WordPress Plugin

A professional WordPress plugin that integrates with the Micro JPEG API service for cloud-based image compression with support for 13+ formats including professional RAW files, format conversion, and automatic media optimization.

## 🚀 Features

### Cloud-Based Compression
- **API Integration**: Leverages the powerful Micro JPEG API for superior compression
- **No Server Load**: All processing happens on Micro JPEG servers, not your WordPress site
- **Consistent Quality**: Same compression algorithms across all installations
- **Advanced Features**: Access to webhooks, batch processing, and enterprise features

### Automatic WordPress Integration
- **Auto-Compress Uploads**: Automatically compress images when uploaded to media library
- **Media Library Integration**: Optimize existing images with one-click from media library
- **Bulk Optimization**: Process entire media library with intelligent batch processing
- **Backup Originals**: Optional backup of original images before compression

### Comprehensive Format Support
- **Standard Formats**: JPEG, PNG, WebP, AVIF, SVG, TIFF
- **RAW File Support**: CR2, ARW, DNG, NEF, ORF, RAF, RW2 (professional camera formats)
- **Output Formats**: Convert to optimized web formats (JPEG, PNG, WebP, AVIF, TIFF)
- **Smart Conversion**: Automatic format optimization for web performance with RAW processing
- **Quality Control**: Precise quality settings from 10% to 100%

### Developer-Friendly
- **Shortcode Support**: Easy integration into pages and posts
- **API Integration**: Built on WordPress hooks and filters
- **Extensible**: Hooks for custom functionality
- **Logging**: Comprehensive compression logging and statistics

## 💰 Cost Benefits

### API vs Web Interface Pricing
For bulk operations, the API provides significant cost savings:

- **1,000 images via API**: $4.00 (first 500 free + $8/1,000)
- **1,000 images via Web**: $49.00 (credit system)
- **Your Savings**: $45 (92% less expensive!)

### Free Tier
- **500 compressions per month** completely free
- No payment method required for API key
- Perfect for small to medium websites

## 📦 Installation

### Method 1: WordPress Admin Dashboard
1. Download the plugin ZIP file
2. Go to WordPress Admin → Plugins → Add New
3. Click "Upload Plugin" 
4. Choose the ZIP file and click "Install Now"
5. Activate the plugin

### Method 2: Manual Installation
1. Extract the plugin files
2. Upload the plugin folder to `/wp-content/plugins/`
3. Activate the plugin through WordPress admin

### Method 3: WordPress.org Repository
*Coming soon - the plugin will be available directly from the WordPress plugin repository*

## ⚙️ Configuration

### 1. Get Your API Key
1. Visit [microjpeg.com/api-docs](https://microjpeg.com/api-docs)
2. Sign up for a free account
3. Generate your API key (500 free compressions monthly)

### 2. Configure Plugin
1. Go to WordPress Admin → Media → Micro JPEG API
2. Enter your API key
3. Click "Test API Key" to verify
4. Configure your preferences:
   - **Auto-compress uploads**: Automatically optimize new uploads
   - **Default quality**: Quality setting for automatic compression (75% recommended)
   - **Backup originals**: Keep copies of original files
5. Save settings

## 🎯 Usage

### Shortcode Integration
Add the compression interface to any page or post:

```
[micro_jpeg_api_compressor]
```

With custom parameters:
```
[micro_jpeg_api_compressor max_files="5" max_file_size="5"]
```

**Shortcode Parameters:**
- `max_files`: Maximum files to upload at once (default: 10)
- `max_file_size`: Maximum file size in MB (default: 10)
- `theme`: Visual theme (default: 'default')

### Automatic Media Library Optimization
1. **New Uploads**: Enable auto-compression in settings for automatic optimization
2. **Existing Images**: Use bulk optimization or individual optimization from media library
3. **One-Click Optimization**: Click "Optimize" next to any image in media library

### Bulk Optimization
1. Go to WordPress Admin → Media → Bulk Optimize
2. Review statistics (total images, unoptimized count, estimated savings)
3. Click "Start Bulk Optimization"
4. Monitor progress with real-time updates
5. Review results and savings

## 🔧 Advanced Features

### Compression Settings
- **Quality Control**: Slider from 10% to 100% with real-time preview
- **Output Format**: Keep original, JPEG, WebP, or AVIF
- **Resize Options**: Keep original size or resize for web optimization
- **Smart Defaults**: Optimized settings for common use cases

### Media Library Integration
- **Compression Column**: See optimization status for each image
- **Individual Controls**: Optimize single images with one click
- **Batch Selection**: Select multiple images for optimization
- **Statistics Tracking**: View compression ratios and file size savings

### Developer Hooks
```php
// Custom compression settings
add_filter('micro_jpeg_api_compression_settings', function($settings) {
    $settings['quality'] = 85;
    return $settings;
});

// After compression callback
add_action('micro_jpeg_api_after_compression', function($result, $attachment_id) {
    // Custom logic after image compression
}, 10, 2);

// Bulk optimization progress
add_action('micro_jpeg_api_bulk_progress', function($progress) {
    // Custom progress handling
});
```

## 📊 Performance Benefits

### File Size Reduction
- **JPEG**: Typically 30-60% smaller with same visual quality
- **PNG**: Convert to WebP for 25-80% size reduction
- **WebP**: 25-35% smaller than equivalent JPEG
- **AVIF**: Up to 50% smaller than JPEG (next-generation format)

### Website Performance
- **Faster Loading**: Smaller images = faster page loads
- **Better SEO**: Google PageSpeed improvements
- **Mobile Optimization**: Reduced data usage for mobile users
- **CDN Ready**: Optimized images work better with CDNs

### Server Benefits
- **Reduced Storage**: Compressed images take less disk space
- **Lower Bandwidth**: Reduced hosting costs
- **Better Performance**: Less server load for image delivery

## 🛠️ Troubleshooting

### Common Issues

**API Key Not Working**
- Verify API key is entered correctly (no extra spaces)
- Check your API key hasn't expired
- Ensure you have remaining compression credits
- Test API key using the "Test API Key" button

**Images Not Compressing**
- Check file format is supported (JPEG, PNG, WebP, AVIF)
- Verify file size is under 10MB limit
- Ensure your server can make outbound HTTP requests
- Check WordPress error logs for API errors

**Bulk Optimization Stopping**
- Check your hosting provider's execution time limits
- Verify API rate limits aren't being exceeded
- Try smaller batch sizes in plugin settings
- Check server memory limits

**Upload Issues**
- Verify WordPress upload directory permissions
- Check available disk space
- Ensure PHP upload_max_filesize is adequate
- Test with smaller files first

### Error Messages

**"API key is not configured"**
- Solution: Add your API key in WordPress Admin → Media → Micro JPEG API

**"File too large. Maximum size is 10MB"**
- Solution: Resize image before upload or contact support for larger file limits

**"Unsupported file type"**
- Solution: Convert to JPEG, PNG, WebP, or AVIF format

**"No credits remaining"**
- Solution: Purchase additional credits or wait for monthly reset

## 📈 Best Practices

### For Photographers
- Use 85-90% quality for portfolio images
- Enable backup originals for important photos
- Convert RAW files to JPEG before upload
- Use WebP format for web galleries

### For E-commerce
- Use 75-80% quality for product images
- Enable auto-compression for consistent optimization
- Convert PNG product images to WebP
- Optimize existing images with bulk tool

### For Bloggers
- Use 70-75% quality for blog images
- Enable auto-compression for new posts
- Optimize featured images for social sharing
- Use AVIF for modern browsers

### For Developers
- Implement custom hooks for advanced control
- Monitor compression logs for optimization insights
- Use API directly for programmatic access
- Integrate with custom media workflows

## 🔐 Security & Privacy

### Data Protection
- Images are processed securely via HTTPS
- No permanent storage on compression servers
- Optional original image backups
- Compliance with WordPress security standards

### API Security
- Secure authentication with API keys
- Rate limiting protection
- Encrypted data transmission
- No personal data collection

## 🆘 Support

### Documentation
- **Plugin Documentation**: This README file
- **API Documentation**: [microjpeg.com/api-docs](https://microjpeg.com/api-docs)
- **WordPress Hooks**: See developer section above
- **Video Tutorials**: Coming soon

### Get Help
- **Plugin Support**: WordPress.org support forum
- **API Support**: support@microjpeg.com
- **Enterprise Support**: Available with premium plans
- **Community**: Join our Discord server

### Bug Reports
Please report bugs with:
1. WordPress version
2. PHP version
3. Plugin version
4. Error messages
5. Steps to reproduce

## 📋 Requirements

### WordPress
- **WordPress**: 5.0 or higher
- **PHP**: 7.4 or higher
- **MySQL**: 5.6 or higher
- **HTTPS**: Required for API communication

### Server Requirements
- **cURL**: Required for API communication
- **JSON**: Required for data processing
- **File Uploads**: Must be enabled
- **Outbound HTTP**: Must be allowed

### Recommended
- **Memory**: 128MB+ PHP memory limit
- **Execution Time**: 60+ seconds for bulk operations
- **Upload Size**: 10MB+ max upload size
- **Modern PHP**: 8.0+ for best performance

## 📜 License

This plugin is licensed under the GPL v2 or later.

```
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
```

## 🚀 Changelog

### Version 2.0.0 (Current)
- **NEW**: Complete API integration with Micro JPEG service
- **NEW**: Cloud-based compression (no server load)
- **NEW**: Automatic WordPress media library integration
- **NEW**: Bulk optimization with progress tracking
- **NEW**: Advanced format conversion (WebP, AVIF)
- **NEW**: Cost-effective pricing (92% savings vs web interface)
- **NEW**: Real-time compression statistics
- **NEW**: Developer hooks and filters
- **IMPROVED**: Better error handling and user feedback
- **IMPROVED**: Mobile-responsive admin interface
- **IMPROVED**: Comprehensive logging and analytics

### Version 1.0.0 (Legacy)
- Basic local compression using ImageMagick/GD
- Simple shortcode interface
- Basic admin settings

## 🔮 Roadmap

### Coming Soon
- **WordPress.org Repository**: Official listing
- **Advanced Analytics**: Detailed compression statistics
- **CDN Integration**: Direct CDN upload support  
- **WooCommerce Integration**: Product image optimization
- **Multisite Support**: Network-wide settings
- **Advanced Scheduling**: Automated optimization schedules

### Future Features
- **AI-Powered Optimization**: Smart quality selection
- **Advanced Formats**: Support for newer image formats
- **Progressive Enhancement**: Automatic format switching
- **Performance Monitoring**: Page speed impact tracking
- **Advanced Hooks**: More developer customization options

---

**Ready to optimize your WordPress images?** [Get started with your free API key](https://microjpeg.com/api-docs) and start saving bandwidth and improving performance today! 🎯