import React from "react"
import { Outlet } from "react-router-dom"
import WorkspaceSidebar from "../components/WorkspaceSidebar"

const WorkspaceLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-72px)] lg:overflow-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[320px] p-5 overflow-y-auto">
        <WorkspaceSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col">
        {/* Content */}
        <div className="mx-auto w-full max-w-[1040px] min-w-0 p-5 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default WorkspaceLayout
