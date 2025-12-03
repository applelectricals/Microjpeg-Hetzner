import { getConversionFAQ } from './conversionFAQs';

// Add this function for FAQ schema
export function getFAQSchema(sourceFormat: string, targetFormat: string) {
  const faqs = getConversionFAQ(sourceFormat, targetFormat);
  
  if (!faqs || faqs.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Add this function for Breadcrumb schema
export function getBreadcrumbSchema(sourceFormat: string, targetFormat: string) {
  const isCompression = sourceFormat.toLowerCase() === targetFormat.toLowerCase();
  const path = isCompression 
    ? `/compress/${sourceFormat.toLowerCase()}`
    : `/convert/${sourceFormat.toLowerCase()}-to-${targetFormat.toLowerCase()}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://microjpeg.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": isCompression ? "Compress" : "Convert",
        "item": `https://microjpeg.com/${isCompression ? 'compress' : 'convert'}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": isCompression 
          ? `Compress ${sourceFormat.toUpperCase()}`
          : `${sourceFormat.toUpperCase()} to ${targetFormat.toUpperCase()}`,
        "item": `https://microjpeg.com${path}`
      }
    ]
  };
}

// Add this function for WebPage schema
export function getWebPageSchema(sourceFormat: string, targetFormat: string, title: string, description: string) {
  const isCompression = sourceFormat.toLowerCase() === targetFormat.toLowerCase();
  const path = isCompression 
    ? `/compress/${sourceFormat.toLowerCase()}`
    : `/convert/${sourceFormat.toLowerCase()}-to-${targetFormat.toLowerCase()}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": `https://microjpeg.com${path}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "MicroJPEG",
      "url": "https://microjpeg.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MicroJPEG",
      "url": "https://microjpeg.com"
    }
  };
}

// src/data/conversionSchema.ts

export interface FAQItem {
  question: string;
  answer: string;
}

// Special enhanced FAQ for CR2 to JPG (from the optimized document)
const CR2_TO_JPG_FAQ: FAQItem[] = [
  {
    question: "Can I convert CR2 to JPG for free?",
    answer: "Yes, MicroJPEG offers free CR2 to JPG conversion for quick and small workflow needs."
  },
  {
    question: "What cameras create CR2 files?",
    answer: "Canon EOS DSLR models such as the 5D, 6D, 7D, 80D, and Rebel series use CR2."
  },
  {
    question: "Does converting CR2 to JPG reduce quality?",
    answer: "JPG is compressed, but MicroJPEG preserves maximum detail and performs clean color rendering for natural-looking results."
  },
  {
    question: "Does metadata remain after conversion?",
    answer: "Most EXIF metadata such as exposure, camera model, ISO, and timestamp is preserved."
  },
  {
    question: "Can I convert multiple CR2 files at once?",
    answer: "Yes. Upload them all and download the final JPGs as a ZIP."
  },
  {
    question: "Can I convert CR2 to JPG on Windows?",
    answer: "Yes. If Windows can't preview CR2, upload them here and download a JPG."
  },
  {
    question: "How do I convert CR2 to JPG on a Mac?",
    answer: "Mac Preview works, but MicroJPEG gives faster batch processing and better compatibility."
  },
  {
    question: "Do I need to install any software?",
    answer: "No installation required — runs fully in your browser."
  },
  {
    question: "Are my CR2 files stored?",
    answer: "No. All conversions occur locally or are deleted automatically depending on your privacy settings."
  },
  {
    question: "What's the difference between CR2 and JPG?",
    answer: "CR2 is uncompressed RAW; JPG is a compressed final image used for sharing."
  },
  {
    question: "Is MicroJPEG safe for RAW images?",
    answer: "Yes — your images are processed securely and deleted after conversion."
  },
  {
    question: "Can I convert CR2 to JPG on Android?",
    answer: "Yes, upload directly from your phone and download the JPG."
  }
];

export function getConversionFaq(from: string, to: string): FAQItem[] {
  // Return specialized FAQ for CR2 to JPG
  if (from.toLowerCase() === 'cr2' && to.toLowerCase() === 'jpg') {
    return CR2_TO_JPG_FAQ;
  }

  // Default generic FAQ for other conversions
  const upperFrom = from.toUpperCase();
  const upperTo = to.toUpperCase();

  return [
    {
      question: `How do I convert ${upperFrom} to ${upperTo} online?`,
      answer: `Upload your ${upperFrom} file, choose ${upperTo} as output and click convert. MicroJPEG automatically optimizes and converts the image in the browser.`
    },
    {
      question: `Is the ${upperFrom} to ${upperTo} converter free?`,
      answer: `Yes. Anonymous users can run hundreds of free conversions per month. Power users and API access are available on paid plans.`
    },
    {
      question: `Will my ${upperFrom} image lose quality after converting to ${upperTo}?`,
      answer: `MicroJPEG uses tuned settings to keep your image visually sharp while reducing file size as much as possible. You can safely use the converted ${upperTo} file on websites, blogs and portfolios.`
    }
  ];
}

