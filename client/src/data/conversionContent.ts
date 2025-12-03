// src/data/conversionContent.ts

export interface ConversionSection {
  title: string;
  body: string;
}

export interface ConversionPageContent {
  intro: string;
  howToSteps: string[];
  sections: ConversionSection[];
}

// Key like "cr2-to-jpg"
const slug = (from: string, to: string) => `${from.toLowerCase()}-to-${to.toLowerCase()}`;

// 1) Special hand-written content
const OVERRIDES: Record<string, ConversionPageContent> = {
  "cr2-to-jpg": {
    intro:
      "Converting CR2 to JPG is essential when you need a universally compatible, compressed version of Canon RAW photos. CR2 files contain rich detail and wide dynamic range, but they are large and difficult to open on many devices. MicroJPEG makes CR2 conversion fast, accurate, and fully browser-based — no software installation, no slow preview tools, and no quality-destroying compression. Simply upload your CR2 images and download them as clean, optimized JPG files.",

    howToSteps: [
      "Click Upload Files and select your CR2 images.",
      "Wait for the RAW photos to load securely in your browser.",
      "MicroJPEG automatically converts them into high-quality JPG format.",
      "Download your JPG results one by one or in a batch ZIP package.",
      "Upload more CR2 files if you want to convert additional images."
    ],

    sections: [
      {
        title: "What is a CR2 file?",
        body:
          "A CR2 file is Canon’s RAW image format used in EOS DSLR cameras. It stores uncompressed sensor data, which is perfect for editing but too large and incompatible for everyday viewing. Converting CR2 to JPG creates small, shareable images that still look great."
      },
      {
        title: "Why convert CR2 to JPG?",
        body:
          "JPG is supported on every device and browser, uploads quickly, and is ideal for client delivery, websites, and email. A typical CR2 file can be up to 10× larger than its JPG version, so converting saves both time and storage."
      },
      {
        title: "Windows, Mac, and Android support",
        body:
          "Windows 10/11, macOS Preview, and Android devices often struggle to open CR2 files directly. MicroJPEG runs inside your browser and works on all of them, so you can convert CR2 to JPG on any device without installing extra software."
      },
      {
        title: "High quality and metadata preservation",
        body:
          "MicroJPEG uses tuned RAW decoding to preserve detail and natural color while reducing file size. Where possible, EXIF metadata such as exposure, camera model, and capture time is kept in the JPG output."
      },
      {
        title: "Batch conversion for Canon RAW workflows",
        body:
          "Upload multiple CR2 files at once to batch-convert them to JPG and download everything in a single ZIP. This is ideal for photographers who need fast client previews or web-ready exports from large Canon shoots."
      }
    ]
  }
};

// 2) Generic fallback for other conversions
function buildGenericContent(fromName: string, toName: string): ConversionPageContent {
  return {
    intro: `Convert ${fromName} to ${toName} online in seconds with MicroJPEG. Upload your files, let our engine process them securely, and download optimized ${toName} images ready for web, email, and storage.`,
    howToSteps: [
      `Upload your ${fromName} files using the Upload button or drag and drop.`,
      `Confirm ${toName} as the output format.`,
      "Click Convert and wait a few seconds.",
      `Download your converted ${toName} files individually or as a ZIP archive.`
    ],
    sections: [
      {
        title: `Why convert ${fromName} to ${toName}?`,
        body: `${fromName} files are not always ideal for sharing or web use. ${toName} is widely supported, smaller in size, and easy to work with in most apps and browsers.`
      },
      {
        title: "Fast online conversion",
        body:
          "MicroJPEG runs entirely in the browser with an optimized backend. You don’t need to install or maintain desktop software to run reliable conversions."
      }
    ]
  };
}

// 3) Public helper
export function getConversionPageContent(
  from: string,
  to: string,
  fromDisplayName: string,
  toDisplayName: string
): ConversionPageContent {
  const key = slug(from, to);
  if (OVERRIDES[key]) return OVERRIDES[key];
  return buildGenericContent(fromDisplayName, toDisplayName);
}
