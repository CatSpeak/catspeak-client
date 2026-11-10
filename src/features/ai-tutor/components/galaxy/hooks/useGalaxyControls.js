import { useEffect } from "react"

/**
 * Điều khiển camera bằng chuột + cảm ứng (Pointer Events).
 * - Chuột trái / 1 ngón: orbit      - Chuột phải (hoặc Shift+kéo) / 2 ngón kéo: pan
 * - Con lăn / pinch: zoom           - Thả tay: camera lướt theo quán tính (xử lý trong GalaxyCamera)
 *
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @param {React.RefObject<import("../core/GalaxyCamera").GalaxyCamera>} cameraRef
 * @param {{ onHover: (x:number,y:number)=>void, onLeave: ()=>void, draggingRef: React.RefObject<boolean>, onInteract?: ()=>void }} handlers
 */
export function useGalaxyControls(canvasRef, cameraRef, { onHover, onLeave, draggingRef, onInteract }) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const pointers = new Map() // pointerId -> {x, y}
    let mode = null // "orbit" | "pan" | "pinch"
    let lastMove = 0
    let pinchDist = 0

    const local = (e) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const centroid = () => {
      const pts = [...pointers.values()]
      return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
    }
    const spread = () => {
      const pts = [...pointers.values()]
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
    }

    const onDown = (e) => {
      canvas.setPointerCapture?.(e.pointerId)
      pointers.set(e.pointerId, local(e))
      const cam = cameraRef.current
      cam.stopInertia()
      cam.goal = null
      draggingRef.current = true
      onInteract?.()
      if (pointers.size === 2) {
        mode = "pinch"
        pinchDist = spread()
      } else {
        mode = e.button === 2 || e.shiftKey ? "pan" : "orbit"
      }
      onLeave()
    }

    const onMove = (e) => {
      const p = local(e)
      if (!pointers.has(e.pointerId)) {
        if (e.pointerType === "mouse") onHover(p.x, p.y)
        return
      }
      const prev = pointers.get(e.pointerId)
      const cam = cameraRef.current
      lastMove = performance.now()
      if (mode === "pinch" && pointers.size === 2) {
        const before = centroid()
        pointers.set(e.pointerId, p)
        const after = centroid()
        const d = spread()
        if (pinchDist > 0 && d > 0) cam.zoom(pinchDist / d)
        pinchDist = d
        cam.pan(after.x - before.x, after.y - before.y)
        return
      }
      pointers.set(e.pointerId, p)
      const dx = p.x - prev.x
      const dy = p.y - prev.y
      if (mode === "pan") cam.pan(dx, dy)
      else if (mode === "orbit") cam.orbit(dx, dy)
    }

    const onUp = (e) => {
      if (!pointers.delete(e.pointerId)) return
      canvas.releasePointerCapture?.(e.pointerId)
      const cam = cameraRef.current
      if (pointers.size === 1) {
        mode = "orbit" // còn 1 ngón sau pinch
        return
      }
      if (pointers.size === 0) {
        draggingRef.current = false
        mode = null
        // Dừng lại rồi mới thả -> không lướt tiếp.
        if (performance.now() - lastMove > 80) cam.stopInertia()
        // Chạm (touch) xong: không có hover nên không để tooltip treo.
        if (e.pointerType !== "mouse") onLeave()
      }
    }

    const onWheel = (e) => {
      e.preventDefault()
      cameraRef.current.zoom(Math.exp(e.deltaY * 0.0012))
      onInteract?.()
    }

    const onContext = (e) => e.preventDefault()

    canvas.addEventListener("pointerdown", onDown)
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerup", onUp)
    canvas.addEventListener("pointercancel", onUp)
    canvas.addEventListener("pointerleave", onLeave)
    canvas.addEventListener("wheel", onWheel, { passive: false })
    canvas.addEventListener("contextmenu", onContext)
    return () => {
      canvas.removeEventListener("pointerdown", onDown)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerup", onUp)
      canvas.removeEventListener("pointercancel", onUp)
      canvas.removeEventListener("pointerleave", onLeave)
      canvas.removeEventListener("wheel", onWheel)
      canvas.removeEventListener("contextmenu", onContext)
    }
  }, [canvasRef, cameraRef, onHover, onLeave, draggingRef, onInteract])
}