export function getHowToSchema(from: string, to: string, url: string) {
  const upperFrom = from.toUpperCase();
  const upperTo = to.toUpperCase();

  // Special HowTo schema for CR2 to JPG
  if (from.toLowerCase() === 'cr2' && to.toLowerCase() === 'jpg') {
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Convert CR2 to JPG Online",
      "description": "Step-by-step instructions to convert Canon CR2 RAW files to JPG using MicroJPEG.",
      "mainEntityOfPage": url,
      "estimatedDuration": "PT3M",
      "step": [
        { "@type": "HowToStep", "position": 1, "text": "Click Upload Files and select your CR2 images." },
        { "@type": "HowToStep", "position": 2, "text": "Wait for the RAW photos to load securely in your browser." },
        { "@type": "HowToStep", "position": 3, "text": "MicroJPEG automatically converts them into high-quality JPG format." },
        { "@type": "HowToStep", "position": 4, "text": "Download your JPG results one by one or in a batch ZIP package." },
        { "@type": "HowToStep", "position": 5, "text": "(Optional) Upload more CR2 files to convert additional images." }
      ]
    };
  }

  // Default HowTo schema for other conversions
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to convert ${upperFrom} to ${upperTo} online`,
    "description": `Step-by-step instructions to convert ${upperFrom} to ${upperTo} using MicroJPEG.`,
    "mainEntityOfPage": url,
    "step": [
      { "@type": "HowToStep", "position": 1, "text": `Upload your ${upperFrom} file.` },
      { "@type": "HowToStep", "position": 2, "text": `Confirm ${upperTo} as the output format.` },
      { "@type": "HowToStep", "position": 3, "text": "Click Convert and wait a few seconds." },
      { "@type": "HowToStep", "position": 4, "text": `Download your optimized ${upperTo} file.` }
    ]
  };
}

export function getSoftwareAppSchema(from: string, to: string, url: string) {
  const upperFrom = from.toUpperCase();
  const upperTo = to.toUpperCase();

  // Special SoftwareApp schema for CR2 to JPG
  if (from.toLowerCase() === 'cr2' && to.toLowerCase() === 'jpg') {
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "CR2 to JPG Converter – MicroJPEG",
      "description": "MicroJPEG is a browser-based image converter that allows users to convert Canon CR2 RAW files into JPG format instantly. It supports batch uploads, high-quality RAW decoding, metadata preservation, and fast JPG output optimized for web use. No installation required; works on Windows, Mac, Linux, iOS, and Android. Ideal for photographers, designers, and everyday users working with Canon RAW images.",
      "operatingSystem": ["Windows", "macOS", "Linux", "iOS", "Android"],
      "applicationCategory": "MultimediaApplication",
      "url": url,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Batch CR2 to JPG conversion",
        "High-quality RAW decoding",
        "EXIF metadata preservation",
        "No installation required",
        "Browser-based (Windows, Mac, Linux, iOS, Android)",
        "Secure local processing",
        "ZIP download for multiple files"
      ]
    };
  }

  // Default SoftwareApp schema for other conversions
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `${upperFrom} to ${upperTo} Converter – MicroJPEG`,
    "operatingSystem": "Web Browser",
    "applicationCategory": "MultimediaApplication",
    "url": url,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
}

export function getFaqSchema(from: string, to: string, url: string) {
  const faq = getConversionFaq(from, to);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    })),
    "mainEntityOfPage": url
  };
}

// ============================================================================
// CR2-SPECIFIC CONTENT SECTIONS (from fully optimized document)
// ============================================================================

export const CR2_TO_JPG_CONTENT = {
  intro: "Converting CR2 to JPG is essential when you need a universally compatible, compressed version of Canon RAW photos. CR2 files contain rich detail and wide dynamic range, but they are large and difficult to open on many devices. MicroJPEG makes CR2 conversion fast, accurate, and fully browser-based — no software installation, no slow preview tools, and no quality-destroying compression. Whether you're a photographer exporting batches from a Canon DSLR, working on Windows, Mac, or mobile, MicroJPEG lets you convert CR2 files to JPG instantly while preserving maximum detail and metadata wherever possible. Simply upload your CR2 images and download them as clean, optimized JPG files.",

  whatIs: "A CR2 file is Canon's RAW image format used in EOS DSLR cameras. It stores uncompressed sensor data, allowing maximum editing flexibility. Because CR2 files contain high detail, they are much larger than JPGs and cannot be opened easily on many apps, phones, or websites. This is why converting CR2 to JPG is required for sharing, editing, printing, or uploading online.",

  whyConvert: [
    "JPG is supported on all devices and browsers.",
    "File size becomes up to 10× smaller.",
    "Easier to upload to websites, emails, and social platforms.",
    "Faster workflow compared to RAW editing apps.",
    "Ensures compatibility across Windows, Mac, Android, and iOS.",
    "Ideal for backups and quick previews."
  ],

  deviceCoverage: {
    windows: "Windows 10/11 often cannot preview CR2 files natively. MicroJPEG converts CR2 to JPG instantly without needing extra software.",
    mac: "macOS Preview supports CR2 but loads slowly. MicroJPEG provides a faster online alternative for converting CR2 images.",
    android: "Most Android phones cannot open CR2. Upload the RAW file here and download a standard JPG."
  },

  quality: "CR2 conversion on MicroJPEG preserves maximum detail and natural color. Most metadata such as exposure settings, camera model, and timestamps are retained whenever possible. Extremely large CR2 files are compressed intelligently to maintain clarity without visible quality loss.",

  bulk: "MicroJPEG supports batch CR2 to JPG conversion with multiple uploads. Professional photographers using Canon EOS cameras can convert dozens of RAW images at once and download all JPGs in a single ZIP file — ideal for quick client deliveries, portfolio uploads, or website publishing.",

  offlineTools: "CR2 files can also be converted using offline tools like Adobe Lightroom, Photoshop, RawTherapee, GIMP, or FFmpeg. These require installation and technical steps. MicroJPEG offers a zero-setup online alternative that works instantly across all devices.",

  troubleshooting: [
    { issue: "CR2 won't open on Windows?", solution: "Convert here into JPG." },
    { issue: "CR2 looks dull before conversion?", solution: "RAW previews lack processing." },
    { issue: "CR2 too large?", solution: "JPG reduces size drastically." },
    { issue: "Batch conversion confusion?", solution: "Upload multiple files together." }
  ]
};
