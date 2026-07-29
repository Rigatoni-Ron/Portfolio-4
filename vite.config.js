import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// This package is "type": "module", so __dirname doesn't exist — resolve the
// entries from import.meta.url instead.
const entry = (file) => fileURLToPath(new URL(file, import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Two pages: the site, and the CV (its own tab, its own print sheet).
    // preview.html stays out of this on purpose — it's a dev-only scratch page.
    rollupOptions: {
      input: {
        main: entry('./index.html'),
        cv: entry('./cv.html'),
      },
    },
  },
})
