import React, { useState } from "react"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import BugReportModal from "@/features/bug-report/components/BugReportModal"
import { useLanguage } from "@/shared/context/LanguageContext"

function GlobalErrorFallback({ error, errorInfo }) {
  const [isReportOpen, setIsReportOpen] = useState(false)
  const { t } = useLanguage()
  const lang = t?.bugReport?.errorBoundary || {}

  const errorMessage = error?.message || "An unexpected error occurred."
  const errorStack = error?.stack || ""
  const componentStack = errorInfo?.componentStack || ""

  const crashTitle = `${lang.crashTitlePrefix || "[Sập giao diện]"} ${errorMessage.slice(0, 80)}`
  const crashDesc = (lang.crashDescPrompt || "Trang bị crash tại URL: {url}\nLỗi: {error}\nStack Trace:\n{stack}")
    .replace("{url}", window.location.href)
    .replace("{error}", errorMessage)
    .replace("{stack}", `${errorStack}\n\nComponent Stack:\n${componentStack}`)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center bg-white">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100 text-cath-red-700">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-2xl font-bold text-[#2e2e2e] mb-2">
        {lang.title || "Đã có sự cố xảy ra"}
      </h2>
      <p className="text-sm text-[#7A7574] max-w-lg mb-4">
        {lang.description || "Ứng dụng gặp lỗi ngoài dự kiến và không thể tiếp tục hiển thị trang này."}
      </p>
      <div className="w-full max-w-lg mb-6 p-3 rounded-xl bg-gray-50 border border-gray-200 text-left overflow-x-auto text-xs font-mono text-red-600 max-h-32">
        {errorMessage}
      </div>
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
          onClick={() => (window.location.href = "/")}
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

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical Global App Crash Caught by GlobalErrorBoundary:", error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <GlobalErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
        />
      )
    }

    return this.props.children
  }
}

export default GlobalErrorBoundary
