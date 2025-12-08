// src/data/conversionContent.ts
// Comprehensive SEO content for all conversion/compression pages

export interface PageContent {
  // Meta
  metaTitle: string;
  metaDescription: string;
  
  // Hero
  headline?: string;
  subheadline?: string;
  heroDescription?: string;
  
  // Intro paragraph
  intro: string;
  
  // What Is section
  whatIsTitle?: string;
  whatIsContent?: string;
  
  // Why Convert section
  whyConvertTitle?: string;
  whyConvertReasons?: string[];
  
  // How To section
  howToTitle?: string;
  howToSteps?: string[];
  
  // Comparison section
  comparisonTitle?: string;
  sourceInfo?: { label: string; value: string }[];
  targetInfo?: { label: string; value: string }[];
  
  // Features
  features?: string[];
  
  // Device support text
  deviceSupportText?: string;
  
  // Additional sections (optional)
  sections?: { title: string; body: string }[];
  
  // Related conversions
  relatedConversions?: { label: string; href: string }[];
}


// ============================================================================
// CONTENT LIBRARY - ALL 65 PAGES
// ============================================================================

const CONTENT: Record<string, PageContent> = {
  
  // =========================================================================
  // 1. CR2 to JPG - HIGHEST PRIORITY
  // =========================================================================
  'cr2-jpg': {
    metaTitle: 'CR2 to JPG Converter - Free Online Canon RAW to JPEG | MicroJPEG',
    metaDescription: 'Convert Canon CR2 RAW files to JPG instantly. Free online converter supports EOS 5D, 6D, 7D, 80D, Rebel series. Batch conversion, preserves EXIF metadata.',
    
    headline: 'Convert CR2 to JPG Online',
    subheadline: 'Free & Instant',
    heroDescription: 'Transform Canon RAW files into universally compatible JPG images. No software installation required.',
    
    intro: 'MicroJPEG converts Canon CR2 RAW files to high-quality JPG images instantly in your browser. Our converter supports all Canon EOS cameras including the 5D Mark series, 6D, 7D, 80D, 90D, and Rebel series. Upload your CR2 files and download optimized JPGs in seconds — no software installation, no signup required. Free users get 200 conversions per month with support for files up to 15MB.',
    
    whatIsTitle: 'What is a CR2 File?',
    whatIsContent: 'CR2 (Canon Raw version 2) is Canon\'s proprietary RAW image format used in EOS DSLR cameras since 2004. CR2 files store uncompressed sensor data with 14-bit color depth, preserving maximum detail and dynamic range for professional editing. While CR2 offers superior image quality for post-processing, the large file sizes (typically 20-50MB) and limited software compatibility make conversion to JPG essential for sharing, printing, and web use.',
    
    whyConvertTitle: 'Why Convert CR2 to JPG?',
    whyConvertReasons: [
      'Universal compatibility — JPG opens on any device, browser, or application without special software',
      '80-90% smaller file sizes — a 30MB CR2 becomes a 3MB JPG, making sharing and storage easier',
      'Faster uploads to social media, websites, cloud storage, and email attachments',
      'No special software required — recipients can view JPGs immediately on any device',
      'Preserve memories in a widely-supported format that will remain readable for decades',
      'Ideal for client deliveries, portfolio websites, and print orders'
    ],
    
    howToTitle: 'How to Convert CR2 to JPG',
    howToSteps: [
      'Click "Upload Files" or drag and drop your CR2 images into the converter',
      'Wait for files to load securely in your browser (processing happens locally)',
      'MicroJPEG automatically converts your CR2 files to optimized JPG format',
      'Adjust quality settings if needed — 85-90% is recommended for best balance',
      'Download your JPGs individually or as a batch ZIP file'
    ],
    
    comparisonTitle: 'CR2 vs JPG: Format Comparison',
    sourceInfo: [
      { label: 'Format', value: 'CR2 (Canon RAW)' },
      { label: 'Compression', value: 'Uncompressed/Lossless' },
      { label: 'File Size', value: '20-50 MB typical' },
      { label: 'Color Depth', value: '14-bit (16,384 colors/channel)' },
      { label: 'Compatibility', value: 'Canon software, Adobe products' },
      { label: 'Editing Flexibility', value: 'Maximum — full RAW adjustments' },
      { label: 'Web/Email Use', value: 'Not suitable — too large' }
    ],
    targetInfo: [
      { label: 'Format', value: 'JPG (JPEG)' },
      { label: 'Compression', value: 'Lossy' },
      { label: 'File Size', value: '1-5 MB typical' },
      { label: 'Color Depth', value: '8-bit (256 colors/channel)' },
      { label: 'Compatibility', value: 'Universal — all devices' },
      { label: 'Editing Flexibility', value: 'Limited — artifacts on re-save' },
      { label: 'Web/Email Use', value: 'Ideal — optimized for sharing' }
    ],
    
    features: [
      'Batch processing — convert dozens of CR2 files at once and download as ZIP',
      'Quality control — adjust JPG compression from 10-100% to balance size and quality',
      'EXIF preservation — camera settings, date, GPS coordinates retained in output',
      'No installation — runs entirely in your web browser on any device',
      'Privacy-focused — files are processed locally and never uploaded to our servers',
      'Professional output — optimized algorithms preserve color accuracy and detail'
    ],
    
    deviceSupportText: 'MicroJPEG works on all devices with a modern browser: Windows 10/11, macOS, Linux, iOS (Safari), and Android (Chrome). No app installation required.',
    
    sections: [
      {
        title: 'Supported Canon Cameras',
        body: 'Our CR2 converter supports all Canon EOS cameras that produce CR2 files, including professional bodies (EOS 5D Mark I-IV, 1D X series, 6D Mark I-II, 7D Mark I-II), enthusiast cameras (EOS 80D, 90D, 70D, 60D), and consumer models (Rebel T8i/T7i/T6i/T5i/T4i/T3i series, EOS M series). Newer Canon cameras using CR3 format are also supported.'
      },
      {
        title: 'Quality Preservation',
        body: 'MicroJPEG uses advanced algorithms to preserve maximum detail when converting CR2 to JPG. Color profiles are accurately rendered using proper RAW decoding, and EXIF metadata (camera settings, date/time, GPS) is retained in the converted file. While JPG compression is inherently lossy, the quality difference is imperceptible at 85-90% settings for most photographic uses.'
      },
      {
        title: 'Batch Conversion for Photographers',
        body: 'Professional photographers can convert entire shoots efficiently. Upload multiple CR2 files simultaneously, and download all converted JPGs in a single ZIP archive. This workflow is ideal for client deliveries, portfolio updates, social media posting, and website uploads where RAW files are impractical due to size.'
      }
    ],
    
    relatedConversions: [
      { label: 'CR2 to PNG', href: '/convert/cr2-to-png' },
      { label: 'CR2 to WebP', href: '/convert/cr2-to-webp' },
      { label: 'CR2 to AVIF', href: '/convert/cr2-to-avif' },
      { label: 'CR2 to TIFF', href: '/convert/cr2-to-tiff' }
    ]
  },

  // =========================================================================
// 2. Convert CR2 TO PNG
// =========================================================================
'cr2-png': {
  metaTitle: 'Convert CR2 to PNG Online – Canon RAW to PNG Converter | MicroJPEG',
  metaDescription:
    'Convert Canon CR2 RAW photos to PNG online with MicroJPEG. Preserve detail and transparency-ready output. Fast, secure CR2 to PNG converter that works in your browser.',

  headline: 'Convert CR2 to PNG Online',
  subheadline: 'Clean, Lossless PNG Output',
  heroDescription:
    'Turn Canon CR2 RAW photos into high-quality PNG images ready for editing, design, and web use using MicroJPEG – no software installation required.',
  intro:
    'CR2 is Canon’s RAW file format, ideal for capturing maximum data from your camera sensor. When you need a clean, editable, and widely supported format, PNG is a great choice. With MicroJPEG, you can convert CR2 to PNG directly in your browser. Just upload your RAW files and download crisp PNG images in seconds. Explore more tools at microjpeg.com and advanced features at microjpeg.com/features.',

  whatIsTitle: 'What Is a CR2 File?',
  whatIsContent:
    'CR2 (Canon RAW version 2) is a RAW image format used by Canon DSLR and mirrorless cameras. It stores unprocessed sensor data with wide dynamic range and flexible editing potential, but it is large and not universally supported outside photo editing software.',

  whyConvertTitle: 'Why Convert CR2 to PNG?',
  whyConvertReasons: [
    'PNG is widely supported across design, editing, and office tools.',
    'Lossless PNG keeps sharp details from your CR2 photos.',
    'Perfect for graphics, screenshots, and transparent overlays after editing.',
    'Smaller file sizes than RAW while preserving visual quality.',
    'Easier to share, upload, and embed compared to CR2.'
  ],

  howToTitle: 'How to Convert CR2 to PNG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/cr2-to-png.',
    'Drag and drop your CR2 photo into the upload area or click to browse.',
    'MicroJPEG automatically processes and converts the RAW file to PNG.',
    'Wait a short moment while the conversion completes.',
    'Download your new PNG image.',
    'For higher limits or automation, visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'CR2 vs PNG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Camera RAW (Canon)' },
    { label: 'Compression', value: 'None (Sensor Data)' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Professional capture & editing' },
    { label: 'Compatibility', value: 'Limited, requires photo software' },
    { label: 'Editing Flexibility', value: 'Maximum' }
  ],

  targetInfo: [
    { label: 'Type', value: 'Raster Image' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Medium to Large' },
    { label: 'Best for', value: 'Editing, graphics, web assets' },
    { label: 'Compatibility', value: 'Excellent across apps & OS' },
    { label: 'Transparency', value: 'Full Alpha Support' }
  ],

  features: [
    'High-quality PNG output preserving details from CR2 RAW files.',
    'Runs completely in the browser – no desktop tools required.',
    'Secure processing with automatic file deletion after conversion.',
    'Supports single images and batches of CR2 files.',
    'Optimized pipeline for fast RAW decoding and PNG generation.',
    'API access for automated CR2 to PNG workflows at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'MicroJPEG works smoothly on all major devices and platforms, so you can convert CR2 to PNG from almost anywhere:',
    'Windows desktops and laptops',
    'macOS systems',
    'Linux distributions',
    'Android phones and tablets',
    'iPhones and iPads',
    'Modern browsers including Chrome, Firefox, Edge, and Safari'
  ],

  relatedConversions: [
    { label: 'CR2 to JPG', href: '/convert/cr2-to-jpg' },
    { label: 'CR2 to TIFF', href: '/convert/cr2-to-tiff' },
    { label: 'CR2 to WEBP', href: '/convert/cr2-to-webp' },
    { label: 'CR2 to AVIF', href: '/convert/cr2-to-avif' }
  ]
},

// =========================================================================
// 3. Convert CR2 TO TIFF
// =========================================================================
'cr2-tiff': {
  metaTitle: 'Convert CR2 to TIFF Online – Canon RAW to TIFF Converter | MicroJPEG',
  metaDescription:
    'Convert Canon CR2 RAW images to TIFF with MicroJPEG. Get lossless, print-ready TIFF files for professional workflows. Fast online CR2 to TIFF converter – no software needed.',

  headline: 'Convert CR2 to TIFF Online',
  subheadline: 'Lossless, Print-Ready TIFF',
  heroDescription:
    'Convert Canon CR2 RAW photos to high-fidelity TIFF files ideal for printing, archiving, and professional editing – all inside your browser with MicroJPEG.',
  intro:
    'TIFF is a trusted standard for high-end printing, pre-press, and archival workflows. When you convert CR2 RAW files to TIFF, you retain rich tonal data and detail in a format accepted by most professional tools. MicroJPEG lets you perform CR2 to TIFF conversion online with no installation or complex setup. Upload your RAW photos, convert, and download ready-to-use TIFF files in seconds. Learn more about the platform at microjpeg.com and discover pro features at microjpeg.com/features.',

  whatIsTitle: 'What Is a CR2 File?',
  whatIsContent:
    'CR2 is Canon’s RAW image format that records unprocessed sensor data straight from the camera. It offers wide dynamic range and editing flexibility but requires specialized software and uses substantial storage space.',

  whyConvertTitle: 'Why Convert CR2 to TIFF?',
  whyConvertReasons: [
    'TIFF is widely used in printing and professional imaging workflows.',
    'Lossless TIFF preserves fine detail and color accuracy.',
    'Better interoperability with editing, layout, and archival tools.',
    'Simplifies file delivery to clients, printers, and agencies.',
    'Great for long-term storage of master image versions.'
  ],

  howToTitle: 'How to Convert CR2 to TIFF on MicroJPEG',
  howToSteps: [
    'Go to https://microjpeg.com/convert/cr2-to-tiff.',
    'Drag and drop your CR2 files into the upload box.',
    'MicroJPEG automatically decodes and converts them to TIFF.',
    'Wait for the conversion progress to complete.',
    'Download your TIFF files for printing, editing, or archiving.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for higher limits and automation.'
  ],

  comparisonTitle: 'CR2 vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Canon RAW image' },
    { label: 'Compression', value: 'Uncompressed sensor data' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Capture and deep editing' },
    { label: 'Compatibility', value: 'Limited general support' },
    { label: 'Usage', value: 'Camera source format' }
  ],

  targetInfo: [
    { label: 'Type', value: 'High-quality raster image' },
    { label: 'Compression', value: 'Lossless (or lightly compressed)' },
    { label: 'File Size', value: 'Large' },
    { label: 'Best for', value: 'Print, pre-press, and archival' },
    { label: 'Compatibility', value: 'Excellent in pro imaging tools' },
    { label: 'Usage', value: 'Master files and print production' }
  ],

  features: [
    'Lossless TIFF output ideal for print and archival workflows.',
    'Accurate color and tonal rendition from CR2 RAW files.',
    'Browser-based conversion – no heavy desktop applications required.',
    'Secure, time-limited processing with automatic cleanup.',
    'Suitable for both single images and large RAW batches.',
    'Supports API-based integrations for studios and labs via https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert CR2 to TIFF on MicroJPEG from almost any device:',
    'Windows workstations',
    'macOS design machines',
    'Linux-based servers or desktops',
    'Tablets and smartphones',
    'Any modern browser such as Chrome, Safari, Edge, or Firefox'
  ],

  relatedConversions: [
    { label: 'CR2 to JPG', href: '/convert/cr2-to-jpg' },
    { label: 'CR2 to PNG', href: '/convert/cr2-to-png' },
    { label: 'CR2 to WEBP', href: '/convert/cr2-to-webp' },
    { label: 'CR2 to AVIF', href: '/convert/cr2-to-avif' }
  ]
},

// =========================================================================
 // 4. Convert CR2 TO WEBP
 // =========================================================================
'cr2-webp': {
  metaTitle: 'Convert CR2 to WebP Online – Canon RAW to WebP Converter | MicroJPEG',
  metaDescription:
    'Convert CR2 RAW photos to WebP using MicroJPEG. Create lightweight, web-optimized images from Canon RAW files. Fast CR2 to WebP converter that runs in your browser.',

  headline: 'Convert CR2 to WebP Online',
  subheadline: 'Web-Optimized Images from RAW',
  heroDescription:
    'Turn heavy Canon CR2 RAW files into modern, web-friendly WebP images with MicroJPEG – perfect for fast-loading websites and online galleries.',
  intro:
    'WebP is a modern image format that offers excellent compression and strong visual quality, making it ideal for the web. Converting CR2 RAW files to WebP lets you share your photos online without slow load times or huge downloads. With MicroJPEG, you can perform CR2 to WebP conversion online in just a few clicks. Upload your RAW photos, let the system compress them, and download high-quality WebP files optimized for the web. Explore more features at microjpeg.com/features.',

  whatIsTitle: 'What Is a CR2 File?',
  whatIsContent:
    'CR2 is the RAW image format used by many Canon cameras. It stores full sensor information to preserve dynamic range and editing latitude, but files are large and not directly suited for web delivery.',

  whyConvertTitle: 'Why Convert CR2 to WebP?',
  whyConvertReasons: [
    'WebP dramatically reduces file size compared to RAW.',
    'Faster loading galleries, blogs, and portfolios.',
    'Better user experience on slow or mobile connections.',
    'Reduced bandwidth and storage requirements.',
    'Modern browsers offer broad support for WebP images.'
  ],

  howToTitle: 'How to Convert CR2 to WebP on MicroJPEG',
  howToSteps: [
    'Navigate to https://microjpeg.com/convert/cr2-to-webp.',
    'Drop your CR2 photos into the upload zone or select them from your device.',
    'MicroJPEG automatically converts them into compressed WebP images.',
    'Wait briefly while the conversion completes.',
    'Download your WebP files for use on websites or apps.',
    'For higher volumes and automation, see https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'CR2 vs WebP – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Camera RAW (Canon)' },
    { label: 'Compression', value: 'Uncompressed' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Capture and editing' },
    { label: 'Performance on Web', value: 'Not suitable' },
    { label: 'Typical Use', value: 'Source files from camera' }
  ],

  targetInfo: [
    { label: 'Type', value: 'Compressed web image' },
    { label: 'Compression', value: 'Lossy & Lossless' },
    { label: 'File Size', value: 'Small' },
    { label: 'Best for', value: 'Online viewing and sharing' },
    { label: 'Performance on Web', value: 'Excellent' },
    { label: 'Typical Use', value: 'Websites, blogs, social platforms' }
  ],

  features: [
    'High-efficiency WebP compression from CR2 RAW sources.',
    'Smart defaults for good visual quality at small file sizes.',
    'Runs entirely in your browser – nothing to install.',
    'Secure processing with temporary storage and auto-deletion.',
    'Suitable for single images or full photo sets.',
    'Developer-friendly API at https://microjpeg.com/api-docs for automated pipelines.'
  ],

  deviceSupportText: [
    'You can convert CR2 to WebP on MicroJPEG from:',
    'Windows and macOS laptops',
    'Linux desktops and servers',
    'Android and iOS smartphones',
    'Any modern browser such as Chrome, Edge, Firefox, or Safari'
  ],

  relatedConversions: [
    { label: 'CR2 to JPG', href: '/convert/cr2-to-jpg' },
    { label: 'CR2 to PNG', href: '/convert/cr2-to-png' },
    { label: 'CR2 to TIFF', href: '/convert/cr2-to-tiff' },
    { label: 'CR2 to AVIF', href: '/convert/cr2-to-avif' }
  ]
},

// =========================================================================
// 5. Convert CR2 TO AVIF
// =========================================================================
'cr2-avif': {
  metaTitle: 'Convert CR2 to AVIF Online – Canon RAW to AVIF Converter | MicroJPEG',
  metaDescription:
    'Convert Canon CR2 RAW photos to AVIF with MicroJPEG. Achieve tiny file sizes and high visual quality for modern web use. Fast online CR2 to AVIF converter.',

  headline: 'Convert CR2 to AVIF Online',
  subheadline: 'Next-Gen Compression from RAW',
  heroDescription:
    'Convert bulky CR2 RAW files into ultra-efficient AVIF images using MicroJPEG – ideal for modern websites and apps that demand small files and great quality.',
  intro:
    'AVIF is a cutting-edge image format based on AV1 compression technology. It delivers excellent visual quality at very low file sizes, making it perfect for performance-focused websites and applications. MicroJPEG lets you convert CR2 RAW photos to AVIF online so you can keep pro-quality images while dramatically reducing weight. Simply upload your CR2 files, convert, and download AVIF images optimized for the modern web. Explore more about MicroJPEG at microjpeg.com and microjpeg.com/features.',

  whatIsTitle: 'What Is a CR2 File?',
  whatIsContent:
    'CR2 is the RAW file format for many Canon cameras, capturing full sensor data for maximum editing flexibility. While perfect as a source format, it is far too large for everyday sharing and web deployment.',

  whyConvertTitle: 'Why Convert CR2 to AVIF?',
  whyConvertReasons: [
    'AVIF offers higher compression efficiency than many traditional formats.',
    'Significantly smaller files than JPG or PNG at comparable quality.',
    'Better performance and faster page loads on modern websites.',
    'Good for image-heavy apps and galleries where every kilobyte matters.',
    'Maintains strong visual quality even at aggressive compression levels.'
  ],

  howToTitle: 'How to Convert CR2 to AVIF on MicroJPEG',
  howToSteps: [
    'Open https://microjpeg.com/convert/cr2-to-avif.',
    'Drag your CR2 RAW photos into the upload region or click to choose them.',
    'MicroJPEG converts the RAW input into AVIF format automatically.',
    'Wait until the conversion indicator shows completion.',
    'Download your AVIF files and use them in your web projects or apps.',
    'Scale up or integrate programmatically via https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'CR2 vs AVIF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Canon RAW image' },
    { label: 'Compression', value: 'Uncompressed sensor data' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Capture and detailed editing' },
    { label: 'Web Readiness', value: 'Unsuitable, heavy files' },
    { label: 'Typical Use', value: 'Original camera files' }
  ],

  targetInfo: [
    { label: 'Type', value: 'Modern compressed image' },
    { label: 'Compression', value: 'Advanced AV1-based' },
    { label: 'File Size', value: 'Very Small' },
    { label: 'Best for', value: 'High-performance websites and apps' },
    { label: 'Web Readiness', value: 'Excellent on supported browsers' },
    { label: 'Typical Use', value: 'CDNs, performance-focused projects' }
  ],

  features: [
    'State-of-the-art AVIF encoding from CR2 RAW sources.',
    'Tiny file sizes with strong perceived quality for web and app use.',
    'Browser-based workflow with no extra tools needed.',
    'Secure processing with automatic cleanup of temporary files.',
    'Batch conversion support for entire shoots.',
    'Automation-ready with the MicroJPEG API at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'MicroJPEG lets you convert CR2 to AVIF from any modern environment:',
    'Windows and macOS machines',
    'Linux workstations and servers',
    'Phones and tablets running Android or iOS',
    'Browsers such as Chrome, Firefox, Edge, and other AVIF-capable clients'
  ],

  relatedConversions: [
    { label: 'CR2 to JPG', href: '/convert/cr2-to-jpg' },
    { label: 'CR2 to PNG', href: '/convert/cr2-to-png' },
    { label: 'CR2 to TIFF', href: '/convert/cr2-to-tiff' },
    { label: 'CR2 to WEBP', href: '/convert/cr2-to-webp' }
  ]
},

  // =========================================================================
  // 6. NEF to JPG
  // =========================================================================
  'nef-jpg': {
    metaTitle: 'NEF to JPG Converter - Free Online Nikon RAW to JPEG | MicroJPEG',
    metaDescription: 'Convert Nikon NEF RAW files to JPG instantly. Free online converter supports D850, D780, Z9, Z6, D7500. No software needed, preserves EXIF metadata.',
    
    headline: 'Convert NEF to JPG Online',
    subheadline: 'Free & Instant',
    heroDescription: 'Transform Nikon RAW files into universally compatible JPG images. No Nikon software required.',
    
    intro: 'MicroJPEG converts Nikon NEF RAW files to high-quality JPG images instantly. Our converter supports all Nikon cameras including D850, D780, D7500, Z9, Z8, Z7, Z6, and D3500. No Nikon ViewNX, Capture NX, or Adobe subscription required — upload your NEF files and download optimized JPGs in seconds.',
    
    whatIsTitle: 'What is a NEF File?',
    whatIsContent: 'NEF (Nikon Electronic Format) is Nikon\'s proprietary RAW image format containing unprocessed sensor data from Nikon DSLR and mirrorless cameras. NEF files preserve maximum image quality with 12-14 bit color depth, offering full flexibility for exposure, white balance, and color adjustments in post-processing. However, NEF files require specialized software to view and are too large for practical sharing.',
    
    whyConvertTitle: 'Why Convert NEF to JPG?',
    whyConvertReasons: [
      'Open Nikon photos on any device without special Nikon software or plugins',
      'Reduce file sizes by 80-90% — share via email, messaging, and social media easily',
      'Upload to websites, portfolios, and cloud storage without file size restrictions',
      'Create web-optimized versions while keeping original NEF files for archival',
      'Share with clients who don\'t have RAW viewing capabilities',
      'Print directly from JPG at photo labs and print services'
    ],
    
    howToTitle: 'How to Convert NEF to JPG',
    howToSteps: [
      'Upload your NEF files by clicking the upload button or dragging files',
      'Files load securely in your browser — no upload to external servers',
      'MicroJPEG automatically converts to high-quality JPG format',
      'Adjust the quality slider if you want smaller files or higher quality',
      'Download converted JPGs individually or as a ZIP archive'
    ],
    
    comparisonTitle: 'NEF vs JPG: Format Comparison',
    sourceInfo: [
      { label: 'Format', value: 'NEF (Nikon RAW)' },
      { label: 'Compression', value: 'Uncompressed/Lossless' },
      { label: 'File Size', value: '25-60 MB typical' },
      { label: 'Color Depth', value: '12-14 bit' },
      { label: 'Compatibility', value: 'Nikon/Adobe software' },
      { label: 'Best For', value: 'Professional editing' }
    ],
    targetInfo: [
      { label: 'Format', value: 'JPG (JPEG)' },
      { label: 'Compression', value: 'Lossy' },
      { label: 'File Size', value: '2-6 MB typical' },
      { label: 'Color Depth', value: '8-bit' },
      { label: 'Compatibility', value: 'Universal' },
      { label: 'Best For', value: 'Sharing, web, print' }
    ],
    
    features: [
      'Supports all Nikon cameras — DSLR and mirrorless Z-series',
      'Batch conversion — process entire photo shoots at once',
      'No Nikon software required — skip ViewNX and Capture NX installation',
      'EXIF metadata preserved — camera settings and shooting info retained',
      'Browser-based — works on Windows, Mac, Linux, and mobile devices',
      'Privacy-first — your photos never leave your device'
    ],
    
    deviceSupportText: 'Works on any device with a modern browser. No app installation or Nikon software required.',
    
    sections: [
      {
        title: 'Supported Nikon Cameras',
        body: 'Full support for NEF files from all Nikon cameras: professional DSLRs (D6, D5, D850, D780, D500), enthusiast models (D7500, D7200, D5600, D5500), entry-level (D3500, D3400, D3300), and mirrorless Z-series (Z9, Z8, Z7 II, Z7, Z6 III, Z6 II, Z6, Z5, Zf, Zfc, Z50, Z30).'
      },
      {
        title: 'Skip Nikon Software',
        body: 'Converting NEF to JPG with MicroJPEG eliminates the need for Nikon\'s ViewNX-i, Capture NX-D, or NX Studio software. These programs require installation, updates, and can be slow for batch processing. MicroJPEG provides instant conversion directly in your browser.'
      }
    ],
    
    relatedConversions: [
      { label: 'NEF to PNG', href: '/convert/nef-to-png' },
      { label: 'NEF to WebP', href: '/convert/nef-to-webp' },
      { label: 'NEF to AVIF', href: '/convert/nef-to-avif' },
      { label: 'NEF to TIFF', href: '/convert/nef-to-tiff' }
    ]
  },

  // =========================================================================
// 7. Convert NEF TO PNG
// =========================================================================
'nef-png': {
  metaTitle: 'Convert NEF to PNG Online – Nikon RAW to PNG Converter | MicroJPEG',
  metaDescription:
    'Convert NEF RAW photos to high-quality PNG images using MicroJPEG. Fast, browser-based NEF to PNG online converter with lossless results and transparency support.',

  headline: 'Convert NEF to PNG Online',
  subheadline: 'Lossless and Transparent PNG Output',
  heroDescription:
    'Transform Nikon NEF RAW photos into clean, editable PNG images instantly in your browser. MicroJPEG delivers high-quality, transparent format conversion without any software install.',
  intro:
    'NEF files are the RAW image format used by Nikon cameras, designed to preserve every bit of captured detail. For editing, web use, or graphics workflows, converting NEF to PNG is ideal. With MicroJPEG, you can convert NEF to PNG online — no accounts, no plugins, no desktop tools. Simply upload your files and get PNGs in seconds. Discover more tools at microjpeg.com and detailed capabilities at microjpeg.com/features.',

  whatIsTitle: 'What Is a NEF File?',
  whatIsContent:
    'NEF (Nikon Electronic Format) is a RAW photo format created by Nikon cameras that stores unprocessed sensor data. NEF files preserve maximum image information, which makes them perfect for professional editing and post-production but large and not widely supported by general image viewers.',

  whyConvertTitle: 'Why Convert NEF to PNG?',
  whyConvertReasons: [
    'PNG retains image detail without compression artifacts.',
    'Supports full alpha transparency if needed.',
    'Widely compatible with editing and design tools.',
    'Smaller and easier to share than RAW.',
    'Perfect for graphics export and digital projects.'
  ],

  howToTitle: 'How to Convert NEF to PNG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/nef-to-png.',
    'Drag and drop your NEF RAW file into the upload area.',
    'MicroJPEG automatically processes and converts it to PNG.',
    'Wait briefly while it finishes converting.',
    'Download your PNG file.',
    'For higher limits or programmatic workflows, see https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'NEF vs PNG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Nikon RAW photo' },
    { label: 'Compression', value: 'Uncompressed sensor data' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Professional editing' },
    { label: 'Compatibility', value: 'Requires RAW support' },
    { label: 'Usage', value: 'Source capture format' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless raster image' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Medium–Large' },
    { label: 'Best for', value: 'Editing and graphics' },
    { label: 'Compatibility', value: 'High with image apps' },
    { label: 'Transparency', value: 'Yes (alpha)' }
  ],

  features: [
    'High-quality PNG output preserving NEF detail.',
    'Browser-based conversion — no installation required.',
    'Secure conversions with auto file cleanup.',
    'Handles batch NEF uploads.',
    'Fast and optimized RAW processing engine.',
    'API support available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert NEF to PNG on any modern device including:',
    'Windows PCs',
    'macOS laptops and desktops',
    'Linux systems',
    'Android devices',
    'iPhones and iPads',
    'Chrome, Edge, Safari, Firefox and other browsers'
  ],

  relatedConversions: [
    { label: 'NEF to JPG', href: '/convert/nef-to-jpg' },
    { label: 'NEF to TIFF', href: '/convert/nef-to-tiff' },
    { label: 'NEF to WEBP', href: '/convert/nef-to-webp' },
    { label: 'NEF to AVIF', href: '/convert/nef-to-avif' }
  ]
},

// =========================================================================
// 8. Convert NEF TO TIFF
// =========================================================================
'nef-tiff': {
  metaTitle: 'Convert NEF to TIFF Online – Nikon RAW to TIFF Converter | MicroJPEG',
  metaDescription:
    'Convert NEF RAW images to high-fidelity TIFF files with MicroJPEG. Print-ready and lossless NEF to TIFF converter online — fast and browser-based.',

  headline: 'Convert NEF to TIFF Online',
  subheadline: 'Lossless Master Output for Print and Archiving',
  heroDescription:
    'Transform Nikon NEF RAW photos into lossless TIFF images for printing, archiving, and deep editing — directly in your browser with MicroJPEG.',
  intro:
    'When professional-level detail and color accuracy matter, TIFF is the format of choice. Converting Nikon NEF files to TIFF preserves all critical information in a highly interoperable format. MicroJPEG makes this easy — just upload your NEF, and download a professional-grade TIFF in seconds. Explore more at microjpeg.com and pro tools at microjpeg.com/features.',

  whatIsTitle: 'What Is a NEF File?',
  whatIsContent:
    'NEF is Nikon’s RAW format, storing raw sensor output unchanged for maximum detail and editing flexibility. NEF files are large and require specialized support for direct use.',

  whyConvertTitle: 'Why Convert NEF to TIFF?',
  whyConvertReasons: [
    'TIFF preserves complete tonal range and color fidelity.',
    'Ideal for professional printing and layout.',
    'Better for archival storage of master images.',
    'Excellent compatibility with image editing workflows.',
    'Maintains metadata and full resolution detail.'
  ],

  howToTitle: 'How to Convert NEF to TIFF on MicroJPEG',
  howToSteps: [
    'Go to https://microjpeg.com/convert/nef-to-tiff.',
    'Drag and drop your NEF photo(s) into the upload area.',
    'MicroJPEG converts them into lossless TIFF images.',
    'Wait for conversion to finish.',
    'Download your TIFF files.',
    'See https://microjpeg.com/pricing and https://microjpeg.com/api-docs for premium limits and automation.'
  ],

  comparisonTitle: 'NEF vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Nikon RAW' },
    { label: 'Compression', value: 'Uncompressed' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Source photography' },
    { label: 'Compatibility', value: 'Limited RAW support' },
    { label: 'Editing Potential', value: 'Maximum' }
  ],
  targetInfo: [
    { label: 'Type', value: 'High fidelity image' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Large' },
    { label: 'Best for', value: 'Pro workflows and print' },
    { label: 'Compatibility', value: 'Excellent' },
    { label: 'Editing Potential', value: 'Very high' }
  ],

  features: [
    'Lossless TIFF output with full NEF information preserved.',
    'Fast and secure browser-based conversion.',
    'Great for print, publishing, and archival.',
    'Supports single and batch NEF processing.',
    'Temp files automatically deleted for privacy.',
    'API automation ready at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert NEF to TIFF on any device including:',
    'Windows desktops',
    'macOS devices',
    'Linux computers',
    'Android and iOS phones',
    'Any modern browser'
  ],

  relatedConversions: [
    { label: 'NEF to JPG', href: '/convert/nef-to-jpg' },
    { label: 'NEF to PNG', href: '/convert/nef-to-png' },
    { label: 'NEF to WEBP', href: '/convert/nef-to-webp' },
    { label: 'NEF to AVIF', href: '/convert/nef-to-avif' }
  ]
},


// =========================================================================
// 9. Convert NEF TO WEBP
// =========================================================================
'nef-webp': {
  metaTitle: 'Convert NEF to WebP Online – Nikon RAW to WebP Converter | MicroJPEG',
  metaDescription:
    'Convert NEF RAW photos into efficient WebP images with MicroJPEG. WebP output makes sharing and web use faster and smaller — free online NEF to WebP converter.',

  headline: 'Convert NEF to WebP Online',
  subheadline: 'Web-Friendly NEF Compression',
  heroDescription:
    'Turn Nikon NEF RAW files into optimized WebP images that load fast on websites and apps — using MicroJPEG’s browser-based converter.',
  intro:
    'WebP is an efficient, modern format that delivers smaller file sizes with strong visual quality. When you turn Nikon NEF RAW files into WebP, your images become lighter and more suitable for web galleries, blogs, and social platforms. MicroJPEG lets you do this instantly in your browser — no software install needed. Learn more at microjpeg.com/features and try other formats.',

  whatIsTitle: 'What Is a NEF File?',
  whatIsContent:
    'NEF (Nikon Electronic Format) stores RAW photo data directly from the camera sensor, capturing maximum detail and latitude for editing. However, its size and format make it less suitable for direct web use.',

  whyConvertTitle: 'Why Convert NEF to WebP?',
  whyConvertReasons: [
    'WebP significantly reduces file size compared to RAW.',
    'Faster display and load times on websites.',
    'Great format for sharing across social platforms.',
    'Balances quality and compression efficiently.',
    'Excellent browser support for modern web delivery.'
  ],

  howToTitle: 'How to Convert NEF to WebP on MicroJPEG',
  howToSteps: [
    'Navigate to https://microjpeg.com/convert/nef-to-webp.',
    'Upload your NEF photo by dragging it into the uploader.',
    'MicroJPEG converts it into optimized WebP format.',
    'Wait briefly while processing completes.',
    'Download your WebP image.',
    'For extended use cases, see https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'NEF vs WebP – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Nikon RAW' },
    { label: 'Compression', value: 'Uncompressed' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Source capture & editing' },
    { label: 'Web Use', value: 'Not suitable' },
    { label: 'Typical Workflow', value: 'Editing before delivery' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Web optimized image' },
    { label: 'Compression', value: 'Lossy & Lossless' },
    { label: 'File Size', value: 'Small' },
    { label: 'Best for', value: 'Web and social sharing' },
    { label: 'Web Use', value: 'Excellent' },
    { label: 'Typical Workflow', value: 'Final image delivery' }
  ],

  features: [
    'WebP output optimized for web and app use.',
    'Fast processing in the browser.',
    'No desktop software required.',
    'Temporary file handling with auto deletion.',
    'Useful for photo galleries and responsive design.',
    'API support available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'MicroJPEG runs on all modern devices:',
    'Windows',
    'macOS',
    'Linux',
    'Android',
    'iOS',
    'Chrome, Edge, Firefox, Safari and more'
  ],

  relatedConversions: [
    { label: 'NEF to JPG', href: '/convert/nef-to-jpg' },
    { label: 'NEF to PNG', href: '/convert/nef-to-png' },
    { label: 'NEF to TIFF', href: '/convert/nef-to-tiff' },
    { label: 'NEF to AVIF', href: '/convert/nef-to-avif' }
  ]
},

// =========================================================================
// 10. Convert NEF TO AVIF
// =========================================================================
'nef-avif': {
  metaTitle: 'Convert NEF to AVIF Online – Nikon RAW to AVIF Converter | MicroJPEG',
  metaDescription:
    'Convert NEF RAW files into AVIF images with MicroJPEG. Tiny files and premium quality — fast online NEF to AVIF converter that works in your browser.',

  headline: 'Convert NEF to AVIF Online',
  subheadline: 'Next-Gen Image Efficiency',
  heroDescription:
    'Turn your Nikon NEF RAW images into ultra-efficient AVIF files using MicroJPEG. Excellent compression and quality make AVIF a top choice for modern web use without losing detail.',
  intro:
    'AVIF leverages modern compression technology to deliver very small file sizes while maintaining visual quality. When you convert NEF RAW files to AVIF, you get images that are ideal for performance-focused websites, apps, and sharing. Simply upload your NEF files and download AVIF results instantly with MicroJPEG — no installations or plugins required.',

  whatIsTitle: 'What Is a NEF File?',
  whatIsContent:
    'NEF is Nikon’s RAW format capturing high data fidelity and sensor detail. While ideal for editing workflows, NEF is large and not suitable for web use directly without conversion.',

  whyConvertTitle: 'Why Convert NEF to AVIF?',
  whyConvertReasons: [
    'AVIF provides superior compression efficiency.',
    'Greatly reduces file sizes over traditional formats.',
    'Improves website load performance.',
    'Excellent for mobile and responsive experiences.',
    'Maintains high quality even at small sizes.'
  ],

  howToTitle: 'How to Convert NEF to AVIF on MicroJPEG',
  howToSteps: [
    'Go to https://microjpeg.com/convert/nef-to-avif.',
    'Drag and drop your NEF photo(s) into the upload area.',
    'MicroJPEG converts the RAW image to AVIF automatically.',
    'Wait a few seconds for processing.',
    'Download your new AVIF image.',
    'See https://microjpeg.com/pricing and https://microjpeg.com/api-docs for scaling and automation.'
  ],

  comparisonTitle: 'NEF vs AVIF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Nikon RAW' },
    { label: 'Compression', value: 'Uncompressed sensor data' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'RAW capture and editing' },
    { label: 'Web Ready', value: 'No' },
    { label: 'Typical Use', value: 'Master files' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Modern compressed image' },
    { label: 'Compression', value: 'Advanced AV1' },
    { label: 'File Size', value: 'Very Small' },
    { label: 'Best for', value: 'Web & performance use' },
    { label: 'Web Ready', value: 'Yes' },
    { label: 'Typical Use', value: 'Web and app delivery' }
  ],

  features: [
    'Advanced AVIF compression with excellent quality.',
    'Fast browser-based NEF conversion.',
    'Secure temporary file processing.',
    'Batch NEF support.',
    'Ideal for modern websites and apps.',
    'Developer API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'MicroJPEG supports NEF-to-AVIF on all devices:',
    'Windows',
    'macOS',
    'Linux',
    'Android',
    'iOS',
    'Modern browsers including Chrome, Edge, Firefox, Safari'
  ],

  relatedConversions: [
    { label: 'NEF to JPG', href: '/convert/nef-to-jpg' },
    { label: 'NEF to PNG', href: '/convert/nef-to-png' },
    { label: 'NEF to TIFF', href: '/convert/nef-to-tiff' },
    { label: 'NEF to WEBP', href: '/convert/nef-to-webp' }
  ]
},

  // =========================================================================
  // 11. ARW to JPG
  // =========================================================================
  'arw-jpg': {
    metaTitle: 'ARW to JPG Converter - Free Online Sony RAW to JPEG | MicroJPEG',
    metaDescription: 'Convert Sony ARW RAW files to JPG instantly. Free online converter supports A7 IV, A7R V, A6700, A6400. No Sony software needed.',
    
    headline: 'Convert ARW to JPG Online',
    subheadline: 'Free & Instant',
    heroDescription: 'Transform Sony Alpha RAW files into universally compatible JPG images without Sony software.',
    
    intro: 'MicroJPEG converts Sony ARW RAW files to high-quality JPG images instantly. Our converter supports all Sony Alpha cameras including A7 IV, A7R V, A7S III, A6700, A6600, A6400, and older Alpha models. No Sony Imaging Edge software required — upload your ARW files and download optimized JPGs in seconds.',
    
    whatIsTitle: 'What is an ARW File?',
    whatIsContent: 'ARW (Alpha Raw) is Sony\'s proprietary RAW image format used in Alpha mirrorless and DSLR cameras. ARW files contain uncompressed sensor data with up to 14-bit color depth, preserving maximum dynamic range and detail for professional post-processing. Like other RAW formats, ARW files are large and require specialized software to view, making conversion to JPG essential for sharing.',
    
    whyConvertTitle: 'Why Convert ARW to JPG?',
    whyConvertReasons: [
      'Share Sony photos without requiring recipients to install special software',
      'Dramatically reduce file sizes — 50MB ARW becomes 3-5MB JPG',
      'Upload to social media, websites, and cloud storage without restrictions',
      'View photos on any device — phones, tablets, computers',
      'Create web-optimized images while preserving original ARW for editing',
      'Email photos without exceeding attachment size limits'
    ],
    
    howToTitle: 'How to Convert ARW to JPG',
    howToSteps: [
      'Click upload or drag your Sony ARW files into the converter',
      'Wait for secure browser-based processing to complete',
      'Review the converted JPG previews',
      'Adjust quality if needed for your use case',
      'Download individual files or batch ZIP archive'
    ],
    
    comparisonTitle: 'ARW vs JPG: Format Comparison',
    sourceInfo: [
      { label: 'Format', value: 'ARW (Sony RAW)' },
      { label: 'Compression', value: 'Uncompressed' },
      { label: 'File Size', value: '25-80 MB' },
      { label: 'Color Depth', value: '12-14 bit' },
      { label: 'Compatibility', value: 'Sony/Adobe software' },
      { label: 'Best For', value: 'Professional editing' }
    ],
    targetInfo: [
      { label: 'Format', value: 'JPG (JPEG)' },
      { label: 'Compression', value: 'Lossy' },
      { label: 'File Size', value: '2-8 MB' },
      { label: 'Color Depth', value: '8-bit' },
      { label: 'Compatibility', value: 'Universal' },
      { label: 'Best For', value: 'Sharing, web, print' }
    ],
    
    features: [
      'Supports all Sony Alpha cameras — A1, A9, A7 series, A6000 series',
      'No Sony Imaging Edge required — convert directly in browser',
      'Batch processing — convert entire shoots efficiently',
      'EXIF metadata preserved — lens info, settings retained',
      'Quality control — adjustable compression settings',
      'Privacy-focused — local processing, no server uploads'
    ],
    
    deviceSupportText: 'Works on Windows, Mac, Linux, iOS, and Android. No Sony software or app installation needed.',
    
    sections: [
      {
        title: 'Sony Alpha Camera Support',
        body: 'Full support for ARW files from all Sony Alpha cameras: flagship models (A1, A9 III, A9 II), full-frame mirrorless (A7 IV, A7R V, A7S III, A7C II, A7C), APS-C mirrorless (A6700, A6600, A6400, A6100, A6000 series), and legacy Alpha DSLRs.'
      }
    ],
    
    relatedConversions: [
      { label: 'ARW to PNG', href: '/convert/arw-to-png' },
      { label: 'ARW to WebP', href: '/convert/arw-to-webp' },
      { label: 'ARW to AVIF', href: '/convert/arw-to-avif' },
      { label: 'ARW to TIFF', href: '/convert/arw-to-tiff' }
    ]
  },

  // =========================================================================
// 12. Convert ARW TO PNG
// =========================================================================
'arw-png': {
  metaTitle: 'Convert ARW to PNG Online – Sony RAW to PNG Converter | MicroJPEG',
  metaDescription:
    'Convert Sony ARW RAW photos to PNG easily with MicroJPEG. Fast, secure online ARW to PNG converter that preserves full detail and transparency.',

  headline: 'Convert ARW to PNG Online',
  subheadline: 'High-Quality Lossless PNG Output',
  heroDescription:
    'Transform Sony ARW RAW images into crisp, lossless PNG files instantly in your browser — no installation needed.',
  intro:
    'ARW is Sony’s RAW image format that holds every bit of data from the camera sensor. When you need a universally supported image format with transparency and lossless quality, PNG is an excellent choice. With MicroJPEG, converting ARW to PNG is fast, secure, and done right in your browser. Upload your RAW file and get a clean PNG in seconds. Discover more tools at microjpeg.com and advanced features at microjpeg.com/features.',

  whatIsTitle: 'What Is an ARW File?',
  whatIsContent:
    'ARW is the RAW photo format used by Sony cameras. It stores unprocessed sensor data including wide dynamic range and rich color, making it ideal for post-production, but large and not widely supported by standard image viewers.',

  whyConvertTitle: 'Why Convert ARW to PNG?',
  whyConvertReasons: [
    'PNG retains full detail with lossless quality.',
    'Supports transparency for design workflows.',
    'Compatible with most editing tools.',
    'More manageable file size than RAW.',
    'Perfect for graphics, presentation, and web usage.'
  ],

  howToTitle: 'How to Convert ARW to PNG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/arw-to-png.',
    'Drag and drop your ARW file into the upload area.',
    'MicroJPEG will automatically convert it to PNG.',
    'Wait a few moments for the conversion to complete.',
    'Download your PNG file.',
    'For automation and higher limits, visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'ARW vs PNG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Sony RAW image' },
    { label: 'Compression', value: 'Unprocessed sensor data' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Professional editing' },
    { label: 'Compatibility', value: 'Requires special software' },
    { label: 'Use Case', value: 'High fidelity source' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless raster' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Medium' },
    { label: 'Best for', value: 'Editing and graphics' },
    { label: 'Compatibility', value: 'Broad support' },
    { label: 'Transparency', value: 'Supported' }
  ],

  features: [
    'Preserves ARW detail in PNG output.',
    'Runs fully online – no desktop tools required.',
    'Secure processing with automatic file deletion.',
    'Supports multiple ARW uploads at once.',
    'Fast conversion optimized for RAW.',
    'API available for automated workflows at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert ARW to PNG from any modern device:',
    'Windows desktops',
    'macOS machines',
    'Linux systems',
    'Android phones and tablets',
    'iPhones and iPads',
    'Supported browsers such as Chrome, Safari, Firefox, Edge'
  ],

  relatedConversions: [
    { label: 'ARW to JPG', href: '/convert/arw-to-jpg' },
    { label: 'ARW to TIFF', href: '/convert/arw-to-tiff' },
    { label: 'ARW to WEBP', href: '/convert/arw-to-webp' },
    { label: 'ARW to AVIF', href: '/convert/arw-to-avif' }
  ]
},

// =========================================================================
// 13. Convert ARW TO TIFF
// =========================================================================
'arw-tiff': {
  metaTitle: 'Convert ARW to TIFF Online – Sony RAW to TIFF Converter | MicroJPEG',
  metaDescription:
    'Convert Sony ARW RAW files to high-quality TIFF images with MicroJPEG. Online ARW to TIFF converter with lossless results for printing and professional workflows.',

  headline: 'Convert ARW to TIFF Online',
  subheadline: 'Lossless Output for Print & Archiving',
  heroDescription:
    'Convert Sony ARW RAW images into TIFF files that retain every bit of camera detail — perfect for professional printing and archival storage.',
  intro:
    'TIFF is the choice for photographers and studios when quality is non-negotiable. Converting ARW RAW files to TIFF gives you lossless output that can be used in deep editing, print production, and long-term storage. MicroJPEG makes this process effortless — just upload your ARW files and download TIFF images in seconds. Check out more microjpeg.com and explore feature details at microjpeg.com/features.',

  whatIsTitle: 'What Is an ARW File?',
  whatIsContent:
    'ARW is Sony’s RAW format that stores uncompressed sensor data for maximum fidelity and editing flexibility. ARW files are excellent sources for professional imaging but large and not suited for everyday viewing or distribution.',

  whyConvertTitle: 'Why Convert ARW to TIFF?',
  whyConvertReasons: [
    'TIFF maintains full tonal range and detail.',
    'Ideal for printing and publishing workflows.',
    'Better suited for archival storage of masters.',
    'High compatibility with professional editors.',
    'Retains full metadata and color integrity.'
  ],

  howToTitle: 'How to Convert ARW to TIFF on MicroJPEG',
  howToSteps: [
    'Go to https://microjpeg.com/convert/arw-to-tiff.',
    'Upload your ARW files by dragging them into the uploader.',
    'MicroJPEG automatically converts them to TIFF.',
    'Wait briefly while the conversion finishes.',
    'Download your TIFF files.',
    'For higher limits and programmatic access, visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'ARW vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Sony RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Professional capture' },
    { label: 'Compatibility', value: 'Limited without special tools' },
    { label: 'Typical Use', value: 'Source photography' }
  ],
  targetInfo: [
    { label: 'Type', value: 'High-quality raster' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Large' },
    { label: 'Best for', value: 'Print and archive' },
    { label: 'Compatibility', value: 'Excellent' },
    { label: 'Typical Use', value: 'Master images' }
  ],

  features: [
    'Lossless TIFF output from ARW RAW.',
    'Secure browser-based conversion.',
    'Great for printing and professional workflows.',
    'Supports batch ARW processing.',
    'Auto cleanup of temporary files.',
    'Developer API at https://microjpeg.com/api-docs for automation.'
  ],

  deviceSupportText: [
    'Convert ARW to TIFF from any device:',
    'Windows computers',
    'macOS systems',
    'Linux environments',
    'Android and iOS phones',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'ARW to JPG', href: '/convert/arw-to-jpg' },
    { label: 'ARW to PNG', href: '/convert/arw-to-png' },
    { label: 'ARW to WEBP', href: '/convert/arw-to-webp' },
    { label: 'ARW to AVIF', href: '/convert/arw-to-avif' }
  ]
},


// =========================================================================
// 14. Convert ARW TO WEBP
// =========================================================================
'arw-webp': {
  metaTitle: 'Convert ARW to WebP Online – Sony RAW to WebP Converter | MicroJPEG',
  metaDescription:
    'Convert Sony ARW RAW photos to WebP online. Get web-optimized images easily with MicroJPEG’s fast ARW to WebP converter that works in your browser.',

  headline: 'Convert ARW to WebP Online',
  subheadline: 'Web-Ready RAW Conversion',
  heroDescription:
    'Transform your Sony ARW RAW images into compact, web-optimized WebP format with MicroJPEG — ideal for fast websites and online galleries.',
  intro:
    'WebP combines excellent compression with good visual quality. When you convert ARW RAW files to WebP, you make them perfect for web presentation, blogs, galleries, and quick sharing. MicroJPEG provides a fast online ARW to WebP converter you can use in any browser without installation. Learn more at microjpeg.com/features.',

  whatIsTitle: 'What Is an ARW File?',
  whatIsContent:
    'ARW is the RAW image format used by Sony cameras. It stores untouched sensor data for maximum editability, but these large files are not ideal for direct use on the web.',

  whyConvertTitle: 'Why Convert ARW to WebP?',
  whyConvertReasons: [
    'WebP significantly reduces file size from RAW.',
    'Faster load times on websites and blogs.',
    'Better suited for online sharing.',
    'Good balance of quality and compression.',
    'Supported by all modern browsers.'
  ],

  howToTitle: 'How to Convert ARW to WebP on MicroJPEG',
  howToSteps: [
    'Navigate to https://microjpeg.com/convert/arw-to-webp.',
    'Upload your ARW photo into the drag & drop area.',
    'MicroJPEG automatically converts it to WebP.',
    'Wait while the process completes.',
    'Download your WebP image.',
    'Explore https://microjpeg.com/pricing and https://microjpeg.com/api-docs for advanced use cases.'
  ],

  comparisonTitle: 'ARW vs WebP – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Sony RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Professional editing' },
    { label: 'Web Use', value: 'Too large for web' },
    { label: 'Typical Workflow', value: 'Editing first, delivery later' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Web image' },
    { label: 'Compression', value: 'Lossy & Lossless' },
    { label: 'File Size', value: 'Small' },
    { label: 'Best for', value: 'Web, blogs, social' },
    { label: 'Web Use', value: 'Excellent' },
    { label: 'Typical Workflow', value: 'Final delivery' }
  ],

  features: [
    'WebP compression optimized for online use.',
    'Fast, browser-based RAW to WebP conversion.',
    'No setup or installation needed.',
    'Secure temporary file handling.',
    'Batch ARW support.',
    'API integration at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert ARW to WebP on any popular platform:',
    'Windows',
    'macOS',
    'Linux',
    'Android',
    'iOS',
    'Chrome, Safari, Firefox, Edge'
  ],

  relatedConversions: [
    { label: 'ARW to JPG', href: '/convert/arw-to-jpg' },
    { label: 'ARW to PNG', href: '/convert/arw-to-png' },
    { label: 'ARW to TIFF', href: '/convert/arw-to-tiff' },
    { label: 'ARW to AVIF', href: '/convert/arw-to-avif' }
  ]
},

// =========================================================================
// 15. Convert ARW TO AVIF
// =========================================================================
'arw-avif': {
  metaTitle: 'Convert ARW to AVIF Online – Sony RAW to AVIF Converter | MicroJPEG',
  metaDescription:
    'Convert ARW RAW files to modern AVIF images with MicroJPEG. Get tiny files and great quality — perfect for web delivery. Quick and free ARW to AVIF converter online.',

  headline: 'Convert ARW to AVIF Online',
  subheadline: 'Modern, Efficient AVIF Output',
  heroDescription:
    'Turn Sony ARW RAW images into compact AVIF pictures with MicroJPEG — ready for fast websites and performance-focused applications.',
  intro:
    'AVIF is a next-generation format that delivers high quality with very small file sizes. When you convert ARW RAW files to AVIF, you get optimized images ideal for modern websites and mobile experiences. MicroJPEG provides an easy browser-based ARW to AVIF converter — just upload and download your optimized images. Find more tools at microjpeg.com/features.',

  whatIsTitle: 'What Is an ARW File?',
  whatIsContent:
    'ARW is Sony’s RAW image format capturing full sensor data for the highest level of editing flexibility. It produces large files that need conversion for efficient web or sharing workflows.',

  whyConvertTitle: 'Why Convert ARW to AVIF?',
  whyConvertReasons: [
    'AVIF provides superior compression efficiency.',
    'Significantly smaller files with great visual quality.',
    'Improves website performance.',
    'Excellent for mobile usage and responsive layouts.',
    'Maintains high detail even with high compression.'
  ],

  howToTitle: 'How to Convert ARW to AVIF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/arw-to-avif.',
    'Drag your ARW photos into the uploader.',
    'MicroJPEG automatically converts to AVIF.',
    'Wait while the conversion finishes.',
    'Download your AVIF images.',
    'See https://microjpeg.com/pricing and https://microjpeg.com/api-docs for automation.'
  ],

  comparisonTitle: 'ARW vs AVIF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Sony RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'RAW workflows' },
    { label: 'Web Friendly', value: 'No' },
    { label: 'Typical Use', value: 'Editing master files' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Modern compressed image' },
    { label: 'Compression', value: 'Advanced AV1' },
    { label: 'File Size', value: 'Very Small' },
    { label: 'Best for', value: 'Web and performance use' },
    { label: 'Web Friendly', value: 'Yes' },
    { label: 'Typical Use', value: 'Fast web delivery images' }
  ],

  features: [
    'Advanced AVIF compression from ARW RAW.',
    'Fast, browser-based workflow.',
    'Secure, temporary processing.',
    'Supports ARW batch conversion.',
    'Small file sizes with excellent quality.',
    'Developer API at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert ARW to AVIF on any platform:',
    'Windows',
    'macOS',
    'Linux',
    'Android',
    'iOS',
    'All modern browsers like Chrome, Firefox, Safari, Edge'
  ],

  relatedConversions: [
    { label: 'ARW to JPG', href: '/convert/arw-to-jpg' },
    { label: 'ARW to PNG', href: '/convert/arw-to-png' },
    { label: 'ARW to TIFF', href: '/convert/arw-to-tiff' },
    { label: 'ARW to WEBP', href: '/convert/arw-to-webp' }
  ]
},

// =========================================================================
// 16. Convert RAF TO JPG
// =========================================================================
'raf-jpg': {
  metaTitle: 'Convert RAF to JPG Online – Fujifilm RAW to JPG Converter | MicroJPEG',
  metaDescription:
    'Convert RAF RAW photos from Fujifilm to high-quality JPG online with MicroJPEG. Fast, secure RAF to JPG conversion in your browser.',

  headline: 'Convert RAF to JPG Online',
  subheadline: 'Quick, High-Quality JPEG Output',
  heroDescription:
    'Turn Fujifilm RAF RAW photos into universally compatible JPG images quickly and easily — no software required.',
  intro:
    'RAF is Fujifilm’s RAW format, capturing rich image data directly from the camera sensor. While excellent for editing, RAF files are too large and specialized for everyday use. MicroJPEG lets you convert RAF to JPG online instantly — just upload your RAF photos, and download high-quality JPGs ready for sharing and publishing. Discover more at microjpeg.com and explore features at microjpeg.com/features.',

  whatIsTitle: 'What Is a RAF File?',
  whatIsContent:
    'RAF is the RAW image format used by Fujifilm digital cameras. It stores all sensor information in an uncompressed form, which gives photographers maximum editing flexibility but results in large files that are not widely supported by standard viewers.',

  whyConvertTitle: 'Why Convert RAF to JPG?',
  whyConvertReasons: [
    'JPG is universally supported on all devices and platforms.',
    'Smaller file size for easy sharing and storage.',
    'Good image quality with efficient compression.',
    'Perfect for social sharing, portfolios, and web galleries.',
    'Faster loading and viewing on websites and apps.'
  ],

  howToTitle: 'How to Convert RAF to JPG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/raf-to-jpg.',
    'Drag and drop your RAF file into the upload area.',
    'MicroJPEG automatically converts it to JPG.',
    'Wait a moment while the conversion finishes.',
    'Download your JPG image.',
    'For higher limits and API access, visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'RAF vs JPG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Fujifilm RAW format' },
    { label: 'Compression', value: 'None (RAW sensor data)' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Editing and professional workflows' },
    { label: 'Compatibility', value: 'Raw photo software required' },
    { label: 'Typical Use', value: 'Image capture & edit' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Standard image format' },
    { label: 'Compression', value: 'Lossy JPG compression' },
    { label: 'File Size', value: 'Small to medium' },
    { label: 'Best for', value: 'Web and everyday use' },
    { label: 'Compatibility', value: 'Wide across devices' },
    { label: 'Typical Use', value: 'Publishing and sharing' }
  ],

  features: [
    'Fast RAF to JPG conversion in the browser.',
    'No software installation required.',
    'Automatic deletion of temporary files for privacy.',
    'Supports both single files and batches.',
    'Optimized for performance and quality.',
    'API available for automation at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'MicroJPEG works across devices and platforms including:',
    'Windows desktops and laptops',
    'macOS systems',
    'Linux computers',
    'iPhones and iPads',
    'Android phones and tablets',
    'Chrome, Firefox, Edge, Safari and more'
  ],

  relatedConversions: [
    { label: 'RAF to PNG', href: '/convert/raf-to-png' },
    { label: 'RAF to TIFF', href: '/convert/raf-to-tiff' },
    { label: 'RAF to WebP', href: '/convert/raf-to-webp' },
    { label: 'RAF to AVIF', href: '/convert/raf-to-avif' }
  ]
},

// =========================================================================
// 17. Convert RAF TO PNG
// =========================================================================
'raf-png': {
  metaTitle: 'Convert RAF to PNG Online – Fujifilm RAW to PNG Converter | MicroJPEG',
  metaDescription:
    'Convert RAF RAW photos to lossless PNG images with MicroJPEG. Get high-quality PNG output from Fujifilm RAW files in seconds — online and free.',

  headline: 'Convert RAF to PNG Online',
  subheadline: 'Lossless PNG Output from RAW',
  heroDescription:
    'Convert Fujifilm RAF RAW photos to lossless PNG images quickly in your browser — no installation or signup needed.',
  intro:
    'RAF RAW files contain unprocessed data from Fujifilm cameras. When you need a lossless, editable format that supports transparency, PNG is ideal. MicroJPEG lets you convert RAF to PNG online in just a few clicks. Upload your files and get crisp, high-quality PNG images ready for editing or design workflows. Explore more tools at microjpeg.com and premium features at microjpeg.com/features.',

  whatIsTitle: 'What Is a RAF File?',
  whatIsContent:
    'RAF is the proprietary RAW format for Fujifilm cameras. It captures detailed image data that photographers can use for deep editing, but the size and complexity of RAF make it unsuitable for everyday use without conversion.',

  whyConvertTitle: 'Why Convert RAF to PNG?',
  whyConvertReasons: [
    'PNG keeps lossless image quality.',
    'Full support for transparency.',
    'Clean format for editing workflows.',
    'Easily shareable without losing detail.',
    'Compatible with most graphics tools.'
  ],

  howToTitle: 'How to Convert RAF to PNG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/raf-to-png.',
    'Drag and drop your RAF file into the upload area.',
    'MicroJPEG will convert it automatically to PNG.',
    'Wait while the conversion completes.',
    'Download your PNG file.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for advanced options.'
  ],

  comparisonTitle: 'RAF vs PNG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Fujifilm RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Professional editing' },
    { label: 'Compatibility', value: 'RAW software' },
    { label: 'Typical Use', value: 'Detailed capture' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless PNG' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Medium' },
    { label: 'Best for', value: 'Editing and graphics' },
    { label: 'Compatibility', value: 'Wide support' },
    { label: 'Transparency', value: 'Yes' }
  ],

  features: [
    'Lossless PNG results from RAF source.',
    'Fast browser conversion.',
    'Secure and private processing.',
    'Batch-supported workflow.',
    'No install or plugin required.',
    'API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert RAF to PNG on any device:',
    'Windows computers',
    'macOS systems',
    'Linux desktops',
    'Android phones and tablets',
    'iPhones and iPads',
    'All major browsers'
  ],

  relatedConversions: [
    { label: 'RAF to JPG', href: '/convert/raf-to-jpg' },
    { label: 'RAF to TIFF', href: '/convert/raf-to-tiff' },
    { label: 'RAF to WebP', href: '/convert/raf-to-webp' },
    { label: 'RAF to AVIF', href: '/convert/raf-to-avif' }
  ]
},

