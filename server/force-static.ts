import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function forceServeStatic(app: Express) {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  🚨 EMERGENCY STATIC FILE SERVING                       ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  // Try EVERY possible location
  const locations = [
    '/app/dist/client',
    '/app/dist/public', 
    path.resolve(process.cwd(), 'dist/client'),
    path.resolve(process.cwd(), 'dist/public'),
    path.resolve(process.cwd(), 'dist'),
  ];

  console.log('🔍 Checking ALL possible build locations:');
  
  let foundLocation: string | null = null;
  
  for (const loc of locations) {
    const exists = fs.existsSync(loc);
    console.log(`   ${exists ? '📁' : '❌'} ${loc}`);
    
    if (exists && !foundLocation) {
      const indexPath = path.join(loc, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log(`      ✅ index.html found!`);
        
        // Check if it's the built version
        const content = fs.readFileSync(indexPath, 'utf-8');
        const scriptMatch = content.match(/<script[^>]*src="([^"]*)"[^>]*>/);
        const scriptSrc = scriptMatch ? scriptMatch[1] : 'NO SCRIPT TAG';
        
        console.log(`      📜 Script src: ${scriptSrc}`);
        
        if (scriptSrc.includes('/src/main.tsx')) {
          console.log(`      ⚠️  This is DEV version (has /src/main.tsx)`);
        } else if (scriptSrc.includes('/assets/')) {
          console.log(`      ✅ This is PROD version (has /assets/)`);
          foundLocation = loc;
        } else {
          console.log(`      ⚠️  Unknown script source`);
        }
        
        // Use it anyway if we haven't found anything better
        if (!foundLocation && scriptSrc !== 'NO SCRIPT TAG') {
          foundLocation = loc;
        }
      } else {
        console.log(`      ❌ No index.html in this directory`);
      }
      
      // Show what files are in the directory
      try {
        const files = fs.readdirSync(loc);
        console.log(`      📂 Contains: ${files.slice(0, 8).join(', ')}${files.length > 8 ? '...' : ''}`);
      } catch (err) {
        console.log(`      ⚠️  Could not list directory`);
      }
    }
  }

  if (!foundLocation) {
    console.log('\n❌ CRITICAL ERROR: Could not find ANY valid build!');
    console.log('\n📊 Debug information:');
    console.log('   process.cwd():', process.cwd());
    console.log('   __dirname equivalent:', import.meta.dirname);
    
    // Show what's in the project root
    try {
      const rootFiles = fs.readdirSync(process.cwd());
      console.log('   Project root contains:', rootFiles.slice(0, 10).join(', '));
    } catch (err) {
      console.log('   Could not read project root');
    }
    
    throw new Error('No valid build found in any location - check Vite build output');
  }

  console.log(`\n✅ USING BUILD FROM: ${foundLocation}\n`);

  // Set up static file serving
  console.log('📦 Configuring express.static...');
  app.use(express.static(foundLocation, {
    etag: false,
    maxAge: 0,
    index: false,
  }));
  console.log('   ✅ Static files configured');

  // Set up SPA fallback
  const indexPath = path.join(foundLocation, 'index.html');
  console.log('🔀 Configuring SPA fallback...');
  console.log(`   Index path: ${indexPath}`);
  
  app.use("*", (req, res) => {
    console.log(`📥 [${new Date().toISOString()}] Serving index.html for: ${req.path}`);
    res.sendFile(indexPath);
  });
  
  console.log('   ✅ SPA fallback configured');
  
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  ✅ EMERGENCY STATIC SERVING COMPLETE                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}
