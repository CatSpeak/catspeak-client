import path from "path"
import { fileURLToPath } from "url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@styles": path.resolve(__dirname, "./src/shared/styles"),
      // Pre-existing video-call unit tests import `node:test`; run them
      // through vitest instead of failing with "No test suite found".
      "node:test": path.resolve(__dirname, "./src/test/nodeTestShim.js"),
    },
  },
  test: {
    include: [
      "src/features/placement-test/**/*.test.{js,jsx}",
      "src/features/ai-tutor/**/*.test.{js,jsx}",
      "src/features/learning-path/**/*.test.{js,jsx}",
      "src/features/navigation/**/*.test.{js,jsx}",
      "src/features/rooms/components/**/*.test.{js,jsx}",
      "src/features/billing/**/*.test.{js,jsx}",
      "src/features/video-call/**/*.test.{js,jsx}",
    ],
  },
})
