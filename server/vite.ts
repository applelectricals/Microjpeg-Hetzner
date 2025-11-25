import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  console.log('🔍 Searching for client build directory...');
  
  // Try multiple possible locations
  const possiblePaths = [
    // Strategy 1: From project root (most likely in production)
    path.resolve(process.cwd(), 'dist', 'client'),
    
    // Strategy 2: Relative to compiled server code location
    path.resolve(import.meta.dirname, 'client'),
    
    // Strategy 3: One level up from compiled code, then into dist/client
    path.resolve(import.meta.dirname, '..', 'client'),
    
    // Strategy 4: Absolute path (if everything else fails)
    '/app/dist/client',
  ];

  console.log('   Checking paths:');
  let distPath: string | null = null;
  
  for (const testPath of possiblePaths) {
    const exists = fs.existsSync(testPath);
    console.log(`   ${exists ? '✅' : '❌'} ${testPath}`);
    
    if (exists && !distPath) {
      distPath = testPath;
    }
  }

  if (!distPath) {
    // Last resort: show what actually exists
    console.log('\n❌ Could not find client build in any expected location!');
    console.log('📂 Debugging info:');
    console.log('   process.cwd():', process.cwd());
    console.log('   import.meta.dirname:', import.meta.dirname);
    
    // Show contents of dist/ if it exists
    const distRoot = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distRoot)) {
      console.log('   Contents of dist/:', fs.readdirSync(distRoot).join(', '));
    } else {
      console.log('   ❌ dist/ directory does not exist at project root!');
    }

    throw new Error(
      `Could not find the build directory in any of these locations: ${possiblePaths.join(', ')}`
    );
  }

  console.log(`\n✅ Found client build at: ${distPath}\n`);

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath!, "index.html"));
  });
}
