import React from "react"
import { Outlet } from "react-router-dom"

const UserPagesLayout = () => {
  return (
    <div className="w-full min-h-[calc(100vh-70px)] bg-primaryBg mx-auto">
      <Outlet />
    </div>
  )
}

export default UserPagesLayout
