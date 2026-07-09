import React from "react"
import UploadProgressPanel from "@/features/reels/components/UploadProgressPanel"

export const BottomRightStack = () => {
  return (
    <div className="fixed bottom-6 right-6 z-[9998] flex flex-col-reverse items-end gap-3.5 pointer-events-none max-w-[390px] w-full">
      {/* UploadProgressPanel sits at top of flex-col-reverse list */}
      <UploadProgressPanel embedInStack={true} />
    </div>
  )
}

export default BottomRightStack
