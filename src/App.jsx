import { Suspense, lazy } from "react"
import { Provider, useSelector } from "react-redux"
import AppRouter from "@routes"
import { store } from "@store"
import { selectCurrentToken } from "@/store/slices/authSlice"
import "@styles/app.css"
import AppToaster from "@/shared/components/ui/AppToaster"

import { ConversationSignalRProvider } from "@/features/chat/context/ConversationSignalRProvider"
import { InChatCallProvider } from "@/features/chat/context/InChatCallProvider"
import GlobalSignalRHandler from "@/features/chat/components/GlobalSignalRHandler"
import { GlobalVideoCallProvider } from "@/features/video-call/context/GlobalVideoCallProvider"

import { GlobalPresenceProvider } from "@/shared/context/GlobalPresenceContext"
import { SidebarProvider } from "@/shared/context/SidebarContext"
import { LanguageProvider } from "@/shared/context/LanguageContext"
import { ThemeProvider } from "@/shared/context/ThemeContext"
import { AuthVisibilitySync } from "@/shared/hooks/useVisibilityReauth"
import GlobalErrorBoundary from "@/shared/components/GlobalErrorBoundary"
import WebViewGuard from "@/shared/components/WebViewGuard"

const ServerDownScreen = lazy(() => import("@/shared/components/ServerDownScreen"))
const PiPWidget = lazy(() => import("@/features/video-call/components/pip/PiPWidget"))
const GlobalTaskProgressWidget = lazy(
  () => import("@/shared/components/ui/progress/GlobalTaskProgressWidget"),
)
const GlobalTaskSync = lazy(() =>
  import("@/shared/hooks/useGlobalTask.jsx").then((m) => ({
    default: m.GlobalTaskSync,
  })),
)
const RecordingPoller = lazy(
  () => import("@/features/video-call/components/RecordingPoller"),
)
const CompletionReviewPrompt = lazy(
  () => import("@/features/courses/components/CompletionReviewPrompt"),
)
const HelpWidget = lazy(() => import("@/features/help/components/HelpWidget"))
const ChatAssistantWidget = lazy(() =>
  import("@/features/chat-assistant").then((m) => ({
    default: m.ChatAssistantWidget,
  })),
)
const AutoCrashReporterSync = lazy(
  () => import("@/shared/components/AutoCrashReporterSync"),
)

function AuthenticatedBackgroundFeatures() {
  const isAuthenticated = Boolean(useSelector(selectCurrentToken))
  if (!isAuthenticated) return null
  return (
    <Suspense fallback={null}>
      <GlobalSignalRHandler />
      <CompletionReviewPrompt />
      <PiPWidget />
      <GlobalTaskProgressWidget />
      <RecordingPoller />
      <GlobalTaskSync />
      <AutoCrashReporterSync />
    </Suspense>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AuthVisibilitySync />
      <LanguageProvider>
        <ThemeProvider>
        <GlobalErrorBoundary>
          <WebViewGuard>
            <GlobalVideoCallProvider>
              <Suspense fallback={null}>
                <ServerDownScreen />
              </Suspense>
              <SidebarProvider>
                <ConversationSignalRProvider>
                  <InChatCallProvider>
                    <GlobalPresenceProvider>
                      <AppToaster />
                      <AppRouter />
                      <AuthenticatedBackgroundFeatures />
                      <Suspense fallback={null}>
                        <HelpWidget />
                        <ChatAssistantWidget />
                      </Suspense>
                    </GlobalPresenceProvider>
                  </InChatCallProvider>
                </ConversationSignalRProvider>
              </SidebarProvider>
            </GlobalVideoCallProvider>
          </WebViewGuard>
        </GlobalErrorBoundary>
        </ThemeProvider>
      </LanguageProvider>
    </Provider>
  )
}

export default App
