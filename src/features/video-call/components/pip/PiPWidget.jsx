import React, { useMemo } from "react"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"

import { usePiPDrag } from "@/features/video-call/hooks/usePiPDrag"

import PiPWidgetContent from "./PiPWidgetContent"
import DocumentPiPWindow from "./DocumentPiPWindow"

/**
 * Main PiP routing component.
 * Decides whether to render the new Document Picture-in-Picture window
 * or fallback to the in-website floating widget if unsupported.
 */
const PiPWidget = () => {
  const { isInCall, isPiP } = useSelector((s) => s.videoCall)
  const shouldRender = isInCall && isPiP

  // Check if browser supports modern Document PiP API
  const isDocumentPiPSupported = useMemo(() => {
    return "documentPictureInPicture" in window
  }, [])

  if (!shouldRender) return null

  // Modern Document PiP API (Chrome/Edge Desktop)
  if (isDocumentPiPSupported) {
    return (
      <DocumentPiPWindow>
        <PiPWidgetContent isNativeWindow={true} />
      </DocumentPiPWindow>
    )
  }

  // Fallback Floating Widget (Firefox, Safari, Mobile)
  return <FallbackPiPWidget />
}

/**
 * The original floating PiP widget used as a fallback for unsupported browsers.
 * Draggable, snaps to viewport corners.
 */
const FallbackPiPWidget = () => {
  const { position, constraintsRef, handleDragEnd } = usePiPDrag(true)

  return (
    <>
      {/* Drag boundary */}
      <div
        ref={constraintsRef}
        style={{
          position: "fixed",
          inset: "20px",
          pointerEvents: "none",
          zIndex: 9998,
        }}
      />

      <AnimatePresence>
        <motion.div
          className="fixed z-[9999] w-[calc(100vw-40px)] max-w-[400px] flex flex-col rounded-[24px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.28),0_2px_8px_rgba(0,0,0,0.12)] bg-white cursor-grab active:cursor-grabbing select-none touch-none group"
          key="pip-widget"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, x: position.x, y: position.y }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ position: "fixed", top: 0, left: 0 }}
        >
          <PiPWidgetContent isNativeWindow={false} />
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default PiPWidget
