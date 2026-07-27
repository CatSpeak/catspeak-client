import React from "react"
import { Outlet } from "react-router-dom"

const WorkspaceLayout = () => {
  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col bg-[#f3f3f3] relative">
      <div className="mx-auto w-full min-w-0 p-4 sm:p-6 flex-1">
        <Outlet />
      </div>
    </div>
  )
}

export default WorkspaceLayout
