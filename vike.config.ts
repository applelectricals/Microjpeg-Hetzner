// vike.config.js   (must be in project root, same level as vite.config.ts)
export default {
  // THIS LINE SOLVES THE ERROR FOREVER
  ssr: true,

  // This generates real HTML files for all pages (your 65 + homepage)
  prerender: true
}