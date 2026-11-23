import React, { Suspense, lazy } from "react"
import { Link } from "react-router-dom"
import { Orbit } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGalaxyWords } from "../hooks/useGalaxyWords"
import { useGalaxyWordsMock } from "../hooks/useGalaxyWordsMock"

const GalaxyView = lazy(() => import("./GalaxyView"))
const FORCE_MOCK = import.meta.env.VITE_GALAXY_FORCE_MOCK === "1"
export const GALAXY_ROUTE = "/workspace/vocabulary-galaxy"

/**
 * Mini Galaxy (FE-07): bản thu nhỏ, không điều khiển, bấm vào mở trang Ngân hà.
 * Dùng chung dữ liệu với trang lớn (RTK Query cache), canvas tự dừng vẽ khi cuộn khuất (FE-04).
 */
const MiniGalaxy = ({ title, className = "" }) => {
  const { t } = useLanguage()
  const g = t?.vocabularyGalaxy || {}
  const real = useGalaxyWords({ enabled: !FORCE_MOCK })
  const mock = useGalaxyWordsMock({ enabled: FORCE_MOCK })
  const data = FORCE_MOCK ? mock : real
  const label = g.openGalaxy || "Mở Ngân hà từ vựng"

  return (
    <Link
      to={GALAXY_ROUTE}
      aria-label={label}
      className={`group relative block h-56 overflow-hidden rounded-2xl border border-slate-200 dark:border-[#3F3F3F] bg-[#090c18] ${className}`}
    >
      {data.status === "ready" ? (
        <div className="pointer-events-none absolute inset-0 flex">
          <Suspense fallback={null}>
            <GalaxyView words={data.words} clusters={data.clusters} compact className="flex-1 !border-t-0" />
          </Suspense>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/40">
          <Orbit className={`h-10 w-10 ${data.status === "loading" ? "animate-pulse" : ""}`} />
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8 text-white">
        <div>
          <div className="text-sm font-semibold">{title || g.title || "Ngân hà từ vựng"}</div>
          {data.status === "ready" && (
            <div className="text-[11px] text-white/70">
              {data.words.length} {g.words || "từ"} · {data.clusters.length} {g.topics || "chủ đề"}
            </div>
          )}
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur group-hover:bg-white/25">
          {label}
        </span>
      </div>
    </Link>
  )
}

export default MiniGalaxy
