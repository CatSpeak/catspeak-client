import { Provider } from "react-redux"
import AppRouter from "@routes"
import { store } from "@store"
import "@styles/app.css"
import { Toaster } from "react-hot-toast"

import { ConversationSignalRProvider } from "@/features/messages/context/ConversationSignalRContext"
import GlobalSignalRHandler from "@/features/messages/components/GlobalSignalRHandler"
import ServerDownScreen from "@/shared/components/ServerDownScreen"
import NavigationProgress from "@/shared/components/NavigationProgress"
import { GlobalVideoCallProvider } from "@/features/video-call/context/GlobalVideoCallProvider"
import PiPWidget from "@/features/video-call/components/pip/PiPWidget"
import { GlobalPresenceProvider } from "@/shared/context/GlobalPresenceContext"
import { SidebarProvider } from "@/shared/context/SidebarContext"
import { ScrollToTopButton } from "@/shared/components/ui/buttons"
import { GlobalUploadSync } from "@/shared/hooks/useGlobalUpload.jsx"
import GlobalUploadWidget from "@/shared/components/ui/progress/GlobalUploadWidget"
import RecordingPoller from "@/features/video-call/components/RecordingPoller"

function App() {
  return (
    <Provider store={store}>
      <GlobalVideoCallProvider>
          <NavigationProgress />
          <ServerDownScreen />
          <SidebarProvider>
            <ConversationSignalRProvider>
              <GlobalPresenceProvider>
                <GlobalSignalRHandler />
                <Toaster position="top-center" limit={1} />
                <ScrollToTopButton />
                <AppRouter />
                <PiPWidget />
                <GlobalUploadWidget />
                <RecordingPoller />
                <GlobalUploadSync />
              </GlobalPresenceProvider>
            </ConversationSignalRProvider>
          </SidebarProvider>
        </GlobalVideoCallProvider>
    </Provider>
  )
}

export default App
