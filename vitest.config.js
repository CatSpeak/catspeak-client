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
  test: {
    include: [
      "src/shared/**/*.test.{js,jsx}",
      "src/store/**/*.test.{js,jsx}",
      "src/layouts/**/*.test.{js,jsx}",
      "src/routes/**/*.test.{js,jsx}",
      "src/features/auth/pages/**/*.test.{js,jsx}",
      "src/features/auth/components/**/*.test.{js,jsx}",
      "src/features/landing/**/*.test.{js,jsx}",
      "src/features/settings/**/*.test.{js,jsx}",
      "src/features/news/components/**/*.test.{js,jsx}",
      "src/features/video-call/utils/moderationAuth.test.js",
      "src/features/chat-assistant/**/*.test.{js,jsx}",
      "src/features/placement-test/**/*.test.{js,jsx}",
      "src/features/ai-tutor/**/*.test.{js,jsx}",
      "src/features/learning-path/**/*.test.{js,jsx}",
      "src/features/navigation/**/*.test.{js,jsx}",
      "src/features/rooms/components/**/*.test.{js,jsx}",
      "src/features/billing/**/*.test.{js,jsx}",
      "src/features/workspace/**/*.test.{js,jsx}",
      "src/features/chat/components/messages/**/*.test.{js,jsx}",
      "src/features/chat/components/ChatSidebar.test.jsx",
      "src/features/websites/**/*.test.{js,jsx}",
      "src/features/courses/components/analytics/**/*.test.{js,jsx}",
      "src/features/courses/components/lecture-hall/**/*.test.{js,jsx}",
      "src/features/courses/pages/SessionAnalyticsDetailPage.test.jsx",
      "src/features/courses/pages/TeacherPublicProfilePage.test.jsx",
      "src/features/courses/pages/TeacherCompetencyPage.test.jsx",
      "src/features/courses/pages/CreateExamPage.test.jsx",
      "src/features/courses/pages/ExploreCoursesPage.test.jsx",
      "src/features/courses/pages/StudentCourseDetailPage.test.jsx",
      "src/features/courses/pages/TeacherCourseDetailPageElements/TeacherClassOverviewTab.test.jsx",
      "src/features/materials/pages/**/*.test.{js,jsx}",
      "src/features/vouchers/**/*.test.{js,jsx}",
      "src/features/stories/hooks/**/*.test.{js,jsx}",
      "src/features/calendar/components/**/*.test.{js,jsx}",
      "src/features/calendar/pages/MyCalendarPage.test.jsx",
      "src/features/profile/**/*.test.{js,jsx}",
    ],
  },
})
