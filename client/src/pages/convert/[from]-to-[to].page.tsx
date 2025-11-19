// pages/convert/[from]-to-[to].page.tsx
import React from 'react'
import ConversionPage from '@/pages/ConversionPage'
import { usePageContext } from 'vike-react'

export default function Page() {
  const { routeParams } = usePageContext()
  const conversion = `${routeParams.from}-to-${routeParams.to}`

  return <ConversionPage initialConversion={conversion} />
}

// ALL 65+ CONVERSION URLs (both /convert/ and /compress/)
export async function prerender() {
  const conversions = [
    // === RAW to Regular ===
    'cr2-to-jpg', 'cr2-to-png', 'cr2-to-webp', 'cr2-to-avif', 'cr2-to-tiff',
    'crw-to-jpg', 'crw-to-png', 'crw-to-webp', 'crw-to-avif', 'crw-to-tiff',
    'cr3-to-jpg', 'cr3-to-png', 'cr3-to-webp', 'cr3-to-avif',
    'nef-to-jpg', 'nef-to-png', 'nef-to-webp', 'nef-to-avif', 'nef-to-tiff',
    'arw-to-jpg', 'arw-to-png', 'arw-to-webp', 'arw-to-avif', 'arw-to-tiff',
    'orf-to-jpg', 'orf-to-png', 'orf-to-webp', 'orf-to-avif', 'orf-to-tiff',
    'raf-to-jpg', 'raf-to-png', 'raf-to-webp', 'raf-to-avif', 'raf-to-tiff',
    'dng-to-jpg', 'dng-to-png', 'dng-to-webp', 'dng-to-avif', 'dng-to-tiff',

    // === Regular Conversions ===
    'jpg-to-png', 'jpg-to-webp', 'jpg-to-avif', 'jpg-to-tiff',
    'png-to-jpg', 'png-to-webp', 'png-to-avif', 'png-to-tiff',
    'webp-to-jpg', 'webp-to-png', 'webp-to-avif', 'webp-to-tiff',
    'avif-to-jpg', 'avif-to-png', 'avif-to-webp', 'avif-to-tiff',
    'tiff-to-jpg', 'tiff-to-png', 'tiff-to-webp', 'tiff-to-avif',
    'svg-to-jpg', 'svg-to-png', 'svg-to-webp', 'svg-to-avif', 'svg-to-tiff',

    // === Compression (same format) ===
    'jpg-to-jpg', 'png-to-png', 'webp-to-webp', 'avif-to-avif', 'tiff-to-tiff'
  ]

  // Generate both /convert/ and /compress/ URLs
  const convertUrls = conversions.map(slug => `/convert/${slug}`)
  const compressUrls = ['jpg', 'png', 'webp', 'avif', 'tiff'].map(format => `/compress/${format}`)

  return [...convertUrls, ...compressUrls]
}

export const prerender = true