import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      external: ['url', 'fs', 'path', 'stream', 'os', 'util', 'events', 'buffer'],
      output: {
        globals: {
          url: 'url',
          fs: 'fs',
          path: 'path'
        }
      }
    }
  }
});
