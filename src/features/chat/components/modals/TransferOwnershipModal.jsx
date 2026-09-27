import { useState, useMemo } from "react"
import { Crown, Search, AlertTriangle } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { PillButton } from "@/shared/components/ui/buttons"
import { useTransferOwnershipMutation } from "@/store/api/social/conversationsApi"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * TransferOwnershipModal — Allows group owner to transfer group ownership to another member.
 */
const TransferOwnershipModal = ({
  open,
  onClose,
  conversation,
  currentUserId,
  initialTargetAccountId = null,
}) => {
  const { t } = useLanguage()
  const [transferOwnership, { isLoading }] = useTransferOwnershipMutation()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAccountId, setSelectedAccountId] = useState(
    initialTargetAccountId ? Number(initialTargetAccountId) : null,
  )
  const [isConfirming, setIsConfirming] = useState(false)

  const [prevOpenKey, setPrevOpenKey] = useState({ open, initialTargetAccountId })
  if (open !== prevOpenKey.open || initialTargetAccountId !== prevOpenKey.initialTargetAccountId) {
    setPrevOpenKey({ open, initialTargetAccountId })
    if (open) {
      setSelectedAccountId(initialTargetAccountId ? Number(initialTargetAccountId) : null)
      setIsConfirming(false)
      setSearchQuery("")
    }
  }

  const eligibleMembers = useMemo(() => {
    const participants = conversation?.participants || []
    return participants.filter((p) => p.accountId !== currentUserId)
  }, [conversation?.participants, currentUserId])

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return eligibleMembers
    const q = searchQuery.toLowerCase()
    return eligibleMembers.filter(
      (p) =>
        (p.username && p.username.toLowerCase().includes(q)) ||
        (p.name && p.name.toLowerCase().includes(q)),
    )
  }, [eligibleMembers, searchQuery])

  const selectedMember = useMemo(() => {
    return eligibleMembers.find((p) => p.accountId === selectedAccountId)
  }, [eligibleMembers, selectedAccountId])

  const handleTransfer = async () => {
    if (!selectedAccountId) return

    try {
      await transferOwnership({
        conversationId: conversation.id,
        newOwnerAccountId: selectedAccountId,
      }).unwrap()

      toast.success(
        t?.chat?.ownershipTransferredSuccess ||
          `Group ownership transferred to ${selectedMember?.username || "new owner"}`,
      )
      setIsConfirming(false)
      setSelectedAccountId(null)
      onClose()
    } catch (err) {
      console.error("Failed to transfer ownership:", err)
      toast.error(
        err?.data?.message ||
          t?.chat?.ownershipTransferFailed ||
          "Failed to transfer ownership",
      )
    }
  }

  const handleClose = () => {
    setIsConfirming(false)
    setSelectedAccountId(null)
    setSearchQuery("")
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t?.chat?.transferOwnershipTitle || "Transfer Group Ownership"}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        {isConfirming ? (
          /* Confirmation Warning Screen */
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center animate-pulse">
              <AlertTriangle size={30} />
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                {t?.chat?.confirmTransferTitle || "Confirm Ownership Transfer"}
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
                {t?.chat?.confirmTransferWarning ||
                  `Are you sure you want to make ${selectedMember?.username} the new group owner? You will lose all owner management permissions.`}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full pt-4 border-t border-border">
              <PillButton
                type="button"
                variant="ghost"
                onClick={() => setIsConfirming(false)}
                disabled={isLoading}
                className="flex-1"
              >
                {t?.chat?.back || "Back"}
              </PillButton>
              <PillButton
                type="button"
                variant="primary"
                onClick={handleTransfer}
                disabled={isLoading}
                className="flex-1 !bg-amber-600 hover:!bg-amber-700"
              >
                {isLoading
                  ? t?.chat?.transferring || "Transferring..."
                  : t?.chat?.confirmTransfer || "Confirm Transfer"}
              </PillButton>
            </div>
          </div>
        ) : (
          /* Member Selection Screen */
          <>
            <p className="text-xs text-neutral-500">
              {t?.chat?.selectNewOwnerPrompt ||
                "Select a group member to become the new owner of this group."}
            </p>

            {/* Search filter */}
            <div className="relative">
              <TextInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t?.chat?.searchMembers || "Search members..."}
                startIcon={<Search size={16} className="text-neutral-400" />}
              />
            </div>

            {/* Members List */}
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto divide-y divide-border/30 pr-1">
              {filteredMembers.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  {t?.chat?.noMembersFound || "No eligible members found"}
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const mId = member.accountId
                  const isSelected = selectedAccountId === mId
                  const theme = getParticipantTheme(mId || member.username)

                  return (
                    <div
                      key={mId}
                      onClick={() => setSelectedAccountId(mId)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-neutral-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          size={38}
                          name={member.username || member.name}
                          src={member.avatarImageUrl}
                          className={theme.avatarClass}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-neutral-800 dark:text-neutral-200">
                            {member.username || member.name}
                          </p>
                          <p className="text-[11px] text-neutral-400 truncate">
                            {member.role || "Member"}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-neutral-300 dark:border-neutral-600"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <PillButton
                type="button"
                variant="ghost"
                onClick={handleClose}
              >
                {t?.chat?.cancel || "Cancel"}
              </PillButton>
              <PillButton
                type="button"
                variant="primary"
                onClick={() => setIsConfirming(true)}
                disabled={!selectedAccountId}
                startIcon={<Crown size={15} />}
              >
                {t?.chat?.continue || "Continue"}
              </PillButton>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default TransferOwnershipModal
