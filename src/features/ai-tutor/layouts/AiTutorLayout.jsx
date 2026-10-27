import React from "react"
import { Outlet } from "react-router-dom"

const AiTutorLayout = () => {
  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col bg-primaryBg relative">
      <div className="mx-auto w-full min-w-0 p-4 sm:p-6 flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

export default AiTutorLayout
