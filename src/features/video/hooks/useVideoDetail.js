import { useMemo } from "react"
import { MOCK_VIDEOS } from "../data/mockVideos"

/**
 * Hook to look up a single video by its ID.
 *
 * Currently backed by mock data. To connect a real API:
 *   1. Replace the lookup with useGetVideoByIdQuery(id)
 *   2. Keep the return shape identical
 *
 * @param {string} id - The video ID from the URL params
 * @returns {{ video: Video|null, isLoading: boolean, notFound: boolean }}
 */
const useVideoDetail = (id) => {
  const video = useMemo(
    () => MOCK_VIDEOS.find((v) => v.id === id) ?? null,
    [id],
  )

  return {
    video,
    isLoading: false,
    notFound: !video,
  }
}

export default useVideoDetail
