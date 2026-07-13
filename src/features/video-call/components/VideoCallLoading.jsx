import React from "react"
import { Loader2 } from "lucide-react"

/**
 * Full-screen loading overlay shown while the video call session is being prepared.
 * Covers all loading phases (session fetch, room fetch, SDK token, connecting) behind one unified UI.
 */
const VideoCallLoading = ({ message }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-950 text-white">
      <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

export default VideoCallLoading
