import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"

const StopRecordingModal = ({ open, onClose, onConfirm }) => {
  const { t } = useLanguage()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.rooms?.videoCall?.recording?.stopTitle || "Dừng ghi hình"}
    >
      <div className="flex flex-col gap-5 pt-2">
        <p className="text-gray-700">
          {t.rooms?.videoCall?.recording?.stopDescription ? (
            <span
              dangerouslySetInnerHTML={{
                __html: t.rooms.videoCall.recording.stopDescription,
              }}
            />
          ) : (
            <>
              Bản ghi sẽ được lưu tại{" "}
              <strong>Nhà của bạn (My Workspace)</strong>
            </>
          )}
        </p>
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200"
          >
            {t.rooms?.videoCall?.recording?.continueBtn || "Tiếp tục ghi"}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-[#d40018] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e7001a]"
          >
            {t.rooms?.videoCall?.recording?.confirmBtn || "Xác nhận"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default StopRecordingModal
