import React, { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, AlertCircle, Trash2, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import FluentCard from "@/shared/components/ui/FluentCard"
import { Badge } from "@/shared/components/ui/indicators"
import Radio from "@/shared/components/ui/inputs/Radio"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import {
  useSetDefaultInstructorBankAccountMutation,
  useDeleteInstructorBankAccountMutation,
} from "../api/instructorBankAccountsApi"

export default function BankAccountCard({ account }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const [setDefaultAccount, { isLoading: isSettingDefault }] =
    useSetDefaultInstructorBankAccountMutation()
  const [deleteAccount] = useDeleteInstructorBankAccountMutation()

  const {
    id,
    bankShortName,
    bankFullName,
    accountNumber,
    accountHolderName,
    isVerified,
    isDefault,
  } = account || {}

  const handleSetDefault = async (e) => {
    if (e) e.stopPropagation()
    if (isDefault || isSettingDefault) return
    try {
      await setDefaultAccount(id).unwrap()
    } catch (err) {
      // Silent update
    }
  }

  const handleDelete = async (e) => {
    if (e) e.stopPropagation()
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?")) {
      return
    }
    setIsDeleting(true)
    try {
      await deleteAccount(id).unwrap()
      toast.success("Đã xóa tài khoản ngân hàng")
    } catch (err) {
      toast.error(err?.data?.message || "Không thể xóa tài khoản ngân hàng")
      setIsDeleting(false)
    }
  }

  // Format account number into clean grouped 4-digit chunks
  const formatAccountNumber = (num) => {
    if (!num) return ""
    return num.replace(/(.{4})/g, "$1 ").trim()
  }

  return (
    <FluentCard
      className={`group relative justify-between transition-all duration-300 ease-in-out border-transparent overflow-hidden ${
        isDefault
          ? "shadow-xl cursor-default border-t border-white/40 ring-2 ring-white/30"
          : "hover:shadow-lg cursor-pointer hover:border-white/30"
      }`}
      onClick={isDefault ? undefined : handleSetDefault}
    >
      {/* ── Base: Full Red-to-Amber Gradient for ALL Cards (No Tint Overlay) ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#990011] via-[#c00015] to-amber-500 z-0" />

      {/* ── Animated Background Details: Moving Light Dots & Animated Waves ── */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {/* Circle 1: Small Soft White Light Dot */}
        <motion.div
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute top-2 left-6 w-14 h-14 rounded-full bg-white/25 blur-xl"
        />

        {/* Circle 2: Small Soft Amber Light Dot */}
        <motion.div
          animate={{
            x: [0, -20, 15, 0],
            y: [0, 15, -10, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute bottom-3 right-8 w-16 h-16 rounded-full bg-amber-200/30 blur-xl"
        />

        {/* 🌊 Animated Banknote Guilloche Waves Watermark SVG */}
        <motion.svg
          animate={{
            x: [0, 25, -15, 0],
            opacity: [0.1, 0.18, 0.12, 0.1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute inset-0 w-full h-full text-white pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
        >
          <motion.path
            animate={{
              d: [
                "M-50 100 Q 100 0 250 100 T 550 100",
                "M-50 85 Q 100 25 250 85 T 550 85",
                "M-50 115 Q 100 -15 250 115 T 550 115",
                "M-50 100 Q 100 0 250 100 T 550 100",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <motion.path
            animate={{
              d: [
                "M-50 120 Q 100 20 250 120 T 550 120",
                "M-50 135 Q 100 5 250 135 T 550 135",
                "M-50 105 Q 100 35 250 105 T 550 105",
                "M-50 120 Q 100 20 250 120 T 550 120",
              ],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </motion.svg>
      </div>

      {/* Glass Glossy Sheen Overlay */}
      <div className="absolute inset-0 z-0 bg-white/5 backdrop-blur-[1px] pointer-events-none" />

      {/* ── Content: Crisp White Text for ALL Cards ── */}
      <div className="relative z-10 flex flex-col gap-4 text-white">
        {/* Header: Radio Selection, Bank Name & Badges */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Radio UX indicator */}
            {isDefault ? (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white shrink-0 shadow-md">
                <div className="h-2.5 w-2.5 rounded-full bg-[#990011]" />
              </div>
            ) : (
              <Radio
                checked={false}
                disabled={isSettingDefault}
                onChange={handleSetDefault}
              />
            )}

            <div className="flex flex-col min-w-0 flex-1">
              <p
                className="font-semibold text-base truncate text-white"
                title={bankShortName || bankFullName}
              >
                {bankShortName || bankFullName || "Ngân hàng"}
              </p>
              <p
                className="text-sm truncate text-white/80"
                title={bankFullName}
              >
                {bankFullName || bankShortName}
              </p>
            </div>
          </div>

          {/* Badges container */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {isVerified ? (
              <Badge color="white">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Đã xác thực
              </Badge>
            ) : (
              <Badge color="white">
                <AlertCircle className="h-3.5 w-3.5 text-yellow-600" />
                Chưa xác thực
              </Badge>
            )}
          </div>
        </div>

        {/* Card Details: Account Number & Holder Name */}
        <div className="flex flex-col gap-2 pl-8">
          <div>
            <span className="text-xs font-medium uppercase block text-white/70">
              Số tài khoản
            </span>
            <p className="font-mono font-bold tracking-wider select-all truncate text-white">
              {formatAccountNumber(accountNumber)}
            </p>
          </div>

          {accountHolderName && (
            <div>
              <span className="text-xs font-medium uppercase text-white/70">
                Chủ tài khoản
              </span>
              <p className="font-semibold truncate text-white">
                {accountHolderName}
              </p>
            </div>
          )}
        </div>

        {/* Card Footer: Delete Action */}
        <div
          className="flex items-center justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            onClick={handleDelete}
            disabled={isDeleting}
            variant="overlay"
            size="sm"
            title="Xóa tài khoản"
            className="!text-white"
          >
            {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
          </IconButton>
        </div>
      </div>
    </FluentCard>
  )
}
