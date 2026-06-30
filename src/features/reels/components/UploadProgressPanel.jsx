import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { X, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Loader2, Video } from "lucide-react"
import { cancelReelUpload } from "../utils/uploadManager"
import { removeUpload } from "@/store/slices/reelUploadSlice"
import { useGetMyRecordingsQuery } from "@/store/api/recordingsApi"
import {
  updateRecordingProgress,
  recordingSuccess,
  recordingFailed,
  removeRecording,
} from "@/store/slices/recordingProcessSlice"

const CONSTANT_REC_SIZE = 25 * 1024 * 1024 // 25 MB virtual size for weighting

const UploadProgressPanel = () => {
  const dispatch = useDispatch()
  const uploads = useSelector((state) => state.reelUpload.uploads)
  const recordings = useSelector((state) => state.recordingProcess.recordings)

  const uploadItems = Object.values(uploads)
  const recordingItems = Object.values(recordings)

  const [isMinimized, setIsMinimized] = useState(false)

  // 1. Auto-increment progress for processing recordings smoothly
  useEffect(() => {
    const processingItems = recordingItems.filter((r) => r.status === "processing")
    if (processingItems.length === 0) return

    const interval = setInterval(() => {
      processingItems.forEach((rec) => {
        let nextProgress = rec.progress
        if (rec.progress < 50) {
          nextProgress += 2
        } else if (rec.progress < 85) {
          nextProgress += 1
        } else if (rec.progress < 95) {
          nextProgress += 0.5
        } else if (rec.progress < 99) {
          nextProgress += 0.1
        }
        dispatch(
          updateRecordingProgress({
            egressId: rec.egressId,
            progress: parseFloat(nextProgress.toFixed(1)),
          })
        )
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [recordingItems, dispatch])

  // 2. Poll DB to verify recording completion when there are active processing tasks
  const activeRecordings = recordingItems.filter((r) => r.status === "processing")
  const { data: dbRecordings = [] } = useGetMyRecordingsQuery(undefined, {
    skip: activeRecordings.length === 0,
    pollingInterval: 5000,
  })

  useEffect(() => {
    if (activeRecordings.length === 0 || dbRecordings.length === 0) return

    activeRecordings.forEach((activeRec) => {
      const dbRec = dbRecordings.find((r) => r.egressId === activeRec.egressId)
      if (dbRec) {
        if (dbRec.status === "completed" || dbRec.status === "Partial Completed") {
          dispatch(recordingSuccess({ egressId: activeRec.egressId }))
        } else if (dbRec.status === "failed") {
          dispatch(
            recordingFailed({
              egressId: activeRec.egressId,
              error: "Xử lý bản ghi hình thất bại trên máy chủ.",
            })
          )
        }
      }
    })
  }, [dbRecordings, activeRecordings, dispatch])

  if (uploadItems.length === 0 && recordingItems.length === 0) return null

  const activeUploads = uploadItems.filter((item) => item.status === "uploading")
  const activeRecs = recordingItems.filter((item) => item.status === "processing")
  const isFinished = activeUploads.length === 0 && activeRecs.length === 0

  const completedUploads = uploadItems.filter((item) => item.status === "success")
  const completedRecs = recordingItems.filter((item) => item.status === "success")

  // Calculate cumulative progress
  const totalUploadedSize =
    uploadItems.reduce((sum, item) => sum + (item.progress * item.size) / 100, 0) +
    recordingItems.reduce((sum, item) => sum + (item.progress * CONSTANT_REC_SIZE) / 100, 0)

  const totalSize =
    uploadItems.reduce((sum, item) => sum + item.size, 0) +
    recordingItems.reduce((sum, item) => sum + CONSTANT_REC_SIZE, 0)

  const overallProgress =
    totalSize > 0 ? Math.round((totalUploadedSize / totalSize) * 100) : 0

  const handleClearFinished = () => {
    uploadItems.forEach((item) => {
      if (item.status === "success" || item.status === "failed") {
        dispatch(removeUpload(item.id))
      }
    })
    recordingItems.forEach((item) => {
      if (item.status === "success" || item.status === "failed") {
        dispatch(removeRecording(item.egressId))
      }
    })
  }

  // Generate header text
  let headerText = ""
  if (!isFinished) {
    headerText = `Đang xử lý hoạt động (${overallProgress}%)`
  } else {
    const totalDone = completedUploads.length + completedRecs.length
    headerText = `Hoàn tất ${totalDone} tác vụ`
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] bg-white border border-gray-200 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-[9999] overflow-hidden flex flex-col transition-all duration-300">
      {/* Widget Header */}
      <div
        className="bg-[#1A1A1A] text-white px-4 py-3.5 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          {!isFinished && (
            <Loader2 size={16} className="animate-spin text-[#990011]" />
          )}
          <span className="font-semibold text-xs tracking-wide uppercase">
            {headerText}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-white transition-colors focus:outline-none">
            {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {isFinished && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClearFinished()
              }}
              className="text-gray-400 hover:text-white transition-colors focus:outline-none"
              title="Clear all"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Global Progress Bar */}
      {!isFinished && (
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-[#990011] h-1 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      )}

      {/* Panel List Details */}
      {!isMinimized && (
        <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-100 bg-[#FAF9F9]">
          {/* Reel Upload Items */}
          {uploadItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            >
              {item.coverUrl && (
                <img
                  src={item.coverUrl}
                  alt="Thumbnail"
                  className="w-12 h-16 rounded-lg object-cover mr-3 bg-gray-100 border border-gray-100 flex-shrink-0"
                />
              )}

              <div className="flex-1 min-w-0 mr-3">
                <p className="text-xs font-semibold text-gray-800 truncate" title={item.title}>
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500 font-medium">
                    {(item.size / (1024 * 1024)).toFixed(1)} MB (Reel)
                  </span>
                  <span className="text-[10px] font-bold text-gray-700">
                    {item.status === "uploading" && `${item.progress}%`}
                    {item.status === "success" && "Đã tải lên"}
                    {item.status === "failed" && "Thất bại"}
                  </span>
                </div>

                {item.status === "uploading" && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2.5">
                    <div
                      className="bg-[#990011] h-1 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === "failed" && (
                  <p className="text-[10px] text-red-500 mt-1 font-semibold truncate">
                    {item.error || "Tải lên thất bại."}
                  </p>
                )}
              </div>

              <div className="flex items-center flex-shrink-0">
                {item.status === "uploading" ? (
                  <button
                    onClick={() => cancelReelUpload(item.id)}
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-colors focus:outline-none"
                    title="Hủy tải lên"
                  >
                    <X size={16} />
                  </button>
                ) : item.status === "success" ? (
                  <span className="text-[#990011] bg-red-50 p-1.5 rounded-full">
                    <CheckCircle2 size={16} />
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-500 bg-red-50 p-1.5 rounded-full">
                      <AlertCircle size={16} />
                    </span>
                    <button
                      onClick={() => dispatch(removeUpload(item.id))}
                      className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors focus:outline-none"
                      title="Xóa"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Recording Processing Items */}
          {recordingItems.map((item) => (
            <div
              key={item.egressId}
              className="p-3.5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-16 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                <Video className="w-6 h-6 text-[#990011]" />
              </div>

              <div className="flex-1 min-w-0 mr-3">
                <p className="text-xs font-semibold text-gray-800 truncate" title={item.meetingId}>
                  {item.meetingId}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500 font-medium">
                    Ghi hình cuộc họp
                  </span>
                  <span className="text-[10px] font-bold text-gray-700">
                    {item.status === "processing" && `${Math.round(item.progress)}%`}
                    {item.status === "success" && "Đã lưu"}
                    {item.status === "failed" && "Lỗi"}
                  </span>
                </div>

                {item.status === "processing" && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2.5">
                    <div
                      className="bg-[#990011] h-1 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === "failed" && (
                  <p className="text-[10px] text-red-500 mt-1 font-semibold truncate">
                    {item.error || "Xử lý bản ghi thất bại."}
                  </p>
                )}
              </div>

              <div className="flex items-center flex-shrink-0">
                {item.status === "processing" ? (
                  <Loader2 size={16} className="animate-spin text-gray-400 m-1.5" />
                ) : item.status === "success" ? (
                  <span className="text-[#990011] bg-red-50 p-1.5 rounded-full">
                    <CheckCircle2 size={16} />
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-500 bg-red-50 p-1.5 rounded-full">
                      <AlertCircle size={16} />
                    </span>
                    <button
                      onClick={() => dispatch(removeRecording(item.egressId))}
                      className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors focus:outline-none"
                      title="Xóa"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UploadProgressPanel
