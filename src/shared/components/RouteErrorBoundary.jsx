import React, { useState } from "react"
import { useRouteError, useNavigate } from "react-router-dom"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import BugReportModal from "@/features/bug-report/components/BugReportModal"
import { useLanguage } from "@/shared/context/LanguageContext"

const RouteErrorBoundary = () => {
  const error = useRouteError()
  const navigate = useNavigate()
  const [isReportOpen, setIsReportOpen] = useState(false)
  const { t } = useLanguage()
  const lang = t.bugReport?.errorBoundary || {}

  console.error("Unhandled Route Error:", error)

  const errorMessage =
    error?.statusText || error?.message || "An unexpected error occurred."
  const errorStack = error?.stack || ""

  const crashTitle = `${lang.crashTitlePrefix || "[Sập ứng dụng]"} ${errorMessage.slice(0, 80)}`
  const crashDesc = (lang.crashDescPrompt || "Trang bị crash tại URL: {url}\nLỗi: {error}\nStack Trace:\n{stack}")
    .replace("{url}", window.location.href)
    .replace("{error}", errorMessage)
    .replace("{stack}", errorStack)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100 text-cath-red-700">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-2xl font-bold text-[#2e2e2e] mb-2">
        {lang.title || "Đã có sự cố xảy ra"}
      </h2>
      <p className="text-sm text-[#7A7574] max-w-md mb-6">
        {errorMessage}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <PillButton
          onClick={() => window.location.reload()}
          variant="secondary"
          startIcon={<RefreshCw size={16} />}
        >
          {lang.reload || "Tải lại trang"}
        </PillButton>
        <PillButton
          onClick={() => setIsReportOpen(true)}
          variant="primary"
          startIcon={<Bug size={16} />}
        >
          {lang.reportIssue || "Báo cáo sự cố này"}
        </PillButton>
        <PillButton
          onClick={() => navigate("/")}
          variant="secondary"
          startIcon={<Home size={16} />}
        >
          {lang.goHome || "Về trang chủ"}
        </PillButton>
      </div>

      <BugReportModal
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        initialTitle={crashTitle}
        initialDescription={crashDesc}
      />
    </div>
  )
}

export default RouteErrorBoundary
