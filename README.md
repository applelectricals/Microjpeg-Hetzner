# Micro JPEG Compressor - Production Deploy

Professional JPEG compression application with multi-format support.

## Features
- JPEG compression with quality control
- Multi-format conversion (PNG, WebP, AVIF, TIFF, SVG, RAW)
- Stripe subscription integration
- Google OAuth authentication
- Image preview and comparison
- Batch processing

## Deploy to Render

1. Push this folder to GitHub
2. Go to Render Dashboard → New + → Blueprint
3. Select your repository
4. Render auto-detects `render.yaml`
5. Add environment variables
6. Click Apply to deploy

## Required Environment Variables

```
STRIPE_SECRET_KEY
VITE_STRIPE_PUBLIC_KEY  
SENDGRID_API_KEY
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
VITE_TIDIO_PUBLIC_KEY
DATABASE_URL (auto-configured by Render)
```

## Tech Stack
- Frontend: React 18 + TypeScript + Vite + TailwindCSS
- Backend: Express.js + Node.js
- Database: PostgreSQL
- Image Processing: Sharp
