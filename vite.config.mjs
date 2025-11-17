import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  // This is what makes the build work from file:// and USB
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
  },
})