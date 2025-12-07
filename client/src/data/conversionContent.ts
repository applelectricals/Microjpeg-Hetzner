// src/data/conversionContent.ts
// Comprehensive SEO content for all conversion/compression pages

export interface PageContent {
  // Meta
  metaTitle: string;
  metaDescription: string;
  
  // Hero
  headline: string;
  subheadline: string;
  heroDescription: string;
  
  // Intro paragraph
  intro: string;
  
  // What Is section
  whatIsTitle: string;
  whatIsContent: string;
  
  // Why Convert section
  whyConvertTitle: string;
  whyConvertReasons: string[];
  
  // How To section
  howToTitle: string;
  howToSteps: string[];
  
  // Comparison section
  comparisonTitle: string;
  sourceInfo: { label: string; value: string }[];
  targetInfo: { label: string; value: string }[];
  
  // Features
  features: string[];
  
  // Device support text
  deviceSupportText: string;
  
  // Additional sections (optional)
  sections?: { title: string; body: string }[];
  
  // Related conversions
  relatedConversions: { label: string; href: string }[];
}

// ============================================================================
// TIER 1: HIGH VOLUME PAGES (CR2→JPG, NEF→JPG, ARW→JPG, PNG→JPG, etc.)
// ============================================================================

const CONTENT: Record<string, PageContent> = {
  
  // =========================================================================
  // CR2 to JPG - HIGHEST PRIORITY
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
      { label: 'NEF to JPG', href: '/convert/nef-to-jpg' },
      { label: 'ARW to JPG', href: '/convert/arw-to-jpg' }
    ]
  },

  // =========================================================================
  // NEF to JPG
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
      { label: 'CR2 to JPG', href: '/convert/cr2-to-jpg' },
      { label: 'ARW to JPG', href: '/convert/arw-to-jpg' }
    ]
  },

  // =========================================================================
  // ARW to JPG
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
      { label: 'CR2 to JPG', href: '/convert/cr2-to-jpg' },
      { label: 'NEF to JPG', href: '/convert/nef-to-jpg' }
    ]
  },

  // =========================================================================
  // PNG to JPG
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
      { label: 'JPG to PNG', href: '/convert/jpg-to-png' },
      { label: 'Compress PNG', href: '/compress/png' }
    ]
  },

  // =========================================================================
  // JPG to PNG
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
      { label: 'PNG to JPG', href: '/convert/png-to-jpg' },
      { label: 'JPG to WebP', href: '/convert/jpg-to-webp' },
      { label: 'Compress JPG', href: '/compress/jpg' }
    ]
  },

  // =========================================================================
  // WEBP to JPG
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
      { label: 'JPG to WebP', href: '/convert/jpg-to-webp' },
      { label: 'WebP to PNG', href: '/convert/webp-to-png' },
      { label: 'PNG to WebP', href: '/convert/png-to-webp' }
    ]
  },

  // =========================================================================
  // JPG to WEBP
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
      { label: 'PNG to WebP', href: '/convert/png-to-webp' },
      { label: 'WebP to JPG', href: '/convert/webp-to-jpg' },
      { label: 'JPG to AVIF', href: '/convert/jpg-to-avif' },
      { label: 'Compress WebP', href: '/compress/webp' }
    ]
  },

  // =========================================================================
  // Compress JPG
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
      { label: 'JPG to WebP', href: '/convert/jpg-to-webp' },
      { label: 'PNG to JPG', href: '/convert/png-to-jpg' }
    ]
  },

  // =========================================================================
  // Compress PNG
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
      { label: 'PNG to WebP', href: '/convert/png-to-webp' },
      { label: 'PNG to JPG', href: '/convert/png-to-jpg' }
    ]
  }
};

 // =========================================================================
  // Convert WEB TO TIFF
  // =========================================================================
  'webp-tiff': {
    metaTitle: 'Convert WebP to TIFF Online – Fast, High-Quality WebP to TIFF Converter | MicroJPEG'
    metaDescription: 'Convert WebP images to TIFF instantly with MicroJPEG. High-quality, lossless output ideal for print and archival use. Free online WebP to TIFF converter — no signup required. Works on all devices.'
    
    headline: 'Convert WebP to TIFF Online'
    subheadline: 'Up to 70% Smaller'
    heroDescription: 'High-quality, lossless TIFF output for printing, editing, and archiving — fast, secure, and free on MicroJPEG.'
    intro: 'WebP images are great for the web, but sometimes you need a high-quality, lossless format for printing, editing, or long-term storage. MicroJPEG makes this easy with a fast, reliable WebP to TIFF converter directly in your browser. No installation, no account required — just upload your WebP file and download a clean TIFF image in seconds. Explore all features at microjpeg.com and learn more at microjpeg.com/features.'
    
    whatIsTitle: 'What Is a WebP File?'
    whatIsContent: 'WebP is a modern image format designed for efficient web performance. It supports both lossy and lossless compression, allowing websites to deliver smaller file sizes without sacrificing visual quality. Because it’s optimized for browsing speed, WebP is widely used for images that need to load quickly across devices.'
    
    whyConvertTitle: 'Why Convert WebP to TIFF?'
    whyConvertReasons: [
      'Converting WebP to TIFF on MicroJPEG takes only a few seconds:',
      '1. Maximum image quality with no compression artifacts.',
      '2. Print-ready output for magazines, brochures, or professional prints.',
      '3. Editable format for design tools that rely on lossless data.',
      '4. Accurate color representation in pre-press workflows.',
      '5. Long-term archiving where stability and retention of detail are essential.',
      '6. Long-term archiving where stability and retention of detail are essential.'
    ]
    
    howToTitle: 'How to Convert WebP to TIFF on MicroJPEG'
    howToSteps: [
      'Converting WebP to TIFF on MicroJPEG takes only a few seconds:',
      '1. Visit https://microjpeg.com/convert/webp-to-tiff',
      '2. Drag and drop your WebP file into the upload area (or select it manually).',
      '3. MicroJPEG automatically processes and converts your image to TIFF.',
      '4. Wait a moment for the conversion to complete.',
      '5. WDownload your ready-to-use TIFF file.',
      'For more tools and options, see https://microjpeg.com/pricing or explore the https://microjpeg.com/api-docs.'
      ]
    
    comparisonTitle: 'WebP vs TIFF – Comparison Table'
    sourceInfo: [
      { label: 'Compression', value: 'Lossy & lossless' },
      { label: 'Transparency', value: 'Preserved' },
      { label: 'Best for', value: 'Websites, online images' },
      { label: 'Color Depth', value: 'Good'},
      { label: 'Metadata', value: 'Basic'},
      { label: 'Quality Priority', value: 'Balanced'}
    ]
    targetInfo: [
       { label: 'Compression', value: 'Lossless' },
      { label: 'Transparency', value:  'Large' },
      { label: 'Best for', value: 'Printing, editing, archiving' },
      { label: 'Color Depth', value: 'Excellent'},
      { label: 'Metadata', value: 'Advanced'},
      { label: 'Quality Priority', value: 'Maximum'}
    ]
    
    features: [
      'Lossless TIFF output with excellent detail retention',
      'Fast browser-based conversion with optimized performance',
      'Secure, temporary processing — files auto-delete after conversion',
      'Works for small and large WebP images',
      'Batch upload support for multiple images',
      'No installation required — fully online',
      'API availability for automated workflows https://microjpeg.com/api-docs'
   ]
    
    deviceSupportText: [
    'MicroJPEG works across all major devices and browsers. Convert WebP to TIFF seamlessly on:',
                       'Windows PCs',
                       'macOS laptops',
                       'Linux systems',
                       'iPhones and iPads',
                       'Android phones and tablets',
                       'Chrome, Safari, Firefox, and Edge'
    ]

    
    relatedConversions: [
      { label: 'WebP to JPG', href: '/convert/webp-to-jpg' },
      { label: 'WebP to PNG', href: '/convert/webp-to-png' },
      { label: 'WebP to AVIF', href: '/convert/webp-to-avif' },
   ]
  },

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get content for a specific conversion page
 */
export function getConversionPageContent(
  sourceFormat: string,
  targetFormat: string
): PageContent | null {
  // Try exact match first
  const key = `${sourceFormat.toLowerCase()}-${targetFormat.toLowerCase()}`;
  if (CONTENT[key]) {
    return CONTENT[key];
  }
  
  // Try compression format
  if (sourceFormat.toLowerCase() === targetFormat.toLowerCase()) {
    const compressKey = `compress-${sourceFormat.toLowerCase()}`;
    if (CONTENT[compressKey]) {
      return CONTENT[compressKey];
    }
  }
  
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
 * Get all available content keys
 */
export function getAvailableContentKeys(): string[] {
  return Object.keys(CONTENT);
}

export default CONTENT;