// =========================================================================
// 18. Convert RAF TO PNG
// =========================================================================
'raf-png': {
  metaTitle: 'Convert RAF to PNG Online – Fujifilm RAW to PNG Converter | MicroJPEG',
  metaDescription:
    'Convert RAF RAW photos to lossless PNG images with MicroJPEG. Get high-quality PNG output from Fujifilm RAW files in seconds — online and free.',

  headline: 'Convert RAF to PNG Online',
  subheadline: 'Lossless PNG Output from RAW',
  heroDescription:
    'Convert Fujifilm RAF RAW photos to lossless PNG images quickly in your browser — no installation or signup needed.',
  intro:
    'RAF RAW files contain unprocessed data from Fujifilm cameras. When you need a lossless, editable format that supports transparency, PNG is ideal. MicroJPEG lets you convert RAF to PNG online in just a few clicks. Upload your files and get crisp, high-quality PNG images ready for editing or design workflows. Explore more tools at microjpeg.com and premium features at microjpeg.com/features.',

  whatIsTitle: 'What Is a RAF File?',
  whatIsContent:
    'RAF is the proprietary RAW format for Fujifilm cameras. It captures detailed image data that photographers can use for deep editing, but the size and complexity of RAF make it unsuitable for everyday use without conversion.',

  whyConvertTitle: 'Why Convert RAF to PNG?',
  whyConvertReasons: [
    'PNG keeps lossless image quality.',
    'Full support for transparency.',
    'Clean format for editing workflows.',
    'Easily shareable without losing detail.',
    'Compatible with most graphics tools.'
  ],

  howToTitle: 'How to Convert RAF to PNG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/raf-to-png.',
    'Drag and drop your RAF file into the upload area.',
    'MicroJPEG will convert it automatically to PNG.',
    'Wait while the conversion completes.',
    'Download your PNG file.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for advanced options.'
  ],

  comparisonTitle: 'RAF vs PNG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Fujifilm RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Professional editing' },
    { label: 'Compatibility', value: 'RAW software' },
    { label: 'Typical Use', value: 'Detailed capture' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless PNG' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Medium' },
    { label: 'Best for', value: 'Editing and graphics' },
    { label: 'Compatibility', value: 'Wide support' },
    { label: 'Transparency', value: 'Yes' }
  ],

  features: [
    'Lossless PNG results from RAF source.',
    'Fast browser conversion.',
    'Secure and private processing.',
    'Batch-supported workflow.',
    'No install or plugin required.',
    'API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert RAF to PNG on any device:',
    'Windows computers',
    'macOS systems',
    'Linux desktops',
    'Android phones and tablets',
    'iPhones and iPads',
    'All major browsers'
  ],

  relatedConversions: [
    { label: 'RAF to JPG', href: '/convert/raf-to-jpg' },
    { label: 'RAF to TIFF', href: '/convert/raf-to-tiff' },
    { label: 'RAF to WebP', href: '/convert/raf-to-webp' },
    { label: 'RAF to AVIF', href: '/convert/raf-to-avif' }
  ]
},

