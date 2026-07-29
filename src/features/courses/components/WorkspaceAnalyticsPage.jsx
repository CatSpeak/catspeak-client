import React from "react"
import { useNavigate } from "react-router-dom"
import { BarChart, Construction } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const WorkspaceAnalyticsPage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const analytics = t.courses?.analytics || {}

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e] h-full">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/workspace")}
          >
            {t.nav?.home || "Home"}
          </button>
          <span>/</span>
          <span className="text-[#990011] font-semibold">
            {analytics.title || "Analytics"}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight flex items-center gap-2">
          <BarChart className="text-[#990011]" size={32} />
          {analytics.title || "Analytics"}
        </h1>
      </div>

      {/* Empty / Construction State */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 rounded-3xl bg-white mt-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Construction className="text-gray-400" size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {analytics.underConstruction || "Feature Under Construction"}
        </h2>
        <p className="text-gray-500 text-center max-w-md text-sm leading-relaxed mb-6">
          {analytics.description || "The Analytics dashboard is currently being developed. Soon you will be able to track your course performance, student engagement, and revenue here."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/workspace")}
          className="px-6 py-2.5 bg-[#990011] hover:bg-[#80000e] text-white font-semibold rounded-xl transition-all active:scale-95 text-sm"
        >
          {analytics.returnToWorkspace || "Return to Workspace"}
        </button>
      </div>
    </div>
  )
}

export default WorkspaceAnalyticsPage
