import { useLanguage } from "@/shared/context/LanguageContext"

const PageNotFound = () => {
  const { t } = useLanguage()

  return (
  <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="text-sm uppercase tracking-[0.3em] text-white/60">404</p>
    <h1 className="mt-2 text-4xl font-semibold text-white">{t.errors?.pageNotFound?.title}</h1>
    <p className="mt-4 max-w-xl text-white/70">
      {t.errors?.pageNotFound?.description}
    </p>
  </section>
  )
}

export default PageNotFound

