import { useNavigate } from "react-router-dom"
import { Compass, Sparkles } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const DiscoverPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const comingSoonT = t.common?.comingSoon || {}

  return (
    <div className="w-full flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#3F3F3F] shadow-sm p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#990011] dark:text-[#FF7A8A] flex items-center justify-center">
            <Compass className="w-8 h-8 stroke-[1.5]" />
          </div>
          <span className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-[#990011] dark:text-[#FF7A8A] border border-rose-100 dark:border-rose-900/60">
            <Sparkles className="w-3 h-3 fill-current" />
            {comingSoonT.badge || "Sắp ra mắt"}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.catSpeak.discover.title}
        </h2>

        <p className="text-gray-600 dark:text-neutral-300 max-w-md">
          {t.catSpeak.discover.description}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <PillButton variant="secondary" onClick={() => navigate(-1)}>
            {t.common?.back || "Quay lại"}
          </PillButton>
          <PillButton onClick={() => navigate("/")}>
            {comingSoonT.backToHome || "Về trang chủ"}
          </PillButton>
        </div>
      </div>
    </div>
  )
}

export default DiscoverPage
