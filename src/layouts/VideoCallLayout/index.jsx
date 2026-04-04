import { useEffect } from "react"
import { Outlet, ScrollRestoration } from "react-router-dom"

const VideoCallLayout = () => {
  // Fullscreen layout — opt out of scrollbar-gutter reserved space
  useEffect(() => {
    const html = document.documentElement
    const original = html.style.scrollbarGutter
    html.style.scrollbarGutter = "auto"
    return () => {
      html.style.scrollbarGutter = original
    }
  }, [])

  return (
    <div className="h-screen w-full overflow-hidden">
      <Outlet />
      <ScrollRestoration />
    </div>
  )
}

export default VideoCallLayout
