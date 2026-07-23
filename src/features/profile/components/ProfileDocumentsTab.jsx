import React from "react"
import { FileText, Download, FileArchive } from "lucide-react"
import { useGetUserWallDocumentsQuery } from "../../../store/api/social/profilePostsApi"
import { Skeleton, EmptyState } from "@/shared/components/ui/indicators"
import FluentCard from "@/shared/components/ui/FluentCard"

const ProfileDocumentsTab = ({ targetAccountId }) => {
  const { data, isLoading } = useGetUserWallDocumentsQuery({
    accountId: targetAccountId,
    page: 1,
    pageSize: 50,
  })

  const documents = data?.data || []

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Helper to get file extension from name/url
  const getFileExtension = (filename) => {
    if (!filename) return ""
    return filename.split(".").pop().toLowerCase()
  }

  return (
    <div className="w-full flex flex-col gap-3 min-h-[500px]">
      {/* Top Header Card */}
      <FluentCard className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Tài liệu chia sẻ</h2>
        </div>
      </FluentCard>

      {/* Content Section */}
      <div className="w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <FluentCard
                key={i}
                className="flex-row items-center gap-4 p-4 sm:p-4 min-h-[80px]"
              >
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </FluentCard>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <FluentCard>
            <EmptyState
              message="Chưa có tài liệu nào được chia sẻ."
              icon={FileText}
            />
          </FluentCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((doc) => {
              const fileId = doc.postMediaId || doc.mediaId
              const ext = getFileExtension(doc.fileName)
              const isArchive = ["zip", "rar", "tar", "gz", "7z"].includes(ext)

              return (
                <FluentCard
                  key={fileId}
                  className="flex-row items-center justify-between p-4 sm:p-4 min-h-[80px] hover:border-[#990011]/20 hover:shadow-sm transition-all group cursor-pointer bg-white"
                >
                  <div className="flex items-center gap-4 overflow-hidden flex-1">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-[#990011] flex items-center justify-center shrink-0">
                      {isArchive ? (
                        <FileArchive className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-gray-900 text-[15px] truncate">
                        {doc.fileName || "Tài liệu không tên"}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(doc.fileSize)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={doc.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-[#990011] rounded-full hover:bg-red-50 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </FluentCard>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileDocumentsTab
