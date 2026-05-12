import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this site under /<repo-name>/ so we set base accordingly.
// (When running `npm run dev`, base is just '/'.)
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/proset-voice-first-prototype/' : './',
})
