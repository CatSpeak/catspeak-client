import { useState, useEffect, useCallback } from "react"
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
          // Display genuine account error from the bank if present
          setVerifyError(result?.message || "")
        }
      } catch (err) {
        setVerifiedName("")
        setCanBypass(true)
        setVerifyError("")
      } finally {
        setIsChecking(false)
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [accountNumber, selectedBank, verifyBankAccount, enabled, resetVerification])

  return {
    verifiedName,
    verifyError,
    canBypass,
    isChecking,
    isVerifying,
    resetVerification,
  }
}

