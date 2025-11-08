import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    // Explicitly define environment variables for frontend
    define: {
      'import.meta.env.VITE_PAYPAL_CLIENT_ID': JSON.stringify(env.VITE_PAYPAL_CLIENT_ID || ''),
      'import.meta.env.VITE_PAYPAL_PLAN_STARTER_MONTHLY': JSON.stringify(env.VITE_PAYPAL_PLAN_STARTER_MONTHLY || ''),
      'import.meta.env.VITE_PAYPAL_PLAN_STARTER_YEARLY': JSON.stringify(env.VITE_PAYPAL_PLAN_STARTER_YEARLY || ''),
      'import.meta.env.VITE_PAYPAL_PLAN_PRO_MONTHLY': JSON.stringify(env.VITE_PAYPAL_PLAN_PRO_MONTHLY || ''),
      'import.meta.env.VITE_PAYPAL_PLAN_PRO_YEARLY': JSON.stringify(env.VITE_PAYPAL_PLAN_PRO_YEARLY || ''),
      'import.meta.env.VITE_PAYPAL_PLAN_BUSINESS_MONTHLY': JSON.stringify(env.VITE_PAYPAL_PLAN_BUSINESS_MONTHLY || ''),
      'import.meta.env.VITE_PAYPAL_PLAN_BUSINESS_YEARLY': JSON.stringify(env.VITE_PAYPAL_PLAN_BUSINESS_YEARLY || ''),
      'import.meta.env.VITE_PAYPAL_PLAN_CDN_STARTER': JSON.stringify(env.VITE_PAYPAL_PLAN_CDN_STARTER || ''),
      'import.meta.env.VITE_PAYPAL_PLAN_CDN_BUSINESS': JSON.stringify(env.VITE_PAYPAL_PLAN_CDN_BUSINESS || ''),
      'import.meta.env.VITE_PAYPAL_PLAN_CDN_ENTERPRISE': JSON.stringify(env.VITE_PAYPAL_PLAN_CDN_ENTERPRISE || ''),
    },
  };
});
