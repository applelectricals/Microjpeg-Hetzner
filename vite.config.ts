// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'

export default defineConfig({
  plugins: [react(), vike({ prerender: true })],
  build: {
    target: 'esnext'
  }
})