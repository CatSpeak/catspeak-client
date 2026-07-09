import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import {
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Video,
  Loader2,
} from "lucide-react"

import { cancelReelUpload } from "../utils/uploadManager"
import { removeUpload } from "@/store/slices/reelUploadSlice"
import { useGetMyRecordingsQuery } from "@/store/api/recordingsApi"
import {
  updateRecordingProgress,
  recordingSuccess,
  recordingFailed,
  removeRecording,
} from "@/store/slices/recordingProcessSlice"

import ListItem from "@/shared/components/ui/ListItem"
import ProgressBar from "@/shared/components/ui/ProgressBar"

const UploadProgressPanel = ({ embedInStack = false }) => {
  const dispatch = useDispatch()
  const uploads = useSelector((state) => state.reelUpload.uploads)
  const recordings = useSelector((state) => state.recordingProcess.recordings)

  const uploadItems = Object.values(uploads).reverse()
  const recordingItems = Object.values(recordings).reverse()

  const [isMinimized, setIsMinimized] = useState(false)

  // 1. Auto-increment progress for processing recordings smoothly
  useEffect(() => {
    const processingItems = recordingItems.filter(
      (r) => r.status === "processing",
    )
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
          }),
        )
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [recordingItems, dispatch])

  // 2. Poll DB to verify recording completion when there are active processing tasks
  const activeRecordings = recordingItems.filter(
    (r) => r.status === "processing",
  )
  const { data: dbRecordings = [] } = useGetMyRecordingsQuery(undefined, {
    skip: activeRecordings.length === 0,
    pollingInterval: 5000,
  })

  // Check completions
  useEffect(() => {
    if (activeRecordings.length === 0 || dbRecordings.length === 0) return

    activeRecordings.forEach((rec) => {
      const match = dbRecordings.find(
        (dbRec) =>
          dbRec.egressId === rec.egressId ||
          (rec.sessionId && dbRec.sessionId === rec.sessionId),
      )
      if (match) {
        if (rec.progress < 100) {
          dispatch(
            updateRecordingProgress({ egressId: rec.egressId, progress: 100 }),
          )
          setTimeout(() => {
            dispatch(recordingSuccess({ egressId: rec.egressId }))
          }, 500)
        }
      }
    })
  }, [dbRecordings, activeRecordings, dispatch])

  const completedUploads = uploadItems.filter((i) => i.status === "success")
  const completedRecs = recordingItems.filter((i) => i.status === "success")
  const isFinished =
    uploadItems.every((i) => i.status === "success" || i.status === "failed") &&
    recordingItems.every((i) => i.status === "success" || i.status === "failed")

  const hasActiveItems = uploadItems.length > 0 || recordingItems.length > 0
  if (!hasActiveItems) return null

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
    const activeCount =
      uploadItems.filter((i) => i.status === "uploading").length +
      recordingItems.filter((i) => i.status === "processing").length
    headerText = `Đang xử lý ${activeCount} tác vụ`
  } else {
    const totalDone = completedUploads.length + completedRecs.length
    headerText = `Hoàn tất ${totalDone} tác vụ`
  }

  return (
    <div
      className={`${embedInStack ? "w-[380px] max-w-full pointer-events-auto shadow-xl" : "fixed bottom-6 right-6 z-[9999] w-[380px] pointer-events-auto"} bg-white border border-[#e5e5e5] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col transition-all duration-300`}
    >
      {/* Widget Header */}
      <div
        className="bg-white border-b border-[#e5e5e5] px-4 h-14 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold">{headerText}</span>
        </div>
        <div className="flex items-center">
          <button className="group flex h-12 w-12 shrink-0 items-center justify-center focus:outline-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-full transition-colors text-[#606060] group-hover:text-black group-hover:bg-[#F2F2F2]">
              {isMinimized ? <ChevronUp /> : <ChevronDown />}
            </div>
          </button>
          {isFinished && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClearFinished()
              }}
              className="group flex h-12 w-12 shrink-0 items-center justify-center focus:outline-none"
              title="Clear all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full transition-colors text-[#606060] group-hover:text-black group-hover:bg-[#F2F2F2]">
                <X />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Panel List Details */}
      {!isMinimized && (
        <div className="py-2 max-h-[280px] overflow-y-auto bg-white">
          {/* Reel Upload Items */}
          {uploadItems.map((item) => (
            <ListItem
              key={item.id}
              hoverEffect={true}
              lines={
                item.status === "uploading"
                  ? 3
                  : item.status === "failed"
                    ? 2
                    : 1
              }
              leftContent={
                item.coverUrl ? (
                  <img
                    src={item.coverUrl}
                    alt="Thumbnail"
                    className="w-12 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <Video />
                )
              }
              rightContent={
                item.status === "uploading" ? (
                  <button
                    onClick={() => cancelReelUpload(item.id)}
                    title="Hủy tải lên"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors opacity-70 group-hover:opacity-100 hover:bg-gray-200"
                  >
                    <X size={16} />
                  </button>
                ) : item.status === "success" ? null : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-red-500" />
                    <button
                      onClick={() => dispatch(removeUpload(item.id))}
                      title="Xóa"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors opacity-70 group-hover:opacity-100 hover:bg-gray-200"
                    >
                      <X />
                    </button>
                  </div>
                )
              }
            >
              <p
                className="text-xs font-semibold text-gray-800 truncate"
                title={item.title}
              >
                {item.title}
              </p>

              {item.status !== "success" && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                    {(item.size / (1024 * 1024)).toFixed(1)} MB (Reel)
                  </span>
                  <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">
                    {item.status === "uploading" && `${item.progress}%`}
                    {item.status === "failed" && "Thất bại"}
                  </span>
                </div>
              )}

              {item.status === "uploading" && (
                <ProgressBar progress={item.progress} className="mt-2.5" />
              )}

              {item.status === "failed" && (
                <p className="text-[10px] text-red-500 mt-1 font-semibold truncate">
                  {item.error || "Tải lên thất bại."}
                </p>
              )}
            </ListItem>
          ))}

          {/* Recording Processing Items */}
          {recordingItems.map((item) => (
            <ListItem
              key={item.egressId}
              hoverEffect={true}
              lines={item.status === "failed" ? 2 : 1}
              leftContent={<Video />}
              rightContent={
                item.status === "processing" ? (
                  <Loader2 className="animate-spin text-gray-400" />
                ) : item.status === "success" ? (
                  <CheckCircle2 className="fill-emerald-500 text-white" />
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-red-500" />
                    <button
                      onClick={() => dispatch(removeRecording(item.egressId))}
                      title="Xóa"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors opacity-70 group-hover:opacity-100 hover:bg-gray-200"
                    >
                      <X />
                    </button>
                  </div>
                )
              }
            >
              <p className="truncate" title={item.meetingId}>
                {item.meetingId}
              </p>

              {item.status === "failed" && (
                <p className="text-[10px] text-red-500 mt-1 font-semibold truncate">
                  {item.error || "Xử lý bản ghi thất bại."}
                </p>
              )}
            </ListItem>
          ))}
        </div>
      )}
    </div>
  )
}

export default UploadProgressPanel
