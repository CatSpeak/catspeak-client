import { useState } from "react"
import dayjs from "dayjs"
import { useDispatch, useSelector } from "react-redux"
import { setActiveConversation } from "@/store/slices/messageWidgetSlice"
import { selectIsAuthenticated } from "@/store/slices/authSlice"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import {
  useGetStoriesQuery,
  useGetMyStoriesQuery,
  useCreateStoryMutation,
  useInteractWithStoryMutation,
  useDeleteStoryMutation,
  useReportStoryMutation,
} from "../api/storiesApi"
import { useConversationSignalRContext } from "@/features/chat/context/useConversationSignalRContext.js"

const useStories = (languageCommunity) => {
  const dispatch = useDispatch()
  const signalR = useConversationSignalRContext()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { openAuthModal } = useAuthModal()
  const [inputValue, setInputValue] = useState("")

  // API Hooks
  const { data: storiesData, isLoading: loadingStories } =
    useGetStoriesQuery(languageCommunity)
  const { data: myStoriesData, isLoading: loadingMyStories } =
    useGetMyStoriesQuery(languageCommunity, { skip: !isAuthenticated })
  const [createStory, { isLoading: isCreating }] = useCreateStoryMutation()
  const [interactWithStory] = useInteractWithStoryMutation()
  const [deleteStory] = useDeleteStoryMutation()
  const [reportStory] = useReportStoryMutation()

  // Data Extraction (unwrapped by baseApi, guaranteed Array to prevent .map()/.filter() errors)
  const storiesRaw = Array.isArray(storiesData) ? storiesData : []
  const stories = storiesRaw.filter((story) => !story.isReported)
  const myStoriesRaw = Array.isArray(myStoriesData) ? myStoriesData : []

  // Filter out expired stories
  const myStories = myStoriesRaw.filter((story) => {
    return dayjs(story.expiresAt).isAfter(dayjs())
  })

  // Derived State
  const canCreate = myStories.length < 2

  // Handlers
  const handleCreate = async (content) => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
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
    } catch {
      // Ignore creation error
    }
  }

  const handleInteract = async (storyId, actionType) => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
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
            console.warn(
              "[useStories] Failed to join conversation group, falling back to reconnect:",
              err,
            )
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
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    try {
      await deleteStory(storyId).unwrap()
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  const handleReport = async (storyId) => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    try {
      await reportStory(storyId).unwrap()
    } catch (error) {
      console.error("Report failed:", error)
      throw error // Throw to let UI handle toast
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
    handleReport,
    loadingStories,
    loadingMyStories,
    isCreating,
  }
}

export default useStories
