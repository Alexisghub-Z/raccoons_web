import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Compresión gzip para archivos de producción
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Solo comprimir archivos > 10KB
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Compresión Brotli (mejor que gzip)
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  build: {
    // Optimizaciones de build
    target: 'es2015', // Compatibilidad moderna
    minify: 'terser', // Mejor minificación que esbuild
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Eliminar funciones específicas
      },
    },
    // Configuración de chunks para mejor caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'utils-vendor': ['lenis', 'jspdf'],
        },
        // Nombres de archivo con hash para cache busting
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Optimizar chunks
    chunkSizeWarningLimit: 600, // Advertir si un chunk > 600KB
    cssCodeSplit: true, // Separar CSS por ruta
    sourcemap: false, // Desactivar sourcemaps en producción
    reportCompressedSize: true, // Reportar tamaño comprimido
    assetsInlineLimit: 4096, // Inline assets < 4KB como base64
  },
  // Optimizaciones de desarrollo
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    open: false,
  },
  // Optimizar dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    exclude: [],
  },
  // Preview server
  preview: {
    port: 4173,
    host: true,
  },
})
