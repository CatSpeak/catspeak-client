/**
 * Data mapping utilities for the Reels feature.
 * Maps backend API data models (ReelDto) to frontend state models (Reel).
 */

/**
 * Maps a single ReelDto from the backend to the frontend Reel model structure.
 * 
 * @param {Object} dto - The ReelDto backend object
 * @returns {Object} The mapped frontend Reel object
 */
export const mapReelDtoToFrontend = (dto) => {
  if (!dto) return null

  // Ensure tags is always an array of strings
  const tags = Array.isArray(dto.hashtags)
    ? dto.hashtags
    : (dto.tags || [])

  // Create a clean, unified author object
  const author = {
    id: dto.accountId ? String(dto.accountId) : "",
    name: dto.nickname || dto.username || "Anonymous",
    avatarUrl: dto.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${dto.username || 'user'}`,
    verified: false // Set verified default to false, or map if available later
  }

  return {
    id: String(dto.reelId),
    title: dto.title || "",
    description: dto.description || "",
    thumbnailUrl: dto.coverUrl || "",
    videoUrl: dto.videoUrl || "",
    duration: 0, // Duration determined dynamically by video tag on load
    views: dto.viewCount || 0,
    likes: dto.likesCount || 0,
    comments: dto.commentsCount || 0,
    shares: 0, // Fallback default
    isLiked: Boolean(dto.isLiked),
    createdAt: dto.createdAt || new Date().toISOString(),
    tags,
    author,
    orientation: "portrait", // Default layout orientation for Reels
  }
}
