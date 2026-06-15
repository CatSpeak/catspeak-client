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
      toast.success(t.news?.newsDetail?.linkCopied || "Link copied to clipboard!")
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
      className="max-w-md rounded-xl p-6 shadow-2xl"
    >
      <div className="flex flex-col gap-4 mt-4">
        <TextInput
          id="share-url"
          value={shareUrl}
          readOnly
        />
        <PillButton
          type="button"
          variant={isCopied ? "secondary" : "primary"}
          onClick={handleCopy}
          disabled={isCopied}
          className="w-full"
        >
          {isCopied ? (t.news?.newsDetail?.copied || "Copied!") : (t.news?.newsDetail?.copy || "Copy")}
        </PillButton>
      </div>
    </Modal>
  )
}

export default ShareModal
