import React from "react"
import { Outlet } from "react-router-dom"
import WorkspaceSidebar from "../components/WorkspaceSidebar"

const WorkspaceLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-90px)] lg:overflow-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[320px] p-5 flex-shrink-0 overflow-y-auto border-r border-gray-100">
        <WorkspaceSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-gray-50 lg:bg-transparent flex flex-col">
        {/* Content */}
        <div className="mx-auto w-full max-w-[1040px] min-w-0 p-5 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default WorkspaceLayout
