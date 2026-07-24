import React, { useState, useEffect, useMemo } from "react"
import { Image as ImageIcon, Play } from "lucide-react"
import { useGetUserWallMediaQuery } from "@/store/api/social/profilePostsApi"
import { Skeleton, EmptyState } from "@/shared/components/ui/indicators"
import FluentCard from "@/shared/components/ui/FluentCard"
import MediaViewerModal from "@/shared/components/ui/MediaViewerModal"

const useColumnCount = () => {
  const [cols, setCols] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w >= 1024) setCols(4)
      else if (w >= 768) setCols(3)
      else if (w >= 480) setCols(2)
      else setCols(1)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return cols
}

const ProfileMediaTab = ({ targetAccountId }) => {
  const [fullscreenMedia, setFullscreenMedia] = useState(null)

  const { data, isLoading } = useGetUserWallMediaQuery({
    accountId: targetAccountId,
    page: 1,
    pageSize: 50,
  })

  const medias = data?.data || []
  const columnsCount = useColumnCount()

  // Distribute items sequentially across columns to fill column height evenly
  const columns = useMemo(() => {
    const cols = Array.from({ length: columnsCount }, () => [])
    medias.forEach((item, index) => {
      cols[index % columnsCount].push(item)
    })
    return cols
  }, [medias, columnsCount])

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-square rounded-xl" />
          ))}
        </div>
      ) : medias.length === 0 ? (
        <FluentCard>
          <EmptyState message="Chưa có phương tiện nào" icon={ImageIcon} />
        </FluentCard>
      ) : (
        <div className="flex flex-row w-full gap-3 items-start">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col flex-1 gap-3 min-w-0">
              {col.map((media) => (
                <div
                  key={media.postMediaId}
                  onClick={() => setFullscreenMedia(media)}
                  className="relative group cursor-pointer rounded-xl overflow-hidden bg-gray-100 border border-[#e5e5e5]"
                >
                  {media.mediaType === "Image" ? (
                    <img
                      src={media.mediaUrl}
                      alt={media.fileName}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative w-full aspect-square flex items-center justify-center bg-black">
                      <video
                        src={media.mediaUrl}
                        className="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
                      />
                      <Play className="absolute w-12 h-12 text-white/80 drop-shadow-md z-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <MediaViewerModal
        media={fullscreenMedia}
        onClose={() => setFullscreenMedia(null)}
      />
    </div>
  )
}

export default ProfileMediaTab
