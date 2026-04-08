import { useLanguage } from "@/shared/context/LanguageContext"

const ForbiddenPage = () => {
  const { t } = useLanguage()

  return (
  <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="text-sm uppercase tracking-[0.3em] text-white/60">403</p>
    <h1 className="mt-2 text-4xl font-semibold text-white">{t.errors?.forbidden?.title}</h1>
    <p className="mt-4 max-w-xl text-white/70">
      {t.errors?.forbidden?.description}
    </p>
  </section>
  )
}

export default ForbiddenPage

