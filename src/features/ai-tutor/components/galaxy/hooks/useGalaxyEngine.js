import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { GalaxyCamera } from "../core/GalaxyCamera"
import { detectQuality, GalaxyRenderer } from "../core/GalaxyRenderer"
import { generateGalaxyLayout } from "../core/layoutGenerator"
import { StarPicker } from "../core/raycaster"

const AUTO_ROTATE = 0.035
const PICK_RADIUS_MOUSE = 14

/**
 * Quản lý vòng đời Canvas + requestAnimationFrame.
 * Các thứ đổi mỗi frame (nhãn cụm, vị trí tooltip, FPS) được ghi thẳng vào DOM qua ref
 * để không re-render React 60 lần/giây; React chỉ cập nhật khi sao hover đổi.
 *
 * @param {object} p
 * @param {Array} p.words
 * @param {Array} p.clusters
 * @param {React.RefObject<HTMLCanvasElement>} p.canvasRef
 * @param {React.RefObject<HTMLElement>} p.tooltipRef  được dịch chuyển bám theo sao hover
 * @param {React.MutableRefObject<HTMLElement[]>} p.labelRefs  nhãn cụm, cùng thứ tự `clusters`
 * @param {React.RefObject<HTMLElement>} [p.statsRef]  hiển thị FPS (tùy chọn)
 */
export function useGalaxyEngine({ words, clusters, canvasRef, tooltipRef, labelRefs, statsRef }) {
  const layout = useMemo(() => generateGalaxyLayout(words, clusters), [words, clusters])
  const cameraRef = useRef(null)
  const draggingRef = useRef(false)
  const pointerRef = useRef(null) // {x, y} hoặc null
  const interactedRef = useRef(false)
  const rendererRef = useRef(null)
  const [hoverIndex, setHoverIndex] = useState(-1)
  const [isWebGL, setIsWebGL] = useState(true)

  if (!cameraRef.current) cameraRef.current = new GalaxyCamera()

  const onHover = useCallback((x, y) => {
    pointerRef.current = { x, y }
  }, [])
  const onLeave = useCallback(() => {
    pointerRef.current = null
  }, [])
  const onInteract = useCallback(() => {
    interactedRef.current = true
  }, [])

  const resetView = useCallback(() => {
    cameraRef.current?.reset()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const camera = cameraRef.current
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    const renderer = new GalaxyRenderer(canvas, layout, { quality: detectQuality(), reducedMotion })
    const picker = new StarPicker(layout.positions)
    rendererRef.current = renderer
    setIsWebGL(renderer.isWebGL)

    let firstSize = true
    const resize = () => {
      renderer.resize()
      camera.setViewport(renderer.width, renderer.height)
      if (firstSize) {
        camera.dist = camera.baseDist()
        firstSize = false
      }
      picker.invalidate()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf = 0
    let last = performance.now()
    let hovered = -1
    let frames = 0
    let fpsStart = last

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const idleRotate = reducedMotion || interactedRef.current ? 0 : AUTO_ROTATE
      camera.update(dt, draggingRef.current, idleRotate)
      picker.invalidate()

      // Hover: chỉ pick khi con trỏ nằm trong canvas và không đang kéo.
      let next = -1
      const ptr = pointerRef.current
      if (ptr && !draggingRef.current) next = picker.pick(camera, ptr.x, ptr.y, PICK_RADIUS_MOUSE)
      if (next !== hovered) {
        hovered = next
        renderer.hover = next
        setHoverIndex(next)
      }

      renderer.render(camera, now)

      // Tooltip bám theo sao.
      const tip = tooltipRef.current
      if (tip) {
        const s =
          hovered >= 0
            ? camera.worldToScreen(layout.positions[hovered * 3], layout.positions[hovered * 3 + 1], layout.positions[hovered * 3 + 2])
            : null
        if (s) {
          tip.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`
          tip.dataset.side = s.x > renderer.width - 220 ? "left" : "right"
          tip.dataset.vert = s.y < 140 ? "below" : "above"
        }
      }

      // Nhãn cụm.
      const labels = labelRefs.current
      layout.centers.forEach((c, k) => {
        const el = labels[k]
        if (!el) return
        const s = camera.worldToScreen(c[0], c[1] + 0.12, c[2])
        if (!s || s.x < -80 || s.x > renderer.width + 80 || s.y < -30 || s.y > renderer.height + 30) {
          el.style.opacity = "0"
          return
        }
        el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%)`
        // Mờ dần khi zoom sát vào cụm, rõ khi nhìn tổng thể.
        el.style.opacity = String(Math.max(0, Math.min(0.9, (camera.dist - 0.45) * 1.6)) * renderer.intro(now))
      })

      // FPS
      frames++
      if (now - fpsStart >= 500) {
        const fps = Math.round((frames * 1000) / (now - fpsStart))
        if (statsRef?.current) statsRef.current.textContent = `${fps} FPS · ${layout.n} stars`
        frames = 0
        fpsStart = now
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      rendererRef.current = null
    }
  }, [layout, canvasRef, tooltipRef, labelRefs, statsRef])

  return {
    layout,
    cameraRef,
    hoverIndex,
    isWebGL,
    resetView,
    controls: { onHover, onLeave, onInteract, draggingRef },
  }
}
