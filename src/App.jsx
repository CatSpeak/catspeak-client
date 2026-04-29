import { Provider } from "react-redux"
import AppRouter from "@routes"
import { store } from "@store"
import "@styles/app.css"
import { Toaster } from "react-hot-toast"
import "@/styles/theme.css"

import { ConversationSignalRProvider } from "@/features/messages/context/ConversationSignalRContext"
import GlobalSignalRHandler from "@/features/messages/components/GlobalSignalRHandler"
import ServerDownScreen from "@/shared/components/ServerDownScreen"
import NavigationProgress from "@/shared/components/NavigationProgress"
import { GlobalVideoCallProvider } from "@/features/video-call/context/GlobalVideoCallProvider"
import PiPWidget from "@/features/video-call/components/pip/PiPWidget"

function App() {
  return (
    <Provider store={store}>
      <GlobalVideoCallProvider>
        <NavigationProgress />
        <ServerDownScreen />
        <ConversationSignalRProvider>
          <GlobalSignalRHandler />
          <Toaster position="top-center" limit={1} />
          <AppRouter />
          <PiPWidget />
        </ConversationSignalRProvider>
      </GlobalVideoCallProvider>
    </Provider>
  )
}

export default App
