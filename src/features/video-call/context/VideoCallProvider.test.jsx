// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  isCallReady: false,
  lkRoom: null,
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ id: "42", lang: "vi" }),
  useLocation: () => ({ search: "", state: {}, pathname: "/vi/meet/42" }),
  useNavigate: () => () => {},
  Navigate: ({ to }) => <div data-testid="navigate">{to}</div>,
}))

vi.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({
      videoCall: {
        isInCall: true,
        callInfo: { roomId: "42", sessionId: "s1" },
      },
      auth: { user: { accountId: 7 } },
    }),
  useDispatch: () => () => {},
}))

vi.mock("react-hot-toast", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ user: { accountId: 7 }, isAuthenticated: true }),
}))

vi.mock("@/store/api/userApi", () => ({
  useGetUserProfileQuery: () => ({ data: { accountId: 7 }, isLoading: false }),
}))

vi.mock("@/store/api/livekitApi", () => ({
  useGetLivekitTokenMutation: () => [vi.fn()],
}))

vi.mock("@/features/rooms", () => ({
  useGetRoomByIdQuery: () => ({ data: null, isLoading: false }),
  WaitingScreen: () => <div>waiting-screen</div>,
  useMediaPreview: () => ({
    micOn: false,
    cameraOn: false,
    localStream: null,
    lkVideoTrack: null,
    toggleMic: vi.fn(),
    toggleCamera: vi.fn(),
    stopAllPreviewTracks: vi.fn(),
  }),
  useDeviceSelection: () => ({}),
}))

vi.mock("@/store/api/roomsApi", () => ({
  useVerifyJoinRoomMutation: () => [vi.fn(), { isLoading: false }],
  roomsApi: { util: { upsertQueryData: vi.fn() } },
  useGetRoomStateQuery: () => ({ data: null }),
}))

vi.mock("@/store/api/coursesApi", () => ({
  useGetClassDetailQuery: () => ({ data: null, isLoading: false }),
  useGetStudentClassDetailQuery: () => ({ data: null, isLoading: false }),
  useJoinClassRoomMutation: () => [vi.fn()],
  useJoinStudentClassRoomMutation: () => [vi.fn()],
}))

vi.mock("@/features/courses/components/RoleSwitcher", () => ({
  useRoleOverride: () => ({ isTeacher: false, isRoleResolved: true }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    language: "vi",
    t: { rooms: { videoCall: { provider: { connecting: "Connecting..." } } } },
  }),
}))

vi.mock("@/shared/utils/navigation", () => ({
  getCommunityLang: () => "vi",
}))

vi.mock("@/store/slices/videoCallSlice", () => ({
  enterCall: (payload) => ({ type: "enterCall", payload }),
  setPiP: (payload) => ({ type: "setPiP", payload }),
  leaveCall: () => ({ type: "leaveCall" }),
  enterBreakout: (payload) => ({ type: "enterBreakout", payload }),
}))

vi.mock("@/shared/utils/audioUnlockUtils", () => ({ unlockAudioContext: vi.fn() }))

vi.mock("@/features/video-call/components/SwitchCallModal", () => ({
  default: () => <div>switch-modal</div>,
}))

vi.mock("@/features/video-call/services/callBroadcastChannel", () => ({
  pingActiveCall: async () => false,
  requestLeaveActiveCall: vi.fn(),
}))

vi.mock("../components/VideoCallLoading", () => ({
  default: ({ message }) => <div data-testid="loading">{message}</div>,
}))

vi.mock("../components/RoomNotFoundScreen", () => ({
  default: () => <div>not-found</div>,
}))
vi.mock("../components/PasswordScreen", () => ({
  default: () => <div>password</div>,
}))
vi.mock("../components/CallEndedScreen", () => ({
  default: () => <div>ended</div>,
}))
vi.mock("../components/waiting/WaitingScreen", () => ({
  PreJoinWaitingGate: () => <div>pre-join</div>,
}))

vi.mock("@/shared/components/VideoCallErrorBoundary", () => ({
  default: ({ children }) => <div>{children}</div>,
}))

vi.mock("@/shared/utils/dateUtils", () => ({ isRoomExpired: () => false }))
vi.mock("@/features/video-call/utils/roomTypeHelpers", () => ({
  isRoomHost: () => false,
}))

vi.mock("@livekit/components-react", () => ({
  useMaybeRoomContext: () => state.lkRoom,
}))

vi.mock("./videoCallContext", () => ({
  useGlobalVideoCall: () => ({ isCallReady: state.isCallReady }),
}))

import { VideoCallProvider } from "./VideoCallProvider"

describe("ISS-79: VideoCallProvider waits for the lazy call context", () => {
  it("shows the connecting screen and keeps children unmounted before sync", () => {
    state.isCallReady = false
    state.lkRoom = null

    const html = renderToStaticMarkup(
      <VideoCallProvider>
        <div data-testid="call-children">call-children</div>
      </VideoCallProvider>,
    )

    expect(html).toContain('data-testid="loading"')
    expect(html).toContain("Connecting...")
    expect(html).not.toContain("call-children")
    expect(html).not.toContain('data-testid="navigate"')
  })

  it("mounts children once both isCallReady and the LiveKit room are available", () => {
    state.isCallReady = true
    state.lkRoom = { name: "lk-room" }

    const html = renderToStaticMarkup(
      <VideoCallProvider>
        <div data-testid="call-children">call-children</div>
      </VideoCallProvider>,
    )

    expect(html).toContain("call-children")
    expect(html).not.toContain('data-testid="loading"')
    expect(html).not.toContain('data-testid="navigate"')
  })
})
