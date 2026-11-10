import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // 🟢 ESTA ES LA LÍNEA QUE SOLUCIONA EL ERROR MIME TYPE
  base: './',

  server: {
    port: 5173,
    open: true,
    host: 'localhost',
  },
});