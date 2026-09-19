import { useLanguage } from "@/shared/context/LanguageContext"

const PlacementTestPage = () => {
  const { t } = useLanguage()

  return (
    <div className="min-h-[calc(100vh-200px)] bg-primaryBg px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-primary">
          {t.placementTest?.title || "Đánh giá trình độ"}
        </h1>
        <p className="mt-3 text-textColor">
          {t.placementTest?.placeholder || ""}
        </p>
      </div>
    </div>
  )
}

export default PlacementTestPage
