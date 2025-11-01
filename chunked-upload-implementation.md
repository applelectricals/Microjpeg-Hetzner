# Complete Chunked Upload Implementation for Large Images (50MB+)

## Architecture Overview

This implementation uses **tus.io protocol** for resumable, chunked uploads that bypass Cloudflare's 100MB limit and handle network interruptions gracefully.

### How It Works:
1. **Client** splits file into chunks (5-10MB each)
2. **Each chunk** uploaded separately to your server
3. **Server** stores chunks temporarily
4. **When complete**, chunks are merged and processed
5. **Upload to R2** happens server-side (no proxy issues)

---

## Backend Implementation (Node.js + Express)

### 1. Install Dependencies

```bash
npm install @tus/server @tus/file-store express cors
```

### 2. Create Tus Server (`server.js`)

```javascript
const express = require('express');
const cors = require('cors');
const { Server } = require('@tus/server');
const { FileStore } = require('@tus/file-store');
const path = require('path');
const fs = require('fs').promises;
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();

// CORS for chunked uploads
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  exposedHeaders: ['Location', 'Upload-Offset', 'Upload-Length', 'Tus-Resumable'],
  methods: ['GET', 'HEAD', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
}));

// Configure R2 (Cloudflare S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Tus upload directory (temporary storage)
const uploadDir = path.join(__dirname, 'uploads');

// Create Tus Server
const tusServer = new Server({
  path: '/files',
  datastore: new FileStore({ 
    directory: uploadDir,
  }),
  // Handle upload completion
  onUploadFinish: async (req, res, upload) => {
    console.log(`✅ Upload complete: ${upload.id}`);
    console.log(`File: ${upload.metadata?.filename}`);
    console.log(`Size: ${upload.size} bytes`);

    try {
      // Get the uploaded file path
      const filePath = path.join(uploadDir, upload.id);
      
      // Read file
      const fileBuffer = await fs.readFile(filePath);
      
      // Upload to R2
      const r2Key = `uploads/${Date.now()}-${upload.metadata?.filename}`;
      await r2Client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: r2Key,
        Body: fileBuffer,
        ContentType: upload.metadata?.filetype || 'application/octet-stream',
      }));

      console.log(`📦 Uploaded to R2: ${r2Key}`);

      // Process image here (compression, conversion, etc.)
      const result = await processImage(fileBuffer, upload.metadata);

      // Clean up temporary file
      await fs.unlink(filePath);
      console.log(`🗑️ Cleaned up temp file: ${upload.id}`);

      // Store metadata in your database
      // await db.images.create({ ... });

      // Return success response
      res.status(200).json({
        success: true,
        uploadId: upload.id,
        r2Key: r2Key,
        processed: result
      });

    } catch (error) {
      console.error('Error processing upload:', error);
      res.status(500).json({ error: 'Failed to process upload' });
    }
  },
  onUploadCreate: (req, res, upload) => {
    console.log(`📤 New upload started: ${upload.id}`);
    console.log(`Metadata:`, upload.metadata);
    return res;
  },
});

// Mount Tus server
app.all('/files', (req, res) => {
  tusServer.handle(req, res);
});

app.all('/files/*', (req, res) => {
  tusServer.handle(req, res);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', tus: 'enabled' });
});

// Your existing compression endpoint (for fallback/small files)
app.post('/api/compress', async (req, res) => {
  // Your existing logic for small files
});

// Image processing function
async function processImage(buffer, metadata) {
  // Your image processing logic here
  // Use sharp, jimp, or other libraries
  const sharp = require('sharp');
  
  const formats = ['jpeg', 'png', 'webp', 'avif'];
  const results = {};

  for (const format of formats) {
    const processed = await sharp(buffer)
      .toFormat(format, { quality: 80 })
      .toBuffer();
    
    results[format] = {
      size: processed.length,
      buffer: processed
    };
  }

  return results;
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`🔄 Tus endpoint: http://localhost:${PORT}/files`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
```

### 3. Environment Variables

Add to your `.env`:

```bash
# Tus Configuration
TUS_UPLOAD_DIR=/home/claude/uploads

# R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name

# Server
PORT=3000
FRONTEND_URL=https://microjpeg.com
```

---

## Frontend Implementation (React/Vanilla JS)

### 1. Install tus-js-client

```bash
npm install tus-js-client
```

### 2. Create Upload Component

```javascript
import * as tus from 'tus-js-client';
import { useState } from 'react';

