import React from "react"
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher"

const VideoCallErrorFallback = ({
  error,
  errorInfo,
  onReload,
  onGoHome,
  onCopyError,
  copied,
  showDetails,
  onToggleDetails,
}) => {
  const { t } = useLanguage()
  const eb = t?.rooms?.videoCall?.errorBoundary ?? {}

  const errorMessage =
    error?.message ||
    eb.defaultDescription ||
    "An unexpected error occurred during the video call session."

  return (
    <div className="h-screen w-full flex flex-col items-center justify-start overflow-y-auto relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-xl p-4 sm:p-6 flex flex-col items-center text-center">
        {/* Icon */}
        <AlertTriangle className="w-14 h-14 mb-4 text-red-500 stroke-[1.5]" />

        {/* Heading */}
        <h2 className="text-3xl font-bold mb-2">
          {eb.title || "Video Call Encountered an Error"}
        </h2>

        {/* Error Message */}
        <p className="text-sm text-[#606060] mb-6 max-w-md">{errorMessage}</p>

        {/* Action Buttons using PillButton */}
        <div className="w-full max-w-md flex flex-col gap-2">
          <PillButton
            variant="primary"
            className="w-full"
            startIcon={<RefreshCw />}
            onClick={onReload}
          >
            {eb.reloadPage || "Reload Page"}
          </PillButton>

          <div className="grid grid-cols-2 gap-2">
            <PillButton
              variant="secondary"
              className="w-full"
              startIcon={copied ? <Check /> : <Copy />}
              onClick={onCopyError}
            >
              {copied ? eb.copied || "Copied!" : eb.copyLog || "Copy Log"}
            </PillButton>

            <PillButton
              variant="secondary"
              className="w-full"
              startIcon={<Home />}
              onClick={onGoHome}
            >
              {eb.goHome || "Go to Home"}
            </PillButton>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="pt-4 sm:pt-6 w-full border-t border-border flex items-center justify-center">
        <PillButton
          variant="secondary-no-outline"
          endIcon={
            showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />
          }
          onClick={onToggleDetails}
        >
          {eb.technicalDetails || "Technical Details"}
        </PillButton>
      </div>

      {/* Collapsible Technical Error Details */}
      {showDetails && (
        <div className="w-full max-w-4xl p-0 sm:p-6">
          <div className="w-full rounded-none sm:rounded-xl border border-[#27272a] bg-[#18181b] p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap select-all text-gray-200 shadow-inner [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#18181b] [&::-webkit-scrollbar-thumb]:bg-[#3f3f46] [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:#3f3f46_#18181b]">
            <p className="font-semibold text-red-400 mb-2">
              {error?.name}: {error?.message}
            </p>
            {error?.stack && (
              <div className="text-gray-300 mb-3">
                <span className="text-gray-500 font-semibold">
                  {eb.stackTrace || "Stack Trace:"}
                </span>
                <br />
                {error.stack}
              </div>
            )}
            {errorInfo?.componentStack && (
              <div className="text-gray-400">
                <span className="text-gray-500 font-semibold">
                  {eb.componentStack || "Component Stack:"}
                </span>
                <br />
                {errorInfo.componentStack}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

class VideoCallErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: Boolean(import.meta.env?.DEV),
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error(
      "VideoCallErrorBoundary caught an unhandled error:",
      error,
      errorInfo,
    )
  }

  handleCopyError = async () => {
    const { error, errorInfo } = this.state
    const logText = [
      `[CatSpeak VideoCall Error Log]`,
      `Time: ${new Date().toISOString()}`,
      `URL: ${window.location.href}`,
      `UserAgent: ${navigator.userAgent}`,
      `Error: ${error?.name || "Error"}: ${error?.message || "Unknown error"}`,
      `Stack:\n${error?.stack || "No stack trace available"}`,
      `Component Stack:\n${errorInfo?.componentStack || "N/A"}`,
    ].join("\n\n")

    try {
      await navigator.clipboard.writeText(logText)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2500)
    } catch {
      // Fallback clipboard write
      const textarea = document.createElement("textarea")
      textarea.value = logText
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2500)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <VideoCallErrorFallback
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        copied={this.state.copied}
        showDetails={this.state.showDetails}
        onReload={this.handleReload}
        onGoHome={this.handleGoHome}
        onCopyError={this.handleCopyError}
        onToggleDetails={this.toggleDetails}
      />
    )
  }
}

export default VideoCallErrorBoundary
