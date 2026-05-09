import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@styles/index.css"
import App from "./App.jsx"
import { LanguageProvider } from "./shared/context/LanguageContext.jsx"
import { GoogleOAuthProvider } from "@react-oauth/google"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