function ChunkedUploader() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadUrl, setUploadUrl] = useState(null);

  const handleFileUpload = (file) => {
    if (!file) return;

    // Validate file size (allow up to 250MB)
    if (file.size > 250 * 1024 * 1024) {
      setError('File too large. Maximum size is 250MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an image.');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    // Create tus upload
    const upload = new tus.Upload(file, {
      // Your server endpoint
      endpoint: 'https://microjpeg.com/files',
      
      // Retry configuration
      retryDelays: [0, 3000, 5000, 10000, 20000],
      
      // Chunk size (10MB chunks work well)
      chunkSize: 10 * 1024 * 1024, // 10MB
      
      // Metadata
      metadata: {
        filename: file.name,
        filetype: file.type,
        filesize: file.size.toString(),
      },
      
      // Upload storage (for resume capability)
      uploadUrl: uploadUrl || undefined,
      
      // Callbacks
      onError: (error) => {
        console.error('Upload failed:', error);
        setError(`Upload failed: ${error.message}`);
        setUploading(false);
      },
      
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        setProgress(parseFloat(percentage));
        console.log(`Progress: ${percentage}%`);
      },
      
      onSuccess: () => {
        console.log('Upload complete!');
        setProgress(100);
        setUploading(false);
        setUploadUrl(upload.url);
        
        // Show success message
        alert(`Upload successful! File: ${file.name}`);
        
        // Clear upload URL from storage
        localStorage.removeItem(`tus::${upload.url}::expiration_date`);
      },
      
      // Store upload URL for resume capability
      onAfterResponse: (req, res) => {
        const uploadUrl = res.getHeader('Location');
        if (uploadUrl) {
          setUploadUrl(uploadUrl);
          // Store in localStorage for resume
          localStorage.setItem('lastUploadUrl', uploadUrl);
        }
      },
    });

    // Check for previous uploads (resume capability)
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) {
        const confirmed = confirm(
          'Found a previous unfinished upload. Do you want to resume it?'
        );
        
        if (confirmed) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
      }
      
      // Start upload
      upload.start();
    });

    // Store upload instance for pause/resume
    window.currentUpload = upload;
  };

  const pauseUpload = () => {
    if (window.currentUpload) {
      window.currentUpload.abort();
      setUploading(false);
    }
  };

  const resumeUpload = () => {
    if (window.currentUpload) {
      window.currentUpload.start();
      setUploading(true);
    }
  };

  return (
    <div className="chunked-uploader">
      <h2>Upload Large Images (up to 250MB)</h2>
      
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files[0])}
        disabled={uploading}
      />
      
      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>{progress.toFixed(2)}% uploaded</p>
          
          <button onClick={pauseUpload}>Pause</button>
          <button onClick={resumeUpload}>Resume</button>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
      
      {progress === 100 && !uploading && (
        <div className="success-message">
          ✅ Upload complete!
        </div>
      )}
    </div>
  );
}

export default ChunkedUploader;
```

### 3. Vanilla JavaScript Alternative

```html
<!DOCTYPE html>
<html>
<head>
  <title>Chunked Upload</title>
  <script src="https://cdn.jsdelivr.net/npm/tus-js-client@3.1.3/dist/tus.min.js"></script>
</head>
<body>
  <input type="file" id="fileInput" accept="image/*" />
  <div id="progress"></div>
  
  <script>
    document.getElementById('fileInput').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      const upload = new tus.Upload(file, {
        endpoint: 'https://microjpeg.com/files',
        retryDelays: [0, 3000, 5000, 10000, 20000],
        chunkSize: 10 * 1024 * 1024, // 10MB chunks
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: (error) => {
          console.error('Failed:', error);
          document.getElementById('progress').textContent = 'Upload failed: ' + error.message;
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          document.getElementById('progress').textContent = percentage + '%';
        },
        onSuccess: () => {
          document.getElementById('progress').textContent = '100% - Complete!';
        }
      });
      
      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length && confirm('Resume previous upload?')) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    });
  </script>
