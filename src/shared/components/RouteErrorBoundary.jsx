import React from "react"
import { useRouteError, useNavigate } from "react-router-dom"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

const RouteErrorBoundary = () => {
  const error = useRouteError()
  const navigate = useNavigate()

  console.error("Unhandled Route Error:", error)

  const errorMessage =
    error?.statusText || error?.message || "An unexpected error occurred."

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100 text-red-600">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-600 max-w-md mb-6">
        {errorMessage}
      </p>
      <div className="flex items-center gap-3">
        <PillButton
          onClick={() => window.location.reload()}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Reload Page
        </PillButton>
        <PillButton
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <Home size={16} />
          Go to Home
        </PillButton>
      </div>
    </div>
  )
}

export default RouteErrorBoundary
