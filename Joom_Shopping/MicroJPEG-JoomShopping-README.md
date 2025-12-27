# MicroJPEG Image Optimizer for JoomShopping

[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](https://microjpeg.com)
[![Joomla](https://img.shields.io/badge/Joomla-4.x%20%7C%205.x-orange.svg)](https://www.joomla.org)
[![JoomShopping](https://img.shields.io/badge/JoomShopping-5.x-green.svg)](https://www.webdesigner-profi.de/joomla-webdesign/joomla-shop/)
[![PHP](https://img.shields.io/badge/PHP-8.0%2B-purple.svg)](https://php.net)
[![License](https://img.shields.io/badge/License-GPL--3.0-red.svg)](LICENSE)

Automatically optimizes uploaded images (products, categories, manufacturers) in the admin panel of JoomShopping for Joomla! Reduce loading time of your shop pages and get more happy users!

## Features

- ✅ **Automatic Compression** - Images are optimized automatically when you save products, categories, or manufacturers
- ✅ **Lossless Quality** - Compress JPG and PNG images by 40-80% without visible quality loss
- ✅ **Format Conversion** - Optional conversion to WebP or AVIF for even better compression
- ✅ **Multiple Image Types** - Compress product images, thumbnails, full-size images, category images, and manufacturer logos
- ✅ **Usage Statistics** - View your monthly compression count directly in the plugin settings
- ✅ **Error Logging** - Detailed logs for troubleshooting
- ✅ **Fast Loading** - Smaller images = faster page loads = better SEO and user experience

## Requirements

- Joomla 4.x or 5.x
- JoomShopping 5.x
- PHP 8.0 or higher
- cURL extension enabled
- MicroJPEG API key (free or paid)

## Installation

1. Download the plugin ZIP file
2. In Joomla admin, go to **System → Install → Extensions**
3. Upload and install the plugin
4. Go to **System → Manage → Plugins**
5. Search for "MicroJPEG" and enable the plugin
6. Click on the plugin name to configure it

## Configuration

### Getting an API Key

1. Go to [microjpeg.com](https://microjpeg.com)
2. Create a free account or subscribe to a plan
3. Navigate to the [API Dashboard](https://microjpeg.com/api-dashboard)
4. Generate your API key
5. Copy the key and paste it in the plugin settings

### Basic Settings

| Setting | Description |
|---------|-------------|
| **API Key** | Your MicroJPEG API key (required) |
| **Compress Product Images** | Enable/disable compression for product images |
| **Compress Category Images** | Enable/disable compression for category images |
| **Compress Manufacturer Images** | Enable/disable compression for manufacturer logos |

### Compression Settings

| Setting | Description |
|---------|-------------|
| **Quality** | Compression quality (50-100). Recommended: 85 |
| **Output Format** | Keep original, JPEG, PNG, WebP, or AVIF |
| **Compress Thumbnails** | Also compress thumbnail versions (thumb_*) |
| **Compress Full Size** | Also compress full size versions (full_*) |

### Advanced Settings

| Setting | Description |
|---------|-------------|
| **Show Statistics** | Display compression stats after saving |
| **Log Errors** | Enable error logging for troubleshooting |
| **API Status** | View your current API usage and limits |

## How It Works

1. When you save a product, category, or manufacturer in JoomShopping admin
2. The plugin automatically sends new/updated images to the MicroJPEG API
3. MicroJPEG compresses the images using advanced algorithms
4. The optimized images are downloaded and replace the originals
5. You see a success message with compression statistics

## API Limits

| Plan | Monthly Compressions | File Size Limit |
|------|---------------------|-----------------|
| **Free** | 30 | 5 MB |
| **Starter** ($9/mo) | Unlimited | 75 MB |

[View full pricing →](https://microjpeg.com/pricing)

## Supported Image Formats

### Input Formats
- JPEG / JPG
- PNG
- WebP
- GIF
- BMP
- TIFF

### Output Formats
- JPEG (best for photos)
- PNG (best for graphics with transparency)
- WebP (best compression, modern browsers)
- AVIF (best compression, newest format)

## Troubleshooting

### Images not being compressed

1. Check that the plugin is enabled
2. Verify your API key is correct
3. Check the log file at `administrator/logs/plg_jshoppingproducts_microjpeg.log.php`
4. Ensure your server has cURL enabled
5. Check if you've reached your monthly limit

### API Connection Errors

1. Verify your server can reach `https://microjpeg.com`
2. Check if your hosting has firewall restrictions
3. Ensure SSL/TLS is properly configured

### Large Files Not Compressing

- Free plan has 5MB limit per file
- Upgrade to Starter plan for 75MB limit

## Changelog

### Version 1.0.0 (2025-01)
- Initial release
- Support for Joomla 4.x and 5.x
- Support for JoomShopping 5.x
- Product, category, and manufacturer image compression
- Format conversion (WebP, AVIF)
- API usage statistics in plugin settings
- Error logging

## Support

- **Documentation**: [microjpeg.com/docs](https://microjpeg.com/api-docs)
- **API Dashboard**: [microjpeg.com/api-dashboard](https://microjpeg.com/api-dashboard)
- **Support**: [support@microjpeg.com](mailto:support@microjpeg.com)

## License

This plugin is licensed under the GNU General Public License version 3 or later.

## Credits

Developed by [MicroJPEG](https://microjpeg.com) - Picture Perfect Image Compression

---

**Note**: This is not an official Joomla or JoomShopping product. JoomShopping is developed by [MAXXmarketing GmbH](https://www.webdesigner-profi.de/).
