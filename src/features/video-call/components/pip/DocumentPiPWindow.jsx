import React, { useEffect, useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

/**
 * Manages the native OS Document Picture-in-Picture window.
 * Copies stylesheets to maintain Tailwind/CSS styling and renders children via Portal.
 */
const DocumentPiPWindow = ({ children }) => {
  const [pipWindow, setPipWindow] = useState(null)
  const { returnToCall } = useGlobalVideoCall()

  useEffect(() => {
    let activePipWindow = null

    const openPiP = async () => {
      try {
        if (!("documentPictureInPicture" in window)) return

        // Request a new window
        const newPipWindow = await window.documentPictureInPicture.requestWindow({
          width: 400,
          height: 300,
        })

        // Copy styles from main document to PiP document
        const styles = Array.from(document.styleSheets)
        styles.forEach((styleSheet) => {
          try {
            if (styleSheet.href) {
              const link = document.createElement("link")
              link.rel = "stylesheet"
              link.href = styleSheet.href
              newPipWindow.document.head.appendChild(link)
            } else if (styleSheet.ownerNode) {
              const style = document.createElement("style")
              style.textContent = styleSheet.ownerNode.textContent
              newPipWindow.document.head.appendChild(style)
            }
          } catch (e) {
            console.warn("Failed to copy stylesheet:", e)
          }
        })

        // Copy tailwind dark mode classes or other classes on body/html
        newPipWindow.document.body.className = document.body.className
        newPipWindow.document.documentElement.className = document.documentElement.className

        // Listen for user closing the OS window
        newPipWindow.addEventListener("pagehide", () => {
          // If the user manually closes the window from OS (X button), return them to call
          returnToCall()
        })

        activePipWindow = newPipWindow
        setPipWindow(newPipWindow)
      } catch (err) {
        console.error("Failed to open Document PiP window:", err)
      }
    }

    openPiP()

    return () => {
      if (activePipWindow) {
        activePipWindow.close()
      }
    }
  }, [returnToCall])

  if (!pipWindow) return null

  // Render children into the new window's body
  return createPortal(
    <div className="w-full h-full overflow-hidden m-0 p-0">{children}</div>,
    pipWindow.document.body
  )
}

export default DocumentPiPWindow
