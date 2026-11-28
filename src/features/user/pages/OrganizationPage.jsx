import React from "react"
import { Building2 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const OrganizationPage = () => {
  const { t } = useLanguage()
  const orgText = t?.organization || {}

  return (
    <div className="w-full flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#3F3F3F] shadow-sm p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#990011] dark:text-[#FF7A8A] flex items-center justify-center">
            <Building2 className="w-8 h-8 stroke-[1.5]" />
          </div>
          <span className="absolute -bottom-2 -right-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap bg-rose-50 dark:bg-rose-950/40 text-[#990011] dark:text-[#FF7A8A] border border-rose-100 dark:border-rose-900/60">
            {orgText.badge || "Sắp ra mắt"}
          </span>
        </div>

        <h1 className="text-xl font-bold text-red-900 dark:text-[#FF7A8A] mb-6">
          {orgText.title || "Thông tin tổ chức"}
        </h1>
        <p className="text-gray-600 dark:text-neutral-300 max-w-md">
          {orgText.description ||
            "Không gian dành cho tổ chức, trung tâm và doanh nghiệp đang được hoàn thiện. Vui lòng quay lại sau để trải nghiệm."}
        </p>

        <a
          href="/workspace/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-[#990011] hover:bg-[#85000f] px-5 py-3 text-sm font-bold text-white transition-colors"
        >
          {orgText.backToDashboard || "Quay lại Dashboard"}
        </a>
      </div>
    </div>
  )
}

export default OrganizationPage
