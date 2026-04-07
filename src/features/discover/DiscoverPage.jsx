import { useLanguage } from "@/shared/context/LanguageContext"

const DiscoverPage = () => {
  const { t } = useLanguage()

  return (
    <div className="rounded-2xl bg-white shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-4">{t.catSpeak.discover.title}</h2>
      <p className="text-gray-700">{t.catSpeak.discover.description}</p>
    </div>
  )
}

export default DiscoverPage
