// vike.config.js
export default {
  // Client-only app — no SSR server
  ssr: false,

  // Generate real HTML for all pages (homepage + all 65 convert pages)
  prerender: {
    // This is the key — generate pure static HTML files
    partial: false,
    noExtraDir: false,
    parallel: true
  }
}