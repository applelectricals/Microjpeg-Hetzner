// src/data/conversionSchema.ts

export interface FAQItem {
  question: string;
  answer: string;
}

export function getConversionFaq(from: string, to: string): FAQItem[] {
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