// =========================================================================
// 19. Convert RAF TO TIFF
// =========================================================================
'raf-tiff': {
  metaTitle: 'Convert RAF to TIFF Online – Fujifilm RAW to TIFF Converter | MicroJPEG',
  metaDescription:
    'Convert Fujifilm RAF RAW images to professional TIFF files online with MicroJPEG. Get lossless, print-ready TIFF output fast and securely.',

  headline: 'Convert RAF to TIFF Online',
  subheadline: 'Lossless TIFF for Print & Archive',
  heroDescription:
    'Get high-fidelity TIFF images from Fujifilm RAF RAW files — perfect for printing, archiving, and professional editing workflows, all in your browser.',
  intro:
    'TIFF is the go-to format for publishing, printing, and archiving — when quality matters. MicroJPEG lets you convert RAF RAW files to TIFF quickly and easily in your browser. Upload, wait, and download lossless TIFF files ready for pro use. Learn more at microjpeg.com and see additional tools at microjpeg.com/features.',

  whatIsTitle: 'What Is a RAF File?',
  whatIsContent:
    'RAF is the RAW format used by Fujifilm cameras to store unprocessed sensor data. It retains maximum detail and flexibility for editing but needs conversion for general use.',

  whyConvertTitle: 'Why Convert RAF to TIFF?',
  whyConvertReasons: [
    'TIFF preserves full image detail and color fidelity.',
    'Perfect for professional print workflows.',
    'Great for digital archiving of masters.',
    'Excellent compatibility with editing tools.',
    'Retains metadata and resolution.'
  ],

  howToTitle: 'How to Convert RAF to TIFF on MicroJPEG',
  howToSteps: [
    'Go to https://microjpeg.com/convert/raf-to-tiff.',
    'Upload your RAF files into the drag & drop area.',
    'The tool converts your RAF files to TIFF automatically.',
    'Wait for conversion to complete.',
    'Download your TIFF files.',
    'Visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs for more options.'
  ],

  comparisonTitle: 'RAF vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Fujifilm RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Editing and pro capture' },
    { label: 'Compatibility', value: 'Limited without special tools' },
    { label: 'Typical Use', value: 'High-detail source' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless TIFF' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Large' },
    { label: 'Best for', value: 'Print workflows' },
    { label: 'Compatibility', value: 'Excellent' },
    { label: 'Typical Use', value: 'Publishing and archival' }
  ],

  features: [
    'High-quality TIFF from RAF.',
    'Browser-based conversion — no desktop software.',
    'Secure and fast processing.',
    'Batch RAF support.',
    'Auto-cleanup of temporary files.',
    'Developer API at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert RAF to TIFF from any device:',
    'Windows PCs',
    'macOS systems',
    'Linux devices',
    'Android and iOS phones',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'RAF to JPG', href: '/convert/raf-to-jpg' },
    { label: 'RAF to PNG', href: '/convert/raf-to-png' },
    { label: 'RAF to WebP', href: '/convert/raf-to-webp' },
    { label: 'RAF to AVIF', href: '/convert/raf-to-avif' }
  ]
},

// =========================================================================
// 20. Convert RAF TO AVIF
// =========================================================================
'raf-avif': {
  metaTitle: 'Convert RAF to AVIF Online – Fujifilm RAW to AVIF Converter | MicroJPEG',
  metaDescription:
    'Convert Fujifilm RAF RAW images to efficient AVIF format using MicroJPEG. Tiny files and great quality — free and online RAF to AVIF converter.',

  headline: 'Convert RAF to AVIF Online',
  subheadline: 'Next-Gen Compression from RAW',
  heroDescription:
    'Turn large Fujifilm RAF RAW images into ultra-efficient AVIF files with MicroJPEG — perfect for modern web use.',  
  intro:
    'AVIF is a modern image format with superior compression and excellent quality, making it ideal for web performance and mobile delivery. Converting Fujifilm RAF RAW files to AVIF produces images that load faster and consume less bandwidth, while keeping visual detail. MicroJPEG provides this conversion quick and browser-based — no installations. Explore more features at microjpeg.com/features.',

  whatIsTitle: 'What Is a RAF File?',
  whatIsContent:
    'RAF is RAW image data captured by Fujifilm cameras. It stores every bit of sensor detail, ideal for deep editing but too large for sharing or web use as-is.',

  whyConvertTitle: 'Why Convert RAF to AVIF?',
  whyConvertReasons: [
    'AVIF produces much smaller files than traditional formats.',
    'Excellent visual quality even at tight compression.',
    'Boosts website performance with faster load times.',
    'Great for responsive experiences on mobile.',
    'Maintains detail while reducing size drastically.'
  ],

  howToTitle: 'How to Convert RAF to AVIF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/raf-to-avif.',
    'Drop your RAF images into the upload area.',
    'MicroJPEG automatically converts RAF to AVIF.',
    'Wait while processing completes.',
    'Download your AVIF images.',
    'For more limits and API options see https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'RAF vs AVIF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Fujifilm RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Professional editing' },
    { label: 'Web Use', value: 'Not suitable as-is' },
    { label: 'Typical Workflow', value: 'Capture & edit' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Modern web image' },
    { label: 'Compression', value: 'Advanced AV1' },
    { label: 'File Size', value: 'Very Small' },
    { label: 'Best for', value: 'Web & performance' },
    { label: 'Web Use', value: 'Excellent' },
    { label: 'Typical Workflow', value: 'Final image delivery' }
  ],

  features: [
    'State-of-the-art AVIF compression from RAF RAW files.',
    'Fast browser conversion.',
    'Private and secure temp file handling.',
    'Supports batch conversions.',
    'Files auto-delete after processing.',
    'API access at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert RAF to AVIF on all major devices:',
    'Windows PCs',
    'macOS systems',
    'Linux devices',
    'Android smartphones',
    'iPhones and iPads',
    'Chrome, Firefox, Edge, Safari and others'
  ],

  relatedConversions: [
    { label: 'RAF to JPG', href: '/convert/raf-to-jpg' },
    { label: 'RAF to PNG', href: '/convert/raf-to-png' },
    { label: 'RAF to TIFF', href: '/convert/raf-to-tiff' },
    { label: 'RAF to WEBP', href: '/convert/raf-to-webp' }
  ]
},


// =========================================================================
// 21. Convert ORF TO JPG
// =========================================================================
'orf-jpg': {
  metaTitle: 'Convert ORF to JPG Online – Olympus RAW to JPG Converter | MicroJPEG',
  metaDescription:
    'Convert ORF RAW photos from Olympus to high-quality JPG online with MicroJPEG. Fast, browser-based ORF to JPG converter — no software required.',

  headline: 'Convert ORF to JPG Online',
  subheadline: 'Fast, Universal JPG Output',
  heroDescription:
    'Transform your Olympus ORF RAW images into universally compatible JPG photos in seconds — no installations needed.',
  intro:
    'ORF is the RAW image format used by Olympus cameras to capture detailed sensor data. While ideal for editing and post-production, ORF files are too large and not widely supported for everyday use. With MicroJPEG, converting ORF to JPG is simple: upload your image, and download a ready-to-use JPG instantly. Discover more tools at microjpeg.com and advanced capabilities at microjpeg.com/features.',

  whatIsTitle: 'What Is an ORF File?',
  whatIsContent:
    'ORF (Olympus RAW Format) is the proprietary RAW photo format used by Olympus digital cameras. It stores unprocessed sensor information with maximum detail for editing flexibility, resulting in large and specialized file sizes that require conversion for general use.',

  whyConvertTitle: 'Why Convert ORF to JPG?',
  whyConvertReasons: [
    'JPG is compatible with all devices, apps, and platforms.',
    'Smaller file size makes sharing easy.',
    'Good balance of compression and visible quality.',
    'Ideal for web, email, and social platforms.',
    'Faster loading and viewing on websites and apps.'
  ],

  howToTitle: 'How to Convert ORF to JPG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/orf-to-jpg.',
    'Drag and drop your ORF image into the upload area (or select manually).',
    'MicroJPEG automatically converts it to JPG.',
    'Wait while processing completes.',
    'Download your JPG photo.',
    'For higher limits or automation, see https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'ORF vs JPG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Olympus RAW image' },
    { label: 'Compression', value: 'None (RAW sensor data)' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Editing and pro workflows' },
    { label: 'Compatibility', value: 'Requires special software' },
    { label: 'Use Case', value: 'High fidelity capture' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Standard image format' },
    { label: 'Compression', value: 'Lossy JPG compression' },
    { label: 'File Size', value: 'Small to medium' },
    { label: 'Best for', value: 'Sharing and web use' },
    { label: 'Compatibility', value: 'Broad support' },
    { label: 'Use Case', value: 'Publishing and sharing' }
  ],

  features: [
    'Quick and reliable ORF to JPG conversion.',
    'Runs in your browser — no downloads needed.',
    'Automatic cleanup of uploaded files for privacy.',
    'Supports both single and batch conversion.',
    'Optimized for speed and quality.',
    'API access available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'MicroJPEG works on all major devices including:',
    'Windows PCs',
    'macOS laptops and desktops',
    'Linux systems',
    'Android devices',
    'iPhones and iPads',
    'Chrome, Firefox, Edge, Safari and more'
  ],

  relatedConversions: [
    { label: 'ORF to PNG', href: '/convert/orf-to-png' },
    { label: 'ORF to TIFF', href: '/convert/orf-to-tiff' },
    { label: 'ORF to WebP', href: '/convert/orf-to-webp' },
    { label: 'ORF to AVIF', href: '/convert/orf-to-avif' }
  ]
},

// =========================================================================
// 22. Convert ORF TO PNG
// =========================================================================
'orf-png': {
  metaTitle: 'Convert ORF to PNG Online – Olympus RAW to PNG Converter | MicroJPEG',
  metaDescription:
    'Convert ORF RAW photos to lossless PNG images using MicroJPEG. High-quality PNG output from Olympus RAW — fast, secure, and free.',

  headline: 'Convert ORF to PNG Online',
  subheadline: 'Lossless PNG Output',
  heroDescription:
    'Convert Olympus ORF RAW photos to lossless PNG images easily in your browser, preserving every detail without compression loss.',
  intro:
    'ORF RAW files contain rich, uncompressed data from Olympus camera sensors — perfect for editing, but not ideal for general use. For transparent, high-quality images suitable for design or editing workflows, converting ORF to PNG is the solution. With MicroJPEG, you can complete that conversion quickly and securely online. Explore more at microjpeg.com and enhanced tools at microjpeg.com/features.',

  whatIsTitle: 'What Is an ORF File?',
  whatIsContent:
    'ORF is Olympus’s RAW image format that retains full sensor data for deep editing. It stores high fidelity visuals but requires specialized support and is typically large in size.',

  whyConvertTitle: 'Why Convert ORF to PNG?',
  whyConvertReasons: [
    'PNG preserves details with lossless compression.',
    'Supports transparency for editing and design.',
    'Compatible with most graphic tools.',
    'Smaller than RAW while keeping quality.',
    'Great for design workflows and publishing.'
  ],

  howToTitle: 'How to Convert ORF to PNG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/orf-to-png.',
    'Drop your ORF files into the upload zone.',
    'MicroJPEG automatically converts to PNG.',
    'Wait while conversion proceeds.',
    'Download your PNG file.',
    'See https://microjpeg.com/pricing and https://microjpeg.com/api-docs for more options.'
  ],

  comparisonTitle: 'ORF vs PNG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Olympus RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Editing and pro capture' },
    { label: 'Compatibility', value: 'Raw readers required' },
    { label: 'Typical Use', value: 'Source editing' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless PNG' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Medium' },
    { label: 'Best for', value: 'Editing & design' },
    { label: 'Compatibility', value: 'Broad support' },
    { label: 'Transparency', value: 'Yes' }
  ],

  features: [
    'Lossless PNG output from ORF RAW.',
    'Quick, browser-based conversion.',
    'Secure file handling and auto cleanup.',
    'Batch ORF file support.',
    'Easy to use with minimal steps.',
    'Automation ready with https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert ORF to PNG on:',
    'Windows machines',
    'macOS systems',
    'Linux computers',
    'Android tablets and phones',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'ORF to JPG', href: '/convert/orf-to-jpg' },
    { label: 'ORF to TIFF', href: '/convert/orf-to-tiff' },
    { label: 'ORF to WebP', href: '/convert/orf-to-webp' },
    { label: 'ORF to AVIF', href: '/convert/orf-to-avif' }
  ]
},

// =========================================================================
// 23. Convert ORF TO TIFF
// =========================================================================
'orf-tiff': {
  metaTitle: 'Convert ORF to TIFF Online – Olympus RAW to TIFF Converter | MicroJPEG',
  metaDescription:
    'Convert Olympus ORF RAW files to TIFF with MicroJPEG. Get lossless, print-quality TIFF images from Olympus RAW — online and secure.',

  headline: 'Convert ORF to TIFF Online',
  subheadline: 'Lossless, Print-Ready TIFF Output',
  heroDescription:
    'Turn ORF RAW photos into high-fidelity TIFF images perfect for printing, archiving, and advanced editing using MicroJPEG.',
  intro:
    'TIFF is a trusted format for printing and archival, holding rich detail and color data. Converting ORF RAW files to TIFF ensures you retain maximum fidelity and compatibility with professional workflows. MicroJPEG makes this conversion easy — just upload your files and download TIFF images instantly. Check out microjpeg.com for more tools and microjpeg.com/features for advanced capabilities.',

  whatIsTitle: 'What Is an ORF File?',
  whatIsContent:
    'ORF is the RAW image format native to Olympus cameras that captures every detail straight from the sensor, enabling deep editing, but resulting in large, unoptimized files.',

  whyConvertTitle: 'Why Convert ORF to TIFF?',
  whyConvertReasons: [
    'TIFF preserves full tonal range and color fidelity.',
    'Ideal for print workflows and archiving.',
    'Great compatibility in editing software.',
    'Useful for professional graphics and publishing.',
    'Retains metadata and original detail.'
  ],

  howToTitle: 'How to Convert ORF to TIFF on MicroJPEG',
  howToSteps: [
    'Go to https://microjpeg.com/convert/orf-to-tiff.',
    'Drag and drop your ORF photos into the uploader.',
    'MicroJPEG automatically converts to TIFF.',
    'Wait while conversion completes.',
    'Download your TIFF images.',
    'For advanced options, visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'ORF vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Olympus RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Source capture & editing' },
    { label: 'Compatibility', value: 'RAW software required' },
    { label: 'Typical Use', value: 'Master images' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless TIFF' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Large' },
    { label: 'Best for', value: 'Print & archive' },
    { label: 'Compatibility', value: 'Broad support' },
    { label: 'Typical Use', value: 'Publishing workflows' }
  ],

  features: [
    'Lossless TIFF output from ORF RAW.',
    'Secure, fast browser conversion.',
    'Great for printing and archival.',
    'Supports batch ORF processing.',
    'Auto cleanup of temporary files.',
    'Developer API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert ORF to TIFF on any device including:',
    'Windows PCs',
    'macOS machines',
    'Linux computers',
    'Android devices',
    'iPhones and iPads',
    'All major browsers'
  ],

  relatedConversions: [
    { label: 'ORF to JPG', href: '/convert/orf-to-jpg' },
    { label: 'ORF to PNG', href: '/convert/orf-to-png' },
    { label: 'ORF to WebP', href: '/convert/orf-to-webp' },
    { label: 'ORF to AVIF', href: '/convert/orf-to-avif' }
  ]
},

