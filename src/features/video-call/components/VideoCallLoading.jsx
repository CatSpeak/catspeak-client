import React from "react"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

/**
 * Full-screen loading overlay shown while the video call session is being prepared.
 * Covers all loading phases (session fetch, room fetch, SDK token, connecting) behind one unified UI.
 */
const VideoCallLoading = ({ message = "Loading room..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primaryBg">
      <LoadingSpinner text={message} />
    </div>
  )
}

export default VideoCallLoading

