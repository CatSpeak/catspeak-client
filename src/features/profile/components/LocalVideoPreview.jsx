import React, { useState, useRef } from "react"
import { Play } from "lucide-react"

const LocalVideoPreview = ({ url }) => {
  const [hasStarted, setHasStarted] = useState(false)
  const videoRef = useRef(null)

  const handleStart = (e) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.play()
      setHasStarted(true)
    }
  }

  const handleEnded = () => {
    setHasStarted(false)
  }

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center min-h-[180px] max-h-[300px]">
      <video
        ref={videoRef}
        src={url}
        controls={hasStarted}
        playsInline
        preload="metadata"
        className="w-full max-h-[300px] object-contain"
        onEnded={handleEnded}
        onClick={(e) => {
          if (hasStarted) e.stopPropagation()
        }}
      />
      {!hasStarted && (
        <button
          type="button"
          onClick={handleStart}
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 hover:bg-black/45 transition-colors border-none outline-none cursor-pointer z-10"
        >
          <Play className="w-8 h-8 text-white drop-shadow" />
        </button>
      )}
    </div>
  )
}

export default LocalVideoPreview