// =========================================================================
// 24. Convert ORF TO WEBP
// =========================================================================
'orf-webp': {
  metaTitle: 'Convert ORF to WebP Online – Olympus RAW to WebP Converter | MicroJPEG',
  metaDescription:
    'Convert ORF RAW files to WebP online with MicroJPEG. Get compressed web-ready images fast and easy in your browser.',

  headline: 'Convert ORF to WebP Online',
  subheadline: 'Web-Ready Compression from RAW',
  heroDescription:
    'Turn your Olympus ORF RAW photos into optimized WebP images suitable for websites, blogs, and mobile apps — with MicroJPEG’s online converter.',
  intro:
    'WebP is a modern image format combining efficient compression with great visual quality — perfect for websites and apps. Converting large ORF RAW files to WebP makes them suitable for web delivery and sharing without sacrificing too much detail. MicroJPEG lets you do this directly in the browser — no software needed.',

  whatIsTitle: 'What Is an ORF File?',
  whatIsContent:
    'ORF is the RAW image format used by Olympus cameras to capture high-resolution sensor data that requires deep editing workflows, but is not ideal for web use without conversion.',

  whyConvertTitle: 'Why Convert ORF to WebP?',
  whyConvertReasons: [
    'WebP significantly reduces file size from RAW.',
    'Faster load times on websites and apps.',
    'Excellent format for sharing and online galleries.',
    'Balances quality with compressed file size.',
    'Supported by all modern browsers.'
  ],

  howToTitle: 'How to Convert ORF to WebP on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/orf-to-webp.',
    'Upload your ORF photos by dragging into the upload zone.',
    'MicroJPEG converts to WebP automatically.',
    'Wait a moment while processing completes.',
    'Download your WebP images.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for higher limits.'
  ],

  comparisonTitle: 'ORF vs WebP – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Olympus RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Editing workflows' },
    { label: 'Web Use', value: 'Not suitable as-is' },
    { label: 'Typical Workflow', value: 'Post process then deliver' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Web optimized image' },
    { label: 'File Size', value: 'Small' },
    { label: 'Compression', value: 'Lossy & Lossless' },
    { label: 'Best for', value: 'Web & mobile' },
    { label: 'Web Use', value: 'Excellent' },
    { label: 'Typical Workflow', value: 'Final delivery' }
  ],

  features: [
    'WebP output optimized for web use.',
    'Fast, browser-based ORF to WebP conversion.',
    'Secure processing with automatic cleanup.',
    'Batch ORF support available.',
    'No installation required.',
    'API accessible at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert ORF to WebP on all modern devices:',
    'Windows machines',
    'macOS systems',
    'Linux desktops',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'ORF to JPG', href: '/convert/orf-to-jpg' },
    { label: 'ORF to PNG', href: '/convert/orf-to-png' },
    { label: 'ORF to TIFF', href: '/convert/orf-to-tiff' },
    { label: 'ORF to AVIF', href: '/convert/orf-to-avif' }
  ]
},

// =========================================================================
// 25. Convert ORF TO WEBP
// =========================================================================
'orf-webp': {
  metaTitle: 'Convert ORF to WebP Online – Olympus RAW to WebP Converter | MicroJPEG',
  metaDescription:
    'Convert ORF RAW files to WebP online with MicroJPEG. Get compressed web-ready images fast and easy in your browser.',

  headline: 'Convert ORF to WebP Online',
  subheadline: 'Web-Ready Compression from RAW',
  heroDescription:
    'Turn your Olympus ORF RAW photos into optimized WebP images suitable for websites, blogs, and mobile apps — with MicroJPEG’s online converter.',
  intro:
    'WebP is a modern image format combining efficient compression with great visual quality — perfect for websites and apps. Converting large ORF RAW files to WebP makes them suitable for web delivery and sharing without sacrificing too much detail. MicroJPEG lets you do this directly in the browser — no software needed.',

  whatIsTitle: 'What Is an ORF File?',
  whatIsContent:
    'ORF is the RAW image format used by Olympus cameras to capture high-resolution sensor data that requires deep editing workflows, but is not ideal for web use without conversion.',

  whyConvertTitle: 'Why Convert ORF to WebP?',
  whyConvertReasons: [
    'WebP significantly reduces file size from RAW.',
    'Faster load times on websites and apps.',
    'Excellent format for sharing and online galleries.',
    'Balances quality with compressed file size.',
    'Supported by all modern browsers.'
  ],

  howToTitle: 'How to Convert ORF to WebP on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/orf-to-webp.',
    'Upload your ORF photos by dragging into the upload zone.',
    'MicroJPEG converts to WebP automatically.',
    'Wait a moment while processing completes.',
    'Download your WebP images.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for higher limits.'
  ],

  comparisonTitle: 'ORF vs WebP – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Olympus RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Editing workflows' },
    { label: 'Web Use', value: 'Not suitable as-is' },
    { label: 'Typical Workflow', value: 'Post process then deliver' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Web optimized image' },
    { label: 'File Size', value: 'Small' },
    { label: 'Compression', value: 'Lossy & Lossless' },
    { label: 'Best for', value: 'Web & mobile' },
    { label: 'Web Use', value: 'Excellent' },
    { label: 'Typical Workflow', value: 'Final delivery' }
  ],

  features: [
    'WebP output optimized for web use.',
    'Fast, browser-based ORF to WebP conversion.',
    'Secure processing with automatic cleanup.',
    'Batch ORF support available.',
    'No installation required.',
    'API accessible at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert ORF to WebP on all modern devices:',
    'Windows machines',
    'macOS systems',
    'Linux desktops',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'ORF to JPG', href: '/convert/orf-to-jpg' },
    { label: 'ORF to PNG', href: '/convert/orf-to-png' },
    { label: 'ORF to TIFF', href: '/convert/orf-to-tiff' },
    { label: 'ORF to AVIF', href: '/convert/orf-to-avif' }
  ]
},

// =========================================================================
// 26. Convert DNG TO JPG
// =========================================================================
'dng-jpg': {
  metaTitle: 'Convert DNG to JPG Online – DNG RAW to JPG Converter | MicroJPEG',
  metaDescription:
    'Convert DNG RAW photos to JPG quickly with MicroJPEG. Fast, browser-based DNG to JPG converter with high quality — no software needed.',

  headline: 'Convert DNG to JPG Online',
  subheadline: 'Fast High-Quality JPG Output',
  heroDescription:
    'Turn your DNG RAW photos into universally compatible JPG images instantly in your browser, without installing anything.',
  intro:
    'DNG (Digital Negative) is a RAW photo format widely used across cameras and editing tools. While DNG holds vast image data for professional workflows, it isn’t ideal for everyday sharing. With MicroJPEG you can convert DNG to JPG online quickly and easily — just upload your file and download a polished JPG image. Learn more at microjpeg.com and explore tools at microjpeg.com/features.',

  whatIsTitle: 'What Is a DNG File?',
  whatIsContent:
    'DNG is an open RAW image format created to standardize RAW storage across cameras. It contains unprocessed data straight from the camera sensor and is favored by photographers for flexibility, but it is typically large and not directly supported by everyday apps.',

  whyConvertTitle: 'Why Convert DNG to JPG?',
  whyConvertReasons: [
    'JPG is compatible with all devices and platforms.',
    'Smaller file sizes make sharing easy.',
    'Good balance of compression and quality.',
    'Perfect for galleries, websites, and social media.',
    'No additional software needed to view.'
  ],

  howToTitle: 'How to Convert DNG to JPG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/dng-to-jpg.',
    'Drag and drop your DNG file into the upload area.',
    'MicroJPEG automatically converts it to JPG.',
    'Wait until processing completes.',
    'Download your JPG photo.',
    'For higher limits or API access, see https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'DNG vs JPG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'RAW image' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Editing and professional workflows' },
    { label: 'Compatibility', value: 'Requires RAW support' },
    { label: 'Typical Use', value: 'Capture & edit' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Raster image' },
    { label: 'Compression', value: 'Lossy JPG' },
    { label: 'File Size', value: 'Small–Medium' },
    { label: 'Best for', value: 'Everyday use and sharing' },
    { label: 'Compatibility', value: 'Broad device support' },
    { label: 'Typical Use', value: 'Web & mobile viewing' }
  ],

  features: [
    'Fast DNG to JPG conversion in the browser.',
    'No desktop software required.',
    'Secure temporary file handling with auto deletion.',
    'Batch file support.',
    'Optimized for speed and quality.',
    'API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert DNG to JPG on any device:',
    'Windows PCs',
    'macOS systems',
    'Linux desktops',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'DNG to PNG', href: '/convert/dng-to-png' },
    { label: 'DNG to TIFF', href: '/convert/dng-to-tiff' },
    { label: 'DNG to WebP', href: '/convert/dng-to-webp' },
    { label: 'DNG to AVIF', href: '/convert/dng-to-avif' }
  ]
},

// =========================================================================
// 27. Convert DNG TO PNG
// =========================================================================
'dng-png': {
  metaTitle: 'Convert DNG to PNG Online – Lossless DNG to PNG Converter | MicroJPEG',
  metaDescription:
    'Convert DNG RAW photos to lossless PNG images using MicroJPEG. Quick browser-based DNG to PNG converter for transparent output and high detail.',

  headline: 'Convert DNG to PNG Online',
  subheadline: 'Lossless PNG Output',
  heroDescription:
    'Convert your DNG RAW photos to high-quality PNG images instantly, keeping full detail and transparency where present.',
  intro:
    'DNG files contain rich sensor data and dynamic range. For editing and graphic workflows where you need lossless output, PNG is a great choice. With MicroJPEG you can convert DNG to PNG online in a few clicks — no installation required. Explore more tools at microjpeg.com and pro features at microjpeg.com/features.',

  whatIsTitle: 'What Is a DNG File?',
  whatIsContent:
    'DNG is a RAW image format that stores unprocessed data from camera sensors in a standardized way, allowing photographers easy access to image data in editing software.',

  whyConvertTitle: 'Why Convert DNG to PNG?',
  whyConvertReasons: [
    'PNG keeps all image detail with lossless quality.',
    'Supports transparency when needed.',
    'Ideal for editing workflows and graphics.',
    'Smaller than RAW while retaining quality.',
    'Broad compatibility across design tools.'
  ],

  howToTitle: 'How to Convert DNG to PNG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/dng-to-png.',
    'Drag and drop your DNG files into the upload area.',
    'MicroJPEG automatically converts them to PNG.',
    'Wait for the conversion to complete.',
    'Download your lossless PNG files.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for automation and premium limits.'
  ],

  comparisonTitle: 'DNG vs PNG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'RAW image' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Editing workflows' },
    { label: 'Compatibility', value: 'RAW support needed' },
    { label: 'Editing Flexibility', value: 'Maximum' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless PNG' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Medium' },
    { label: 'Best for', value: 'Graphics & editing' },
    { label: 'Compatibility', value: 'Broad support' },
    { label: 'Transparency', value: 'Yes' }
  ],

  features: [
    'High-quality lossless PNG images from DNG RAW.',
    'Fast conversion in your browser.',
    'Secure and private with auto file deletion.',
    'Supports batch DNG conversions.',
    'Easy to use with minimal interface.',
    'API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert DNG to PNG on any modern device:',
    'Windows computers',
    'macOS desktops and laptops',
    'Linux systems',
    'Android devices',
    'iPhones and iPads',
    'Modern browsers supported'
  ],

  relatedConversions: [
    { label: 'DNG to JPG', href: '/convert/dng-to-jpg' },
    { label: 'DNG to TIFF', href: '/convert/dng-to-tiff' },
    { label: 'DNG to WebP', href: '/convert/dng-to-webp' },
    { label: 'DNG to AVIF', href: '/convert/dng-to-avif' }
  ]
},


// =========================================================================
// 28. Convert DNG TO TIFF
// =========================================================================
'dng-tiff': {
  metaTitle: 'Convert DNG to TIFF Online – Lossless TIFF Output for RAW | MicroJPEG',
  metaDescription:
    'Convert DNG RAW files to high-fidelity TIFF images online with MicroJPEG. Great for printing, editing and archiving — secure and fast.',

  headline: 'Convert DNG to TIFF Online',
  subheadline: 'Lossless, High-Fidelity TIFF Output',
  heroDescription:
    'Convert your DNG RAW files into lossless, print-ready TIFF images using MicroJPEG — perfect for professional workflows.',
  intro:
    'TIFF is the preferred choice for detailed printing, professional editing, and archival storage. Converting DNG to TIFF ensures you retain full image detail and color fidelity in a widely supported format. With MicroJPEG, this powerful conversion is just a few clicks away. Learn more at microjpeg.com and explore advanced tools at microjpeg.com/features.',

  whatIsTitle: 'What Is a DNG File?',
  whatIsContent:
    'DNG is a RAW image format that stores full sensor data for maximum editing flexibility and detail, but is large in size and not suitable for direct viewing or sharing.',

  whyConvertTitle: 'Why Convert DNG to TIFF?',
  whyConvertReasons: [
    'TIFF retains full tonal range and details.',
    'Ideal for professional printing and publishing.',
    'Great for archival storage.',
    'Compatible with professional editors.',
    'Retains metadata and resolution.'
  ],

  howToTitle: 'How to Convert DNG to TIFF on MicroJPEG',
  howToSteps: [
    'Go to https://microjpeg.com/convert/dng-to-tiff.',
    'Drag and drop your DNG files into the uploader.',
    'MicroJPEG automatically converts them to TIFF.',
    'Wait until processing completes.',
    'Download your TIFF images.',
    'Visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs for more options.'
  ],

  comparisonTitle: 'DNG vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'RAW image' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Editing and pro workflows' },
    { label: 'Compatibility', value: 'RAW software needed' },
    { label: 'Use Case', value: 'Camera capture' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless TIFF' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Large image' },
    { label: 'Best for', value: 'Print and archive' },
    { label: 'Compatibility', value: 'Broad support' },
    { label: 'Use Case', value: 'Professional workflows' }
  ],

  features: [
    'High-quality TIFF output from RAW images.',
    'Fast browser conversion.',
    'Secure processing with auto cleanup.',
    'Batch RAW support available.',
    'Supports advanced workflows.',
    'API support at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert DNG to TIFF on:',
    'Windows computers',
    'macOS systems',
    'Linux desktops',
    'Android and iOS mobile devices',
    'Chrome, Edge, Firefox, Safari browsers'
  ],

  relatedConversions: [
    { label: 'DNG to JPG', href: '/convert/dng-to-jpg' },
    { label: 'DNG to PNG', href: '/convert/dng-to-png' },
    { label: 'DNG to WebP', href: '/convert/dng-to-webp' },
    { label: 'DNG to AVIF', href: '/convert/dng-to-avif' }
  ]
},

// =========================================================================
// 29. Convert DNG TO WEBP
// =========================================================================
'dng-webp': {
  metaTitle: 'Convert DNG to WebP Online – Efficient WebP from RAW | MicroJPEG',
  metaDescription:
    'Convert DNG RAW images to WebP online with MicroJPEG. Get compressed, web-optimized images with great quality — fast and simple.',

  headline: 'Convert DNG to WebP Online',
  subheadline: 'Optimized, Web-Ready Images',
  heroDescription:
    'Turn your DNG RAW files into efficient WebP images ready for web and app delivery — all in your browser with MicroJPEG.',
  intro:
    'WebP is a modern image format that delivers compression with strong visual quality — ideal for web galleries and mobile experiences. Converting DNG RAW to WebP yields images that load fast, save bandwidth, and still look great. With MicroJPEG, this happens instantly in your browser — no software needed.',

  whatIsTitle: 'What Is a DNG File?',
  whatIsContent:
    'DNG is a RAW image format that retains all sensor data captured by a camera, offering full editing flexibility at the cost of large file size and limited direct compatibility.',

  whyConvertTitle: 'Why Convert DNG to WebP?',
  whyConvertReasons: [
    'WebP greatly reduces file size compared to RAW.',
    'Speeds up page load on websites.',
    'Great for sharing and online galleries.',
    'Balances compression with quality.',
    'Supported by modern browsers.'
  ],

  howToTitle: 'How to Convert DNG to WebP on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/dng-to-webp.',
    'Drag your DNG files into the upload area.',
    'MicroJPEG automatically converts them to WebP.',
    'Wait for the conversion to finish.',
    'Download your WebP images.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for extended limits and automation.'
  ],

  comparisonTitle: 'DNG vs WebP – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'RAW image' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Compatibility', value: 'RAW software needed' },
    { label: 'Best for', value: 'Professional editing' },
    { label: 'Web Use', value: 'Not suitable as-is' },
    { label: 'Typical Workflow', value: 'Post-process then deliver' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Compressed web image' },
    { label: 'File Size', value: 'Small' },
    { label: 'Compatibility', value: 'Modern browsers' },
    { label: 'Best for', value: 'Web and apps' },
    { label: 'Web Use', value: 'Excellent' },
    { label: 'Typical Workflow', value: 'Final delivery images' }
  ],

  features: [
    'Fast browser-based WebP output from RAW.',
    'Secure temporary file handling.',
    'WebP compression with good visual quality.',
    'Supports batch conversions.',
    'No installation required.',
    'API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert DNG to WebP on any modern device:',
    'Windows systems',
    'macOS machines',
    'Linux desktops',
    'Android phones',
    'iPhones and iPads',
    'Major browsers including Chrome, Edge, Firefox, Safari'
  ],

  relatedConversions: [
    { label: 'DNG to JPG', href: '/convert/dng-to-jpg' },
    { label: 'DNG to PNG', href: '/convert/dng-to-png' },
    { label: 'DNG to TIFF', href: '/convert/dng-to-tiff' },
    { label: 'DNG to AVIF', href: '/convert/dng-to-avif' }
  ]
},

// =========================================================================
// 30. Convert DNG TO AVIF
// =========================================================================
'dng-avif': {
  metaTitle: 'Convert DNG to AVIF Online – Modern AVIF from RAW | MicroJPEG',
  metaDescription:
    'Convert DNG RAW images to AVIF online with MicroJPEG. Get modern, tiny images with excellent quality — quick and browser-based.',

  headline: 'Convert DNG to AVIF Online',
  subheadline: 'Next-Gen Compression from RAW',
  heroDescription:
    'Turn your DNG RAW photos into compact and high-quality AVIF images using MicroJPEG — perfect for fast web pages and performance-focused workflows.',
  intro:
    'AVIF is a cutting-edge image format that delivers excellent visual quality at tiny file sizes — ideal for modern web delivery. Converting your DNG RAW files to AVIF creates images that load quickly, consume less bandwidth, and still maintain strong visual fidelity. With MicroJPEG, this conversion happens fast in your browser.',

  whatIsTitle: 'What Is a DNG File?',
  whatIsContent:
    'DNG is a RAW format that retains full sensor data from the camera for editing flexibility, but is large and not suitable for general sharing without conversion.',

  whyConvertTitle: 'Why Convert DNG to AVIF?',
  whyConvertReasons: [
    'AVIF yields very small files for web performance.',
    'Excellent visual quality at reduced size.',
    'Boosts page load speed.',
    'Good for mobile and responsive applications.',
    'Maintains detail even with heavy compression.'
  ],

  howToTitle: 'How to Convert DNG to AVIF on MicroJPEG',
  howToSteps: [
    'Go to https://microjpeg.com/convert/dng-to-avif.',
    'Drag and drop your DNG images into the upload area.',
    'MicroJPEG automatically converts them to AVIF.',
    'Wait until processing completes.',
    'Download your AVIF files.',
    'Visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs for automation and premium limits.'
  ],

  comparisonTitle: 'DNG vs AVIF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'RAW image' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Compatibility', value: 'RAW tools needed' },
    { label: 'Best for', value: 'Editing workflows' },
    { label: 'Web Use', value: 'Not suitable as-is' },
    { label: 'Typical Workflow', value: 'Post-process then deliver' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Modern web image' },
    { label: 'File Size', value: 'Small' },
    { label: 'Compression', value: 'Advanced AV1' },
    { label: 'Best for', value: 'Web & apps' },
    { label: 'Web Use', value: 'Excellent' },
    { label: 'Typical Workflow', value: 'Final delivery' }
  ],

  features: [
    'State-of-the-art AVIF compression from RAW.',
    'Fast browser-based conversion.',
    'Private and secure temporary file processing.',
    'Batch support available.',
    'Tiny files with excellent quality.',
    'Developer API at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert DNG to AVIF on any device including:',
    'Windows PCs',
    'macOS systems',
    'Linux computers',
    'Android phones',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'DNG to JPG', href: '/convert/dng-to-jpg' },
    { label: 'DNG to PNG', href: '/convert/dng-to-png' },
    { label: 'DNG to TIFF', href: '/convert/dng-to-tiff' },
    { label: 'DNG to WebP', href: '/convert/dng-to-webp' }
  ]
},

// =========================================================================
// 31. Convert CRW TO JPG
// =========================================================================
'crw-jpg': {
  metaTitle: 'Convert CRW to JPG Online – Canon RAW to JPG Converter | MicroJPEG',
  metaDescription:
    'Convert Canon CRW RAW photos to JPG online with MicroJPEG. Fast, browser-based CRW to JPG converter with high quality output.',

  headline: 'Convert CRW to JPG Online',
  subheadline: 'Universal JPG Output from RAW',
  heroDescription:
    'Transform Canon CRW RAW images into universally compatible JPG files right in your browser — no installation needed.',
  intro:
    'Canon CRW files store unprocessed camera sensor data and are ideal for editing, but they are large and not always supported. MicroJPEG makes converting CRW to JPG fast and simple — upload your RAW file and download a polished JPG image instantly. Learn more at microjpeg.com and explore features at microjpeg.com/features.',

  whatIsTitle: 'What Is a CRW File?',
  whatIsContent:
    'CRW is an older Canon RAW image format used on early Canon models. It stores rich image data directly from the camera, offering excellent editing flexibility but limited compatibility with general image viewers.',

  whyConvertTitle: 'Why Convert CRW to JPG?',
  whyConvertReasons: [
    'JPG is compatible with every device and app.',
    'Smaller file size for sharing and storage.',
    'Good balance of quality and compression.',
    'Perfect for blogs, galleries, and social media.',
    'Fast to view without RAW software.'
  ],

  howToTitle: 'How to Convert CRW to JPG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/crw-to-jpg.',
    'Drag and drop your CRW file into the upload area.',
    'MicroJPEG automatically converts it to JPG.',
    'Wait while conversion completes.',
    'Download your JPG photo.',
    'For higher limits or automation, see https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'CRW vs JPG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Canon RAW image' },
    { label: 'Compression', value: 'None (RAW sensor data)' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Professional editing' },
    { label: 'Compatibility', value: 'Limited RAW support' },
    { label: 'Typical Use', value: 'Editing workflows' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Standard image (JPG)' },
    { label: 'Compression', value: 'Lossy JPG' },
    { label: 'File Size', value: 'Small to medium' },
    { label: 'Best for', value: 'Sharing & web use' },
    { label: 'Compatibility', value: 'Universal' },
    { label: 'Typical Use', value: 'Everyday viewing' }
  ],

  features: [
    'Fast CRW to JPG conversion in the browser.',
    'No software installation required.',
    'Secure file processing with automatic deletion.',
    'Supports batch CRW files.',
    'Optimized output quality.',
    'API access at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert CRW to JPG on any device:',
    'Windows computers',
    'macOS systems',
    'Linux desktops',
    'Android phones and tablets',
    'iPhones and iPads',
    'Chrome, Firefox, Edge, Safari'
  ],

  relatedConversions: [
    { label: 'CRW to PNG', href: '/convert/crw-to-png' },
    { label: 'CRW to TIFF', href: '/convert/crw-to-tiff' },
    { label: 'CRW to WebP', href: '/convert/crw-to-webp' },
    { label: 'CRW to AVIF', href: '/convert/crw-to-avif' }
  ]
},

// =========================================================================
// 32. Convert CRW TO PNG
// =========================================================================
'crw-png': {
  metaTitle: 'Convert CRW to PNG Online – Canon RAW to PNG Converter | MicroJPEG',
  metaDescription:
    'Convert Canon CRW RAW images to PNG online with MicroJPEG. Lossless PNG output from Canon RAW — quick, secure, and easy.',

  headline: 'Convert CRW to PNG Online',
  subheadline: 'Lossless PNG for Editing and Design',
  heroDescription:
    'Convert your Canon CRW RAW photos to lossless PNG images in your browser — perfect for editing, graphics, and transparency workflows.',
  intro:
    'CRW RAW captures full sensor data from Canon cameras and is ideal for deep editing. For workflows that require transparency or lossless output, converting CRW to PNG is a great choice. MicroJPEG lets you do this quickly online — upload your RAW photo and get high-quality PNG results in seconds. See more at microjpeg.com and discover features at microjpeg.com/features.',

  whatIsTitle: 'What Is a CRW File?',
  whatIsContent:
    'CRW is Canon’s legacy RAW format that stores unprocessed sensor data with high detail. It requires specialized software for direct use and is often large in file size.',

  whyConvertTitle: 'Why Convert CRW to PNG?',
  whyConvertReasons: [
    'PNG keeps lossless image detail.',
    'Supports transparency for graphics workflows.',
    'Compatible with design tools.',
    'Smaller and easier to share than RAW.',
    'Ideal for editing and presentations.'
  ],

  howToTitle: 'How to Convert CRW to PNG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/crw-to-png.',
    'Drag and drop your CRW file into the upload area.',
    'MicroJPEG automatically converts it to PNG.',
    'Wait while conversion completes.',
    'Download your PNG file.',
    'Visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs for more options.'
  ],

  comparisonTitle: 'CRW vs PNG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Canon RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Professional editing' },
    { label: 'Compatibility', value: 'Requires RAW support' },
    { label: 'Typical Use', value: 'Editing workflows' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless PNG' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Medium' },
    { label: 'Best for', value: 'Graphics & editing' },
    { label: 'Compatibility', value: 'Broad support' },
    { label: 'Transparency', value: 'Yes' }
  ],

  features: [
    'Lossless PNG output preserving CRW detail.',
    'Secure browser processing with automatic file cleanup.',
    'Batch conversion supported.',
    'No installation needed.',
    'Fast and optimized RAW decoding.',
    'Automation via API at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert CRW to PNG on:',
    'Windows desktops',
    'macOS systems',
    'Linux computers',
    'Android phones and tablets',
    'iPhones and iPads',
    'Modern browsers like Chrome and Safari'
  ],

  relatedConversions: [
    { label: 'CRW to JPG', href: '/convert/crw-to-jpg' },
    { label: 'CRW to TIFF', href: '/convert/crw-to-tiff' },
    { label: 'CRW to WebP', href: '/convert/crw-to-webp' },
    { label: 'CRW to AVIF', href: '/convert/crw-to-avif' }
  ]
},

