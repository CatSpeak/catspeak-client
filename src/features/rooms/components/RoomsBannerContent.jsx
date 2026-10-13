import React from "react"
import doodles from "@/shared/assets/images/communities/doodles.png"
import SessionActionButtons from "./SessionActionButtons"
import { InteractiveScriptWidget } from "@/features/interactive-script"

const RoomsBannerContent = ({ sessionProps }) => {
  return (
    <div className="w-full flex flex-col">
      {/* Doodle logo */}
      <img
        src={doodles}
        alt="Cat Speak doodles"
        className="w-52 mb-4 object-contain object-left"
      />

      <div className="flex flex-col gap-4">
        <InteractiveScriptWidget />
        <div className="-mt-4">
          <SessionActionButtons {...sessionProps} />
        </div>
      </div>
    </div>
  )
}

export default RoomsBannerContent