</body>
</html>
```

---

## Cloudflare Configuration for Chunked Uploads

### 1. DNS Settings
- Keep your main domain **proxied (orange cloud)** for CDN benefits
- The tus endpoint will work through the proxy

### 2. Create Page Rule for `/files/*`
Go to **Rules > Page Rules**:
- **URL**: `microjpeg.com/files/*`
- **Settings**:
  - Cache Level: Bypass
  - Security Level: Medium
  - Disable: Browser Integrity Check, Rocket Loader

### 3. Create WAF Rule
Go to **Security > WAF > Custom Rules**:
- **Name**: "Allow Chunked Uploads"
- **Expression**:
  ```
  (http.request.uri.path contains "/files")
  ```
- **Action**: Skip → All remaining rules

### 4. Create Transform Rule (Optional)
Go to **Rules > Transform Rules > HTTP Request Header Modification**:
- **Name**: "Tus Headers"
- **Expression**: `(http.request.uri.path contains "/files")`
- **Set Static Header**:
  - `Tus-Resumable: 1.0.0`

---

## Coolify Configuration

### 1. Update Environment Variables

In **Application > Environment Variables**, add:

```bash
# Tus Configuration
TUS_ENABLED=true
TUS_UPLOAD_DIR=/home/claude/uploads
TUS_MAX_SIZE=262144000

# Existing vars...
BODY_LIMIT=250mb
```

### 2. Server Proxy Config

In **Server > Proxy Configuration**, add:

```yaml
http:
  middlewares:
    tus-uploads:
      buffering:
        maxRequestBodyBytes: 15728640  # 15MB (larger than chunk size)
        maxResponseBodyBytes: 15728640
        retryExpression: "IsNetworkError() && Attempts() < 2"
      headers:
        customResponseHeaders:
          Tus-Resumable: "1.0.0"
          Access-Control-Expose-Headers: "Location, Upload-Offset, Upload-Length, Tus-Resumable"
    
    tus-timeout:
      forwardingTimeouts:
        dialTimeout: 30s
        responseHeaderTimeout: 120s  # 2 minutes per chunk
```

---

## Benefits of This Approach

✅ **Bypasses Cloudflare 100MB limit** - Each chunk is only 10MB
✅ **Resumable uploads** - Network interruptions don't restart upload
✅ **Faster uploads** - Parallel chunk processing possible
✅ **Better UX** - Real-time progress tracking
✅ **Server efficiency** - No memory overload from large files
✅ **R2 integration** - Direct upload to storage after processing
✅ **Error recovery** - Automatic retries with exponential backoff

---

## Testing

### 1. Test with curl:

```bash
# Create upload
curl -X POST https://microjpeg.com/files \
  -H "Tus-Resumable: 1.0.0" \
  -H "Upload-Length: 52428800" \
  -H "Upload-Metadata: filename dGVzdC5qcGc=,filetype aW1hZ2UvanBlZw==" \
  -v

# Upload chunk (get Location header from above)
curl -X PATCH https://microjpeg.com/files/UPLOAD_ID \
  -H "Tus-Resumable: 1.0.0" \
  -H "Upload-Offset: 0" \
  -H "Content-Type: application/offset+octet-stream" \
  --data-binary @chunk1.bin \
  -v
```

### 2. Monitor Logs:

```bash
# In Coolify > Application > Logs
# Look for:
# "📤 New upload started"
# "✅ Upload complete"
# "📦 Uploaded to R2"
```

---

## Migration Path

1. **Phase 1** (Immediate):
   - Deploy tus server alongside existing API
   - Test with large files
   - Keep existing `/api/compress` for small files

2. **Phase 2** (After testing):
   - Update frontend to use tus for files > 25MB
   - Keep legacy upload for files < 25MB

3. **Phase 3** (Full migration):
   - Migrate all uploads to tus
   - Remove old upload code

---

## Alternative: Direct R2 Upload (Simpler but less robust)

If you want a simpler solution without tus:

```javascript
// Backend: Generate presigned URL
app.post('/api/get-upload-url', async (req, res) => {
  const { filename, contentType } = req.body;
  const key = `uploads/${Date.now()}-${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  
  res.json({ uploadUrl, key });
});

// Frontend: Upload directly
const response = await fetch('/api/get-upload-url', {
  method: 'POST',
  body: JSON.stringify({ filename: file.name, contentType: file.type }),
});

const { uploadUrl, key } = await response.json();

await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type },
});

// Then process
await fetch('/api/process-image', {
  method: 'POST',
  body: JSON.stringify({ key }),
});
```

This bypasses your server entirely but doesn't support chunking or resume.

---

## Recommended: Use Tus.io

The tus.io approach is the gold standard for large file uploads and is what professional apps use. It's more complex to set up but provides the best user experience.
