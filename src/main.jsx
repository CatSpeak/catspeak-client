import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@styles/index.css"
import App from "./App.jsx"
import { LanguageProvider } from "./shared/context/LanguageContext.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
