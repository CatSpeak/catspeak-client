import { useState } from "react"
import dayjs from "dayjs"
import { useDispatch } from "react-redux"
import { setActiveConversation } from "@/store/slices/messageWidgetSlice"
import {
  useGetStoriesQuery,
  useGetMyStoriesQuery,
  useCreateStoryMutation,
  useInteractWithStoryMutation,
  useDeleteStoryMutation,
} from "@/store/api/storiesApi"
import { useConversationSignalRContext } from "@/features/messages/context/ConversationSignalRContext"

const useStories = (languageCommunity) => {
  const dispatch = useDispatch()
  const signalR = useConversationSignalRContext()
  const [inputValue, setInputValue] = useState("")

  // API Hooks
  const { data: storiesData, isLoading: loadingStories } =
    useGetStoriesQuery(languageCommunity)
  const { data: myStoriesData, isLoading: loadingMyStories } =
    useGetMyStoriesQuery(languageCommunity)
  const [createStory, { isLoading: isCreating }] = useCreateStoryMutation()
  const [interactWithStory] = useInteractWithStoryMutation()
  const [deleteStory] = useDeleteStoryMutation()

  // Safe Data Extraction
  const stories = storiesData?.data ?? []
  const myStoriesRaw = myStoriesData?.data ?? []

  // Filter out expired stories
  const myStories = myStoriesRaw.filter((story) => {
    return dayjs(story.expiresAt).isAfter(dayjs())
  })

  // Derived State
  const canCreate = myStories.length < 2

  // Handlers
  const handleCreate = async (content) => {
    if (!content.trim()) return

    if (!canCreate) {
      return
    }

    try {
      await createStory({
        storyContent: content,
        languageCommunity,
      }).unwrap()

      setInputValue("")
    } catch (error) {}
  }

  const handleInteract = async (storyId, actionType) => {
    // actionType: 1 = Accept/Interest, 0 = Decline/Ignore, 2 = Decline?
    // Based on user request info: 1 = Accept, 2 = Decline
    try {
      const response = await interactWithStory({
        storyId,
        action: actionType,
      }).unwrap()

      const convId = response?.data?.conversationId || response?.conversationId

      // If accepted provided, open conversation
      if (
        actionType === 1 &&
        (response?.success || response?.isSuccess || convId) &&
        convId
      ) {
        // Join the SignalR group for the new conversation so real-time
        // messages work immediately without requiring a page refresh.
        if (signalR?.invoke) {
          signalR.invoke("JoinConversation", Number(convId)).catch((err) => {
            console.warn("[useStories] Failed to join conversation group, falling back to reconnect:", err)
            if (signalR.reconnect) signalR.reconnect()
          })
        } else if (signalR?.reconnect) {
           signalR.reconnect()
        }

        dispatch(setActiveConversation(convId))
      }
    } catch (error) {
      console.error("Interaction failed:", error)
    }
  }

  const handleDelete = async (storyId) => {
    try {
      await deleteStory(storyId).unwrap()
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  return {
    stories,
    myStories,
    inputValue,
    setInputValue,
    handleCreate,
    handleInteract,
    handleDelete,
    loadingStories,
    loadingMyStories,
    isCreating,
  }
}

export default useStories
