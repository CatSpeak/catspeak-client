import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"

const ShareModal = ({ open, onClose, shareUrl }) => {
  const { t } = useLanguage()
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    if (isCopied) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(
        t.news?.newsDetail?.linkCopied || "Link copied to clipboard!",
      )
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1000)
    } catch (e) {
      console.error("Copy failed", e)
      toast.error("Failed to copy link")
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.news?.newsDetail?.share || "Share"}
      showCloseButton={true}
      className="rounded-xl max-w-md"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={
        <div className="flex justify-end gap-2">
          <PillButton
            type="button"
            variant={isCopied ? "secondary" : "primary"}
            onClick={handleCopy}
            disabled={isCopied}
            className="w-full sm:w-auto"
          >
            {isCopied
              ? t.news?.newsDetail?.copied || "Copied!"
              : t.news?.newsDetail?.copy || "Copy"}
          </PillButton>
        </div>
      }
    >
      <TextInput id="share-url" value={shareUrl} readOnly />
    </Modal>
  )
}

export default ShareModal