// =========================================================================
// 33. Convert CRW TO TIFF
// =========================================================================
'crw-tiff': {
  metaTitle: 'Convert CRW to TIFF Online – Canon RAW to TIFF Converter | MicroJPEG',
  metaDescription:
    'Convert Canon CRW RAW photos to high-quality TIFF images with MicroJPEG. Lossless TIFF output for printing and professional workflows.',

  headline: 'Convert CRW to TIFF Online',
  subheadline: 'Lossless TIFF for Print & Archival',
  heroDescription:
    'Turn your Canon CRW RAW photos into lossless TIFF images perfect for print, editing, and archive — all done in your browser.',
  intro:
    'TIFF is a professional standard for lossless image storage, printing, and editing. Converting CRW RAW to TIFF preserves full image fidelity and makes your RAW photos useful in pro workflows. MicroJPEG makes this conversion fast and easy — upload your CRW files and download print-ready TIFF results instantly. Learn more at microjpeg.com and explore features at microjpeg.com/features.',

  whatIsTitle: 'What Is a CRW File?',
  whatIsContent:
    'CRW is a Canon RAW format used by older camera models that stores full unprocessed sensor data. It offers maximum editing flexibility but produces very large files.',

  whyConvertTitle: 'Why Convert CRW to TIFF?',
  whyConvertReasons: [
    'TIFF keeps full tonal range and detail.',
    'Ideal for print, publishing, and archival.',
    'Great compatibility with editing tools.',
    'Perfect for professional workflows.',
    'Retains metadata and resolution.'
  ],

  howToTitle: 'How to Convert CRW to TIFF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/crw-to-tiff.',
    'Drag and drop your CRW photos into the upload area.',
    'MicroJPEG automatically converts them to TIFF.',
    'Wait a short while for processing.',
    'Download your TIFF files.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for advanced usage.'
  ],

  comparisonTitle: 'CRW vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Canon RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Editing work' },
    { label: 'Compatibility', value: 'Requires RAW support' },
    { label: 'Typical Use', value: 'Camera capture' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless TIFF' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Large' },
    { label: 'Best for', value: 'Professional use' },
    { label: 'Compatibility', value: 'Broad support' },
    { label: 'Typical Use', value: 'Print and archive' }
  ],

  features: [
    'Lossless TIFF result from CRW RAW.',
    'Fast, browser-based conversion.',
    'Secure temp file handling.',
    'Batch CRW support.',
    'High quality for print workflows.',
    'Developer API at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert CRW to TIFF on any device:',
    'Windows systems',
    'macOS devices',
    'Linux desktops',
    'Android phones',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'CRW to JPG', href: '/convert/crw-to-jpg' },
    { label: 'CRW to PNG', href: '/convert/crw-to-png' },
    { label: 'CRW to WebP', href: '/convert/crw-to-webp' },
    { label: 'CRW to AVIF', href: '/convert/crw-to-avif' }
  ]
},

// =========================================================================
// 34. Convert CRW TO TIFF
// =========================================================================
'crw-tiff': {
  metaTitle: 'Convert CRW to TIFF Online – Canon RAW to TIFF Converter | MicroJPEG',
  metaDescription:
    'Convert Canon CRW RAW photos to high-quality TIFF images with MicroJPEG. Lossless TIFF output for printing and professional workflows.',

  headline: 'Convert CRW to TIFF Online',
  subheadline: 'Lossless TIFF for Print & Archival',
  heroDescription:
    'Turn your Canon CRW RAW photos into lossless TIFF images perfect for print, editing, and archive — all done in your browser.',
  intro:
    'TIFF is a professional standard for lossless image storage, printing, and editing. Converting CRW RAW to TIFF preserves full image fidelity and makes your RAW photos useful in pro workflows. MicroJPEG makes this conversion fast and easy — upload your CRW files and download print-ready TIFF results instantly. Learn more at microjpeg.com and explore features at microjpeg.com/features.',

  whatIsTitle: 'What Is a CRW File?',
  whatIsContent:
    'CRW is a Canon RAW format used by older camera models that stores full unprocessed sensor data. It offers maximum editing flexibility but produces very large files.',

  whyConvertTitle: 'Why Convert CRW to TIFF?',
  whyConvertReasons: [
    'TIFF keeps full tonal range and detail.',
    'Ideal for print, publishing, and archival.',
    'Great compatibility with editing tools.',
    'Perfect for professional workflows.',
    'Retains metadata and resolution.'
  ],

  howToTitle: 'How to Convert CRW to TIFF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/crw-to-tiff.',
    'Drag and drop your CRW photos into the upload area.',
    'MicroJPEG automatically converts them to TIFF.',
    'Wait a short while for processing.',
    'Download your TIFF files.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for advanced usage.'
  ],

  comparisonTitle: 'CRW vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Canon RAW' },
    { label: 'Compression', value: 'None' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Editing work' },
    { label: 'Compatibility', value: 'Requires RAW support' },
    { label: 'Typical Use', value: 'Camera capture' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless TIFF' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Large' },
    { label: 'Best for', value: 'Professional use' },
    { label: 'Compatibility', value: 'Broad support' },
    { label: 'Typical Use', value: 'Print and archive' }
  ],

  features: [
    'Lossless TIFF result from CRW RAW.',
    'Fast, browser-based conversion.',
    'Secure temp file handling.',
    'Batch CRW support.',
    'High quality for print workflows.',
    'Developer API at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert CRW to TIFF on any device:',
    'Windows systems',
    'macOS devices',
    'Linux desktops',
    'Android phones',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'CRW to JPG', href: '/convert/crw-to-jpg' },
    { label: 'CRW to PNG', href: '/convert/crw-to-png' },
    { label: 'CRW to WebP', href: '/convert/crw-to-webp' },
    { label: 'CRW to AVIF', href: '/convert/crw-to-avif' }
  ]
},

// =========================================================================
// 35. Convert CRW TO WEBP
// =========================================================================
'crw-webp': {
  metaTitle: 'Convert CRW to WebP Online – Canon RAW to WebP Converter | MicroJPEG',
  metaDescription:
    'Convert Canon CRW RAW images to WebP online with MicroJPEG. Get web-optimized images fast with a simple browser workflow.',

  headline: 'Convert CRW to WebP Online',
  subheadline: 'Web-Ready Images from RAW',
  heroDescription:
    'Convert your Canon CRW RAW photos into efficient WebP images ready for websites, apps, and galleries — all in your browser.',
  intro:
    'WebP is an efficient modern format that provides small file size with good quality. Converting CRW RAW files to WebP makes them suitable for web and app use, significantly improving load speeds. With MicroJPEG, this process is easy — just upload and download optimized WebP results. Check out more at microjpeg.com/features.',

  whatIsTitle: 'What Is a CRW File?',
  whatIsContent:
    'CRW is Canon’s legacy RAW format that holds unprocessed sensor data and wide dynamic range — ideal for deep editing but too large and unsupported for web use without conversion.',

  whyConvertTitle: 'Why Convert CRW to WebP?',
  whyConvertReasons: [
    'WebP greatly reduces file size.',
    'Faster website and app performance.',
    'Great choice for galleries and portfolios.',
    'Balances quality & compression.',
    'Supported by all modern browsers.'
  ],

  howToTitle: 'How to Convert CRW to WebP on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/crw-to-webp.',
    'Drag and drop your CRW RAW photo into the uploader.',
    'MicroJPEG converts it to WebP automatically.',
    'Wait while processing completes.',
    'Download your WebP image.',
    'Explore https://microjpeg.com/pricing and https://microjpeg.com/api-docs for advanced use.'
  ],

  comparisonTitle: 'CRW vs WebP – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Canon RAW' },
    { label: 'Compression', value: 'Uncompressed' },
    { label: 'File Size', value: 'Very Large' },
    { label: 'Best for', value: 'Editing workflows' },
    { label: 'Web Use', value: 'Not suitable as-is' },
    { label: 'Typical Workflow', value: 'Post-process then deliver' }
  ],
  targetInfo: [
    { label: 'Type', value: 'WebP' },
    { label: 'Compression', value: 'Lossy & lossless' },
    { label: 'File Size', value: 'Small' },
    { label: 'Best for', value: 'Web & apps' },
    { label: 'Web Use', value: 'Excellent' },
    { label: 'Typical Workflow', value: 'Final delivery' }
  ],

  features: [
    'Fast browser-based RAW to WebP conversion.',
    'Secure file handling.',
    'No installation needed.',
    'Batch CRW processing.',
    'Optimized for web image delivery.',
    'Developer API at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert CRW to WebP on:',
    'Windows PCs',
    'macOS systems',
    'Linux desktops',
    'Android phones',
    'iPhones and iPads',
    'Modern browsers'
  ],

  relatedConversions: [
    { label: 'CRW to JPG', href: '/convert/crw-to-jpg' },
    { label: 'CRW to PNG', href: '/convert/crw-to-png' },
    { label: 'CRW to TIFF', href: '/convert/crw-to-tiff' },
    { label: 'CRW to AVIF', href: '/convert/crw-to-avif' }
  ]
},

// =========================================================================
  // 36. WEBP to JPG
  // =========================================================================
  'webp-jpg': {
    metaTitle: 'WebP to JPG Converter - Free Online | MicroJPEG',
    metaDescription: 'Convert WebP images to JPG online free. Universal compatibility for all devices and software. Instant conversion.',
    
    headline: 'Convert WebP to JPG Online',
    subheadline: 'Free & Instant',
    heroDescription: 'Convert WebP images to universally compatible JPG format for older devices and software.',
    
    intro: 'MicroJPEG converts WebP images to standard JPG format instantly. While WebP offers excellent compression, some older software, devices, and email clients don\'t support it. Converting to JPG ensures universal compatibility.',
    
    whatIsTitle: 'What is WebP Format?',
    whatIsContent: 'WebP is a modern image format developed by Google that provides superior compression compared to JPG and PNG. While WebP is supported by all modern browsers (Chrome, Firefox, Safari, Edge), some older software, image editors, and devices may not open WebP files. Converting to JPG ensures your images work everywhere.',
    
    whyConvertTitle: 'Why Convert WebP to JPG?',
    whyConvertReasons: [
      'Universal compatibility — JPG works on all devices and software',
      'Email attachments — some email clients don\'t preview WebP',
      'Older software support — Photoshop versions before 2022 need plugins for WebP',
      'Print services — some print labs only accept JPG',
      'Social media uploads — older platforms may not support WebP',
      'Document embedding — Word/PowerPoint handle JPG better than WebP'
    ],
    
    howToTitle: 'How to Convert WebP to JPG',
    howToSteps: [
      'Upload your WebP files to the converter',
      'MicroJPEG converts to optimized JPG format',
      'Adjust quality settings if needed',
      'Download your JPG files'
    ],
    
    comparisonTitle: 'WebP vs JPG: Format Comparison',
    sourceInfo: [
      { label: 'Format', value: 'WebP' },
      { label: 'Compression', value: 'Lossy/Lossless' },
      { label: 'File Size', value: 'Smaller' },
      { label: 'Browser Support', value: '97%+ modern browsers' },
      { label: 'Software Support', value: 'Limited in older apps' }
    ],
    targetInfo: [
      { label: 'Format', value: 'JPG (JPEG)' },
      { label: 'Compression', value: 'Lossy' },
      { label: 'File Size', value: 'Slightly larger' },
      { label: 'Browser Support', value: '100% universal' },
      { label: 'Software Support', value: 'Universal' }
    ],
    
    features: [
      'Instant conversion — results in seconds',
      'Batch processing — convert multiple WebP files',
      'Quality control — adjust output compression',
      'Handles transparency — converts to white background',
      'No signup needed'
    ],
    
    deviceSupportText: 'Works on all devices with a modern browser.',
    
    relatedConversions: [
      { label: 'WebP to AVIF', href: '/convert/webp-to-avif' },
      { label: 'WebP to PNG', href: '/convert/webp-to-png' },
      { label: 'WebP to TIFF', href: '/convert/webp-to-tiff' }
    ]
  },

  // =========================================================================
// 37. Convert WEBP TO TIFF
// =========================================================================
'webp-tiff': {
  metaTitle: 'Convert WebP to TIFF Online – Fast, High-Quality WebP to TIFF Converter | MicroJPEG',
  metaDescription:
    'Convert WebP images to TIFF instantly with MicroJPEG. High-quality, lossless output ideal for print and archival use. Free online WebP to TIFF converter — no signup required. Works on all devices.',

  headline: 'Convert WebP to TIFF Online',
  subheadline: 'Up to 70% Smaller',
  heroDescription:
    'High-quality, lossless TIFF output for printing, editing, and archiving — fast, secure, and free on MicroJPEG.',
  intro:
    'WebP images are great for the web, but sometimes you need a high-quality, lossless format for printing, editing, or long-term storage. MicroJPEG makes this easy with a fast, reliable WebP to TIFF converter directly in your browser. No installation, no account required — just upload your WebP file and download a clean TIFF image in seconds. Explore all features at microjpeg.com and learn more at microjpeg.com/features.',

  whatIsTitle: 'What Is a WebP File?',
  whatIsContent:
    'WebP is a modern image format designed for efficient web performance. It supports both lossy and lossless compression, allowing websites to deliver smaller file sizes without sacrificing visual quality. Because it’s optimized for browsing speed, WebP is widely used for images that need to load quickly across devices.',

  whyConvertTitle: 'Why Convert WebP to TIFF?',
  whyConvertReasons: [
    'Maximum image quality with no compression artifacts.',
    'Print-ready output for magazines, brochures, or professional prints.',
    'Editable format for design tools that rely on lossless data.',
    'Accurate color representation in pre-press workflows.',
    'Long-term archiving where stability and retention of detail are essential.'
  ],

  howToTitle: 'How to Convert WebP to TIFF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/webp-to-tiff.',
    'Drag and drop your WebP file into the upload area (or select it manually).',
    'MicroJPEG automatically processes and converts your image to TIFF.',
    'Wait a moment for the conversion to complete.',
    'Download your ready-to-use TIFF file.',
    'For more tools and options, visit https://microjpeg.com/pricing or check https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'WebP vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Compression', value: 'Lossy & lossless' },
    { label: 'Transparency', value: 'Preserved' },
    { label: 'Best for', value: 'Websites, online images' },
    { label: 'Color Depth', value: 'Good' },
    { label: 'Metadata', value: 'Basic' },
    { label: 'Quality Priority', value: 'Balanced' }
  ],

  targetInfo: [
    { label: 'Compression', value: 'Lossless' },
    { label: 'Transparency', value: 'Full Support' },
    { label: 'Best for', value: 'Printing, editing, archiving' },
    { label: 'Color Depth', value: 'Excellent' },
    { label: 'Metadata', value: 'Advanced' },
    { label: 'Quality Priority', value: 'Maximum' }
  ],

  features: [
    'Lossless TIFF output with excellent detail retention.',
    'Fast browser-based conversion with optimized performance.',
    'Secure, temporary processing — files auto-delete after conversion.',
    'Works for small and large WebP images.',
    'Batch upload support for multiple images.',
    'No installation required — fully online.',
    'API availability for automated workflows at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'MicroJPEG works across all major devices and browsers. Convert WebP to TIFF seamlessly on:',
    'Windows PCs',
    'macOS laptops',
    'Linux systems',
    'iPhones and iPads',
    'Android phones and tablets',
    'Chrome, Safari, Firefox, and Edge'
  ],

  relatedConversions: [
    { label: 'WebP to JPG', href: '/convert/webp-to-jpg' },
    { label: 'WebP to PNG', href: '/convert/webp-to-png' },
    { label: 'WebP to AVIF', href: '/convert/webp-to-avif' }
      ]
  },

// =========================================================================
// 38. Convert WEBP TO PNG
// =========================================================================
'webp-png': {
  metaTitle: 'Convert WebP to PNG Online – High-Quality WebP to PNG Converter | MicroJPEG',
  metaDescription:
    'Convert WebP images to PNG instantly with MicroJPEG. Preserve transparency and quality with a fast, free WebP to PNG converter. Works on all devices without installation.',

  headline: 'Convert WebP to PNG Online',
  subheadline: 'High-Quality PNG Output',
  heroDescription:
    'Convert your WebP images to PNG with full transparency and high visual fidelity — fast, free, and secure on MicroJPEG.',
  intro:
    'WebP is widely used for web optimization, but PNG remains one of the best formats for preserving sharp details and transparency. MicroJPEG offers a fast, online WebP to PNG converter that works directly in your browser. No installation or account is needed — just upload your WebP file and download a clean PNG instantly. Explore more tools at microjpeg.com and discover premium features at microjpeg.com/features.',

  whatIsTitle: 'What Is a WebP File?',
  whatIsContent:
    'WebP is a next-generation image format designed for the web, offering both lossy and lossless compression with smaller file sizes. It provides fast load times and supports transparency, making it ideal for online images.',

  whyConvertTitle: 'Why Convert WebP to PNG?',
  whyConvertReasons: [
    'PNG provides lossless quality with no compression artifacts.',
    'PNG fully supports alpha-channel transparency.',
    'Easier compatibility with all design tools and editing software.',
    'Better suited for high-detail graphics, icons, and UI assets.',
    'Ideal for exporting clean images for presentations or documents.'
  ],

  howToTitle: 'How to Convert WebP to PNG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/webp-to-png.',
    'Upload your WebP file by dragging it into the drop zone.',
    'MicroJPEG instantly converts your image to PNG.',
    'Wait briefly as the conversion completes.',
    'Download your high-quality PNG file.',
    'Learn more or upgrade at https://microjpeg.com/pricing or explore https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'WebP vs PNG – Comparison Table',
  sourceInfo: [
    { label: 'Compression', value: 'Lossy & Lossless' },
    { label: 'Transparency', value: 'Supported' },
    { label: 'Best for', value: 'Web graphics, small file sizes' },
    { label: 'Color Depth', value: 'Good' },
    { label: 'Metadata', value: 'Basic' },
    { label: 'Quality Priority', value: 'Balanced' }
  ],

  targetInfo: [
    { label: 'Compression', value: 'Lossless' },
    { label: 'Transparency', value: 'Full Alpha Support' },
    { label: 'Best for', value: 'Design, editing, graphics export' },
    { label: 'Color Depth', value: 'Excellent' },
    { label: 'Metadata', value: 'Standard' },
    { label: 'Quality Priority', value: 'Maximum' }
  ],

  features: [
    'Preserves transparency perfectly.',
    'Lossless PNG output for high-detail graphics.',
    'Fast online conversion with no software required.',
    'Secure, temporary processing — files auto-delete after conversion.',
    'Handles both small and large WebP images.',
    'Batch conversion supported.',
    'API available for automation at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'MicroJPEG works on all major browsers and devices:',
    'Windows PCs',
    'macOS laptops',
    'Linux systems',
    'iPhones and iPads',
    'Android phones and tablets',
    'Chrome, Safari, Firefox, and Edge'
  ],

  relatedConversions: [
    { label: 'WebP to JPG', href: '/convert/webp-to-jpg' },
    { label: 'WebP to TIFF', href: '/convert/webp-to-tiff' },
    { label: 'WebP to AVIF', href: '/convert/webp-to-avif' }
 ]
  },

// =========================================================================
// 39. Convert WEBP TO AVIF
// =========================================================================
'webp-avif': {
  metaTitle: 'Convert WebP to AVIF Online – High-Compression WebP to AVIF Converter | MicroJPEG',
  metaDescription:
    'Convert WebP images to AVIF instantly with MicroJPEG. Get smaller file sizes with superior visual quality. Free online WebP to AVIF converter — works on all devices.',

  headline: 'Convert WebP to AVIF Online',
  subheadline: 'Superior Compression & Quality',
  heroDescription:
    'Transform your WebP images into highly efficient AVIF format — smaller file sizes, excellent quality, and fast online conversion using MicroJPEG.',
  intro:
    'AVIF is one of the most advanced modern image formats, offering exceptional compression and stunning visual quality. MicroJPEG gives you a fast, online WebP to AVIF converter that runs directly in your browser. Simply upload your WebP file and download a compact, high-quality AVIF image. Try more tools at microjpeg.com and explore advanced options at microjpeg.com/features.',

  whatIsTitle: 'What Is a WebP File?',
  whatIsContent:
    'WebP is a modern image format created for efficient online delivery. It supports both lossy and lossless compression and offers transparency, making it ideal for fast-loading web images.',

  whyConvertTitle: 'Why Convert WebP to AVIF?',
  whyConvertReasons: [
    'AVIF produces significantly smaller file sizes compared to WebP.',
    'Superior visual quality, even at high compression levels.',
    'Efficient for web developers optimizing image-heavy websites.',
    'Supports HDR, deep color, and modern compression algorithms.',
    'Ideal for long-term storage with minimal file size footprint.'
  ],

  howToTitle: 'How to Convert WebP to AVIF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/webp-to-avif.',
    'Drag and drop your WebP image into the upload area.',
    'MicroJPEG automatically converts it to AVIF.',
    'Wait briefly for the processing to complete.',
    'Download your optimized AVIF file.',
    'Upgrade or automate conversions at https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'WebP vs AVIF – Comparison Table',
  sourceInfo: [
    { label: 'Compression', value: 'Lossy & Lossless' },
    { label: 'File Size', value: 'Small' },
    { label: 'Quality', value: 'Good' },
    { label: 'Transparency', value: 'Supported' },
    { label: 'Encoding Speed', value: 'Fast' },
    { label: 'Use Case', value: 'Web images' }
  ],

  targetInfo: [
    { label: 'Compression', value: 'Highly Efficient (Better than WebP)' },
    { label: 'File Size', value: 'Very Small' },
    { label: 'Quality', value: 'Excellent, even at low bitrates' },
    { label: 'Transparency', value: 'Full Support' },
    { label: 'Encoding Speed', value: 'Moderate' },
    { label: 'Use Case', value: 'Web optimization, modern apps, storage' }
  ],

  features: [
    'Ultra-efficient AVIF compression for tiny file sizes.',
    'High-quality output suitable for modern web use.',
    'Fast online conversion with no installation.',
    'Secure, temporary file handling with auto-deletion.',
    'Works with both small and large WebP images.',
    'Batch conversions supported.',
    'API available for developers at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'MicroJPEG runs smoothly on all major devices:',
    'Windows PCs',
    'macOS systems',
    'Linux machines',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers including Chrome, Firefox, Edge, and Safari'
  ],

  relatedConversions: [
    { label: 'WebP to JPG', href: '/convert/webp-to-jpg' },
    { label: 'WebP to PNG', href: '/convert/webp-to-png' },
    { label: 'WebP to TIFF', href: '/convert/webp-to-tiff' }
 ]
  },

// =========================================================================
// 40. Convert TIFF TO JPG
// =========================================================================
'tiff-jpg': {
  metaTitle: 'Convert TIFF to JPG Online – Fast TIFF to JPG Converter | MicroJPEG',
  metaDescription:
    'Convert TIFF images to JPG quickly with MicroJPEG. Simple, browser-based TIFF to JPG converter with high-quality results.',

  headline: 'Convert TIFF to JPG Online',
  subheadline: 'Fast, High-Quality JPG Output',
  heroDescription:
    'Easily convert large TIFF images into universally supported JPG files directly in your browser — no install required.',

  intro:
    'TIFF is a lossless format often used in printing and professional workflows, but JPG is ideal for everyday viewing, sharing, and web use. With MicroJPEG you can convert TIFF to JPG online in seconds — just upload your image and download the optimized JPG output. Explore more tools at microjpeg.com and learn about features at microjpeg.com/features.',

  whatIsTitle: 'What is a TIFF File?',
  whatIsContent:
    'TIFF (Tagged Image File Format) is a high-quality image format widely used in professional photography, publishing, and digital archiving. It supports lossless data and rich color profiles, making it great for editing and print but large in file size.',

  whyConvertTitle: 'Why Convert TIFF to JPG?',
  whyConvertReasons: [
    'JPG is universally supported across devices and apps.',
    'Smaller file sizes make sharing faster and easier.',
    'Perfect for social media, web galleries, and blogs.',
    'Easier to view without specialized software.',
    'Good balance between quality and file size.'
  ],

  howToTitle: 'How to Convert TIFF to JPG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/tiff-to-jpg.',
    'Drag and drop your TIFF file into the upload area.',
    'MicroJPEG automatically converts it to JPG.',
    'Wait a moment for the conversion to complete.',
    'Download your JPG image.',
    'For higher limits and API use, check https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'TIFF vs JPG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Lossless raster image' },
    { label: 'Compression', value: 'None or lossless' },
    { label: 'File Size', value: 'Large' },
    { label: 'Use Case', value: 'Professional editing & print' },
    { label: 'Compatibility', value: 'Requires advanced viewers' },
    { label: 'Quality', value: 'Maximum' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Standard image format' },
    { label: 'Compression', value: 'Lossy JPG' },
    { label: 'File Size', value: 'Small to medium' },
    { label: 'Use Case', value: 'Web & everyday use' },
    { label: 'Compatibility', value: 'Universal' },
    { label: 'Quality', value: 'Good' }
  ],

  features: [
    'Fast online TIFF to JPG conversion.',
    'No installation or software required.',
    'Secure temporary file handling with auto deletion.',
    'Batch image support for multiple TIFF files.',
    'Optimized for quality and performance.',
    'API available for automated workflows at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert TIFF to JPG on any device:',
    'Windows desktops and laptops',
    'macOS computers',
    'Linux systems',
    'Android phones and tablets',
    'iPhones and iPads',
    'Chrome, Firefox, Safari, Edge and more'
  ],

  relatedConversions: [
    { label: 'TIFF to PNG', href: '/convert/tiff-to-png' },
    { label: 'TIFF to WebP', href: '/convert/tiff-to-webp' },
    { label: 'TIFF to AVIF', href: '/convert/tiff-to-avif' }
  ]
},

