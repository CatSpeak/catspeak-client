import React from "react"
import { Video } from "lucide-react"

const RecordingsEmptyState = ({ t }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] p-12 text-center shadow-sm">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-[#272727] mb-4">
      <Video className="h-8 w-8 text-gray-400 dark:text-neutral-400" />
    </div>
    <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
      {t?.recordings?.list?.emptyTitle || "No recordings yet"}
    </h2>
    <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400 max-w-sm">
      {t?.recordings?.list?.emptyDescription ||
        "When you record your calls, they will appear here."}
    </p>
  </div>
)

export default RecordingsEmptyState
