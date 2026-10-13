import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useVerifyBankAccountMutation } from "../api/instructorBankAccountsApi"
import { sanitizeAccountNumber } from "../utils/bankAccountUtils"

/**
 * Custom hook to handle silent debounced verification of bank account numbers.
 *
 * @param {Object|null} selectedBank - Selected bank object containing `bin`
 * @param {string} accountNumber - Raw entered account number
 * @param {boolean} [enabled=true] - Whether verification logic is active
 */
export default function useBankVerification(
  selectedBank,
  accountNumber,
  enabled = true,
) {
  const { t } = useLanguage()
  const [verifiedName, setVerifiedName] = useState("")
  const [verifyError, setVerifyError] = useState("")
  const [canBypass, setCanBypass] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const [verifyBankAccount, { isLoading: isVerifying }] =
    useVerifyBankAccountMutation()

  const resetVerification = useCallback(() => {
    setVerifiedName("")
    setVerifyError("")
    setCanBypass(false)
    setIsChecking(false)
  }, [])

  useEffect(() => {
    if (!enabled) {
      resetVerification()
      return
    }

    const cleaned = sanitizeAccountNumber(accountNumber)
    setVerifiedName("")
    setVerifyError("")
    setCanBypass(false)

    if (!selectedBank || cleaned.length < 6) {
      setIsChecking(false)
      return
    }

    setIsChecking(true)

    const timer = setTimeout(async () => {
      try {
        const result = await verifyBankAccount({
          bankBin: selectedBank.bin,
          accountNumber: cleaned,
        }).unwrap()

        const holderName =
          result?.accountHolderName || result?.data?.accountHolderName || ""
        if (result?.success && holderName) {
          setVerifiedName(holderName)
          setCanBypass(false)
          setVerifyError("")
        } else {
          setVerifiedName("")
          setCanBypass(Boolean(result?.canBypass))
          setVerifyError(
            result?.message ||
              t?.bankAccounts?.modal?.autoVerifyError ||
              "Không thể tự động tra cứu tên chủ tài khoản lúc này. Bạn vẫn có thể tiếp tục thêm tài khoản.",
          )
        }
      } catch (err) {
        setVerifiedName("")
        setCanBypass(Boolean(err?.data?.canBypass))
        setVerifyError(
          err?.data?.message ||
            t?.bankAccounts?.modal?.autoVerifyError ||
            "Không thể xác thực số tài khoản. Vui lòng kiểm tra lại.",
        )
      } finally {
        setIsChecking(false)
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [accountNumber, selectedBank, verifyBankAccount, enabled, resetVerification, t])

  return {
    verifiedName,
    verifyError,
    canBypass,
    isChecking,
    isVerifying,
    resetVerification,
  }
}

