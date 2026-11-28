import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const ForbiddenPage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()

  const backHomeText =
    t.errors?.pageNotFound?.backToHome ||
    t.comingSoon?.backToHome ||
    (t.language === "vi" ? "Quay về trang chủ" : "Back to Home")

  const loginText =
    t.auth?.loginButton || t.auth?.loginLink || "Đăng nhập"

  return (
    <section className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-12 text-center">
      <span className="rounded-full bg-slate-100 px-3.5 py-1 text-sm font-semibold tracking-wider text-slate-600 dark:bg-[#222222] dark:text-neutral-300">
        403
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {t.errors?.forbidden?.title}
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600 dark:text-neutral-300">
        {t.errors?.forbidden?.description}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <PillButton onClick={() => navigate("/")}>{backHomeText}</PillButton>
        {!isAuthenticated && (
          <PillButton variant="secondary" onClick={() => navigate("/login")}>
            {loginText}
          </PillButton>
        )}
      </div>
    </section>
  )
}

export default ForbiddenPage
