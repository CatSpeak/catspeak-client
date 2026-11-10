import React, { Suspense, lazy } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { notebookPaths } from "../utils/flashcardReview"
import { useGalaxyWords } from "../components/galaxy/hooks/useGalaxyWords"

// Lazy-load: WebGL engine chỉ tải khi vào tab này.
const GalaxyView = lazy(() => import("../components/galaxy/GalaxyView"))
// Dữ liệu mock chỉ dùng để dev/QA: thêm ?mock=1 vào URL (không có trong bản production).
const mockModule = import.meta.env.DEV ? import("../components/galaxy/mocks/mockGalaxyData") : null

const PANEL = "flex min-h-[420px] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-[#090c18] px-6 text-center text-white"

const VocabularyGalaxyPage = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const [searchParams] = useSearchParams()
  const useMock = import.meta.env.DEV && searchParams.get("mock") === "1"
  const g = t?.aiTutor?.vocabularyGalaxy || {}

  const real = useGalaxyWords({ enabled: !useMock })
  const [mock, setMock] = React.useState(null)
  React.useEffect(() => {
    if (useMock && mockModule) mockModule.then((m) => setMock({ words: m.MOCK_GALAXY_WORDS, clusters: m.GALAXY_CLUSTERS }))
  }, [useMock])

  const data = useMock ? (mock ? { ...mock, status: "ready" } : { status: "loading" }) : real

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <PageTitle>{g.title || t?.common?.vocabularyGalaxy || "Ngân hà từ vựng"}</PageTitle>
        <p className="mt-1 text-sm text-gray-600">
          {g.subtitle || "Khám phá từ vựng như những vì sao, gom thành từng chòm theo chủ đề."}
        </p>
      </div>

      {data.status === "loading" && (
        <div className={PANEL}>
          <LoadingSpinner />
          <span className="text-sm text-white/70">{g.loading || "Đang tải từ vựng của bạn..."}</span>
        </div>
      )}

      {data.status === "error" && (
        <div className={PANEL}>
          <p className="font-semibold">{g.error || "Không tải được từ vựng."}</p>
          {import.meta.env.DEV && real.error && (
            <p className="max-w-md break-words font-mono text-xs text-amber-300">
              {[real.error.status, real.error.code, real.error.message].filter(Boolean).join(" · ")}
            </p>
          )}
          <button
            type="button"
            onClick={real.retry}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
          >
            {g.retry || "Thử lại"}
          </button>
        </div>
      )}

      {data.status === "empty" && (
        <div className={PANEL}>
          <p className="font-semibold">{g.empty || "Sổ từ vựng của bạn còn trống."}</p>
          <p className="text-sm text-white/70">{g.emptyHint || "Thêm từ vào sổ để thấy chúng thành những vì sao."}</p>
          <Link
            to={notebookPaths(lang || "zh").add}
            className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#680411] hover:bg-white/90"
          >
            {g.addWords || "Thêm từ vựng"}
          </Link>
        </div>
      )}

      {data.status === "ready" && (
        <Suspense fallback={<div className={PANEL}><LoadingSpinner /></div>}>
          <GalaxyView words={data.words} clusters={data.clusters} className="min-h-[420px] flex-1" />
        </Suspense>
      )}
    </div>
  )
}

export default VocabularyGalaxyPage
