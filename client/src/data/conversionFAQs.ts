// src/data/conversionFAQs.ts
// Comprehensive FAQ content for all conversion/compression pages

export interface FAQItem {
  question: string;
  answer: string;
}

// ============================================================================
// FAQ CONTENT BY CONVERSION TYPE
// ============================================================================

const FAQS: Record<string, FAQItem[]> = {
  
  // =========================================================================
  // CR2 to JPG
  // =========================================================================
  'cr2-jpg': [
    {
      question: 'Can I convert CR2 to JPG for free?',
      answer: 'Yes, MicroJPEG offers free CR2 to JPG conversion. Free users get 200 conversions per month with 15MB file size limit for RAW files. No signup required for basic conversions.'
    },
    {
      question: 'What Canon cameras use CR2 format?',
      answer: 'CR2 is used by Canon EOS DSLRs made between 2004-2018, including: EOS 5D Mark I-IV, 6D Mark I-II, 7D Mark I-II, 80D, 90D, 70D, 60D, and Rebel series (T8i, T7i, T6i, T5i, T4i, T3i). Newer Canon cameras use CR3 format.'
    },
    {
      question: 'Does converting CR2 to JPG reduce quality?',
      answer: 'JPG uses lossy compression, so there is some quality reduction. However, MicroJPEG uses optimized algorithms to preserve maximum detail. At 85-90% quality settings, the difference is imperceptible for most uses including web, email, and standard prints.'
    },
    {
      question: 'Is EXIF metadata preserved after conversion?',
      answer: 'Yes, MicroJPEG preserves EXIF metadata including camera model, exposure settings (ISO, aperture, shutter speed), date/time, and GPS coordinates in the converted JPG file.'
    },
    {
      question: 'Can I batch convert multiple CR2 files?',
      answer: 'Yes, upload multiple CR2 files at once and download all converted JPGs in a single ZIP file. This is ideal for converting entire photo shoots efficiently.'
    },
    {
      question: 'How do I convert CR2 to JPG on Windows?',
      answer: 'Windows 10/11 cannot preview CR2 files natively without additional codecs. Simply upload your CR2 files to MicroJPEG and download as JPG — no software installation required.'
    },
    {
      question: 'Can I convert CR2 to JPG on Mac without Lightroom?',
      answer: 'Yes, MicroJPEG works in Safari on Mac. No Adobe subscription or software installation required. Just upload your CR2 files and download JPGs instantly.'
    },
    {
      question: 'What is the maximum CR2 file size?',
      answer: 'Free users can convert CR2 files up to 15MB. Paid plans support up to 200MB for high-resolution professional RAW files from cameras like the 5D Mark IV.'
    },
    {
      question: 'Are my CR2 files stored on your servers?',
      answer: 'No, conversion happens entirely in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security for your photos.'
    },
    {
      question: 'What is the difference between CR2 and CR3?',
      answer: 'CR3 is Canon\'s newer RAW format (introduced 2018) using HEIF container with better compression. CR2 is the older format. MicroJPEG supports both CR2 and CR3 files.'
    },
    {
      question: 'Can I convert CR2 to JPG on my phone?',
      answer: 'Yes, MicroJPEG works on iPhone (Safari) and Android (Chrome). You can upload CR2 files directly from your phone or cloud storage and download converted JPGs.'
    },
    {
      question: 'Why is my CR2 file so large?',
      answer: 'CR2 stores uncompressed RAW sensor data (typically 20-50MB for 20-30MP cameras). Converting to JPG reduces size by 80-90% while maintaining visual quality for most uses.'
    }
  ],

  // =========================================================================
  // NEF to JPG
  // =========================================================================
  'nef-jpg': [
    {
      question: 'What is a NEF file?',
      answer: 'NEF (Nikon Electronic Format) is Nikon\'s proprietary RAW image format used in all Nikon DSLR and mirrorless cameras to store unprocessed sensor data.'
    },
    {
      question: 'Can I convert NEF to JPG for free?',
      answer: 'Yes, MicroJPEG offers free NEF to JPG conversion with 200 conversions per month for free users and 15MB file size limit for RAW files.'
    },
    {
      question: 'Which Nikon cameras use NEF format?',
      answer: 'All Nikon DSLRs (D6, D850, D780, D7500, D5600, D3500) and mirrorless cameras (Z9, Z8, Z7 II, Z6 III, Z5, Zf, Z50, Z30) use NEF format.'
    },
    {
      question: 'Do I need Nikon software to convert NEF?',
      answer: 'No, MicroJPEG converts NEF files directly in your browser. You don\'t need Nikon ViewNX, Capture NX-D, NX Studio, or any other Nikon software.'
    },
    {
      question: 'Does NEF to JPG conversion lose quality?',
      answer: 'Some quality reduction occurs due to JPG compression, but MicroJPEG optimizes the conversion to preserve maximum detail. The difference is minimal at 85-90% quality settings.'
    },
    {
      question: 'Can I batch convert NEF files?',
      answer: 'Yes, upload multiple NEF files and download all converted JPGs as a ZIP file. Perfect for processing entire photo shoots.'
    },
    {
      question: 'Is NEF metadata preserved?',
      answer: 'Yes, EXIF data including camera settings, lens information, and timestamps are preserved in the converted JPG files.'
    },
    {
      question: 'What is the maximum NEF file size supported?',
      answer: 'Free users: 15MB per file. Paid plans support up to 200MB for high-resolution NEF files from cameras like D850 (45.7MP).'
    }
  ],

  // =========================================================================
  // ARW to JPG
  // =========================================================================
  'arw-jpg': [
    {
      question: 'What is an ARW file?',
      answer: 'ARW (Alpha Raw) is Sony\'s proprietary RAW format used in Alpha mirrorless cameras and DSLRs to store unprocessed sensor data with maximum quality.'
    },
    {
      question: 'Which Sony cameras use ARW format?',
      answer: 'All Sony Alpha cameras use ARW: A1, A9 III, A7 IV, A7R V, A7S III, A7C II, A6700, A6600, A6400, A6100, and all previous Alpha models.'
    },
    {
      question: 'Can I convert ARW without Sony software?',
      answer: 'Yes, MicroJPEG converts ARW files directly in your browser. No Sony Imaging Edge Desktop or other Sony software required.'
    },
    {
      question: 'Does ARW to JPG lose quality?',
      answer: 'MicroJPEG uses optimized compression to preserve maximum detail. At 85-90% quality, the visual difference is imperceptible for most uses.'
    },
    {
      question: 'Can I batch convert Sony ARW files?',
      answer: 'Yes, upload multiple ARW files and download converted JPGs individually or as a ZIP archive.'
    },
    {
      question: 'Is EXIF data preserved from ARW?',
      answer: 'Yes, camera settings, lens data, and shooting information are preserved in the converted JPG.'
    },
    {
      question: 'What is the difference between ARW and ARW2?',
      answer: 'Both are Sony RAW formats with minor encoding differences. MicroJPEG supports all ARW variants from any Sony camera.'
    },
    {
      question: 'What is the maximum ARW file size?',
      answer: 'Free users: 15MB. Paid plans: up to 200MB for high-resolution files from cameras like A7R V (61MP).'
    }
  ],

  // =========================================================================
  // PNG to JPG
  // =========================================================================
  'png-jpg': [
    {
      question: 'Why convert PNG to JPG?',
      answer: 'JPG files are 60-80% smaller than PNG, making them faster to load, easier to share via email, and better for web performance.'
    },
    {
      question: 'Does PNG to JPG lose quality?',
      answer: 'JPG uses lossy compression, so there is some quality reduction. However, at 85-90% quality settings, the difference is minimal for photographs.'
    },
    {
      question: 'What happens to PNG transparency?',
      answer: 'JPG doesn\'t support transparency. Transparent areas become white (default) or your chosen background color during conversion.'
    },
    {
      question: 'When should I keep PNG instead of JPG?',
      answer: 'Keep PNG for: images needing transparency, logos, graphics with text, screenshots, and images you\'ll edit multiple times.'
    },
    {
      question: 'Can I convert PNG to JPG without losing transparency?',
      answer: 'No, JPG doesn\'t support transparency. Consider PNG to WebP if you need transparency with smaller files, as WebP supports both.'
    },
    {
      question: 'How much smaller is JPG than PNG?',
      answer: 'Typically 60-80% smaller. A 5MB PNG might become a 1MB JPG with minimal visible quality difference for photographs.'
    },
    {
      question: 'Is PNG to JPG conversion free?',
      answer: 'Yes, MicroJPEG offers free PNG to JPG conversion. No signup required.'
    },
    {
      question: 'Can I batch convert PNG files?',
      answer: 'Yes, upload multiple PNG files and download all converted JPGs at once or as a ZIP.'
    }
  ],

  // =========================================================================
  // JPG to PNG
  // =========================================================================
  'jpg-png': [
    {
      question: 'Why convert JPG to PNG?',
      answer: 'PNG uses lossless compression, preventing further quality loss when editing. It\'s also required when you need to add transparency to an image.'
    },
    {
      question: 'Does JPG to PNG improve quality?',
      answer: 'No, converting from lossy JPG to lossless PNG doesn\'t restore lost data. However, it prevents additional quality loss in future edits.'
    },
    {
      question: 'Will my file size increase?',
      answer: 'Yes, PNG files are typically larger than JPG because PNG uses lossless compression while JPG uses lossy compression.'
    },
    {
      question: 'Can I add transparency by converting to PNG?',
      answer: 'Converting doesn\'t automatically add transparency. You would need to edit the resulting PNG to make specific areas transparent.'
    },
    {
      question: 'When should I convert JPG to PNG?',
      answer: 'When you need to edit the image further, add it to a design project, or prevent additional compression artifacts from repeated saves.'
    },
    {
      question: 'Is JPG to PNG conversion free?',
      answer: 'Yes, MicroJPEG offers free JPG to PNG conversion with no signup required.'
    }
  ],

  // =========================================================================
  // WEBP to JPG
  // =========================================================================
  'webp-jpg': [
    {
      question: 'Why convert WebP to JPG?',
      answer: 'JPG has universal compatibility. Some older software, email clients, and devices don\'t support WebP format.'
    },
    {
      question: 'Does WebP to JPG reduce quality?',
      answer: 'Both are lossy formats. MicroJPEG optimizes the conversion to minimize any additional quality loss.'
    },
    {
      question: 'Will the file size increase?',
      answer: 'Usually yes, slightly. WebP is more efficient than JPG, so the same image is typically larger in JPG format.'
    },
    {
      question: 'Can I batch convert WebP files?',
      answer: 'Yes, upload multiple WebP files and download all converted JPGs as a ZIP file.'
    },
    {
      question: 'Why can\'t I open WebP files?',
      answer: 'Older software and some image editors don\'t support WebP. Converting to JPG ensures universal compatibility.'
    },
    {
      question: 'What happens to WebP transparency?',
      answer: 'WebP supports transparency but JPG doesn\'t. Transparent areas become white (or your chosen color) when converting.'
    },
    {
      question: 'Is WebP to JPG conversion free?',
      answer: 'Yes, MicroJPEG offers free WebP to JPG conversion with no signup required.'
    }
  ],

  // =========================================================================
  // JPG to WEBP
  // =========================================================================
  'jpg-webp': [
    {
      question: 'Why convert JPG to WebP?',
      answer: 'WebP provides 25-35% smaller file sizes than JPG at equivalent quality — essential for website performance and faster loading times.'
    },
    {
      question: 'Is WebP supported everywhere?',
      answer: 'Yes, WebP is supported by 97%+ of browsers including Chrome, Firefox, Safari (14+), and Edge. Only very old browsers lack support.'
    },
    {
      question: 'Does JPG to WebP improve quality?',
      answer: 'No, but it significantly reduces file size while maintaining the same visual quality — making your website faster.'
    },
    {
      question: 'Should I use WebP for my website?',
      answer: 'Yes, WebP is the current best practice for web images. It improves page load speed and Core Web Vitals scores.'
    },
    {
      question: 'Can I convert JPG to WebP with transparency?',
      answer: 'JPG doesn\'t have transparency to preserve. WebP does support transparency if you\'re converting from PNG.'
    },
    {
      question: 'What quality setting should I use?',
      answer: 'For web images, 75-85% quality provides excellent visual quality with maximum file size savings.'
    },
    {
      question: 'Is JPG to WebP conversion free?',
      answer: 'Yes, MicroJPEG offers free JPG to WebP conversion with no signup required.'
    }
  ],

  // =========================================================================
  // Compress JPG
  // =========================================================================
  'compress-jpg': [
    {
      question: 'How much can JPG be compressed?',
      answer: 'MicroJPEG can typically reduce JPG file sizes by 50-80% depending on the image content and quality settings chosen.'
    },
    {
      question: 'Does JPG compression lose quality?',
      answer: 'JPG compression is lossy, but at 80-90% quality settings, the visual difference is imperceptible for most uses.'
    },
    {
      question: 'What quality setting should I use?',
      answer: 'For web: 75-85%. For email: 70-80%. For maximum quality: 90-95%. For smallest size: 60-70%.'
    },
    {
      question: 'Is EXIF data preserved when compressing?',
      answer: 'By default, EXIF metadata is preserved. You can optionally strip metadata for additional file size reduction.'
    },
    {
      question: 'Can I compress multiple JPGs at once?',
      answer: 'Yes, upload multiple JPG files and download all compressed images as a ZIP file.'
    },
    {
      question: 'Is JPG compression free?',
      answer: 'Yes, MicroJPEG offers free JPG compression with no signup required.'
    },
    {
      question: 'How does MicroJPEG compare to TinyPNG?',
      answer: 'MicroJPEG offers similar quality compression with added features like RAW support, quality control, and local processing for privacy.'
    },
    {
      question: 'Will compressed JPG look blurry?',
      answer: 'Not at recommended settings. At 80%+ quality, compression artifacts are minimal and not visible in normal viewing.'
    }
  ],

  // =========================================================================
  // Compress PNG
  // =========================================================================
  'compress-png': [
    {
      question: 'How much can PNG be compressed?',
      answer: 'MicroJPEG can reduce PNG file sizes by 30-70% depending on the image content and compression method used.'
    },
    {
      question: 'Does PNG compression lose quality?',
      answer: 'PNG supports both lossless compression (no quality loss) and lossy compression (minimal quality loss for maximum size reduction).'
    },
    {
      question: 'Is transparency preserved when compressing?',
      answer: 'Yes, PNG compression preserves the alpha channel (transparency) in your images.'
    },
    {
      question: 'What is lossy PNG compression?',
      answer: 'Lossy PNG reduces color palette and removes imperceptible details for smaller files while maintaining visual quality.'
    },
    {
      question: 'Can I compress multiple PNGs at once?',
      answer: 'Yes, upload multiple PNG files and download all compressed images as a ZIP.'
    },
    {
      question: 'Is PNG compression free?',
      answer: 'Yes, MicroJPEG offers free PNG compression with no signup required.'
    },
    {
      question: 'How does this compare to TinyPNG?',
      answer: 'MicroJPEG offers similar quality with additional features and local processing for enhanced privacy.'
    }
  ],

  // =========================================================================
  // DNG to JPG
  // =========================================================================
  'dng-jpg': [
    {
      question: 'What is a DNG file?',
      answer: 'DNG (Digital Negative) is Adobe\'s open RAW format designed as a universal standard. Some cameras shoot DNG natively, and many photographers convert proprietary RAW files to DNG for archival.'
    },
    {
      question: 'Which cameras use DNG?',
      answer: 'Leica, some Pentax models, Google Pixel phones, and many smartphones shoot DNG natively. Many photographers also convert CR2/NEF/ARW to DNG.'
    },
    {
      question: 'Can I convert DNG without Adobe software?',
      answer: 'Yes, MicroJPEG converts DNG files directly in your browser without requiring Lightroom or Photoshop.'
    },
    {
      question: 'Is DNG better than CR2 or NEF?',
      answer: 'DNG is an open format with better long-term compatibility. Quality is equivalent to proprietary RAW formats.'
    },
    {
      question: 'Does DNG to JPG preserve metadata?',
      answer: 'Yes, EXIF and XMP metadata are preserved in the converted JPG file.'
    },
    {
      question: 'Is DNG to JPG conversion free?',
      answer: 'Yes, MicroJPEG offers free DNG to JPG conversion with no signup required.'
    }
  ],

  // =========================================================================
  // RAF to JPG (Fujifilm)
  // =========================================================================
  'raf-jpg': [
    {
      question: 'What is a RAF file?',
      answer: 'RAF is Fujifilm\'s proprietary RAW format used in X-series and GFX cameras to store unprocessed sensor data.'
    },
    {
      question: 'Which Fujifilm cameras use RAF?',
      answer: 'All Fujifilm X-series (X-T5, X-H2, X-S20, X100V) and GFX medium format cameras use RAF format.'
    },
    {
      question: 'Can I convert RAF without Fujifilm software?',
      answer: 'Yes, MicroJPEG converts RAF files directly in your browser without requiring Fujifilm X RAW Studio or Capture One.'
    },
    {
      question: 'Does RAF to JPG preserve Fujifilm colors?',
      answer: 'MicroJPEG applies standard RAW processing. For Fujifilm film simulations, process in Fujifilm software first, then export.'
    },
    {
      question: 'Is RAF to JPG conversion free?',
      answer: 'Yes, MicroJPEG offers free RAF to JPG conversion with no signup required.'
    }
  ],

  // =========================================================================
  // ORF to JPG (Olympus/OM System)
  // =========================================================================
  'orf-jpg': [
    {
      question: 'What is an ORF file?',
      answer: 'ORF is Olympus (now OM System) proprietary RAW format used in OM-D and PEN cameras.'
    },
    {
      question: 'Which cameras use ORF format?',
      answer: 'Olympus/OM System cameras including OM-1, OM-5, E-M1 Mark III, E-M5 Mark III, and PEN series.'
    },
    {
      question: 'Can I convert ORF without Olympus software?',
      answer: 'Yes, MicroJPEG converts ORF files directly in your browser without requiring Olympus Workspace.'
    },
    {
      question: 'Is ORF to JPG conversion free?',
      answer: 'Yes, MicroJPEG offers free ORF to JPG conversion with no signup required.'
    }
  ],

  // =========================================================================
  // AVIF to JPG
  // =========================================================================
  'avif-jpg': [
    {
      question: 'What is AVIF format?',
      answer: 'AVIF (AV1 Image File) is a modern image format offering 50% smaller files than JPG with better quality. Based on AV1 video codec.'
    },
    {
      question: 'Why convert AVIF to JPG?',
      answer: 'JPG has universal compatibility. Some devices, software, and older browsers don\'t yet support AVIF format.'
    },
    {
      question: 'Is AVIF better than JPG?',
      answer: 'AVIF offers better compression and quality, but JPG is more widely supported. Choose based on your compatibility needs.'
    },
    {
      question: 'Can all browsers open AVIF?',
      answer: 'Most modern browsers support AVIF (Chrome 85+, Firefox 93+, Safari 16+), but older versions and some software may not.'
    },
    {
      question: 'Is AVIF to JPG conversion free?',
      answer: 'Yes, MicroJPEG offers free AVIF to JPG conversion with no signup required.'
    }
  ],

  // =========================================================================
  // JPG to AVIF
  // =========================================================================
  'jpg-avif': [
    {
      question: 'Why convert JPG to AVIF?',
      answer: 'AVIF provides 50%+ smaller file sizes than JPG at equivalent quality — the most efficient modern image format.'
    },
    {
      question: 'Is AVIF supported by all browsers?',
      answer: 'AVIF is supported by Chrome (85+), Firefox (93+), and Safari (16+). Older browsers need JPG fallback.'
    },
    {
      question: 'Is AVIF better than WebP?',
      answer: 'AVIF typically provides 20-30% smaller files than WebP, but has slightly less browser support. Both are excellent choices.'
    },
    {
      question: 'What quality setting for AVIF?',
      answer: 'For web images, 50-70% AVIF quality matches 80-90% JPG quality due to AVIF\'s superior compression.'
    },
    {
      question: 'Is JPG to AVIF conversion free?',
      answer: 'Yes, MicroJPEG offers free JPG to AVIF conversion with no signup required.'
    }
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get FAQ content for a specific conversion
 */
export function getConversionFAQ(
  sourceFormat: string,
  targetFormat: string
): FAQItem[] {
  const key = `${sourceFormat.toLowerCase()}-${targetFormat.toLowerCase()}`;
  
  if (FAQS[key]) {
    return FAQS[key];
  }
  
  // Check for compression
  if (sourceFormat.toLowerCase() === targetFormat.toLowerCase()) {
    const compressKey = `compress-${sourceFormat.toLowerCase()}`;
    if (FAQS[compressKey]) {
      return FAQS[compressKey];
    }
  }
  
  // Return generic FAQ if no specific content
  return getGenericFAQ(sourceFormat, targetFormat);
}

/**
 * Generate generic FAQ for conversions without specific content
 */
function getGenericFAQ(source: string, target: string): FAQItem[] {
  const upperSource = source.toUpperCase();
  const upperTarget = target.toUpperCase();
  
  return [
    {
      question: `How do I convert ${upperSource} to ${upperTarget} online?`,
      answer: `Upload your ${upperSource} file to MicroJPEG, select ${upperTarget} as output, and click convert. The process happens instantly in your browser.`
    },
    {
      question: `Is ${upperSource} to ${upperTarget} conversion free?`,
      answer: `Yes, MicroJPEG offers free conversion. Free users get 200 conversions per month with file size limits of 7MB (regular) or 15MB (RAW).`
    },
    {
      question: `Will converting ${upperSource} to ${upperTarget} reduce quality?`,
      answer: `MicroJPEG uses optimized algorithms to preserve maximum quality during conversion. Any quality difference is minimal for most uses.`
    },
    {
      question: `Can I convert multiple ${upperSource} files at once?`,
      answer: `Yes, MicroJPEG supports batch conversion. Upload multiple files and download all converted ${upperTarget} files as a ZIP.`
    },
    {
      question: `Is my data safe when converting ${upperSource} to ${upperTarget}?`,
      answer: `Yes, files are processed locally in your browser and never uploaded to our servers. Your images remain completely private.`
    },
    {
      question: `What devices support ${upperSource} to ${upperTarget} conversion?`,
      answer: `MicroJPEG works on any device with a modern browser: Windows, Mac, Linux, iOS, and Android.`
    }
  ];
}

/**
 * Check if specific FAQ content exists
 */
export function hasSpecificFAQ(source: string, target: string): boolean {
  const key = `${source.toLowerCase()}-${target.toLowerCase()}`;
  return !!FAQS[key];
}

export default FAQS;
