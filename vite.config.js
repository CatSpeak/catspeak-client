/* global process */
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MIME_BY_EXT = {
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
}

function selfHostTinyMcePlugin() {
  const tinySrcDir = path.resolve(__dirname, "node_modules/tinymce")
  const tinyDistDir = path.resolve(__dirname, "dist/tinymce")

  const serveMiddleware = (req, res, next) => {
    const reqUrl = (req.url || "").split("?")[0]
    if (!reqUrl.startsWith("/tinymce/")) return next()
    const relPath = reqUrl.slice("/tinymce/".length)
    const filePath = path.resolve(tinySrcDir, relPath)
    if (!filePath.startsWith(tinySrcDir + path.sep) || !fs.existsSync(filePath)) {
      return next()
    }
    const stat = fs.statSync(filePath)
    if (!stat.isFile()) return next()
    const ext = path.extname(filePath).toLowerCase()
    res.setHeader("Content-Type", MIME_BY_EXT[ext] || "application/octet-stream")
    fs.createReadStream(filePath).pipe(res)
  }

  return {
    name: "self-host-tinymce",
    configureServer(server) {
      server.middlewares.use(serveMiddleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveMiddleware)
    },
    closeBundle() {
      if (fs.existsSync(tinySrcDir)) {
        fs.mkdirSync(tinyDistDir, { recursive: true })
        fs.cpSync(tinySrcDir, tinyDistDir, { recursive: true })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env.development.local vars into process.env (for server-side plugins)
  const env = loadEnv(mode, process.cwd(), "")
  Object.assign(process.env, env)

  return {
    plugins: [react(), selfHostTinyMcePlugin()],
    optimizeDeps: {
      // mediapipe wasm uses Emscripten Module['arguments'] which esbuild
      // incorrectly minifies to plain `arguments_` causing
      // "Module.arguments has been replaced with plain arguments_" abort.
      // Exclude from pre-bundle to keep original wasm loader intact.
      exclude: ["@mediapipe/tasks-vision", "@mediapipe/face_mesh"],
      esbuildOptions: {
        keepNames: true,
      },
    },
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
    worker: {
      format: "es",
    },
    define: {
      global: "globalThis",
    },
    server: {
      proxy: {
        "/api/v1/Instructors": {
          target: "https://instructor-staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: true,
        },
        "/api/v1/instructor": {
          target: "https://instructor-staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: true,
        },
        "/api/media": {
          target: "https://instructor-staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: true,
        },
        "/api/teacher": {
          target: "https://instructor-staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: true,
        },
        "/api/student": {
          target: "https://instructor-staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: true,
        },
        "/api/explore": {
          target: "https://instructor-staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: true,
        },
        "/api/personal-materials": {
          target: "https://instructor-staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: true,
        },
        "/api/vouchers": {
          target: "https://instructor-staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: true,
        },
        "/api/v1/Payments": {
          target: "https://staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: true,
        },
        "/api/social": {
          target: "https://social-staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/social/, "/api"),
        },
        "/api": {
          target: "https://staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: false,
        },
        "/hubs/social": {
          target: "https://social-staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        "/hubs": {
          target: "https://staging-api.catspeak.com.vn",
          changeOrigin: true,
          secure: false,
          ws: true,
        },

        "/r2": {
          target:
            "https://3bef3ed6d4d479f38c51000461eeaa0f.r2.cloudflarestorage.com",
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
            "mediapipe-face": ["@mediapipe/face_mesh"],
            "mediapipe-tasks": ["@mediapipe/tasks-vision"],
          },
        },
        onwarn(warning, warn) {
          // @mediapipe/face_mesh is dynamically imported and large; suppress the
          // "Can't resolve dynamic import" advisory (it resolves at runtime).
          if (
            warning.code === "UNRESOLVED_IMPORT" &&
            warning.exporter?.includes("face_mesh")
          )
            return
          warn(warning)
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "react-hot-toast": path.resolve(
          __dirname,
          "./src/shared/utils/toastBridge.jsx",
        ),
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
  }
})
