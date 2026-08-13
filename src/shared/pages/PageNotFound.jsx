import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const PageNotFound = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const backHomeText =
    t.errors?.pageNotFound?.backToHome ||
    t.comingSoon?.backToHome ||
    (t.language === "vi" ? "Quay về trang chủ" : "Back to Home")

  return (
    <section className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-12 text-center">
      <span className="rounded-full bg-slate-100 px-3.5 py-1 text-sm font-semibold tracking-wider text-slate-600">
        404
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {t.errors?.pageNotFound?.title}
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
        {t.errors?.pageNotFound?.description}
      </p>
      <div className="mt-8">
        <PillButton onClick={() => navigate("/")}>
          {backHomeText}
        </PillButton>
      </div>
    </section>
  )
}

export default PageNotFound

