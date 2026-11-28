// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import CustomRoomCard from "./CustomRoomCard"

const authState = { user: { accountId: 446 } }

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      rooms: {
        customRooms: { edit: "Chỉnh sửa", delete: "Xóa phòng" },
        people: "người",
      },
    },
  }),
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => authState,
}))

vi.mock("@/features/co-host/CoHostManager", () => ({ default: () => null }))

vi.mock("@/store/api/roomsApi", () => ({
  useGetRoomCoHostQuery: () => ({ data: null }),
  useAssignRoomCoHostMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateRoomCoHostMutation: () => [vi.fn(), { isLoading: false }],
  useRevokeRoomCoHostMutation: () => [vi.fn(), { isLoading: false }],
}))

vi.mock("@/shared/components/ui/ConfirmationModal", () => ({
  default: () => null,
}))

const room = {
  id: 11,
  name: "Room",
  creatorId: 446,
  roomType: 4,
  languageType: "English",
}

const renderCard = (overrides = {}) => {
  const html = renderToStaticMarkup(
    <CustomRoomCard
      room={room}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      {...overrides}
    />,
  )
  const container = document.createElement("div")
  container.innerHTML = html
  return container
}

describe("ISS-14: CustomRoomCard action affordances", () => {
  it("marks the outer card as a group/card so hover actions can resolve", () => {
    const container = renderCard()

    expect(container.innerHTML).toContain("group/card")
    expect(container.querySelector('div[class*="group/card"]')).toBeTruthy()
  })

  it("keeps Enter and Delete labelled for every device", () => {
    const container = renderCard()

    const editButton = container.querySelector(
      'button[aria-label="Chỉnh sửa"]',
    )
    const deleteButton = container.querySelector(
      'button[aria-label="Xóa phòng"]',
    )

    expect(editButton).toBeTruthy()
    expect(editButton.getAttribute("title")).toBe("Chỉnh sửa")
    expect(deleteButton).toBeTruthy()
    expect(deleteButton.getAttribute("title")).toBe("Xóa phòng")
  })

  it("shows actions on touch media and reveals them on hover/focus for mice", () => {
    const container = renderCard()

    const actionBar = container.querySelector(
      'button[aria-label="Chỉnh sửa"]',
    ).parentElement
    expect(actionBar).toBeTruthy()
    expect(actionBar.className).toContain(
      "[@media(hover:hover)]:group-hover/card:opacity-100",
    )
    expect(actionBar.className).toContain(
      "[@media(hover:hover)]:group-focus-within/card:opacity-100",
    )
    expect(actionBar.className).toContain("opacity-100")
  })

  it("hides the edit action when the viewer is not the room owner", () => {
    authState.user = { accountId: 999 }

    const container = renderCard()

    expect(container.querySelector('button[aria-label="Chỉnh sửa"]')).toBeNull()
    expect(container.querySelector('button[aria-label="Xóa phòng"]')).toBeTruthy()

    authState.user = { accountId: 446 }
  })
})
