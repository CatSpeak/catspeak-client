import React from "react"
import { Outlet } from "react-router-dom"

const CatSpeakLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full flex-1 self-stretch items-stretch bg-primaryBg dark:bg-[#0F0F0F]">
      {/* Main Content */}
      <main className="flex-1 min-w-0 w-full relative flex flex-col self-stretch">
        <div className="mx-auto w-full h-full flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default CatSpeakLayout
