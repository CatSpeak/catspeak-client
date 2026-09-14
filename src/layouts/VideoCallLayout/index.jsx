import { useLayoutEffect } from "react"
import { Outlet, ScrollRestoration } from "react-router-dom"

const VideoCallLayout = () => {
  // Fullscreen layout — opt out of scrollbar-gutter reserved space and lock
  // document scrolling so the in-room header/footer can never scroll away
  // (mobile browsers treat 100vh as taller than the visible viewport).
  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevGutter = html.style.scrollbarGutter
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow

    html.style.scrollbarGutter = "auto"
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    window.scrollTo(0, 0)

    return () => {
      html.style.scrollbarGutter = prevGutter
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
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
