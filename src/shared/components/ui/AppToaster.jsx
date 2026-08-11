import React, { useState, useEffect } from "react"
import { Toaster } from "sonner"

/**
 * AppToaster Component powered by Sonner & Custom React Toast Card Renderer
 * - Configured with theme="dark" & transparent outer wrapper style
 * - Ensures stacked cards behind match the front dark card without white borders/backgrounds
 */
const AppToaster = () => {
  const [position, setPosition] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640
      ? "bottom-center"
      : "bottom-left",
  )

  useEffect(() => {
    const handleResize = () => {
      setPosition(window.innerWidth < 640 ? "bottom-center" : "bottom-left")
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Toaster
      position={position}
      visibleToasts={3}
      expand={false}
      theme="dark"
      toastOptions={{
        style: {
          background: "transparent",
          border: "none",
          boxShadow: "none",
        },
      }}
    />
  )
}

export default AppToaster
