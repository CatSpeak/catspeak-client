import React from "react"
import { Outlet } from "react-router-dom"
import WorkspaceSidebar from "../components/WorkspaceSidebar"
import SharedLayout from "@/shared/components/layout/SharedLayout"

const WorkspaceLayout = () => {
  return (
    <SharedLayout sidebar={<WorkspaceSidebar />}>
      <Outlet />
    </SharedLayout>
  )
}

export default WorkspaceLayout
