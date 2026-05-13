import { useState, useCallback, useMemo } from "react"
import { MOCK_VIDEOS } from "../data/mockVideos"

/**
 * Hook to manage video grid data and tag filtering.
 *
 * Currently backed by mock data. To connect a real API:
 *   1. Replace MOCK_VIDEOS with useGetVideosQuery() from RTK Query
 *   2. Keep the return shape identical
 *
 * @returns {{
 *   videos: Video[],
 *   filteredVideos: Video[],
 *   activeTag: string|null,
 *   tags: string[],
 *   isLoading: boolean,
 *   setActiveTag: (tag: string|null) => void,
 * }}
 */
const useVideoReels = () => {
  const [activeTag, setActiveTag] = useState(null)

  // Replace with API hook later
  const videos = MOCK_VIDEOS
  const isLoading = false

  const tags = useMemo(() => {
    const tagSet = new Set()
    videos.forEach((v) => v.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [videos])

  const filteredVideos = useMemo(
    () =>
      activeTag
        ? videos.filter((v) => v.tags.includes(activeTag))
        : videos,
    [videos, activeTag],
  )

  const handleSetActiveTag = useCallback(
    (tag) => setActiveTag((prev) => (prev === tag ? null : tag)),
    [],
  )

  return {
    videos,
    filteredVideos,
    activeTag,
    tags,
    isLoading,
    setActiveTag: handleSetActiveTag,
  }
}

export default useVideoReels

