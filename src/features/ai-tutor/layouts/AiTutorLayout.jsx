import React from "react"
import { Link, Outlet, useLocation, useParams } from "react-router-dom"
import { Bot, Languages } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const AiTutorLayout = () => {
  const { lang } = useParams()
  const { pathname = "", search = "" } = useLocation() || {}
  const { t } = useLanguage()
  const notice = t?.aiTutor?.onlyChineseNotice || {}

  if (lang === "zh") {
    return (
      <div className="flex-1 h-full overflow-y-auto flex flex-col bg-primaryBg dark:bg-[#0F0F0F] relative">
        <div className="mx-auto w-full min-w-0 p-4 sm:p-6 flex-1 flex flex-col">
          <Outlet />
        </div>
      </div>
    )
  }

  const targetZhUrl = pathname
    ? pathname.replace(/^\/[^/]+/, "/zh") + search
    : "/zh/ai-tutor/learning-path"

  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col bg-primaryBg dark:bg-[#0F0F0F] relative">
      <div className="mx-auto w-full min-w-0 p-4 sm:p-6 flex-1 flex flex-col">
        <div className="w-full flex items-center justify-center py-10 px-4 sm:px-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#3F3F3F] shadow-sm p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#990011] dark:text-[#FF7A8A] flex items-center justify-center">
              <Bot className="w-8 h-8 stroke-[1.5]" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {notice.title ||
                "Gia sư AI hiện chỉ hỗ trợ cộng đồng Tiếng Trung"}
            </h1>

            <p className="text-gray-600 dark:text-neutral-300 max-w-md">
              {notice.description ||
                "Các phòng luyện nói, lộ trình 5 ngày và kho từ vựng của Gia sư AI hiện được thiết kế riêng cho cộng đồng Tiếng Trung (zh). Bạn có thể chuyển sang Tiếng Trung để tiếp tục, hoặc quay về cộng đồng hiện tại."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to={targetZhUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-[#990011] hover:bg-[#85000f] px-5 py-3 text-sm font-bold text-white transition-colors"
              >
                <Languages className="w-4 h-4" />
                {notice.switchToChinese || "Chuyển sang Tiếng Trung (zh)"}
              </Link>
              <Link
                to={`/${lang || "zh"}/community`}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#3F3F3F] bg-white dark:bg-[#242424] px-5 py-3 text-sm font-semibold text-gray-800 dark:text-neutral-100 transition-colors hover:bg-gray-50 dark:hover:bg-[#2c2c2c]"
              >
                {notice.backToCommunity || "Quay về cộng đồng"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiTutorLayout
