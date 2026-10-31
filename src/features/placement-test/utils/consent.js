/**
 * Đổi trạng thái đồng ý của màn Placement Test.
 *
 * Tick phải hiện ngay khi người dùng bấm: hộp xin quyền microphone của trình
 * duyệt có thể treo 3-5 giây (hoặc lâu hơn), nên trạng thái tick không được
 * chờ promise của `requestPermission`.
 */
export const toggleConsent = async ({
  agreed,
  requestPermission,
  onAgreedChange,
  onPermissionDenied,
}) => {
  if (agreed) {
    onAgreedChange(false)
    return
  }

  onAgreedChange(true)
  if (!requestPermission) return

  const granted = await requestPermission()
  if (granted) return

  onAgreedChange(false)
  if (onPermissionDenied) onPermissionDenied()
}
