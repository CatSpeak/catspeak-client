import { Provider } from "react-redux"
import AppRouter from "@routes"
import { store } from "@store"
import "@styles/app.css"
import AppToaster from "@/shared/components/ui/AppToaster"

import { ConversationSignalRProvider } from "@/features/chat/context/ConversationSignalRContext"
import GlobalSignalRHandler from "@/features/chat/components/GlobalSignalRHandler"
import ServerDownScreen from "@/shared/components/ServerDownScreen"
import NavigationProgress from "@/shared/components/NavigationProgress"
import { GlobalVideoCallProvider } from "@/features/video-call/context/GlobalVideoCallProvider"
import PiPWidget from "@/features/video-call/components/pip/PiPWidget"

import { GlobalPresenceProvider } from "@/shared/context/GlobalPresenceContext"
import { SidebarProvider } from "@/shared/context/SidebarContext"
import { LanguageProvider } from "@/shared/context/LanguageContext"
// import { ScrollToTopButton } from "@/shared/components/ui/buttons";
import { GlobalTaskSync } from "@/shared/hooks/useGlobalTask.jsx"
import { AuthVisibilitySync } from "@/shared/hooks/useVisibilityReauth"
import GlobalTaskProgressWidget from "@/shared/components/ui/progress/GlobalTaskProgressWidget"
import RecordingPoller from "@/features/video-call/components/RecordingPoller"
import CompletionReviewPrompt from "@/features/courses/components/CompletionReviewPrompt"
import BugReportButton from "@/features/bug-report/components/BugReportButton"
import { ChatAssistantWidget } from "@/features/chat-assistant"
import AutoCrashReporterSync from "@/shared/components/AutoCrashReporterSync"
// import TimezoneBackfill from "@/shared/components/TimezoneBackfill";

import GlobalErrorBoundary from "@/shared/components/GlobalErrorBoundary"
import WebViewGuard from "@/shared/components/WebViewGuard"

function App() {
  return (
    <Provider store={store}>
      <AuthVisibilitySync />
      <LanguageProvider>
        <GlobalErrorBoundary>
          <WebViewGuard>
            <GlobalVideoCallProvider>
              <NavigationProgress />
              <ServerDownScreen />
              <SidebarProvider>
                <ConversationSignalRProvider>
                  <GlobalPresenceProvider>
                    <GlobalSignalRHandler />
                    <AppToaster />
                    <CompletionReviewPrompt />
                    {/* <ScrollToTopButton /> */}
                    <AppRouter />
                    <PiPWidget />
                    <GlobalTaskProgressWidget />
                    <RecordingPoller />
                    <GlobalTaskSync />
                    <AutoCrashReporterSync />
                    <BugReportButton />
                    {/* TASK-AI-08: nút nổi trợ lý chatbot, hiện trên mọi màn hình
                        sau khi đăng nhập (FR-rag-chatbot-001). Mount ở đây chứ không
                        ở từng layout để khỏi lặp lại bốn lần. */}
                    <ChatAssistantWidget />
                  </GlobalPresenceProvider>
                </ConversationSignalRProvider>
              </SidebarProvider>
            </GlobalVideoCallProvider>
          </WebViewGuard>
        </GlobalErrorBoundary>
      </LanguageProvider>
    </Provider>
  )
}

export default App
