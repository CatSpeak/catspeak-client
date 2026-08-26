import "@/shared/utils/polyfills.js"
import { initConsoleLogger } from "@/shared/utils/telemetry/consoleLogger"
import { initNetworkLogger } from "@/shared/utils/telemetry/networkLogger"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@styles/index.css"
import App from "./App.jsx"
import { GoogleOAuthProvider } from "@react-oauth/google"

// Initialize telemetry loggers to capture console & network diagnostics
initConsoleLogger()
initNetworkLogger()

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE"

// Dynamically load Eruda mobile console overlay if ?debug=true or ?eruda=true is in the URL
if (
  typeof window !== "undefined" &&
  (window.location.search.includes("debug=true") || window.location.search.includes("eruda=true"))
) {
  const script = document.createElement("script")
  script.src = "https://cdn.jsdelivr.net/npm/eruda"
  script.onload = () => {
    if (window.eruda) window.eruda.init()
  }
  document.head.appendChild(script)
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
