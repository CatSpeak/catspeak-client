/**
 * Shared marker để loại overlay khỏi ảnh chụp html2canvas.
 * Mọi overlay muốn loại khỏi screenshot gắn `{...{ [CAPTURE_IGNORE_ATTR ]: "true" }}`
 * (Modal root, dropdown portal, nút nổi...). Logic match nằm ở
 * `shouldIgnoreCaptureElement` trong useBugReportForm.
 */
export const CAPTURE_IGNORE_ATTR = "data-html2canvas-ignore"
