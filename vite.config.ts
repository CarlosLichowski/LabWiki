// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // 🟢 BLOQUE DE CONFIGURACIÓN DEL SERVIDOR LOCAL
  server: {
    port: 5173, // Establece el puerto fijo a 5173
    open: true, // Abre el navegador automáticamente al ejecutar 'npm run dev'
    host: 'localhost', // Asegura que se vincule solo a localhost
  },
});