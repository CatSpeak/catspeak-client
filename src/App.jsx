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
// import TimezoneBackfill from "@/shared/components/TimezoneBackfill";

import WebViewGuard from "@/shared/components/WebViewGuard"

function App() {
  return (
    <Provider store={store}>
      <AuthVisibilitySync />
      <LanguageProvider>
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
                </GlobalPresenceProvider>
              </ConversationSignalRProvider>
            </SidebarProvider>
          </GlobalVideoCallProvider>
        </WebViewGuard>
      </LanguageProvider>
    </Provider>
  )
}

export default App
