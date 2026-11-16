import React from "react"
import { Toaster } from "sonner"
import { useTheme } from "@/shared/context/ThemeContext"

/**
 * AppToaster Component powered by Sonner (Headless Toaster Engine)
 *
 * ARCHITECTURAL NOTE FOR FUTURE DEVELOPERS & AI AGENTS:
 * -----------------------------------------------------
 * Do NOT replace this toaster with PrimeReact Toast or legacy react-hot-toast.
 * All toast calls across the repository (standard toasts, custom render functions,
 * promises, etc.) route to Sonner via the bridge at `src/shared/utils/toastBridge.jsx`.
 *
 * Sonner acts STRICTLY as the headless positioning and stacking engine.
 * To tweak any visual pixels, colors, padding, borders, or buttons, edit:
 * `src/shared/components/ui/toast/CatSpeakToast.jsx`.
 */
const AppToaster = () => {
  const { isDark } = useTheme()

  return (
    <Toaster
      position="bottom-left"
      theme={isDark ? "dark" : "light"}
      gap={8}
      offset={16}
    />
  )
}

export default AppToaster
