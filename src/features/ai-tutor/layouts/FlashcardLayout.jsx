import React, { useEffect } from "react"
import { Outlet, useLocation, useParams } from "react-router-dom"
import { OfflineBanner } from "../components/flashcard/SyncStatus"
import useOnlineStatus from "../hooks/useOnlineStatus"
import { registerFlashcardOffline } from "../utils/flashcardOfflineShell"
import { enterOfflineCapableRoute } from "@/shared/utils/offlineCapableRoute"

// Nạp sẵn các màn flashcard khi đang có mạng, để mất mạng giữa chừng vẫn chuyển màn
// được (vào phiên ôn, xem kết quả) thay vì lỗi tải module.
const prefetchScreens = () =>
  Promise.allSettled([
    import("../pages/FlashcardReviewPage"),
    import("../pages/FlashcardResultPage"),
    import("../pages/DeckBrowsePage"),
    import("../pages/DeckListPage"),
    import("../pages/AddFlashcardPage"),
    import("../pages/PronunciationPracticePage"),
  ])

/**
 * Khung chung của mọi màn Sổ tay từ vựng (fc01-fc12).
 *
 *   - Banner offline xuyên suốt (CHK-066, CHK-100): mất mạng ở màn nào cũng thấy.
 *   - Nạp sẵn các màn còn lại và đăng ký bộ đệm offline cho trang (CHK-098): tải lại
 *     trang khi mất mạng vẫn mở được sổ và báo rõ đang offline, không trắng màn.
 *
 * Đăng nhập do AuthGuard ở routesConfig chặn trước (CHK-103, CHK-105).
 */
const FlashcardLayout = () => {
  const { lang = "vi" } = useParams()
  const { pathname } = useLocation()
  const isOnline = useOnlineStatus()
  // Màn ôn và màn kết quả có banner riêng (nói về kết quả ôn), không hiện hai banner.
  const ownBanner = pathname.includes("/vocabulary-notebook/review")

  // Ôn được khi mất mạng: không để màn "Máy chủ không khả dụng" phủ kín sổ từ vựng.
  useEffect(() => enterOfflineCapableRoute(), [])

  useEffect(() => {
    if (!isOnline) return undefined
    const id = setTimeout(() => {
      prefetchScreens()
      registerFlashcardOffline(lang)
    }, 800)
    return () => clearTimeout(id)
  }, [isOnline, lang])

  return (
    <div className="flex w-full flex-col gap-4">
      <OfflineBanner
        isOnline={isOnline || ownBanner}
        message="Bạn đang offline - dữ liệu có thể chưa mới nhất. Kết quả ôn vẫn được lưu và sẽ đồng bộ khi có mạng lại."
      />
      <Outlet />
    </div>
  )
}

export default FlashcardLayout
