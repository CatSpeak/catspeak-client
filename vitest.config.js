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
    // Pre-existing video-call suites use the Node test runner (`node:test`),
    // not Vitest, so keep them out of this run.
    exclude: [
      "src/features/video-call/utils/callPolicy.test.js",
      "src/features/video-call/utils/hostSync.test.js",
      "src/features/video-call/utils/moderationNotice.test.js",
      "src/features/video-call/utils/participantVolumePreferences.test.js",
      "src/features/video-call/utils/roomAccess.test.js",
      "src/features/video-call/utils/stripParticipants.test.js",
      "src/features/video-call/utils/userPreferences.test.js",
      "src/features/video-call/utils/videoTileClass.test.js",
      "src/features/video-call/utils/watchMediaLayout.test.js",
      "src/features/video-call/utils/watchPlayerVars.test.js",
      "src/features/video-call/utils/watchSync.test.js",
      "src/features/video-call/utils/watchSyncMachine.test.js",
    ],
  },
})
