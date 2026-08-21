import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useVerifyBankAccountMutation } from "../api/instructorBankAccountsApi"

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
  const [isChecking, setIsChecking] = useState(false)

  const [verifyBankAccount, { isLoading: isVerifying }] =
    useVerifyBankAccountMutation()

  const resetVerification = useCallback(() => {
    setVerifiedName("")
    setVerifyError("")
    setIsChecking(false)
  }, [])

  useEffect(() => {
    if (!enabled) {
      resetVerification()
      return
    }

    const trimmed = accountNumber ? accountNumber.trim() : ""
    setVerifiedName("")
    setVerifyError("")

    if (!selectedBank || trimmed.length < 6) {
      setIsChecking(false)
      return
    }

    setIsChecking(true)

    const timer = setTimeout(async () => {
      try {
        const result = await verifyBankAccount({
          bankBin: selectedBank.bin,
          accountNumber: trimmed,
        }).unwrap()

        const holderName =
          result?.accountHolderName || result?.data?.accountHolderName || ""
        setVerifiedName(holderName)
        setVerifyError("")
      } catch (err) {
        setVerifiedName("")
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
    isChecking,
    isVerifying,
    resetVerification,
  }
}
