import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_SAKAI_URL, // Target API server
          changeOrigin: true, // Change the origin of the host header to the target URL
          rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api prefix when forwarding the request
        },
      },
    }
  }
})
