import React from "react"
import { Outlet } from "react-router-dom"
import SharedLayout from "@/shared/components/layout/SharedLayout"

const WorkspaceLayout = () => {
  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col bg-gray-50/30 relative">
      <div className="mx-auto w-full max-w-[1200px] min-w-0 p-5 flex-1">
        <Outlet />
      </div>
    </div>
  )
}

export default WorkspaceLayout
