import React, { useMemo, useRef } from "react"
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGalaxyEngine } from "./hooks/useGalaxyEngine"
import { useGalaxyControls } from "./hooks/useGalaxyControls"
import { GALAXY_CLUSTERS, MOCK_GALAXY_WORDS } from "./mocks/mockGalaxyData"

const SHOW_STATS = import.meta.env.DEV

/**
 * Ngân hà từ vựng (FE-01). Dữ liệu vào qua props -> S4 chỉ cần thay `words`/`clusters` bằng API thật.
 * Canvas chiếm toàn bộ khung; nhãn cụm và Quick Flashcard là React overlay (pointer-events-none).
 */
const GalaxyView = ({ words = MOCK_GALAXY_WORDS, clusters = GALAXY_CLUSTERS, className = "" }) => {
  const { t } = useLanguage()
  const g = t?.aiTutor?.vocabularyGalaxy || {}

  const canvasRef = useRef(null)
  const tooltipRef = useRef(null)
  const statsRef = useRef(null)
  const labelRefs = useRef([])

  const { layout, cameraRef, hoverIndex, isWebGL, resetView, controls } = useGalaxyEngine({
    words,
    clusters,
    canvasRef,
    tooltipRef,
    labelRefs,
    statsRef: SHOW_STATS ? statsRef : undefined,
  })
  useGalaxyControls(canvasRef, cameraRef, controls)

  const hovered = hoverIndex >= 0 ? words[hoverIndex] : null
  const hoveredCluster = useMemo(
    () => (hovered ? clusters.find((c) => c.id === hovered.clusterId) : null),
    [hovered, clusters],
  )

  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl border border-border bg-[#090c18] ${className}`}
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full touch-none select-none ${hovered ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"}`}
        aria-label={g.canvasLabel || "Vocabulary galaxy"}
        role="img"
      />

      {/* Nhãn cụm chủ đề, vị trí được hook cập nhật mỗi frame */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {clusters.map((c, k) => (
          <span
            key={c.id}
            ref={(el) => {
              labelRefs.current[k] = el
            }}
            className="absolute left-0 top-0 whitespace-nowrap text-xs font-semibold tracking-wide opacity-0 will-change-transform"
            style={{ color: c.color, textShadow: "0 0 10px rgba(0,0,0,.9)" }}
          >
            {c.label}
          </span>
        ))}
      </div>

      {/* Quick Flashcard */}
      <div
        ref={tooltipRef}
        data-side="right"
        data-vert="above"
        className="group pointer-events-none absolute left-0 top-0 z-10 will-change-transform"
        style={{ visibility: hovered ? "visible" : "hidden" }}
      >
        {hovered && (
          <div
            className="absolute w-52 rounded-xl border border-white/15 bg-[#0d1226]/90 px-4 py-3 text-white shadow-xl backdrop-blur-md
              group-data-[side=right]:left-4 group-data-[side=left]:right-4
              group-data-[vert=above]:bottom-3 group-data-[vert=below]:top-3"
          >
            <div className="text-4xl font-bold leading-tight">{hovered.word}</div>
            <div className="mt-1 text-sm text-white/70">{hovered.pinyin}</div>
            <div className="mt-2 border-t border-white/15 pt-2 text-sm font-medium">{hovered.meaning}</div>
            {hoveredCluster && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/60">
                <span className="h-2 w-2 rounded-full" style={{ background: hoveredCluster.color }} />
                {hoveredCluster.label}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chú thích + điều khiển */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
        <div className="max-w-[60%] text-[11px] leading-relaxed text-white/60 sm:text-xs">
          <div>{g.hint || "Drag to rotate · scroll or pinch to zoom · right-drag or two fingers to pan"}</div>
          <div className="mt-0.5">
            {layout.n} {g.words || "words"} · {clusters.length} {g.topics || "topics"}
            {!isWebGL && <span className="ml-2 text-amber-300">{g.fallback || "(Canvas 2D mode)"}</span>}
          </div>
          {SHOW_STATS && <div ref={statsRef} className="mt-0.5 font-mono text-emerald-300" />}
        </div>
        <div className="pointer-events-auto flex gap-1.5">
          <GalaxyButton label={g.zoomIn || "Zoom in"} onClick={() => cameraRef.current.zoom(0.75)}>
            <ZoomIn size={16} />
          </GalaxyButton>
          <GalaxyButton label={g.zoomOut || "Zoom out"} onClick={() => cameraRef.current.zoom(1.33)}>
            <ZoomOut size={16} />
          </GalaxyButton>
          <GalaxyButton label={g.resetView || "Reset view"} onClick={resetView}>
            <Maximize2 size={16} />
          </GalaxyButton>
        </div>
      </div>
    </div>
  )
}

const GalaxyButton = ({ label, onClick, children }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
  >
    {children}
  </button>
)

export default GalaxyView
