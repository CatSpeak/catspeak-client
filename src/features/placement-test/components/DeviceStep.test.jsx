import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

const micCaptureMock = vi.fn()

vi.mock("../hooks/useMicCapture", () => ({ default: () => micCaptureMock() }))

// The buttons barrel pulls every button implementation and with it the redux
// store; the live-region contract only needs the rendered text.
vi.mock("@/shared/components/ui/buttons", () => ({
  PillButton: ({ children }) => <button type="button">{children}</button>,
}))

import DeviceStep from "./DeviceStep"

const copy = {
  device: {
    title: "Thử Giọng Khẩu Ngữ",
    instruction: "Hệ thống kiểm tra micro sau 5 giây thu mẫu.",
    sampleHanzi: "你好！欢迎来到 CatSpeak。",
    samplePinyin: "Nǐ hǎo! Huānyíng lái dào CatSpeak.",
    sampleTranslation: "Xin chào, chào mừng bạn đến với CatSpeak!",
    statusNoSignal: "Chưa phát hiện giọng nói",
    statusError: "Lỗi micro",
    statusReady: "Đã sẵn sàng",
    statusPending: "Chưa đo tín hiệu",
    statusListening: "Đang nghe...",
    record: "Bắt đầu thu mẫu",
    recording: "Đang thu mẫu...",
    deviceTitle: "Nguồn microphone",
    errorTitle: "Không mở được microphone",
    errorBody: "Thiết bị đang được ứng dụng khác sử dụng.",
    errorRetryCta: "Thử lại",
  },
  noAudio: {
    instruction: "Hệ thống không nhận được âm thanh từ microphone sau 5 giây thu mẫu.",
    meterLabel: "Không có tín hiệu âm thanh (0 dB)",
    info: "Vui lòng thử các bước khắc phục bên cạnh trước khi thử lại.",
    guideTitle: "Hướng Dẫn Khắc Phục Lỗi Thu Âm",
    switchHint: "Nhấp để đổi nguồn microphone khác",
    fixes: [],
    retryCta: "Nói Thử Lại Lần Nữa",
  },
}

const capture = (overrides = {}) => ({
  devices: [],
  deviceId: "",
  selectDevice: () => {},
  level: 0,
  status: "ready",
  recording: false,
  recordingUrl: null,
  recordingMs: 0,
  startRecording: () => {},
  stopRecording: () => {},
  retry: () => {},
  ...overrides,
})

describe("DeviceStep live regions", () => {
  it("announces the 0 dB no-signal error assertively", () => {
    // Oracle: user report 2026-10-31 — a blocked/silent mic must be announced,
    // not only painted red. Expected: role="alert" or aria-live="assertive".
    micCaptureMock.mockReturnValue(capture({ status: "nosignal" }))

    const html = renderToStaticMarkup(<DeviceStep copy={copy} onContinue={() => {}} />)

    expect(html).toContain("Không có tín hiệu âm thanh (0 dB)")
    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
  })

  it("announces a device error assertively", () => {
    micCaptureMock.mockReturnValue(capture({ status: "error" }))

    const html = renderToStaticMarkup(<DeviceStep copy={copy} onContinue={() => {}} />)

    expect(html).toContain("Không mở được microphone")
    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
  })

  it("stays silent while the sample is still valid", () => {
    micCaptureMock.mockReturnValue(capture())

    const html = renderToStaticMarkup(<DeviceStep copy={copy} onContinue={() => {}} />)

    expect(html).not.toContain('aria-live="assertive"')
  })
})
