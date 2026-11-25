// @vitest-environment happy-dom
import { configureStore } from "@reduxjs/toolkit"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { socialApi } from "./socialApi"
import { conversationsApi } from "./conversationsApi"

vi.mock("@/shared/utils/moderation", () => ({
  maskBody: vi.fn(async (_api, body) => body),
}))

describe("conversationsApi routes match ChatController api/chat/conversations", () => {
  let fetchMock

  beforeEach(() => {
    fetchMock = vi.fn(async () =>
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )
    globalThis.fetch = fetchMock
  })

  function createTestStore() {
    // Non-expired dummy JWT payload: {"exp":9999999999}
    const validDummyJwt = "header.eyJleHAiOjk5OTk5OTk5OTl9.sig"
    return configureStore({
      reducer: {
        [socialApi.reducerPath]: socialApi.reducer,
        auth: () => ({
          token: validDummyJwt,
          refreshToken: "rt-test",
          user: { timeZone: "Asia/Ho_Chi_Minh" },
        }),
        serverStatus: () => ({ isServerDown: false }),
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(socialApi.middleware),
    })
  }

  const endpointInvocations = [
    ["getConversations", undefined],
    ["createPrivateConversation", 9],
    ["createGroupConversation", { title: "Study" }],
    ["getConversationMessages", { conversationId: 12, page: 1, pageSize: 20 }],
    ["sendMessage", { conversationId: 12, messageData: { messageContent: "hello" } }],
    ["sendMediaMessage", { conversationId: 12, formData: new FormData() }],
    ["deleteMessageForMe", { conversationId: 12, messageId: 34 }],
    ["recallMessage", { conversationId: 12, messageId: 34 }],
    ["markConversationAsRead", 12],
    ["addParticipants", { conversationId: 12, accountIds: [5] }],
    ["removeParticipant", { conversationId: 12, accountId: 5 }],
    ["getSupportStaff", undefined],
    ["editMessage", { conversationId: 12, messageId: 34, messageContent: "edited" }],
    ["toggleReaction", { conversationId: 12, messageId: 34, emoji: "👍" }],
    ["getMessageReactions", { conversationId: 12, messageId: 34 }],
    ["getPinnedMessages", 12],
    ["pinMessage", { conversationId: 12, messageId: 34 }],
    ["unpinMessage", { conversationId: 12, messageId: 34 }],
    ["forwardMessages", { sourceMessageId: 34, targetConversationIds: [12, 13] }],
    ["forwardMessageById", { conversationId: 12, messageId: 34, targetConversationIds: [13] }],
    ["getConversationMedia", { conversationId: 12, type: "image" }],
    ["searchConversationMessages", { conversationId: 12, query: "hsk" }],
    ["getConversationMembers", { conversationId: 12 }],
    ["updateGroupInfo", { conversationId: 12, groupName: "HSK 4" }],
    ["promoteParticipant", { conversationId: 12, accountId: 5 }],
    ["demoteParticipant", { conversationId: 12, accountId: 5 }],
    ["transferOwnership", { conversationId: 12, newOwnerAccountId: 5 }],
    ["leaveGroup", 12],
    ["initiateCall", { conversationId: 12, callType: "video" }],
    ["joinCall", 12],
    ["endCall", { conversationId: 12, forceEnd: false }],
    ["getActiveCall", 12],
    ["getActiveIncomingCall", undefined],
    ["rejectCall", { conversationId: 12, callId: 77 }],
    ["getGroupInviteLink", 12],
    ["resetGroupInviteLink", 12],
    ["updateGroupInviteLinkStatus", { conversationId: 12, isEnabled: true }],
    ["previewGroupInvite", "INV123"],
    ["joinGroupViaInvite", "INV123"],
  ]

  it("prefixes every conversation endpoint with /api/social/chat/conversations", async () => {
    const store = createTestStore()

    for (const [name, arg] of endpointInvocations) {
      fetchMock.mockClear()
      await store.dispatch(conversationsApi.endpoints[name].initiate(arg))
      expect(fetchMock, `endpoint ${name} should perform fetch`).toHaveBeenCalled()

      const firstArg = fetchMock.mock.calls[0][0]
      const rawUrl = typeof firstArg === "string" ? firstArg : firstArg.url
      const pathname = new URL(rawUrl, "https://catspeak.com.vn").pathname

      expect(pathname, `endpoint ${name}`).toMatch(
        /^\/api\/social\/chat\/conversations(?:\/|$)/,
      )
      expect(pathname, `endpoint ${name}`).not.toMatch(
        /^\/api\/social\/conversations(?:\/|$)/,
      )
    }
  })
})
