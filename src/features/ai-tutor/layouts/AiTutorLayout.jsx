import React from "react"
import { Outlet, useParams } from "react-router-dom"
import { PageNotFound } from "@/shared/pages"

const AiTutorLayout = () => {
  const { lang } = useParams()

  if (lang !== "zh") {
    return <PageNotFound />
  }

  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col bg-primaryBg relative">
      <div className="mx-auto w-full min-w-0 p-4 sm:p-6 flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

export default AiTutorLayout