// =========================================================================
// 41. Convert TIFF TO PNG
// =========================================================================
'tiff-png': {
  metaTitle: 'Convert TIFF to PNG Online – Lossless TIFF to PNG Converter | MicroJPEG',
  metaDescription:
    'Convert TIFF images to PNG online with MicroJPEG. Preserve transparency and quality in a browser-based TIFF to PNG converter.',

  headline: 'Convert TIFF to PNG Online',
  subheadline: 'Lossless PNG Results',
  heroDescription:
    'Convert high-quality TIFF images to lossless PNG format online — perfect for editing, design workflows, and transparent output.',

  intro:
    'PNG is a lossless format that maintains full color and transparency, making it ideal for editing, graphic design, and publishing. When you need a web-friendly lossless alternative to TIFF, MicroJPEG lets you convert TIFF to PNG easily in your browser — no accounts or software needed. See more at microjpeg.com/features.',

  whatIsTitle: 'What is a TIFF File?',
  whatIsContent:
    'TIFF (Tagged Image File Format) is a professional format used for high-quality images, archiving and print. It can contain multiple layers, channels, and color depth information, which makes it large in size but perfect for high fidelity output.',

  whyConvertTitle: 'Why Convert TIFF to PNG?',
  whyConvertReasons: [
    'PNG preserves image detail with lossless compression.',
    'Supports full transparency (alpha channel).',
    'Great for editing and design workflows.',
    'Smaller file size than TIFF while retaining quality.',
    'Broad compatibility with image software and tools.'
  ],

  howToTitle: 'How to Convert TIFF to PNG on MicroJPEG',
  howToSteps: [
    'Go to https://microjpeg.com/convert/tiff-to-png.',
    'Upload your TIFF image via drag & drop.',
    'MicroJPEG automatically converts it to PNG.',
    'Wait for processing to finish.',
    'Download your PNG image.',
    'For API or higher limits, see https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'TIFF vs PNG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Professional lossless format' },
    { label: 'Compression', value: 'None or lossless' },
    { label: 'File Size', value: 'Very large' },
    { label: 'Best for', value: 'Editing and print' },
    { label: 'Compatibility', value: 'Advanced viewers' },
    { label: 'Editing', value: 'Extensive' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless PNG' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'File Size', value: 'Medium to large' },
    { label: 'Best for', value: 'Editing workflows' },
    { label: 'Compatibility', value: 'Broad support' },
    { label: 'Transparency', value: 'Yes' }
  ],

  features: [
    'Preserves quality and transparency.',
    'Fast browser-based conversion.',
    'Secure with automatic cleanup.',
    'Batch TIFF file support.',
    'No installation required.',
    'API available for automation at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert TIFF to PNG on any device:',
    'Windows',
    'macOS',
    'Linux systems',
    'Android devices',
    'iPhones and iPads',
    'All standard browsers'
  ],

  relatedConversions: [
    { label: 'TIFF to JPG', href: '/convert/tiff-to-jpg' },
    { label: 'TIFF to WebP', href: '/convert/tiff-to-webp' },
    { label: 'TIFF to AVIF', href: '/convert/tiff-to-avif' }
  ]
},

// =========================================================================
// 42. Convert TIFF TO WEBP
// =========================================================================
'tiff-webp': {
  metaTitle: 'Convert TIFF to WebP Online – Efficient TIFF to WebP Converter | MicroJPEG',
  metaDescription:
    'Convert TIFF images to WebP format online with MicroJPEG. Get smaller files with good quality — ideal for web and apps.',

  headline: 'Convert TIFF to WebP Online',
  subheadline: 'Optimized WebP Output',
  heroDescription:
    'Convert large TIFF images to modern WebP format for web use — fast, browser-based, and secure.',

  intro:
    'WebP is a modern image format designed for fast load times and small file sizes without compromising visual quality. When you need web-ready images from professional TIFF sources, MicroJPEG makes converting TIFF to WebP fast and simple. Upload, convert, and download right in your browser. Check out more at microjpeg.com/features.',

  whatIsTitle: 'What is a TIFF File?',
  whatIsContent:
    'TIFF is a professional image format used in editing, publishing, and archival workflows. Its lossless nature ensures maximum quality, but results in large files that are not ideal for web delivery.',

  whyConvertTitle: 'Why Convert TIFF to WebP?',
  whyConvertReasons: [
    'WebP reduces file size significantly.',
    'Faster display on web pages and apps.',
    'Good visual quality with compression.',
    'Ideal for responsive and mobile experiences.',
    'Supported by modern browsers.'
  ],

  howToTitle: 'How to Convert TIFF to WebP on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/tiff-to-webp.',
    'Drag and drop your TIFF files into the uploader.',
    'MicroJPEG automatically converts it to WebP.',
    'Wait while processing completes.',
    'Download your WebP images.',
    'For API and premium features, see https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'TIFF vs WebP – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Professional lossless format' },
    { label: 'File Size', value: 'Large' },
    { label: 'Best for', value: 'Editing and archive' },
    { label: 'Web Use', value: 'Not suitable as-is' },
    { label: 'Quality', value: 'High' },
    { label: 'Compatibility', value: 'Advanced viewers' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Web optimized image' },
    { label: 'File Size', value: 'Small' },
    { label: 'Best for', value: 'Web & apps' },
    { label: 'Compression', value: 'Lossy & lossless' },
    { label: 'Web Use', value: 'Excellent' },
    { label: 'Compatibility', value: 'Broad browser support' }
  ],

  features: [
    'Fast WebP output from TIFF.',
    'No installation required.',
    'Secure browser processing with auto deletion.',
    'Batch TIFF file support.',
    'Optimized for web image delivery.',
    'API support at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert TIFF to WebP on all devices:',
    'Windows PCs',
    'macOS systems',
    'Linux desktops',
    'Android phones',
    'iPhones and iPads',
    'Modern browsers supported'
  ],

  relatedConversions: [
    { label: 'TIFF to JPG', href: '/convert/tiff-to-jpg' },
    { label: 'TIFF to PNG', href: '/convert/tiff-to-png' },
    { label: 'TIFF to AVIF', href: '/convert/tiff-to-avif' }
  ]
},

// =========================================================================
// 43. Convert TIFF TO AVIF
// =========================================================================
'tiff-avif': {
  metaTitle: 'Convert TIFF to AVIF Online – Modern AVIF from TIFF | MicroJPEG',
  metaDescription:
    'Convert your TIFF images to AVIF format online using MicroJPEG. Get very small files with excellent quality — ideal for modern web delivery.',

  headline: 'Convert TIFF to AVIF Online',
  subheadline: 'Next-Gen AVIF Output',
  heroDescription:
    'Convert large TIFF images into ultra-efficient AVIF format for modern web and app performance — directly in your browser.',

  intro:
    'AVIF is a cutting-edge image format delivering excellent visual quality at very small file sizes. When you need web performance without sacrificing detail, converting TIFF to AVIF gives you the best of both worlds. MicroJPEG makes this fast and easy online — upload your files and download AVIF results instantly.',

  whatIsTitle: 'What is a TIFF File?',
  whatIsContent:
    'TIFF is a professional, lossless image format commonly used in editing, printing, and archival workflows. While excellent for quality, its large size makes it less ideal for web delivery without conversion.',

  whyConvertTitle: 'Why Convert TIFF to AVIF?',
  whyConvertReasons: [
    'AVIF provides very high compression efficiency.',
    'Greatly reduces file size while maintaining quality.',
    'Boosts page load performance.',
    'Perfect for mobile and responsive experiences.',
    'Supported by modern browsers.'
  ],

  howToTitle: 'How to Convert TIFF to AVIF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/tiff-to-avif.',
    'Upload your TIFF files via drag & drop.',
    'MicroJPEG automatically converts to AVIF.',
    'Wait while processing finishes.',
    'Download your AVIF images.',
    'Visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs for automation and premium features.'
  ],

  comparisonTitle: 'TIFF vs AVIF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Professional lossless format' },
    { label: 'File Size', value: 'Large' },
    { label: 'Best for', value: 'Editing & print' },
    { label: 'Web Use', value: 'Not suitable as-is' },
    { label: 'Compatibility', value: 'Advanced viewers' },
    { label: 'Quality', value: 'Top' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Modern web format' },
    { label: 'File Size', value: 'Very small' },
    { label: 'Best for', value: 'Web & mobile' },
    { label: 'Compression', value: 'Advanced AV1' },
    { label: 'Web Use', value: 'Excellent' },
    { label: 'Compatibility', value: 'Modern browsers' }
  ],

  features: [
    'High-efficiency AVIF compression from TIFF.',
    'Fast browser conversion.',
    'Secure temp file handling.',
    'Batch TIFF support.',
    'Small file sizes with good quality.',
    'API ready at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert TIFF to AVIF on any device:',
    'Windows machines',
    'macOS systems',
    'Linux computers',
    'Android phones',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'TIFF to JPG', href: '/convert/tiff-to-jpg' },
    { label: 'TIFF to PNG', href: '/convert/tiff-to-png' },
    { label: 'TIFF to WebP', href: '/convert/tiff-to-webp' }
  ]
},

// =========================================================================
// 44. Convert SVG TO TIFF
// =========================================================================
'svg-tiff': {
  metaTitle: 'Convert SVG to TIFF Online – Vector to High-Quality TIFF | MicroJPEG',
  metaDescription:
    'Convert SVG vector images to TIFF online with MicroJPEG. Lossless TIFF output ideal for printing and archiving — fast, browser-based SVG to TIFF converter.',

  headline: 'Convert SVG to TIFF Online',
  subheadline: 'Lossless Output from Vector',
  heroDescription:
    'Turn your SVG vector graphics into high-quality TIFF images instantly in your browser — perfect for printing, editing, and archival workflows.',

  intro:
    'SVG (Scalable Vector Graphics) stores images in vector form, enabling resolution-independent scaling. While great for UI and web, converting SVG to a raster format like TIFF is useful for print and professional design. MicroJPEG offers a fast, online SVG to TIFF converter — just upload your vector and download a detailed TIFF file in seconds.',

  whatIsTitle: 'What Is an SVG File?',
  whatIsContent:
    'SVG stands for Scalable Vector Graphics — a text-based format that describes images using shapes, paths, and curves. It is resolution-independent and ideal for icons, logos, maps, and illustrations that need sharp display at any size.',

  whyConvertTitle: 'Why Convert SVG to TIFF?',
  whyConvertReasons: [
    'TIFF provides high-fidelity raster output suitable for printing.',
    'Great for professional workflows needing lossless detail.',
    'Raster formats are easier to use in traditional editors.',
    'Ideal for archival and publishing.',
    'Compatible with a wide range of professional tools.'
  ],

  howToTitle: 'How to Convert SVG to TIFF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/svg-to-tiff.',
    'Drag and drop your SVG file into the upload area.',
    'MicroJPEG automatically converts vector to TIFF.',
    'Wait a few seconds while conversion runs.',
    'Download your TIFF image.',
    'For higher limits and APIs, visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'SVG vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Scalable Vector Graphics' },
    { label: 'Scalability', value: 'Infinite resolution' },
    { label: 'Best for', value: 'Icons, logos, UI, maps' },
    { label: 'Compatibility', value: 'Web & design apps' },
    { label: 'File Size', value: 'Usually small' },
    { label: 'Rendering', value: 'Vector based' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Raster image' },
    { label: 'Best for', value: 'Printing & editing' },
    { label: 'Compatibility', value: 'Print & pro tools' },
    { label: 'File Size', value: 'Large' },
    { label: 'Detail', value: 'Maximum' },
    { label: 'Use Case', value: 'Publishing & archive' }
  ],

  features: [
    'Convert SVG vectors into lossless TIFF images.',
    'Fast, browser-based conversion.',
    'Secure temporary file processing with auto deletion.',
    'Batch uploads supported.',
    'No installations or plugins required.',
    'API available for programmatic workflows at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'MicroJPEG works on any device for SVG to TIFF conversion:',
    'Windows desktops',
    'macOS devices',
    'Linux systems',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'SVG to JPG', href: '/convert/svg-to-jpg' },
    { label: 'SVG to PNG', href: '/convert/svg-to-png' },
    { label: 'SVG to WebP', href: '/convert/svg-to-webp' },
    { label: 'SVG to AVIF', href: '/convert/svg-to-avif' }
  ]
},

// =========================================================================
// 45. Convert SVG TO JPG
// =========================================================================
'svg-jpg': {
  metaTitle: 'Convert SVG to JPG Online – Vector to Compressed JPG | MicroJPEG',
  metaDescription:
    'Convert SVG vector graphics to JPG online with MicroJPEG. Easy online SVG to JPG converter with fast results — no software needed.',

  headline: 'Convert SVG to JPG Online',
  subheadline: 'Web-Ready JPG Output',
  heroDescription:
    'Convert your SVG designs into compressed JPG images quickly in your browser — ideal for web, social media, and everyday viewing.',

  intro:
    'SVG is perfect for vector design and scaling, but JPG is more widely supported for everyday viewing, sharing, and publishing. MicroJPEG lets you convert SVG to JPG online with speed and simplicity. Upload your SVG and download JPG — all without installing any software.',

  whatIsTitle: 'What Is an SVG File?',
  whatIsContent:
    'SVG (Scalable Vector Graphics) is an XML-based vector image format used for graphics that need to preserve clarity at any resolution, commonly used in icons, logos, illustrations, and charts on the web.',

  whyConvertTitle: 'Why Convert SVG to JPG?',
  whyConvertReasons: [
    'JPG works everywhere — from phones to desktops.',
    'Smaller file sizes for sharing and web use.',
    'Great for photos, social media, and galleries.',
    'Fewer compatibility issues than vector formats.',
    'Faster loading for non-editable images.'
  ],

  howToTitle: 'How to Convert SVG to JPG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/svg-to-jpg.',
    'Upload your SVG file by dragging it into the uploader.',
    'MicroJPEG automatically converts it to JPG.',
    'Wait for it to finish processing.',
    'Download your JPG image.',
    'For high volume or API use, see https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'SVG vs JPG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Vector SVG image' },
    { label: 'Scalability', value: 'Infinite' },
    { label: 'Best for', value: 'Design & icons' },
    { label: 'Compatibility', value: 'Modern browsers' },
    { label: 'File Size', value: 'Small' },
    { label: 'Editing', value: 'Vector editors' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Raster JPG image' },
    { label: 'Best for', value: 'Web & sharing' },
    { label: 'Compatibility', value: 'Universal' },
    { label: 'File Size', value: 'Smaller' },
    { label: 'Quality', value: 'Good' },
    { label: 'Use Case', value: 'Everyday viewing' }
  ],

  features: [
    'Quick SVG to JPG conversion online.',
    'Compatible with all devices.',
    'Secure file handling with automatic deletion.',
    'Supports batch SVG files.',
    'No software installations required.',
    'API available at https://microjpeg.com/api-docs for developers.'
  ],

  deviceSupportText: [
    'You can convert SVG to JPG on any device:',
    'Windows PCs',
    'macOS computers',
    'Linux systems',
    'Android devices',
    'iPhones and iPads',
    'Every modern browser'
  ],

  relatedConversions: [
    { label: 'SVG to PNG', href: '/convert/svg-to-png' },
    { label: 'SVG to TIFF', href: '/convert/svg-to-tiff' },
    { label: 'SVG to WebP', href: '/convert/svg-to-webp' },
    { label: 'SVG to AVIF', href: '/convert/svg-to-avif' }
  ]
},

// =========================================================================
// 46. Convert SVG TO PNG
// =========================================================================
'svg-png': {
  metaTitle: 'Convert SVG to PNG Online – Vector to PNG Converter | MicroJPEG',
  metaDescription:
    'Convert SVG images to PNG online with MicroJPEG. Get crisp, lossless PNG results — perfect for editing, design, and transparency.',

  headline: 'Convert SVG to PNG Online',
  subheadline: 'Lossless PNG Output',
  heroDescription:
    'Convert your SVG vector graphics into high-quality PNG images directly in your browser — ideal for design and transparency workflows.',

  intro:
    'SVG is perfect for vector assets but often needs conversion to raster formats like PNG for editing, transparency, and compatibility with many tools. With MicroJPEG, you can convert SVG to PNG online in a few clicks and download crisp results instantly.',

  whatIsTitle: 'What Is an SVG File?',
  whatIsContent:
    'SVG (Scalable Vector Graphics) is a vector format that scales infinitely without losing clarity. It stores graphics using shapes and paths, making it ideal for logos, charts, and interactive web visuals.',

  whyConvertTitle: 'Why Convert SVG to PNG?',
  whyConvertReasons: [
    'PNG preserves lossless detail.',
    'Supports transparency.',
    'Great for editing and design tools.',
    'Better support for raster apps.',
    'More predictable appearance across uses.'
  ],

  howToTitle: 'How to Convert SVG to PNG on MicroJPEG',
  howToSteps: [
    'Go to https://microjpeg.com/convert/svg-to-png.',
    'Drag your SVG file into the uploader.',
    'MicroJPEG will convert it into a PNG automatically.',
    'Wait for conversion to complete.',
    'Download your new PNG file.',
    'See https://microjpeg.com/pricing and https://microjpeg.com/api-docs for advanced options.'
  ],

  comparisonTitle: 'SVG vs PNG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Vector image' },
    { label: 'Resolution', value: 'Infinite' },
    { label: 'Best for', value: 'Icons, graphics, UI' },
    { label: 'Compatibility', value: 'Web & vector apps' },
    { label: 'File Size', value: 'Small' },
    { label: 'Editing', value: 'Vector editors' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless raster PNG' },
    { label: 'Best for', value: 'Editing & transparency' },
    { label: 'Compatibility', value: 'Broad app support' },
    { label: 'File Size', value: 'Medium' },
    { label: 'Transparency', value: 'Yes' },
    { label: 'Use Case', value: 'Design workflows' }
  ],

  features: [
    'High-quality SVG to PNG results.',
    'Browser-based and secure.',
    'Temporary file auto deletion.',
    'Batch conversion supported.',
    'No software required.',
    'APIs at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert SVG to PNG from any device:',
    'Windows PCs',
    'macOS systems',
    'Linux machines',
    'Android phones',
    'iPhones and iPads',
    'Modern browsers'
  ],

  relatedConversions: [
    { label: 'SVG to JPG', href: '/convert/svg-to-jpg' },
    { label: 'SVG to TIFF', href: '/convert/svg-to-tiff' },
    { label: 'SVG to WebP', href: '/convert/svg-to-webp' },
    { label: 'SVG to AVIF', href: '/convert/svg-to-avif' }
  ]
},


// =========================================================================
// 47. Convert SVG TO WEBP
// =========================================================================
'svg-webp': {
  metaTitle: 'Convert SVG to WebP Online – Vector to WebP Converter | MicroJPEG',
  metaDescription:
    'Convert SVG vector images to WebP online with MicroJPEG. Get web-optimized, small images with good quality — fast and easy.',

  headline: 'Convert SVG to WebP Online',
  subheadline: 'Web-Ready Vector Conversion',
  heroDescription:
    'Convert your SVG graphics into efficient WebP images ideal for websites, blogs, and mobile apps — all within your browser.',

  intro:
    'WebP is a modern web image format offering excellent compression and good visual quality. When you convert SVG vector graphics to WebP, you get lightweight, web-optimized images perfect for fast page loads and responsive designs. MicroJPEG makes this conversion simple and free online.',

  whatIsTitle: 'What Is an SVG File?',
  whatIsContent:
    'SVG is a vector image format using XML to describe shapes and paths. It delivers resolution-independent graphics that remain sharp at any size and is widely used for UI and web visuals.',

  whyConvertTitle: 'Why Convert SVG to WebP?',
  whyConvertReasons: [
    'WebP provides smaller file size for web delivery.',
    'Improves page load performance.',
    'Excellent support across modern browsers.',
    'Maintains visual quality with compression.',
    'Great for responsive and mobile designs.'
  ],

  howToTitle: 'How to Convert SVG to WebP on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/svg-to-webp.',
    'Upload your SVG file via drag & drop.',
    'MicroJPEG automatically converts to WebP.',
    'Wait while processing completes.',
    'Download your WebP image.',
    'For automation and higher limits see https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'SVG vs WebP – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Vector SVG' },
    { label: 'Resolution', value: 'Infinite' },
    { label: 'Best for', value: 'UI & vector graphics' },
    { label: 'Compatibility', value: 'Vector editors & browsers' },
    { label: 'File Size', value: 'Small' },
    { label: 'Editing', value: 'Vector tools' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Compressed WebP image' },
    { label: 'Best for', value: 'Web & apps' },
    { label: 'Compatibility', value: 'Modern browsers' },
    { label: 'File Size', value: 'Smallest' },
    { label: 'Quality', value: 'Good' },
    { label: 'Use Case', value: 'Fast delivery images' }
  ],

  features: [
    'Quick browser-based SVG to WebP conversion.',
    'Secure with temporary file deletion.',
    'Small file sizes ideal for web.',
    'Batch upload support.',
    'No installation needed.',
    'APIs at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert SVG to WebP on any device:',
    'Windows PCs',
    'macOS systems',
    'Linux machines',
    'Android phones',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'SVG to JPG', href: '/convert/svg-to-jpg' },
    { label: 'SVG to PNG', href: '/convert/svg-to-png' },
    { label: 'SVG to TIFF', href: '/convert/svg-to-tiff' },
    { label: 'SVG to AVIF', href: '/convert/svg-to-avif' }
  ]
},

// =========================================================================
// 48. Convert SVG TO AVIF
// =========================================================================
'svg-avif': {
  metaTitle: 'Convert SVG to AVIF Online – Web-Optimized AVIF from Vector | MicroJPEG',
  metaDescription:
    'Convert SVG images to AVIF online with MicroJPEG. Get state-of-the-art compression with excellent quality — fast browser-based conversion.',

  headline: 'Convert SVG to AVIF Online',
  subheadline: 'Next-Gen Web Format from Vector',
  heroDescription:
    'Transform your SVG vector images into efficient AVIF files suitable for modern web and mobile use — all in your browser.',

  intro:
    'AVIF is a next-generation image format that provides very high compression with strong visual quality. When you convert SVG graphics to AVIF, you get lightweight files that load fast and deliver great performance across modern websites and apps. With MicroJPEG this conversion is fast, simple, and free.',

  whatIsTitle: 'What Is an SVG File?',
  whatIsContent:
    'SVG (Scalable Vector Graphics) is a vector format that uses XML to describe scalable shapes, paths, and colors — perfect for icons, illustrations, maps, and UI graphics that retain clarity at any size.',

  whyConvertTitle: 'Why Convert SVG to AVIF?',
  whyConvertReasons: [
    'AVIF delivers tiny file sizes with strong visual quality.',
    'Great for fast web pages and mobile apps.',
    'Superior compression over older formats.',
    'Excellent browser support for performance images.',
    'Ideal for large icon sets and responsive graphics.'
  ],

  howToTitle: 'How to Convert SVG to AVIF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/svg-to-avif.',
    'Upload your SVG files into the uploader.',
    'MicroJPEG automatically converts them to AVIF.',
    'Wait for the conversion to finish.',
    'Download your AVIF images.',
    'For premium limits and APIs, check https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'SVG vs AVIF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Vector SVG' },
    { label: 'Scalability', value: 'Infinite resolution' },
    { label: 'Best for', value: 'Vector workflows' },
    { label: 'Compatibility', value: 'Vector editors' },
    { label: 'Use Case', value: 'Design & UI' },
    { label: 'File Size', value: 'Small text size' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Modern AVIF image' },
    { label: 'Best for', value: 'Web & apps' },
    { label: 'Compatibility', value: 'Modern browsers' },
    { label: 'File Size', value: 'Very small' },
    { label: 'Quality', value: 'High' },
    { label: 'Use Case', value: 'High performance delivery' }
  ],

  features: [
    'Advanced AVIF compression from SVG.',
    'Fast browser conversion experience.',
    'Secure handling with auto deletion.',
    'Batch SVG support available.',
    'No software installation required.',
    'APIs available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert SVG to AVIF on:',
    'Windows PCs',  
    'macOS systems',
    'Linux computers',
    'Android phones',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'SVG to JPG', href: '/convert/svg-to-jpg' },
    { label: 'SVG to PNG', href: '/convert/svg-to-png' },
    { label: 'SVG to TIFF', href: '/convert/svg-to-tiff' },
    { label: 'SVG to WebP', href: '/convert/svg-to-webp' }
  ]
},


  // =========================================================================
  // 49. PNG to JPG
  // =========================================================================
  'png-jpg': {
    metaTitle: 'PNG to JPG Converter - Free Online | MicroJPEG',
    metaDescription: 'Convert PNG images to JPG online free. Reduce file sizes by 60-80% while maintaining quality. No signup, instant conversion.',
    
    headline: 'Convert PNG to JPG Online',
    subheadline: 'Free & Instant',
    heroDescription: 'Reduce PNG file sizes by 60-80% by converting to optimized JPG format.',
    
    intro: 'MicroJPEG converts PNG images to compressed JPG format instantly. Reduce file sizes dramatically while maintaining visual quality — perfect for web optimization, email attachments, and social media. No signup required, conversion happens instantly in your browser.',
    
    whatIsTitle: 'What is PNG Format?',
    whatIsContent: 'PNG (Portable Network Graphics) is a lossless image format that supports transparency and preserves perfect quality. While PNG is excellent for graphics, logos, and images requiring transparency, the lossless compression results in larger file sizes compared to JPG. For photographs and images where transparency isn\'t needed, converting to JPG significantly reduces file size.',
    
    whyConvertTitle: 'Why Convert PNG to JPG?',
    whyConvertReasons: [
      'Reduce file sizes by 60-80% — a 5MB PNG often becomes a 1MB JPG',
      'Faster website loading — smaller images improve page speed and SEO',
      'Meet email attachment limits — JPG files are more email-friendly',
      'Save storage space — store more photos in the same space',
      'Faster uploads to social media and cloud services',
      'Better compatibility with older software and devices'
    ],
    
    howToTitle: 'How to Convert PNG to JPG',
    howToSteps: [
      'Upload your PNG images using the upload button or drag-and-drop',
      'MicroJPEG automatically converts to optimized JPG format',
      'Adjust quality settings — 80-90% recommended for best balance',
      'Preview the converted images to verify quality',
      'Download your compressed JPG files'
    ],
    
    comparisonTitle: 'PNG vs JPG: Format Comparison',
    sourceInfo: [
      { label: 'Format', value: 'PNG' },
      { label: 'Compression', value: 'Lossless' },
      { label: 'File Size', value: 'Larger' },
      { label: 'Transparency', value: 'Supported' },
      { label: 'Best For', value: 'Graphics, screenshots, logos' },
      { label: 'Color Support', value: 'Full color + alpha channel' }
    ],
    targetInfo: [
      { label: 'Format', value: 'JPG (JPEG)' },
      { label: 'Compression', value: 'Lossy' },
      { label: 'File Size', value: '60-80% smaller' },
      { label: 'Transparency', value: 'Not supported' },
      { label: 'Best For', value: 'Photos, web images' },
      { label: 'Color Support', value: 'Full color, no alpha' }
    ],
    
    features: [
      'Instant conversion — results in seconds',
      'Batch processing — convert multiple PNGs at once',
      'Quality control — adjust compression level',
      'Background color option — choose color for transparent areas',
      'No signup required — start converting immediately',
      'Browser-based — no software installation'
    ],
    
    deviceSupportText: 'Works on all devices with a modern browser — Windows, Mac, Linux, iOS, Android.',
    
    sections: [
      {
        title: 'When to Keep PNG vs Convert to JPG',
        body: 'Keep PNG for: images with transparency, logos, graphics with text, screenshots with sharp edges, and images you\'ll edit multiple times. Convert to JPG for: photographs, images for web/email where small size matters, and any image where transparency isn\'t needed.'
      },
      {
        title: 'Handling Transparency',
        body: 'JPG format doesn\'t support transparency. When converting PNG images with transparent areas, those areas become white by default. You can choose a different background color if needed for your use case.'
      }
    ],
    
    relatedConversions: [
      { label: 'PNG to WebP', href: '/convert/png-to-webp' },
      { label: 'PNG to AVIF', href: '/convert/png-to-avif' },
      { label: 'PNG to TIFF', href: '/convert/png-to-tiff' }
    ]
  },

  // =========================================================================
