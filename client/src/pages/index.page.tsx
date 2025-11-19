// pages/index.page.tsx
import React from 'react'
import Landing from '@/pages/micro-jpeg-landing'
import { SEOHead } from '@/components/SEOHead'

export default function Page() {
  return (
    <>
      <SEOHead
        title="MicroJPEG - Smart Image Compression & RAW Converter Online"
        description="Compress JPEG, PNG, WebP, AVIF and convert 65+ RAW formats (CR2, NEF, ARW, DNG) online free. Reduce file size by up to 90% with no quality loss."
      />
      <Landing />
    </>
  )
}

// THIS IS THE MAGIC — Google now sees full HTML!
export const prerender = true