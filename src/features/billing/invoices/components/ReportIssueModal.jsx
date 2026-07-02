import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useReportPaymentIssueMutation } from "@/store/api/paymentsApi"
import { CheckCircle2, UploadCloud } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const ReportIssueModal = ({ isOpen, onClose, paymentId }) => {
  const { t } = useLanguage()
  const [reportIssue, { isLoading }] = useReportPaymentIssueMutation()
  const [step, setStep] = useState("form") // form | success
  
  const [explanation, setExplanation] = useState("")
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!explanation.trim()) {
      setError(t.billing.reportIssueModal.errorNoExplanation)
      return
    }

    try {
      setError(null)
      const formData = new FormData()
      formData.append("PaymentId", paymentId)
      formData.append("UserExplanation", explanation)
      if (file) {
        formData.append("file", file)
      }

      await reportIssue(formData).unwrap()
      setStep("success")
    } catch (err) {
      setError(t.billing.reportIssueModal.errorSubmitFailed)
      console.error(err)
    }
  }

  const handleClose = () => {
    if (isLoading) return
    onClose()
    setTimeout(() => {
      setStep("form")
      setExplanation("")
      setFile(null)
      setError(null)
    }, 300)
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={step === "form" ? t.billing.reportIssueModal.title : ""}
      showCloseButton={!isLoading}
      className="max-w-md"
    >
      {step === "form" && (
        <form onSubmit={handleSubmit} className="pb-4 space-y-4">
          <p className="text-sm text-[#7A7574] mb-4">
            {t.billing.reportIssueModal.subtitle.replace("{{paymentId}}", paymentId)}
          </p>

          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="explanation">
              {t.billing.reportIssueModal.explanationLabel} <span className="text-cath-red-700">*</span>
            </label>
            <textarea
              id="explanation"
              className="w-full border border-[#E5E5E5] rounded-xl p-3 outline-none focus:border-[#333] transition-colors resize-none h-32"
              placeholder={t.billing.reportIssueModal.explanationPlaceholder}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              {t.billing.reportIssueModal.proofImageLabel}
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#E5E5E5] border-dashed rounded-xl cursor-pointer hover:bg-[#fafafa] transition-colors relative">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 text-[#7A7574] mb-2" />
                <p className="text-sm text-[#7A7574]">
                  {file ? file.name : t.billing.reportIssueModal.uploadFileText}
                </p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={isLoading}
              />
            </label>
          </div>

          {error && <p className="text-sm text-cath-red-700">{error}</p>}

          <div className="pt-4 flex gap-4">
            <PillButton
              variant="secondary"
              className="flex-1"
              type="button"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t.billing.reportIssueModal.cancel}
            </PillButton>
            <PillButton type="submit" className="flex-1" loading={isLoading}>
              {t.billing.reportIssueModal.submit}
            </PillButton>
          </div>
        </form>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-[#E5F7ED] text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-2">{t.billing.reportIssueModal.successTitle}</h3>
          <p className="text-[#7A7574] mb-8">
            {t.billing.reportIssueModal.successSubtitle}
          </p>
          <PillButton onClick={handleClose} className="w-full">
            {t.billing.reportIssueModal.done}
          </PillButton>
        </div>
      )}
    </Modal>
  )
}

export default ReportIssueModal