//  50. Convert PNG TO TIFF
// =========================================================================
'png-tiff': {
  metaTitle: 'Convert PNG to TIFF Online – Lossless PNG to TIFF Converter | MicroJPEG',
  metaDescription:
    'Convert PNG images to high-quality TIFF online with MicroJPEG. Get lossless TIFF output fast and securely in your browser.',

  headline: 'Convert PNG to TIFF Online',
  subheadline: 'Lossless TIFF from PNG',
  heroDescription:
    'Turn your PNG images into professional, high-fidelity TIFF files right in your browser — ideal for printing, editing, and archival.',

  intro:
    'PNG is a popular lossless image format used widely online and for design. TIFF offers even broader support in professional and print workflows, making PNG to TIFF conversion useful for designers, photographers, and editors. MicroJPEG makes this process fast and easy — just upload your PNG file, and download a TIFF image in seconds.',

  whatIsTitle: 'What Is a PNG File?',
  whatIsContent:
    'PNG (Portable Network Graphics) is a lossless raster image format that supports full color and alpha transparency. It is widely used for graphics, presentations, and web images where quality is important.',

  whyConvertTitle: 'Why Convert PNG to TIFF?',
  whyConvertReasons: [
    'TIFF is ideal for professional printing and publishing.',
    'Better compatibility with pro editing tools.',
    'Preserves full image fidelity.',
    'Useful for archival and master formats.',
    'Supports multi-page and rich metadata.'
  ],

  howToTitle: 'How to Convert PNG to TIFF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/png-to-tiff.',
    'Drag and drop your PNG image into the upload area.',
    'MicroJPEG automatically converts your PNG to TIFF.',
    'Wait a moment for processing.',
    'Download your TIFF file.',
    'For API and premium options, visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'PNG vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Lossless raster image' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'Transparency', value: 'Yes' },
    { label: 'Best for', value: 'Web, design, graphics' },
    { label: 'Compatibility', value: 'Standard image apps' },
    { label: 'File Size', value: 'Medium' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Professional raster image' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'Transparency', value: 'Yes' },
    { label: 'Best for', value: 'Printing & archival' },
    { label: 'Compatibility', value: 'Professional tools' },
    { label: 'File Size', value: 'Large' }
  ],

  features: [
    'High-quality TIFF output from PNG.',
    'Fast, browser-based conversion.',
    'Secure, temporary processing with auto deletion.',
    'Batch file support.',
    'No software installation required.',
    'Developer API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert PNG to TIFF on any device:',
    'Windows PCs',
    'macOS devices',
    'Linux computers',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'PNG to WebP', href: '/convert/png-to-webp' },
    { label: 'PNG to AVIF', href: '/convert/png-to-avif' },
    { label: 'TIFF to JPG', href: '/convert/tiff-to-jpg' },
    { label: 'TIFF to WebP', href: '/convert/tiff-to-webp' }
  ]
},

// =========================================================================
//  51. Convert PNG TO WEBP
// =========================================================================
'png-webp': {
  metaTitle: 'Convert PNG to WebP Online – Efficient PNG to WebP Converter | MicroJPEG',
  metaDescription:
    'Convert PNG images to WebP online with MicroJPEG. Get web-optimized images with good quality and smaller file sizes — fast and secure.',

  headline: 'Convert PNG to WebP Online',
  subheadline: 'Web-Friendly WebP Output',
  heroDescription:
    'Turn your PNG images into modern WebP format for fast web delivery and responsive performance — directly in your browser.',

  intro:
    'WebP is a modern image format designed for web optimization, offering smaller file sizes without sacrificing much visual quality. Converting PNG to WebP helps your websites load faster and reduces bandwidth usage, all while keeping good visual clarity. MicroJPEG provides fast, online PNG to WebP conversion without the need for software.',

  whatIsTitle: 'What Is a PNG File?',
  whatIsContent:
    'PNG (Portable Network Graphics) is a lossless image format that preserves full color and transparency. It is widely used for crisp graphics, user interfaces, and design elements.',

  whyConvertTitle: 'Why Convert PNG to WebP?',
  whyConvertReasons: [
    'WebP offers smaller file sizes for faster page loads.',
    'Improves performance on websites and apps.',
    'Good balance of compression and quality.',
    'Supported by most modern browsers.',
    'Ideal for responsive and mobile experiences.'
  ],

  howToTitle: 'How to Convert PNG to WebP on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/png-to-webp.',
    'Upload your PNG image by dragging it into the upload area.',
    'MicroJPEG automatically converts to WebP.',
    'Wait for the processing to finish.',
    'Download your WebP image.',
    'See https://microjpeg.com/pricing and https://microjpeg.com/api-docs for more features.'
  ],

  comparisonTitle: 'PNG vs WebP – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Lossless raster image' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'Transparency', value: 'Yes' },
    { label: 'Best for', value: 'Design & graphics' },
    { label: 'Compatibility', value: 'Standard image apps' },
    { label: 'File Size', value: 'Medium' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Web optimized image' },
    { label: 'Compression', value: 'Lossy & lossless' },
    { label: 'Transparency', value: 'Yes' },
    { label: 'Best for', value: 'Web & apps' },
    { label: 'Compatibility', value: 'Modern browsers' },
    { label: 'File Size', value: 'Small' }
  ],

  features: [
    'Fast WebP output from PNG.',
    'Browser-based conversion with no software.',
    'Secure temporary file handling.',
    'Batch PNG support.',
    'Improved web performance.',
    'Developer API support at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert PNG to WebP on:',
    'Windows systems',
    'macOS devices',
    'Linux computers',
    'Android phones',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'PNG to TIFF', href: '/convert/png-to-tiff' },
    { label: 'PNG to AVIF', href: '/convert/png-to-avif' },
    { label: 'WebP to JPG', href: '/convert/webp-to-jpg' },
    { label: 'WebP to PNG', href: '/convert/webp-to-png' }
  ]
},

// =========================================================================
//  52. Convert PNG TO AVIF
// =========================================================================
'png-avif': {
  metaTitle: 'Convert PNG to AVIF Online – Modern Compression | MicroJPEG',
  metaDescription:
    'Convert PNG images to AVIF format online with MicroJPEG. Achieve very small files and great quality for web use — fast and secure.',

  headline: 'Convert PNG to AVIF Online',
  subheadline: 'Next-Gen Web Format',
  heroDescription:
    'Turn your PNG images into ultra-efficient AVIF files ideal for modern web and app delivery — all in your browser.',

  intro:
    'AVIF is a next-generation image format offering higher compression efficiency than older formats. By converting PNG to AVIF you get very small image sizes with strong visual quality — perfect for today’s performance-focused web and mobile experiences. MicroJPEG provides fast, online PNG to AVIF conversion with ease.',

  whatIsTitle: 'What Is a PNG File?',
  whatIsContent:
    'PNG is a lossless image format that preserves complete visual detail and supports transparency. It is widely used in graphics, UI design, and web assets where quality is critical.',

  whyConvertTitle: 'Why Convert PNG to AVIF?',
  whyConvertReasons: [
    'AVIF delivers significantly smaller file sizes.',
    'Excellent visual quality at high compression.',
    'Great for modern web performance.',
    'Reduces bandwidth for mobile users.',
    'Supported by most modern browsers.'
  ],

  howToTitle: 'How to Convert PNG to AVIF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/png-to-avif.',
    'Drag and drop your PNG images into the upload area.',
    'MicroJPEG automatically converts them to AVIF.',
    'Wait while processing completes.',
    'Download your AVIF files.',
    'For automation and higher limits, visit https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'PNG vs AVIF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Lossless PNG' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'Transparency', value: 'Yes' },
    { label: 'Best for', value: 'Graphics & editing' },
    { label: 'Compatibility', value: 'Broad support' },
    { label: 'File Size', value: 'Medium' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Modern web image' },
    { label: 'Compression', value: 'Advanced AV1' },
    { label: 'Transparency', value: 'Yes' },
    { label: 'Best for', value: 'Web & apps' },
    { label: 'Compatibility', value: 'Modern browsers' },
    { label: 'File Size', value: 'Very small' }
  ],

  features: [
    'High-efficiency AVIF compression.',
    'Fast, browser-based conversion.',
    'Secure temporary file cleaning.',
    'Batch PNG support.',
    'Great visual quality at small sizes.',
    'API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert PNG to AVIF on any device:',
    'Windows PCs',
    'macOS systems',
    'Linux machines',
    'Android phones',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'PNG to TIFF', href: '/convert/png-to-tiff' },
    { label: 'PNG to WebP', href: '/convert/png-to-webp' },
    { label: 'WebP to AVIF', href: '/convert/webp-to-avif' },
    { label: 'AVIF to JPG', href: '/convert/avif-to-jpg' }
  ]
},


  // =========================================================================
  // 53. JPG to PNG
  // =========================================================================
  'jpg-png': {
    metaTitle: 'JPG to PNG Converter - Free Online | MicroJPEG',
    metaDescription: 'Convert JPG images to PNG online free. Lossless format for editing and graphics. No signup required.',
    
    headline: 'Convert JPG to PNG Online',
    subheadline: 'Free & Instant',
    heroDescription: 'Convert JPEG images to lossless PNG format for editing and graphic design.',
    
    intro: 'MicroJPEG converts JPG images to PNG format instantly. PNG\'s lossless compression prevents further quality degradation when you edit and re-save. Perfect for graphic design projects, adding to presentations, or when you need a non-lossy format.',
    
    whatIsTitle: 'Why Convert JPG to PNG?',
    whatIsContent: 'While JPG to PNG conversion won\'t restore quality lost in the original JPG compression, it prevents additional quality loss in future edits. PNG is also required when you need to add transparency or when working with graphic design software that prefers lossless formats.',
    
    whyConvertTitle: 'Why Convert JPG to PNG?',
    whyConvertReasons: [
      'Prevent further quality loss — PNG won\'t degrade with re-saves',
      'Prepare for editing — many design tools work better with PNG',
      'Add to presentations — PNG often renders more sharply',
      'Combine with graphics — PNG works better in design compositions',
      'Archival purposes — lossless format for long-term storage',
      'Print preparation — some print workflows prefer PNG'
    ],
    
    howToTitle: 'How to Convert JPG to PNG',
    howToSteps: [
      'Upload your JPG images to the converter',
      'MicroJPEG converts to PNG format automatically',
      'Preview the converted images',
      'Download PNG files individually or as ZIP'
    ],
    
    comparisonTitle: 'JPG vs PNG: Format Comparison',
    sourceInfo: [
      { label: 'Format', value: 'JPG (JPEG)' },
      { label: 'Compression', value: 'Lossy' },
      { label: 'File Size', value: 'Smaller' },
      { label: 'Quality on Re-save', value: 'Degrades' },
      { label: 'Transparency', value: 'Not supported' }
    ],
    targetInfo: [
      { label: 'Format', value: 'PNG' },
      { label: 'Compression', value: 'Lossless' },
      { label: 'File Size', value: 'Larger' },
      { label: 'Quality on Re-save', value: 'Preserved' },
      { label: 'Transparency', value: 'Supported' }
    ],
    
    features: [
      'Instant conversion — no waiting',
      'Batch processing — convert multiple files',
      'No quality settings needed — PNG is lossless',
      'Browser-based — works everywhere',
      'No signup required'
    ],
    
    deviceSupportText: 'Works on all devices with a modern browser.',
    
    sections: [
      {
        title: 'Understanding the Conversion',
        body: 'Converting from JPG to PNG doesn\'t improve image quality or restore details lost in JPG compression. However, it does prevent any additional quality loss when you edit and save the file multiple times. The resulting PNG will have the same visual quality as the source JPG, but in a lossless format.'
      }
    ],
    
    relatedConversions: [
      { label: 'JPG to AVIF', href: '/convert/jpg-to-avif' },
      { label: 'JPG to WebP', href: '/convert/jpg-to-webp' },
      { label: 'JPG to TIFF', href: '/compress/jpg-to-tiff' }
    ]
  },

  

  // =========================================================================
  // 54. JPG to WEBP
  // =========================================================================
  'jpg-webp': {
    metaTitle: 'JPG to WebP Converter - Free Online | MicroJPEG',
    metaDescription: 'Convert JPG images to WebP online free. Reduce file sizes by 25-35% for faster websites. Instant conversion.',
    
    headline: 'Convert JPG to WebP Online',
    subheadline: 'Free & Instant',
    heroDescription: 'Reduce image sizes by 25-35% with WebP format for faster website loading.',
    
    intro: 'MicroJPEG converts JPG images to WebP format instantly. WebP provides 25-35% smaller file sizes than JPG at equivalent visual quality — essential for website performance, Core Web Vitals, and page speed optimization.',
    
    whatIsTitle: 'What is WebP Format?',
    whatIsContent: 'WebP is a modern image format developed by Google that provides superior compression compared to both JPG and PNG. WebP is now supported by 97%+ of browsers worldwide (Chrome, Firefox, Safari 14+, Edge) and is the recommended format for web images. Converting your JPG images to WebP can significantly improve website loading speed.',
    
    whyConvertTitle: 'Why Convert JPG to WebP?',
    whyConvertReasons: [
      'Smaller file sizes — 25-35% smaller than JPG at same quality',
      'Faster websites — smaller images mean faster page loads',
      'Better SEO — Google rewards fast-loading pages',
      'Improved Core Web Vitals — WebP helps LCP and page weight metrics',
      'Lower bandwidth costs — serve smaller files to users',
      'Modern standard — WebP is the current web best practice'
    ],
    
    howToTitle: 'How to Convert JPG to WebP',
    howToSteps: [
      'Upload your JPG images to the converter',
      'MicroJPEG converts to optimized WebP format',
      'Adjust quality settings — 80-85% recommended for web',
      'Download your WebP files for your website'
    ],
    
    comparisonTitle: 'JPG vs WebP: Format Comparison',
    sourceInfo: [
      { label: 'Format', value: 'JPG (JPEG)' },
      { label: 'Compression', value: 'Lossy' },
      { label: 'Efficiency', value: 'Good' },
      { label: 'Browser Support', value: '100%' }
    ],
    targetInfo: [
      { label: 'Format', value: 'WebP' },
      { label: 'Compression', value: 'Lossy/Lossless' },
      { label: 'Efficiency', value: '25-35% better' },
      { label: 'Browser Support', value: '97%+' }
    ],
    
    features: [
      'Optimized compression — best WebP settings for web use',
      'Batch processing — convert entire image folders',
      'Quality control — balance size vs quality',
      'No signup required — start converting immediately',
      'Browser-based — no software installation'
    ],
    
    deviceSupportText: 'Convert on any device, then use WebP images on your website.',
    
    sections: [
      {
        title: 'WebP Browser Support',
        body: 'WebP is supported by Chrome, Firefox, Edge, Safari (14+), and Opera — covering 97%+ of web users. For the remaining 3%, you can use the <picture> element to provide JPG fallbacks, though this is rarely needed in 2025.'
      }
    ],
    
    relatedConversions: [
      { label: 'JPG to PNG', href: '/convert/jpg-to-png' },
      { label: 'JPG to TIFF', href: '/convert/jpg-to-tiff' },
      { label: 'JPG to AVIF', href: '/convert/jpg-to-avif' }
      
    ]
  },


  // =========================================================================
//  55. Convert JPG TO TIFF
// =========================================================================
'jpg-tiff': {
  metaTitle: 'Convert JPG to TIFF Online – High-Quality JPG to TIFF Converter | MicroJPEG',
  metaDescription:
    'Convert JPG images to high-quality TIFF online with MicroJPEG. Lossless TIFF conversion from JPG that works fast in your browser.',

  headline: 'Convert JPG to TIFF Online',
  subheadline: 'Lossless TIFF from JPG',
  heroDescription:
    'Quickly convert your JPG images into high-fidelity TIFF files — perfect for print, editing, and archiving — directly in your browser.',

  intro:
    'JPG is the most commonly used image format for everyday photos, but when you need a lossless format for editing, printing, or archiving, TIFF is often a better choice. With MicroJPEG, converting JPG to TIFF happens online in seconds — no software installation needed. Simply upload your JPG file and download your new TIFF image.',

  whatIsTitle: 'What Is a JPG File?',
  whatIsContent:
    'JPG (or JPEG) is a compressed image format widely used for digital photos, websites, and social media. It uses lossy compression to reduce file size — ideal for everyday use but not ideal when maximum quality is needed.',

  whyConvertTitle: 'Why Convert JPG to TIFF?',
  whyConvertReasons: [
    'TIFF is lossless and preserves image detail.',
    'Great choice for printing and publishing.',
    'Better suited for professional editing workflows.',
    'Useful for archival storage of master images.',
    'Supports high-quality color data and metadata.'
  ],

  howToTitle: 'How to Convert JPG to TIFF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/jpg-to-tiff.',
    'Drag and drop your JPG file into the upload area.',
    'MicroJPEG automatically converts it to TIFF.',
    'Wait for the conversion to complete.',
    'Download your TIFF image.',
    'For premium limits or API access see https://microjpeg.com/pricing and https://microjpeg.com/api-docs.'
  ],

  comparisonTitle: 'JPG vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Compressed raster image' },
    { label: 'Compression', value: 'Lossy' },
    { label: 'Best for', value: 'Web & everyday use' },
    { label: 'File Size', value: 'Small' },
    { label: 'Compatibility', value: 'Very broad' },
    { label: 'Typical Use', value: 'Everyday photos' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless raster image' },
    { label: 'Compression', value: 'None or lossless' },
    { label: 'Best for', value: 'Professional workflows' },
    { label: 'File Size', value: 'Large' },
    { label: 'Compatibility', value: 'Editing & print tools' },
    { label: 'Typical Use', value: 'Archival & print' }
  ],

  features: [
    'High-quality TIFF output from JPG.',
    'Fast browser-based conversion.',
    'Secure temporary processing with auto deletion.',
    'Batch image support.',
    'No installation required — works in the browser.',
    'API available for automation at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert JPG to TIFF on any device including:',
    'Windows PCs',
    'macOS systems',
    'Linux computers',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'JPG to WebP', href: '/convert/jpg-to-webp' },
    { label: 'JPG to AVIF', href: '/convert/jpg-to-avif' },
    { label: 'TIFF to JPG', href: '/convert/tiff-to-jpg' },
    { label: 'TIFF to WebP', href: '/convert/tiff-to-webp' }
  ]
},

// =========================================================================
// 56. Convert JPG TO AVIF
// =========================================================================
'jpg-avif': {
  metaTitle: 'Convert JPG to AVIF Online – Efficient JPG to AVIF Converter | MicroJPEG',
  metaDescription:
    'Convert JPG images to AVIF online with MicroJPEG for smaller file sizes and excellent quality. Fast, secure, browser-based jpg to avif converter.',

  headline: 'Convert JPG to AVIF Online',
  subheadline: 'Modern, Compact AVIF Output',
  heroDescription:
    'Transform your JPG images into AVIF format for ultra-efficient compression, ideal for modern websites, mobile apps, and performance-focused design.',

  intro:
    'AVIF is a next-generation image format that delivers superior compression and excellent visual quality. When you convert JPG files to AVIF, you get significantly smaller file sizes with strong fidelity. MicroJPEG lets you do this quickly and easily online — just upload your JPG and download high-quality AVIF.',

  whatIsTitle: 'What Is a JPG File?',
  whatIsContent:
    'JPG (JPEG) is a highly popular compressed raster image format used around the world for photos, galleries, websites, and social media. Its lossy compression keeps file sizes small, making it ideal for everyday sharing and storage.',

  whyConvertTitle: 'Why Convert JPG to AVIF?',
  whyConvertReasons: [
    'AVIF offers much smaller file sizes than JPG.',
    'Great for faster-loading websites and apps.',
    'Excellent visual quality with modern compression.',
    'Reduces bandwidth on mobile and desktop.',
    'Supported by modern browsers for web use.'
  ],

  howToTitle: 'How to Convert JPG to AVIF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/jpg-to-avif.',
    'Drag and drop your JPG file into the upload area.',
    'MicroJPEG automatically converts it to AVIF.',
    'Wait while the conversion completes.',
    'Download your AVIF image.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for more features and automation.'
  ],

  comparisonTitle: 'JPG vs AVIF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Compressed raster image' },
    { label: 'Compression', value: 'Lossy' },
    { label: 'Best for', value: 'Web & everyday use' },
    { label: 'File Size', value: 'Small' },
    { label: 'Compatibility', value: 'Very broad' },
    { label: 'Typical Use', value: 'General photo sharing' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Modern compressed image' },
    { label: 'Compression', value: 'Advanced AV1' },
    { label: 'Best for', value: 'Web performance' },
    { label: 'File Size', value: 'Very Small' },
    { label: 'Compatibility', value: 'Supported by modern browsers' },
    { label: 'Typical Use', value: 'Web & app delivery' }
  ],

  features: [
    'Efficient AVIF compression from JPG sources.',
    'Fast, browser-based conversion.',
    'Secure handling with temporary file cleanup.',
    'Batch conversions supported.',
    'Improved web performance with smaller images.',
    'Developer API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert JPG to AVIF on any device including:',
    'Windows PCs',
    'macOS systems',
    'Linux computers',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'JPG to WebP', href: '/convert/jpg-to-webp' },
    { label: 'JPG to TIFF', href: '/convert/jpg-to-tiff' },
    { label: 'AVIF to JPG', href: '/convert/avif-to-jpg' },
    { label: 'WebP to AVIF', href: '/convert/webp-to-avif' }
  ]
},


// =========================================================================
// 57. Convert AVIF TO TIFF
// =========================================================================
'avif-tiff': {
  metaTitle: 'Convert AVIF to TIFF Online – Professional AVIF to TIFF Converter | MicroJPEG',
  metaDescription:
    'Convert AVIF images to TIFF online with MicroJPEG for professional-grade, lossless output. Fast, secure, browser-based avif to tiff converter for photography and print.',

  headline: 'Convert AVIF to TIFF Online',
  subheadline: 'Professional, Lossless TIFF Output',
  heroDescription:
    'Transform your AVIF images into TIFF format for professional photography, archival storage, and print production. Get lossless quality with full color depth preservation.',

  intro:
    'TIFF is the industry standard for professional photography, print production, and long-term archival storage. When you convert AVIF files to TIFF, you get uncompressed or losslessly compressed images with complete color information. MicroJPEG lets you do this quickly online – just upload your AVIF and download professional-grade TIFF.',

  whatIsTitle: 'What Is an AVIF File?',
  whatIsContent:
    'AVIF is a modern compressed image format that delivers superior compression and excellent visual quality. Based on AV1 video codec technology, AVIF provides smaller file sizes than JPG and WebP while maintaining high image quality, making it ideal for web delivery.',

  whyConvertTitle: 'Why Convert AVIF to TIFF?',
  whyConvertReasons: [
    'TIFF preserves maximum image quality for professional use.',
    'Essential for print production and commercial photography.',
    'Supports multiple layers, transparency, and color profiles.',
    'Industry standard for archival and long-term storage.',
    'Compatible with all professional editing software.',
    'No generation loss when editing and re-saving.'
  ],

  howToTitle: 'How to Convert AVIF to TIFF on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/avif-to-tiff.',
    'Drag and drop your AVIF file into the upload area.',
    'MicroJPEG automatically converts it to TIFF.',
    'Wait while the conversion completes.',
    'Download your professional TIFF image.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for batch processing and automation.'
  ],

  comparisonTitle: 'AVIF vs TIFF – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Modern compressed image' },
    { label: 'Compression', value: 'Advanced AV1' },
    { label: 'Best for', value: 'Web performance' },
    { label: 'File Size', value: 'Very Small' },
    { label: 'Compatibility', value: 'Modern browsers' },
    { label: 'Typical Use', value: 'Web & app delivery' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Professional raster image' },
    { label: 'Compression', value: 'Lossless or uncompressed' },
    { label: 'Best for', value: 'Print & archival' },
    { label: 'File Size', value: 'Large' },
    { label: 'Compatibility', value: 'Professional software' },
    { label: 'Typical Use', value: 'Photography & printing' }
  ],

  features: [
    'Professional-grade TIFF output from AVIF sources.',
    'Lossless quality preservation.',
    'Fast, browser-based conversion.',
    'Secure handling with automatic file cleanup.',
    'Batch conversions supported for multiple files.',
    'Developer API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert AVIF to TIFF on any device including:',
    'Windows PCs',
    'macOS systems',
    'Linux computers',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'AVIF to JPG', href: '/convert/avif-to-jpg' },
    { label: 'AVIF to PNG', href: '/convert/avif-to-png' },
    { label: 'AVIF to WebP', href: '/convert/avif-to-webp' },
    { label: 'TIFF to AVIF', href: '/convert/tiff-to-avif' },
    { label: 'JPG to TIFF', href: '/convert/jpg-to-tiff' }
  ]
},

// =========================================================================
// 58. Convert AVIF TO JPG
// =========================================================================
'avif-jpg': {
  metaTitle: 'Convert AVIF to JPG Online – Fast AVIF to JPG Converter | MicroJPEG',
  metaDescription:
    'Convert AVIF images to JPG online with MicroJPEG for universal compatibility. Fast, secure, browser-based avif to jpg converter with high-quality output.',

  headline: 'Convert AVIF to JPG Online',
  subheadline: 'Universal, Compatible JPG Output',
  heroDescription:
    'Transform your AVIF images into universally compatible JPG format. Perfect for sharing, social media, and ensuring compatibility with all devices and platforms.',

  intro:
    'JPG (JPEG) is the most widely supported image format across all devices, browsers, and applications. When you convert AVIF files to JPG, you gain universal compatibility while maintaining excellent visual quality. MicroJPEG makes this conversion instant and easy – just upload your AVIF and download high-quality JPG.',

  whatIsTitle: 'What Is an AVIF File?',
  whatIsContent:
    'AVIF is a next-generation image format that provides superior compression and quality. While AVIF offers smaller file sizes and better quality than JPG, it has limited support in older browsers and applications. Converting to JPG ensures your images work everywhere.',

  whyConvertTitle: 'Why Convert AVIF to JPG?',
  whyConvertReasons: [
    'JPG works on all devices and browsers, including older ones.',
    'Perfect for sharing on social media platforms.',
    'Compatible with all image editing software.',
    'Widely supported across email clients.',
    'Ensures maximum compatibility for client delivery.',
    'Ideal for legacy systems and older devices.'
  ],

  howToTitle: 'How to Convert AVIF to JPG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/avif-to-jpg.',
    'Drag and drop your AVIF file into the upload area.',
    'MicroJPEG automatically converts it to JPG.',
    'Wait while the conversion completes.',
    'Download your universally compatible JPG image.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for automation features.'
  ],

  comparisonTitle: 'AVIF vs JPG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Modern compressed image' },
    { label: 'Compression', value: 'Advanced AV1' },
    { label: 'Best for', value: 'Web performance' },
    { label: 'File Size', value: 'Very Small' },
    { label: 'Compatibility', value: 'Modern browsers only' },
    { label: 'Typical Use', value: 'Modern web delivery' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Compressed raster image' },
    { label: 'Compression', value: 'Lossy' },
    { label: 'Best for', value: 'Universal compatibility' },
    { label: 'File Size', value: 'Small to Medium' },
    { label: 'Compatibility', value: 'Universal' },
    { label: 'Typical Use', value: 'Photos & sharing' }
  ],

  features: [
    'High-quality JPG output from AVIF sources.',
    'Universal device and browser compatibility.',
    'Fast, browser-based conversion.',
    'Secure handling with temporary file cleanup.',
    'Batch conversions supported.',
    'Adjustable quality settings available.',
    'Developer API at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert AVIF to JPG on any device including:',
    'Windows PCs',
    'macOS systems',
    'Linux computers',
    'Android phones and tablets',
    'iPhones and iPads',
    'All browsers (old and new)'
  ],

  relatedConversions: [
    { label: 'AVIF to PNG', href: '/convert/avif-to-png' },
    { label: 'AVIF to WebP', href: '/convert/avif-to-webp' },
    { label: 'AVIF to TIFF', href: '/convert/avif-to-tiff' },
    { label: 'JPG to AVIF', href: '/convert/jpg-to-avif' },
    { label: 'WebP to JPG', href: '/convert/webp-to-jpg' }
  ]
},

