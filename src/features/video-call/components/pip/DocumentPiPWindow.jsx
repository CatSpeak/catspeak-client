import React, { useEffect, useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { store } from "@store"

/**
 * Manages the native OS Document Picture-in-Picture window.
 * Copies stylesheets to maintain Tailwind/CSS styling and renders children via Portal.
 */
const DocumentPiPWindow = ({ children }) => {
  const [pipWindow, setPipWindow] = useState(null)
  const { returnToCall } = useGlobalVideoCall()

  useEffect(() => {
    let activePipWindow = null
    let isMounted = true

    const openPiP = async () => {
      try {
        if (!("documentPictureInPicture" in window)) return

        // Request a new window or use the one created in the click handler
        let newPipWindow
        if (window.__pipWindowPromise) {
          newPipWindow = await window.__pipWindowPromise
          window.__pipWindowPromise = null // Consume it
          window.__activePipWindow = newPipWindow
        } else if (window.__activePipWindow) {
          // StrictMode: reuse the window from the first mount
          newPipWindow = window.__activePipWindow
        } else {
          newPipWindow = await window.documentPictureInPicture.requestWindow({
            width: 400,
            height: 300,
          })
          window.__activePipWindow = newPipWindow
        }

        if (!newPipWindow) return

        if (!isMounted && !store.getState().videoCall.isPiP) {
          newPipWindow.close()
          window.__activePipWindow = null
          return
        }

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
        newPipWindow.document.documentElement.className =
          document.documentElement.className

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
      isMounted = false
      
      // Check current Redux state to see if we actually want to exit PiP
      // This prevents React 18 StrictMode from instantly closing the window on remount
      const isPiPActive = store.getState().videoCall.isPiP
      
      if (!isPiPActive) {
        if (window.documentPictureInPicture?.window) {
          window.documentPictureInPicture.window.close()
        } else if (activePipWindow) {
          activePipWindow.close()
        }
        window.__activePipWindow = null
      }
    }
  }, [returnToCall])

  if (!pipWindow) return null

  // Render children into the new window's body
  return createPortal(
    <div className="w-full h-full overflow-hidden m-0 p-0">{children}</div>,
    pipWindow.document.body,
  )
}

export default DocumentPiPWindow
