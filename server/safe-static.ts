import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function safeServeStatic(app: Express) {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  🔍 SAFE STATIC FILE SERVING - CHECKING ALL LOCATIONS   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  // Try multiple possible locations (including where Vite is ACTUALLY building)
  const locations = [
    path.resolve(process.cwd(), 'client', 'dist', 'client'), // ← Where Vite is ACTUALLY building!
    path.resolve(process.cwd(), 'dist', 'client'),
    path.resolve(process.cwd(), 'dist', 'public'),
    '/app/client/dist/client', // ← Absolute version
    '/app/dist/client',
    '/app/dist/public',
  ];

  let distPath: string | null = null;
  
  for (const loc of locations) {
    try {
      if (fs.existsSync(loc)) {
        const indexPath = path.join(loc, 'index.html');
        if (fs.existsSync(indexPath)) {
          console.log(`✅ FOUND: ${loc}`);
          console.log(`   Has index.html: YES`);
          
          // Quick check of what's in index.html
          try {
            const content = fs.readFileSync(indexPath, 'utf-8');
            const hasAssets = content.includes('/assets/');
            const hasSrcMain = content.includes('/src/main.tsx');
            
            console.log(`   Has /assets/ paths: ${hasAssets ? 'YES ✅' : 'NO'}`);
            console.log(`   Has /src/main.tsx: ${hasSrcMain ? 'YES (dev version)' : 'NO'}`);
            
            if (hasAssets && !distPath) {
              distPath = loc;
              console.log(`   👉 WILL USE THIS ONE (production build)`);
            } else if (!distPath) {
              distPath = loc;
              console.log(`   👉 WILL USE THIS ONE (fallback)`);
            }
          } catch (err) {
            console.log(`   ⚠️  Could not read index.html: ${err}`);
          }
        } else {
          console.log(`⚠️  ${loc} exists but no index.html`);
        }
      } else {
        console.log(`❌ ${loc} does not exist`);
      }
    } catch (err) {
      console.log(`⚠️  Error checking ${loc}: ${err}`);
    }
  }

  if (!distPath) {
    console.log('\n❌ CRITICAL: No valid build found!');
    console.log('📂 Debug info:');
    console.log(`   process.cwd(): ${process.cwd()}`);
    console.log(`   __dirname equivalent: ${path.dirname(new URL(import.meta.url).pathname)}`);
    
    // Don't crash - serve a fallback response
    console.log('⚠️  Serving fallback error page instead of crashing...\n');
    
    app.use('*', (req, res) => {
      res.status(500).send(`
        <html>
          <head><title>Build Error</title></head>
          <body style="font-family: monospace; padding: 40px; background: #1a1a1a; color: #00ff00;">
            <h1>🚨 Build Not Found</h1>
            <p>The application build could not be located. Checked:</p>
            <ul>
              ${locations.map(l => `<li>${l}</li>`).join('')}
            </ul>
            <p>Current working directory: ${process.cwd()}</p>
            <p>Please check build configuration and try rebuilding.</p>
          </body>
        </html>
      `);
    });
    
    console.log('✅ Fallback error handler configured');
    return; // Don't throw - just return
  }

  console.log(`\n✅ USING BUILD FROM: ${distPath}\n`);

  // Configure static file serving
  try {
    app.use(express.static(distPath, {
      etag: false,
      maxAge: 0,
      index: false,
    }));
    console.log('✅ express.static configured');
  } catch (err) {
    console.log(`❌ Error configuring express.static: ${err}`);
  }

  // SPA fallback
  const indexPath = path.join(distPath, 'index.html');
  
  app.use("*", (req, res) => {
    try {
      res.sendFile(indexPath, (err) => {
        if (err && !res.headersSent) {
          console.log(`❌ Error sending ${indexPath}: ${err}`);
          res.status(500).send('Error serving application');
        }
      });
    } catch (err) {
      console.log(`❌ Exception in SPA fallback: ${err}`);
      if (!res.headersSent) {
        res.status(500).send('Internal error');
      }
    }
  });
  
  console.log('✅ SPA fallback configured\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  ✅ STATIC SERVING CONFIGURED                            ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}
