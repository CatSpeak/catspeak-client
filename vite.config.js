import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { fileURLToPath } from "url"
import livekitDevToken from "./plugins/livekitDevToken.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env.development.local vars into process.env (for server-side plugins)
  const env = loadEnv(mode, process.cwd(), "")
  Object.assign(process.env, env)

  return {
    plugins: [react(), livekitDevToken()],
    server: {
      proxy: {
        "/api": {
          target: "https://stagingapi.catspeak.com.vn",
          changeOrigin: true,
          secure: true,
        },
        "/hubs": {
          target: "https://stagingapi.catspeak.com.vn",
          changeOrigin: true,
          secure: true,
          ws: true,
        },
        "/r2": {
          target: "https://3bef3ed6d4d479f38c51000461eeaa0f.r2.cloudflarestorage.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/r2/, ""),
        },
      },
    },
    build: {
      outDir: "dist",
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "redux-vendor": ["@reduxjs/toolkit", "react-redux"],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@layouts": path.resolve(__dirname, "./src/layouts"),

        "@routes": path.resolve(__dirname, "./src/routes"),
        "@utils": path.resolve(__dirname, "./src/shared/utils"),
        "@hooks": path.resolve(__dirname, "./src/shared/hooks"),
        "@store": path.resolve(__dirname, "./src/store"),
        "@services": path.resolve(__dirname, "./src/shared/services"),
        "@styles": path.resolve(__dirname, "./src/shared/styles"),
        "@config": path.resolve(__dirname, "./src/shared/config"),
        "@i18n": path.resolve(__dirname, "./src/shared/i18n"),
        "@context": path.resolve(__dirname, "./src/shared/context"),
      },
    },
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
  }
})
