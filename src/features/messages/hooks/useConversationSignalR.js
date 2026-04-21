import { useEffect, useRef } from "react"
import { useConversationSignalRContext } from "../context/ConversationSignalRContext"

/**
 * Hook to consume SignalR connection for Real-time Conversations
 *
 * handlers: {
 *   NewMessage: (message) => void,
 *   NewConversation: (conversation) => void,
 *   FriendStatusChange: (status) => void,
 *   ChatUpdated: (update) => void,
 *   OnConnected: (connection) => void,
 *   OnReconnected: (connectionId) => void
 * }
 */
export const useConversationSignalR = (handlers = {}) => {
  const context = useConversationSignalRContext()

  if (!context) {
    throw new Error(
      "useConversationSignalR must be used within a ConversationSignalRProvider",
    )
  }

  const { isConnected, connectionId, sendMessage, invoke, reconnect, on, off } = context

  // Keep handlers fresh without re-subscribing
  const handlersRef = useRef(handlers)
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  useEffect(() => {
    const events = [
      "NewMessage",
      "NewConversation",
      "ConversationCreated",
      "FriendStatusChange",
      "ChatUpdated",
      "OnConnected",
      "OnReconnected",
    ]

    const registeredCallbacks = []

    events.forEach((eventName) => {
      const callback = (...args) => {
        const handler = handlersRef.current[eventName]
        if (handler) {
          handler(...args)
        }
      }

      on(eventName, callback)
      registeredCallbacks.push({ eventName, callback })
    })

    return () => {
      registeredCallbacks.forEach(({ eventName, callback }) => {
        off(eventName, callback)
      })
    }
  }, [on, off])

  return {
    isConnected,
    connectionId,
    sendMessage,
    invoke,
    reconnect,
  }
}

export default useConversationSignalR
