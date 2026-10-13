import { useLayoutEffect } from "react"
import { Outlet, ScrollRestoration } from "react-router-dom"
import useScrollLock from "@/shared/hooks/useScrollLock"

const VideoCallLayout = () => {
  // Fullscreen layout — lock body scrolling via reference-counted useScrollLock
  // (reserveScrollBarGap: false so 100dvh isn't shifted by scrollbar padding).
  useScrollLock(true, { reserveScrollBarGap: false })

  // Fullscreen html styles — opt out of scrollbar-gutter reserved space and lock
  // document scrolling so the in-room header/footer can never scroll away
  // (mobile browsers treat 100vh as taller than the visible viewport).
  useLayoutEffect(() => {
    const html = document.documentElement
    const prevGutter = html.style.scrollbarGutter
    const prevHtmlOverflow = html.style.overflow

    html.style.scrollbarGutter = "auto"
    html.style.overflow = "hidden"
    window.scrollTo(0, 0)

    return () => {
      html.style.scrollbarGutter =
        prevGutter && prevGutter !== "auto" ? prevGutter : ""
      html.style.overflow =
        prevHtmlOverflow && prevHtmlOverflow !== "hidden"
          ? prevHtmlOverflow
          : ""
    }
  }, [])

  return (
    <div className="h-[100dvh] w-full overflow-hidden">
      <Outlet />
      <ScrollRestoration />
    </div>
  )
}

export default VideoCallLayout
