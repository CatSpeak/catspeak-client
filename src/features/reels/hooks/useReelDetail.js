import { useMemo } from "react"
import { useGetReelByIdQuery } from "@/store/api/reelsApi"
import { mapReelDtoToFrontend } from "../utils/mappers"

/**
 * Hook to look up a single reel by its ID.
 *
 * Connected to live API.
 *
 * @param {string} id - The reel ID from the URL params
 * @returns {{ reel: Reel|null, isLoading: boolean, notFound: boolean }}
 */
const useReelDetail = (id) => {
  // Run API query directly
  const { 
    data: apiResponse, 
    isLoading: isApiLoading,
    isFetching: isApiFetching,
    error: apiError 
  } = useGetReelByIdQuery(id, {
    skip: !id,
  })

  const reel = useMemo(() => {
    if (!apiResponse) return null
    // The API response might wrap the DTO in { data: ReelDto } or return the ReelDto directly
    const rawReel = apiResponse.data !== undefined ? apiResponse.data : apiResponse
    // Verify rawReel looks like a Reel DTO before passing to mapper
    if (rawReel && (rawReel.reelId !== undefined || rawReel.videoUrl !== undefined)) {
      return mapReelDtoToFrontend(rawReel)
    }
    return null
  }, [apiResponse])

  // Treat as loading if query is loading or fetching and we don't have a resolved reel or error yet
  const isLoading = isApiLoading || (isApiFetching && !reel && !apiError)

  const notFound = !isLoading && !reel

  return {
    reel,
    isLoading,
    notFound,
  }
}

export default useReelDetail
