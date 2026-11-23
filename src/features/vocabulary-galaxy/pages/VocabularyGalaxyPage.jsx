import React, { Suspense, lazy } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { notebookPaths } from "@/features/ai-tutor/utils/flashcardReview"
import { useGalaxyWords } from "../hooks/useGalaxyWords"
import { useGalaxyWordsMock } from "../hooks/useGalaxyWordsMock"

// Lazy-load: WebGL engine chỉ tải khi vào tab này.
const GalaxyView = lazy(() => import("../components/GalaxyView"))

// Chế độ mock dùng khi ai-api staging còn chết (Cloudflare 1033) — xem BAO_CAO_LOI_AI_API_STAGING.md.
// Bật bằng ?mock=1 trên URL, hoặc đặt VITE_GALAXY_FORCE_MOCK=1 trong .env (áp dụng cho mọi người).
const FORCE_MOCK = import.meta.env.VITE_GALAXY_FORCE_MOCK === "1"

const PANEL = "flex min-h-[420px] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-[#090c18] px-6 text-center text-white"

const VocabularyGalaxyPage = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const [searchParams] = useSearchParams()
  const useMock = FORCE_MOCK || searchParams.get("mock") === "1"
  const g = t?.vocabularyGalaxy || {}

  // Hooks phải được gọi vô điều kiện -> luôn gọi cả hai, chỉ dùng cái nào cần.
  const real = useGalaxyWords({ enabled: !useMock })
  const mock = useGalaxyWordsMock({ enabled: useMock })

  const data = useMock ? mock : real

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <PageTitle>{g.title || t?.common?.vocabularyGalaxy || "Ngân hà từ vựng"}</PageTitle>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {g.subtitle || "Khám phá từ vựng như những vì sao, gom thành từng chòm theo chủ đề."}
        </p>
      </div>

      {useMock && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs text-amber-200">
          {g.mockNotice ||
            "Chế độ dữ liệu giả lập — AI API staging đang lỗi hạ tầng (Cloudflare 1033). Bấm vào một ngôi sao để giả lập học từ."}
        </div>
      )}

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
          <button
            type="button"
            onClick={() => {
              const url = new URL(window.location.href)
              url.searchParams.set("mock", "1")
              window.location.href = url.toString()
            }}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
          >
            {g.useMock || "Dùng dữ liệu giả lập"}
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
          <GalaxyView
            words={data.words}
            clusters={data.clusters}
            onWordClick={useMock ? mock.markStudied : null}
            className="min-h-[420px] flex-1"
          />
        </Suspense>
      )}
    </div>
  )
}

export default VocabularyGalaxyPage
