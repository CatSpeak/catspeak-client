import React from "react"
import { AlertCircle, Film, X, Video, Minus } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext"
import { CreateReelProvider, useCreateReelContext } from "../../contexts/CreateReelContext"
import { VideoUploadStep } from "./CreateReel/VideoUploadStep"
import { DetailsInputStep } from "./CreateReel/DetailsInputStep"
import { VideoPreviewStep } from "./CreateReel/VideoPreviewStep"

const CreateReelModalContent = ({ open }) => {
  const { t } = useLanguage()
  const {
    videoPreviewUrl, videoFile, handleDiscardVideo,
    mobileTab, setMobileTab, handleSubmit, isLoading,
    uploadProgress, handleMinimize, handleCancelUpload,
    generalError, apiError
  } = useCreateReelContext()

  return (
    <Modal
      open={open}
      onClose={handleMinimize}
      title={
        <div className="flex items-center gap-2">
          <Film size={20} className="text-cath-red-700" />
          <span>{t.catSpeak?.reels?.uploadReel || "Upload Reel"}</span>
        </div>
      }
      className="max-w-4xl w-full"
      bodyClassName="p-4 sm:p-6 overflow-y-auto h-[calc(100vh-76px)] md:h-auto md:max-h-[80vh] scrollbar-thin flex flex-col"
    >
      {/* Dynamic Keyframes Injector */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes mockMarquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.33%, 0, 0); }
        }
        .animate-shake {
          animation: mockShake 0.4s ease-in-out;
        }
        @keyframes mockShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-fadeIn {
          animation: mockFadeIn 0.3s ease-out forwards;
        }
        @keyframes mockFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cover-slider-range::-webkit-slider-runnable-track {
          background: #e5e7eb;
          height: 6px;
          border-radius: 9999px;
        }
        .cover-slider-range::-webkit-slider-thumb {
          background: #990011;
          border: 2px solid #ffffff;
          border-radius: 9999px;
          width: 16px;
          height: 16px;
          margin-top: -5px;
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .cover-slider-range::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
      `}} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

        {/* API Error Notification */}
        {(generalError || apiError) && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5 text-sm animate-shake">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t?.catSpeak?.reels?.uploadFailedTitle || "Upload failed"}</p>
              <p className="opacity-90">{generalError || t?.catSpeak?.reels?.uploadFailedDesc || "Something went wrong. Please check your file formats and network."}</p>
            </div>
          </div>
        )}

        {!videoPreviewUrl ? (
          <VideoUploadStep />
        ) : (
          /* STEP 1: VIDEO UPLOADED - SIMULTANEOUS DETAILS & LIVE PREVIEW */
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Top Video Uploaded Success Card */}
            <div className="flex items-center justify-between p-3.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                  <Video size={18} />
                </div>
                <div className="text-left min-w-0">
                  <h4 className="text-sm font-bold text-gray-800 truncate pr-2">
                    {videoFile.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 font-semibold">
                    <span className="text-emerald-600 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="font-semibold text-emerald-600 truncate max-w-[150px] sm:max-w-[200px]">
                        {t?.catSpeak?.reels?.createModal?.uploaded || "Uploaded"}
                      </span>
                    </span> <span>•</span>
                    <span>
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDiscardVideo}
                  className="p-2 border border-gray-200 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 hover:border-red-100 rounded-full shadow-sm transition-all active:scale-95 shrink-0"
                  title="Discard video"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Mobile View Toggle Segment Tabs (Only visible on mobile/tablet viewports) */}
            <div className="flex md:hidden bg-gray-100 p-1 rounded-2xl mb-1 border border-gray-200/40">
              <button
                type="button"
                onClick={() => setMobileTab("details")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${mobileTab === "details"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {t?.catSpeak?.reels?.createModal?.editDetails || "Edit Details"}
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("preview")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${mobileTab === "preview"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {t?.catSpeak?.reels?.createModal?.livePreview || "Live Preview"}
              </button>
            </div>

            {/* Side-by-side editing layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 items-start">
              <DetailsInputStep />
              <VideoPreviewStep />
            </div>
          </div>
        )}

        {/* BOTTOM FORM BUTTONS */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2 w-full">
          <PillButton
            type="button"
            variant="secondary"
            onClick={handleCancelUpload}
            className="w-full sm:w-auto min-w-[120px] h-10 font-semibold"
          >
            {t.cancel || "Cancel"}
          </PillButton>
          <PillButton
            type="submit"
            loading={isLoading}
            loadingText={isLoading ? `${t.catSpeak?.reels?.posting || "Posting..."} ${uploadProgress}%` : t.catSpeak?.reels?.posting || "Posting..."}
            disabled={!videoFile || isLoading}
            className="w-full sm:w-auto min-w-[120px] h-10 font-semibold"
            bgColor="#990011"
            textColor="#ffffff"
          >
            {t.catSpeak?.reels?.post || "Post"}
          </PillButton>
        </div>
      </form>
    </Modal>
  )
}

const CreateReelModal = ({ open, onClose, challenge = null }) => {
  if (!open) return null
  
  return (
    <CreateReelProvider open={open} onClose={onClose} challenge={challenge}>
      <CreateReelModalContent open={open} onClose={onClose} />
    </CreateReelProvider>
  )
}

export default CreateReelModal
