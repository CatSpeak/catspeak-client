// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => () => {},
  useParams: () => ({ lang: "vi" }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    language: "vi",
    t: {
      rooms: {
        waitingScreen: {
          roomFull: "Phòng đã đủ người (tối đa {{max}}).",
          joinNow: "Tham gia ngay",
          copyLink: "Copy Link",
        },
      },
    },
  }),
}))

vi.mock("@/shared/components/ui/Dropdown", () => ({
  default: () => <div>dropdown</div>,
}))
vi.mock("@/shared/components/ui/buttons/PillButton", () => ({
  default: ({ children, onClick, disabled, title }) => (
    <button type="button" onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  ),
}))
vi.mock("@/shared/components/ui/ProgressBar", () => ({
  default: () => <div>progress</div>,
}))
vi.mock("./ParticipantsPreview", () => ({ default: () => <div>participants</div> }))
vi.mock("./VideoPreview", () => ({ default: () => <div>video-preview</div> }))
vi.mock("./RoomInformation", () => ({ default: () => <div>room-info</div> }))
vi.mock("./EditNickName", () => ({ default: () => <div>edit-nickname</div> }))
vi.mock("./EditNicknameModal", () => ({ default: () => null }))
vi.mock("./DeviceSettingsModal", () => ({ default: () => null }))
vi.mock("@/layouts/VideoCallLayout/FullscreenOverlayShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}))
vi.mock("@/features/video-call/components/VirtualBackgroundModal", () => ({
  default: () => null,
}))
vi.mock("@/shared/utils/shareUtils", () => ({ copyRoomLink: vi.fn() }))
vi.mock("@/shared/utils/isWebView", () => ({ detectWebView: () => false }))
vi.mock("@/features/video-call/utils/participantIdentity", () => ({
  filterHumanParticipants: (list) => list ?? [],
}))

import WaitingScreen from "./WaitingScreen"

const renderScreen = (maxParticipants) =>
  renderToStaticMarkup(
    <WaitingScreen
      session={{ participants: [] }}
      room={{ name: "Room", languageType: "English" }}
      participantCount={maxParticipants}
      user={{ name: "Learner" }}
      onToggleMic={() => {}}
      onToggleCam={() => {}}
      onJoin={() => {}}
      isFull
      maxParticipants={maxParticipants}
    />,
  )

describe("ISS-79: WaitingScreen room-full copy uses maxParticipants", () => {
  it("renders the dynamic max for a 2-person room", () => {
    const html = renderScreen(2)

    expect(html).toContain("tối đa 2")
    expect(html).toContain("(2/2)")
    expect(html).not.toContain("tối đa 5")
  })

  it("renders a different max for a 10-person room", () => {
    const html = renderScreen(10)

    expect(html).toContain("tối đa 10")
    expect(html).not.toContain("tối đa 5")
  })
})
