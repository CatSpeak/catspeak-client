import React, { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useReportReelMutation } from "@/store/api/reelsApi"
import toast from "react-hot-toast"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"

export default function ReelReportModal({ reel, onClose }) {
  const { t } = useLanguage()
  const lang = t?.catSpeak?.reels?.detail?.reportModal || {}
  
  const [reportReel, { isLoading }] = useReportReelMutation()
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")

  const reasonKeys = [
    "spam",
    "nudity",
    "hateSpeech",
    "violence",
    "illegalGoods",
    "bullying",
    "ipViolation",
    "eatingDisorders",
    "scam",
    "falseInfo",
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) {
      toast.error(lang.selectReasonError || "Please select a reason.")
      return
    }

    try {
      await reportReel({ reelId: reel.id, reason: lang.reasons?.[reason] || reason, description }).unwrap()
      toast.success(lang.success || "Thank you. We've received your report.")
      onClose()
    } catch (err) {
      toast.error(lang.error || "Failed to submit report. Please try again.")
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={lang.title || "Report"}
      fullScreenOnMobile={true}
      className="md:max-w-md w-full max-h-[100dvh]"
      bodyClassName="px-6 py-4 overflow-y-auto"
      footer={
        <div className="flex justify-end gap-3 px-2 pb-2">
          <PillButton
            onClick={onClose}
            variant="secondary"
            className="!h-10 px-5"
          >
            {lang.cancel || "Cancel"}
          </PillButton>
          <PillButton
            onClick={handleSubmit}
            disabled={!reason || isLoading}
            loading={isLoading}
            loadingText={lang.submitting || "Submitting..."}
            className="!h-10 px-5"
          >
            {lang.submit || "Submit Report"}
          </PillButton>
        </div>
      }
    >
      <h3 className="font-medium mb-4 text-[15px]">{lang.question || "Why are you reporting this reel?"}</h3>
      <div className="space-y-1">
        {reasonKeys.map((key) => {
          const reasonText = lang.reasons?.[key] || key
          return (
                <label key={key} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <input
                type="radio"
                name="reason"
                value={key}
                checked={reason === key}
                onChange={(e) => setReason(e.target.value)}
                className="w-4 h-4 text-cath-red-700 focus:ring-cath-red-700 accent-cath-red-700 cursor-pointer"
              />
              <span className="text-[14px] text-gray-800">{reasonText}</span>
            </label>
          )
        })}
      </div>

      {reason && (
        <div className="mt-5 mb-2">
          <label className="block text-[14px] font-semibold mb-2">{lang.details || "Additional Details (Optional)"}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-[14px] focus:outline-none focus:border-cath-red-500 transition-colors"
            rows={3}
            placeholder={lang.placeholder || "Provide more context to help us understand..."}
          />
        </div>
      )}
    </Modal>
  )
}