// =========================================================================
// 59. Convert AVIF TO PNG
// =========================================================================
'avif-png': {
  metaTitle: 'Convert AVIF to PNG Online – Lossless AVIF to PNG Converter | MicroJPEG',
  metaDescription:
    'Convert AVIF images to PNG online with MicroJPEG for lossless quality and transparency support. Fast, secure, browser-based avif to png converter.',

  headline: 'Convert AVIF to PNG Online',
  subheadline: 'Lossless PNG with Transparency',
  heroDescription:
    'Transform your AVIF images into PNG format for lossless quality, transparency support, and universal compatibility. Perfect for graphics, logos, and images requiring transparent backgrounds.',

  intro:
    'PNG is a lossless image format that preserves perfect quality and supports transparency, making it ideal for graphics, logos, icons, and images with transparent backgrounds. When you convert AVIF files to PNG, you get pixel-perfect quality without compression artifacts. MicroJPEG makes this conversion seamless – just upload your AVIF and download high-quality PNG.',

  whatIsTitle: 'What Is an AVIF File?',
  whatIsContent:
    'AVIF is a modern compressed image format based on AV1 video codec technology. While AVIF excels at compression and web delivery, PNG offers lossless quality and is better suited for graphics requiring transparency or images that need repeated editing without quality loss.',

  whyConvertTitle: 'Why Convert AVIF to PNG?',
  whyConvertReasons: [
    'PNG preserves lossless quality for perfect reproduction.',
    'Supports full transparency and alpha channels.',
    'Ideal for logos, icons, and graphics design.',
    'No compression artifacts or quality degradation.',
    'Compatible with all graphic design software.',
    'Perfect for images requiring repeated editing.'
  ],

  howToTitle: 'How to Convert AVIF to PNG on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/avif-to-png.',
    'Drag and drop your AVIF file into the upload area.',
    'MicroJPEG automatically converts it to PNG.',
    'Wait while the conversion completes.',
    'Download your lossless PNG image.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for bulk conversion features.'
  ],

  comparisonTitle: 'AVIF vs PNG – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Modern compressed image' },
    { label: 'Compression', value: 'Advanced lossy AV1' },
    { label: 'Best for', value: 'Web performance' },
    { label: 'File Size', value: 'Very Small' },
    { label: 'Transparency', value: 'Supported' },
    { label: 'Typical Use', value: 'Web delivery' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Lossless raster image' },
    { label: 'Compression', value: 'Lossless' },
    { label: 'Best for', value: 'Graphics & transparency' },
    { label: 'File Size', value: 'Medium to Large' },
    { label: 'Transparency', value: 'Full alpha support' },
    { label: 'Typical Use', value: 'Logos & graphics' }
  ],

  features: [
    'Perfect lossless PNG output from AVIF sources.',
    'Full transparency and alpha channel preservation.',
    'Fast, browser-based conversion.',
    'Secure handling with automatic cleanup.',
    'Batch conversions supported.',
    'No quality loss during conversion.',
    'Developer API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert AVIF to PNG on any device including:',
    'Windows PCs',
    'macOS systems',
    'Linux computers',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'AVIF to JPG', href: '/convert/avif-to-jpg' },
    { label: 'AVIF to WebP', href: '/convert/avif-to-webp' },
    { label: 'AVIF to TIFF', href: '/convert/avif-to-tiff' },
    { label: 'PNG to AVIF', href: '/convert/png-to-avif' },
    { label: 'WebP to PNG', href: '/convert/webp-to-png' }
  ]
},

// =========================================================================
// 60. Convert AVIF TO WEBP
// =========================================================================
'avif-webp': {
  metaTitle: 'Convert AVIF to WebP Online – Modern AVIF to WebP Converter | MicroJPEG',
  metaDescription:
    'Convert AVIF images to WebP online with MicroJPEG for excellent compression and broad browser support. Fast, secure, browser-based avif to webp converter.',

  headline: 'Convert AVIF to WebP Online',
  subheadline: 'Modern WebP with Wide Support',
  heroDescription:
    'Transform your AVIF images into WebP format for excellent compression, quality, and broader browser compatibility. Perfect for web optimization with wider device support than AVIF.',

  intro:
    'WebP is a modern image format developed by Google that offers excellent compression and quality with broader browser support than AVIF. When you convert AVIF files to WebP, you maintain small file sizes and high quality while ensuring compatibility with more browsers and devices. MicroJPEG makes this conversion instant – just upload your AVIF and download optimized WebP.',

  whatIsTitle: 'What Is an AVIF File?',
  whatIsContent:
    'AVIF is a cutting-edge image format that provides superior compression. However, WebP has been around longer and enjoys wider browser support, making it a safer choice for maximum compatibility while still offering modern compression benefits.',

  whyConvertTitle: 'Why Convert AVIF to WebP?',
  whyConvertReasons: [
    'WebP has broader browser support than AVIF.',
    'Excellent compression with high visual quality.',
    'Supported by all modern browsers and many older ones.',
    'Better compatibility across devices and platforms.',
    'Ideal for progressive web optimization strategy.',
    'Supports both lossy and lossless compression.'
  ],

  howToTitle: 'How to Convert AVIF to WebP on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/convert/avif-to-webp.',
    'Drag and drop your AVIF file into the upload area.',
    'MicroJPEG automatically converts it to WebP.',
    'Wait while the conversion completes.',
    'Download your optimized WebP image.',
    'Check https://microjpeg.com/pricing and https://microjpeg.com/api-docs for advanced features.'
  ],

  comparisonTitle: 'AVIF vs WebP – Comparison Table',
  sourceInfo: [
    { label: 'Type', value: 'Next-gen compressed image' },
    { label: 'Compression', value: 'Advanced AV1' },
    { label: 'Best for', value: 'Maximum compression' },
    { label: 'File Size', value: 'Very Small' },
    { label: 'Compatibility', value: 'Modern browsers only' },
    { label: 'Typical Use', value: 'Cutting-edge web' }
  ],
  targetInfo: [
    { label: 'Type', value: 'Modern compressed image' },
    { label: 'Compression', value: 'VP8/VP9' },
    { label: 'Best for', value: 'Web optimization' },
    { label: 'File Size', value: 'Very Small' },
    { label: 'Compatibility', value: 'Broad modern support' },
    { label: 'Typical Use', value: 'Web performance' }
  ],

  features: [
    'Optimized WebP output from AVIF sources.',
    'Broader browser compatibility than AVIF.',
    'Fast, browser-based conversion.',
    'Secure handling with automatic file cleanup.',
    'Batch conversions supported.',
    'Maintains excellent visual quality.',
    'Developer API available at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Convert AVIF to WebP on any device including:',
    'Windows PCs',
    'macOS systems',
    'Linux computers',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'AVIF to JPG', href: '/convert/avif-to-jpg' },
    { label: 'AVIF to PNG', href: '/convert/avif-to-png' },
    { label: 'AVIF to TIFF', href: '/convert/avif-to-tiff' },
    { label: 'WebP to AVIF', href: '/convert/webp-to-avif' },
    { label: 'JPG to WebP', href: '/convert/jpg-to-webp' }
  ]
},

// =========================================================================
// 61. Compress WEBP
// =========================================================================
'compress-webp': {
  metaTitle: 'Compress WebP Images Online – Free WebP Compressor | MicroJPEG',
  metaDescription:
    'Compress WebP images online with MicroJPEG for smaller file sizes without quality loss. Fast, secure, free webp compression tool for web optimization.',

  headline: 'Compress WebP Images Online',
  subheadline: 'Smaller WebP Files, Same Quality',
  heroDescription:
    'Optimize your WebP images for faster loading websites and reduced bandwidth usage. Compress WebP files by up to 80% while maintaining excellent visual quality.',

  intro:
    'WebP is already an efficient format, but further compression can make your images even smaller for faster websites and reduced storage costs. MicroJPEG\'s WebP compressor uses advanced algorithms to reduce file sizes by 50-80% while preserving visual quality. Perfect for web developers, bloggers, and anyone optimizing images for online use.',

  whatIsTitle: 'What Is WebP Format?',
  whatIsContent:
    'WebP is a modern image format developed by Google that provides superior compression compared to traditional JPG and PNG formats. It supports both lossy and lossless compression, transparency, and animation, making it ideal for web use across modern browsers.',

  whyCompressTitle: 'Why Compress WebP Images?',
  whyCompressReasons: [
    'Reduce file sizes by 50-80% without visible quality loss.',
    'Speed up website loading times significantly.',
    'Lower bandwidth costs for high-traffic websites.',
    'Improve SEO rankings with faster page speeds.',
    'Enhance user experience on mobile devices.',
    'Reduce storage requirements for image libraries.',
    'Optimize for Core Web Vitals and performance metrics.'
  ],

  howToTitle: 'How to Compress WebP Images on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/compress/webp.',
    'Drag and drop your WebP files into the upload area.',
    'Choose your desired quality level (we recommend 85-92%).',
    'Click compress and wait for processing.',
    'Download your optimized WebP images.',
    'Check https://microjpeg.com/pricing for bulk compression and https://microjpeg.com/api-docs for API integration.'
  ],

  comparisonTitle: 'Before vs After Compression',
  sourceInfo: [
    { label: 'Original WebP', value: 'Standard quality' },
    { label: 'File Size', value: 'Large (e.g., 2MB)' },
    { label: 'Compression', value: 'Minimal' },
    { label: 'Quality', value: 'High' },
    { label: 'Loading Speed', value: 'Slower' },
    { label: 'Best for', value: 'High-res displays' }
  ],
  targetInfo: [
    { label: 'Compressed WebP', value: 'Optimized quality' },
    { label: 'File Size', value: 'Small (e.g., 400KB)' },
    { label: 'Compression', value: 'Advanced' },
    { label: 'Quality', value: 'Excellent' },
    { label: 'Loading Speed', value: 'Much faster' },
    { label: 'Best for', value: 'Web delivery' }
  ],

  features: [
    'Advanced WebP compression algorithms.',
    'Up to 80% file size reduction.',
    'Preserve visual quality with smart compression.',
    'Batch processing for multiple images.',
    'Adjustable quality settings (30-100%).',
    'Fast, browser-based compression.',
    'Secure with automatic file cleanup.',
    'Developer API at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Compress WebP images on any device including:',
    'Windows PCs',
    'macOS systems',
    'Linux computers',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'Compress JPG', href: '/compress/jpg' },
    { label: 'Compress PNG', href: '/compress/png' },
    { label: 'Compress AVIF', href: '/compress/avif' },
    { label: 'WebP to JPG', href: '/convert/webp-to-jpg' },
    { label: 'JPG to WebP', href: '/convert/jpg-to-webp' }
  ]
},

// =========================================================================
// 62. Compress TIFF
// =========================================================================
'compress-tiff': {
  metaTitle: 'Compress TIFF Images Online – Professional TIFF Compressor | MicroJPEG',
  metaDescription:
    'Compress TIFF images online with MicroJPEG while preserving quality. Fast, secure tiff compression for photography, print, and archival storage.',

  headline: 'Compress TIFF Images Online',
  subheadline: 'Smaller TIFF Files, Professional Quality',
  heroDescription:
    'Reduce your TIFF file sizes by 40-70% while maintaining professional quality. Perfect for photographers, print professionals, and archival storage optimization.',

  intro:
    'TIFF files are large by nature, but that doesn\'t mean they can\'t be optimized. MicroJPEG\'s TIFF compressor uses lossless and intelligent lossy compression to significantly reduce file sizes while preserving the professional quality you need. Ideal for photographers, print shops, and anyone working with high-resolution images.',

  whatIsTitle: 'What Is TIFF Format?',
  whatIsContent:
    'TIFF (Tagged Image File Format) is a professional raster image format widely used in photography, publishing, and graphic design. It supports lossless compression, multiple layers, high color depth, and is the standard format for print production and archival storage.',

  whyCompressTitle: 'Why Compress TIFF Images?',
  whyCompressReasons: [
    'TIFF files are very large – compression saves significant storage.',
    'Reduce cloud storage and backup costs.',
    'Faster file transfers and email attachments.',
    'Maintain professional quality with lossless compression.',
    'Optimize archival storage without quality loss.',
    'Speed up workflow when working with large image libraries.',
    'Reduce bandwidth for client file delivery.'
  ],

  howToTitle: 'How to Compress TIFF Images on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/compress/tiff.',
    'Drag and drop your TIFF files into the upload area.',
    'Choose lossless or high-quality lossy compression.',
    'Wait while MicroJPEG processes your images.',
    'Download your compressed TIFF files.',
    'Check https://microjpeg.com/pricing for bulk processing and https://microjpeg.com/api-docs for automation.'
  ],

  comparisonTitle: 'Before vs After Compression',
  sourceInfo: [
    { label: 'Original TIFF', value: 'Uncompressed' },
    { label: 'File Size', value: 'Very Large (e.g., 50MB)' },
    { label: 'Compression', value: 'None or minimal' },
    { label: 'Quality', value: 'Professional' },
    { label: 'Storage Cost', value: 'High' },
    { label: 'Best for', value: 'Print originals' }
  ],
  targetInfo: [
    { label: 'Compressed TIFF', value: 'Optimized' },
    { label: 'File Size', value: 'Medium (e.g., 15-25MB)' },
    { label: 'Compression', value: 'LZW lossless' },
    { label: 'Quality', value: 'Professional' },
    { label: 'Storage Cost', value: 'Much lower' },
    { label: 'Best for', value: 'Efficient storage' }
  ],

  features: [
    'Lossless LZW compression for TIFF files.',
    'Reduce file sizes by 40-70% without quality loss.',
    'Preserve all EXIF and metadata information.',
    'Support for high bit-depth images (16-bit, 32-bit).',
    'Batch processing for large image collections.',
    'Fast, browser-based compression.',
    'Secure with automatic file cleanup.',
    'Professional API at https://microjpeg.com/api-docs.'
  ],

  deviceSupportText: [
    'Compress TIFF images on any device including:',
    'Windows PCs',
    'macOS systems',
    'Linux computers',
    'Android phones and tablets',
    'iPhones and iPads',
    'All modern browsers'
  ],

  relatedConversions: [
    { label: 'Compress JPG', href: '/compress/jpg' },
    { label: 'Compress PNG', href: '/compress/png' },
    { label: 'TIFF to JPG', href: '/convert/tiff-to-jpg' },
    { label: 'TIFF to PNG', href: '/convert/tiff-to-png' },
    { label: 'JPG to TIFF', href: '/convert/jpg-to-tiff' }
  ]
},

// =========================================================================
// 63. Compress AVIF
// =========================================================================
'compress-avif': {
  metaTitle: 'Compress AVIF Images Online – Next-Gen AVIF Compressor | MicroJPEG',
  metaDescription:
    'Compress AVIF images online with MicroJPEG for ultra-small file sizes. Fast, secure avif compression for modern web optimization and performance.',

  headline: 'Compress AVIF Images Online',
  subheadline: 'Ultra-Small AVIF Files, Maximum Quality',
  heroDescription:
    'Optimize your AVIF images even further for blazing-fast websites. Compress AVIF files by 50-70% while maintaining excellent visual quality with next-generation compression.',

  intro:
    'AVIF is already one of the most efficient image formats, but MicroJPEG can make your AVIF files even smaller. Our advanced compression algorithms reduce AVIF file sizes by an additional 50-70% while preserving the high quality you expect. Perfect for cutting-edge web developers and performance-focused websites.',

  whatIsTitle: 'What Is AVIF Format?',
  whatIsContent:
    'AVIF (AV1 Image File Format) is a next-generation image format based on the AV1 video codec. It provides superior compression compared to JPG, PNG, and WebP, delivering smaller file sizes with excellent visual quality. AVIF is supported by all modern browsers and is ideal for web performance optimization.',

  whyCompressTitle: 'Why Compress AVIF Images?',
  whyCompressReasons: [
    'Make already-small AVIF files even smaller (50-70% reduction).',
    'Achieve sub-second loading times for images.',
    'Perfect scores on Google PageSpeed and Core Web Vitals.',
    'Reduce bandwidth costs even further.',
    'Optimize for mobile-first experiences.',
    'Stay ahead with cutting-edge image optimization.',
    'Ideal for high-traffic websites and CDN delivery.'
  ],

  howToTitle: 'How to Compress AVIF Images on MicroJPEG',
  howToSteps: [
    'Visit https://microjpeg.com/compress/avif.',
    'Drag and drop your AVIF files into the upload area.',
    'Select your target quality level (85-95% recommended).',
    'Let MicroJPEG apply advanced AVIF compression.',
    'Download your ultra-optimized AVIF images.',
    'Check https://microjpeg.com/pricing for high-volume processing and https://microjpeg.com/api-docs for API access.'
  ],

  comparisonTitle: 'Before vs After Compression',
  sourceInfo: [
    { label: 'Original AVIF', value: 'Standard encoding' },
    { label: 'File Size', value: 'Small (e.g., 300KB)' },
    { label: 'Compression', value: 'Default AVIF' },
    { label: 'Quality', value: 'High' },
    { label: 'Loading Speed', value: 'Fast' },
    { label: 'Best for', value: 'Modern web' }
  ],
  targetInfo: [
    { label: 'Compressed AVIF', value: 'Optimized encoding' },
    { label: 'File Size', value: 'Very Small (e.g., 100KB)' },
    { label: 'Compression', value: 'Advanced AVIF' },
    { label: 'Quality', value: 'Excellent' },
    { label: 'Loading Speed', value: 'Ultra-fast' },
    { label: 'Best for', value: 'Performance-critical' }
  ],

  features: [
    'Advanced AVIF compression algorithms.',
    'Additional 50-70% file size reduction.',
    'Maintain excellent'

    ],

    
     relatedConversions: [
    { label: 'Compress JPG', href: '/compress/jpg' },
    { label: 'Compress PNG', href: '/compress/png' },
    { label: 'Compress TIFF', href: '/compress/tiff' },
    { label: 'Compress WebP', href: '/compress/webp' }
    
      ]
},
  // =========================================================================
  // 64. Compress JPG
  // =========================================================================
  'compress-jpg': {
    metaTitle: 'Compress JPG Images Online - Free | MicroJPEG',
    metaDescription: 'Reduce JPG file sizes by up to 80% without visible quality loss. Free online compression, no signup required.',
    
    headline: 'Compress JPG Images Online',
    subheadline: 'Up to 80% Smaller',
    heroDescription: 'Reduce JPEG file sizes dramatically while maintaining visual quality. Perfect for web, email, and storage.',
    
    intro: 'MicroJPEG compresses JPG images using advanced algorithms to achieve up to 80% file size reduction while preserving visual quality. Essential for web optimization, email attachments, and storage management. No signup required — compress instantly in your browser.',
    
    whatIsTitle: 'Why Compress JPG Images?',
    whatIsContent: 'JPG compression reduces file sizes by removing redundant data and optimizing encoding. Modern compression algorithms can achieve significant size reductions with minimal visible quality loss. This is essential for website performance, email attachments, and efficient storage.',
    
    whyConvertTitle: 'Benefits of JPG Compression',
    whyConvertReasons: [
      'Faster website loading — compressed images load quicker',
      'Better SEO — Google ranks faster sites higher',
      'Lower bandwidth costs — smaller files use less data',
      'Email-friendly — meet attachment size limits',
      'Save storage space — store more photos',
      'Improved user experience — pages feel snappier'
    ],
    
    howToTitle: 'How to Compress JPG Images',
    howToSteps: [
      'Upload your JPG images to the compressor',
      'MicroJPEG analyzes and compresses each image optimally',
      'Adjust quality slider if you need smaller files or higher quality',
      'Preview compressed images to verify quality',
      'Download compressed files individually or as ZIP'
    ],
    
    comparisonTitle: 'Compression Results',
    sourceInfo: [
      { label: 'Original Size', value: '5 MB typical' },
      { label: 'Quality', value: '100%' },
      { label: 'Web Load Time', value: 'Slow' },
      { label: 'Email Friendly', value: 'Often too large' }
    ],
    targetInfo: [
      { label: 'Compressed Size', value: '1 MB typical' },
      { label: 'Quality', value: '95%+ visually identical' },
      { label: 'Web Load Time', value: '5x faster' },
      { label: 'Email Friendly', value: 'Yes' }
    ],
    
    features: [
      'Smart compression — optimal settings per image',
      'Batch processing — compress hundreds of images',
      'Quality control — adjustable compression level',
      'EXIF preservation option — keep or strip metadata',
      'No signup required — instant compression',
      'Privacy-focused — images processed locally'
    ],
    
    deviceSupportText: 'Compress JPG images on any device with a modern browser.',
    
    sections: [
      {
        title: 'Lossless vs Lossy Compression',
        body: 'MicroJPEG uses intelligent lossy compression that removes imperceptible data while preserving visual quality. At 80-85% quality settings, most users cannot distinguish between original and compressed images. For maximum compression, lower quality settings can be used for thumbnails or previews.'
      }
    ],
    
    relatedConversions: [
      { label: 'Compress PNG', href: '/compress/png' },
      { label: 'Compress WebP', href: '/compress/webp' },
      { label: 'Compress AVIF', href: '/compress/avif' },
      { label: 'Compress TIFF', href: '/compress/tiff' }
    ]
  },

  // =========================================================================
  // 65. Compress PNG
  // =========================================================================
  'compress-png': {
    metaTitle: 'Compress PNG Images Online - Free | MicroJPEG',
    metaDescription: 'Reduce PNG file sizes by up to 70% while preserving transparency. Free online compression, no signup required.',
    
    headline: 'Compress PNG Images Online',
    subheadline: 'Up to 70% Smaller',
    heroDescription: 'Reduce PNG file sizes while preserving transparency and quality. Perfect for web graphics and logos.',
    
    intro: 'MicroJPEG compresses PNG images using advanced optimization to achieve up to 70% file size reduction while preserving transparency and quality. Essential for web graphics, logos, icons, and any image requiring transparent backgrounds.',
    
    whatIsTitle: 'Why Compress PNG Images?',
    whatIsContent: 'PNG files can be quite large, especially for high-resolution graphics. Compression reduces file sizes by optimizing the PNG encoding without losing quality (lossless) or with minimal quality loss (lossy). This improves website loading times while maintaining the transparency and sharpness PNG is known for.',
    
    whyConvertTitle: 'Benefits of PNG Compression',
    whyConvertReasons: [
      'Faster loading — compressed PNGs load significantly quicker',
      'Preserve transparency — alpha channel maintained',
      'Maintain quality — lossless option available',
      'Smaller file sizes — up to 70% reduction',
      'Better web performance — improved Core Web Vitals',
      'No visual difference — imperceptible quality loss'
    ],
    
    howToTitle: 'How to Compress PNG Images',
    howToSteps: [
      'Upload your PNG images to the compressor',
      'MicroJPEG optimizes each image while preserving transparency',
      'Choose compression level — higher = smaller files',
      'Preview to verify quality meets your needs',
      'Download compressed PNG files'
    ],
    
    comparisonTitle: 'Compression Results',
    sourceInfo: [
      { label: 'Original Size', value: '2 MB typical' },
      { label: 'Transparency', value: 'Preserved' },
      { label: 'Quality', value: '100%' }
    ],
    targetInfo: [
      { label: 'Compressed Size', value: '600 KB typical' },
      { label: 'Transparency', value: 'Preserved' },
      { label: 'Quality', value: '98%+ visually identical' }
    ],
    
    features: [
      'Preserves transparency — alpha channel maintained',
      'Lossless & lossy options — choose your preference',
      'Batch processing — compress multiple PNGs',
      'Color optimization — reduces palette when possible',
      'No signup required',
      'Browser-based processing'
    ],
    
    deviceSupportText: 'Compress PNG images on any device with a modern browser.',
    
    relatedConversions: [
      { label: 'Compress JPG', href: '/compress/jpg' },
      { label: 'Compress WebP', href: '/compress/webp' },
      { label: 'Compress AVIF', href: '/compress/avif' },
      { label: 'Compress TIFF', href: '/compress/tiff' }
 ]
  }
};


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get content for a specific conversion page
 * FIXED: Now properly matches the keys in CONTENT object
 */
export function getConversionPageContent(
  sourceFormat: string,
  targetFormat: string,
  sourceDisplayName?: string,  // Optional - not used but kept for compatibility
  targetDisplayName?: string   // Optional - not used but kept for compatibility
): PageContent | null {
  const source = sourceFormat.toLowerCase();
  const target = targetFormat.toLowerCase();
  
  // Try exact match first (conversion)
  const conversionKey = `${source}-${target}`;
  if (CONTENT[conversionKey]) {
    console.log(`✓ Found content for: ${conversionKey}`);
    return CONTENT[conversionKey];
  }
  
  // Try compression format (when source === target)
  if (source === target) {
    const compressKey = `compress-${source}`;
    if (CONTENT[compressKey]) {
      console.log(`✓ Found content for: ${compressKey}`);
      return CONTENT[compressKey];
    }
  }
  
  // Log missing content for debugging
  console.warn(`❌ No content found for: ${conversionKey} (tried compress-${source} too)`);
  console.warn(`Available keys:`, Object.keys(CONTENT).slice(0, 10), '... and more');
  
  return null;
}

/**
 * Check if content exists for a conversion
 */
export function hasConversionContent(
  sourceFormat: string,
  targetFormat: string
): boolean {
  return getConversionPageContent(sourceFormat, targetFormat) !== null;
}

/**
 * Get all available content keys (for debugging)
 */
export function getAvailableContentKeys(): string[] {
  return Object.keys(CONTENT);
}

export default CONTENT;
