import React from "react"
import { RefreshCw } from "lucide-react"

const RecordingsErrorState = ({ onRetry, t }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 p-10 text-center">
    <p className="text-sm text-red-600 mb-3">
      {t?.recordings?.list?.error || "Failed to load recordings."}
    </p>
    <button
      onClick={onRetry}
      className="flex items-center gap-1.5 rounded-lg bg-white border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      {t?.recordings?.list?.retry || "Retry"}
    </button>
  </div>
)

export default RecordingsErrorState
