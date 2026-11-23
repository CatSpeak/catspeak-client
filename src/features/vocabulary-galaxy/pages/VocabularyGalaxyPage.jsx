import React, { Suspense, lazy } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Sparkles } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import ErrorState from "@/shared/components/ui/indicators/ErrorState"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { notebookPaths } from "@/features/ai-tutor/utils/flashcardReview"
import GalaxyLoading from "../components/GalaxyLoading"
import { useGalaxyWords } from "../hooks/useGalaxyWords"
import { useGalaxyWordsMock } from "../hooks/useGalaxyWordsMock"

// Lazy-load WebGL engine in parallel with data fetching so entry bundle remains light
const galaxyViewPromise = import("../components/GalaxyView")
const GalaxyView = lazy(() => galaxyViewPromise)

// Chế độ mock dùng khi ai-api staging còn chết (Cloudflare 1033) — xem BAO_CAO_LOI_AI_API_STAGING.md.
// Bật bằng ?mock=1 trên URL, hoặc đặt VITE_GALAXY_FORCE_MOCK=1 trong .env (áp dụng cho mọi người).
const FORCE_MOCK = import.meta.env.VITE_GALAXY_FORCE_MOCK === "1"

const PANEL =
  "flex min-h-[420px] flex-1 flex-col items-center justify-center gap-3 border-t border-border dark:border-darkBorder bg-[#090c18] px-6 text-center text-white"

const VocabularyGalaxyPage = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const useMock = FORCE_MOCK || searchParams.get("mock") === "1"
  const g = t?.vocabularyGalaxy || {}

  // Hooks phải được gọi vô điều kiện -> luôn gọi cả hai, chỉ dùng cái nào cần.
  const real = useGalaxyWords({ enabled: !useMock })
  const mock = useGalaxyWordsMock({ enabled: useMock })

  const data = useMock ? mock : real

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-4">
        <PageTitle>
          {g.title || t?.common?.vocabularyGalaxy || "Ngân hà từ vựng"}
        </PageTitle>
      </div>

      <div className="flex flex-1 flex-col">
        {data.status === "loading" && <GalaxyLoading />}

        {data.status === "error" && (
          <div className={PANEL}>
            <ErrorState
              title={g.error ? g.error.replace(/\.$/, "") : "Không tải được từ vựng"}
              description={
                import.meta.env.DEV && real.error
                  ? [real.error.status, real.error.code, real.error.message]
                      .filter(Boolean)
                      .join(" · ")
                      .replace(/\.$/, "")
                  : null
              }
              action={
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <PillButton
                    variant="primary"
                    onClick={real.retry}
                  >
                    {g.retry || "Thử lại"}
                  </PillButton>
                  <PillButton
                    variant="secondary"
                    onClick={() => {
                      const url = new URL(window.location.href)
                      url.searchParams.set("mock", "1")
                      window.location.href = url.toString()
                    }}
                  >
                    {g.useMock || "Dùng dữ liệu giả lập"}
                  </PillButton>
                </div>
              }
            />
          </div>
        )}

        {data.status === "empty" && (
          <div className={PANEL}>
            <EmptyState
              icon={Sparkles}
              title={g.empty || "Sổ từ vựng của bạn còn trống."}
              description={g.emptyHint || "Thêm từ vào sổ để thấy chúng thành những vì sao."}
              action={
                <PillButton
                  variant="primary"
                  onClick={() => navigate(notebookPaths(lang || "zh").add)}
                >
                  {g.addWords || "Thêm từ vựng"}
                </PillButton>
              }
            />
          </div>
        )}

        {data.status === "ready" && (
          <Suspense fallback={<GalaxyLoading />}>
            <GalaxyView
              words={data.words}
              clusters={data.clusters}
              onWordClick={useMock ? mock.markStudied : null}
              className="min-h-[420px] flex-1"
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default VocabularyGalaxyPage
