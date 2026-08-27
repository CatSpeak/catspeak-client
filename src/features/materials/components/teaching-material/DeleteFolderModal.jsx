import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { AlertTriangle, FolderMinus, Loader2 } from "lucide-react"
import { PillButton } from "@/shared/components/ui/buttons"
import {
  useDeletePersonalMaterialMutation,
  useDeleteMaterialsBulkMutation,
  useDeleteFolderMutation,
} from "@/store/api/materialApi"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"

const DeleteFolderModal = ({ open, onClose, onSuccess, item }) => {
  const { t } = useLanguage()
  const [deleteMaterial, { isLoading: isDeletingSingle }] =
    useDeletePersonalMaterialMutation()
  const [deleteFolder, { isLoading: isDeletingFolder }] =
    useDeleteFolderMutation()
  const [deleteMaterialsBulk, { isLoading: isDeletingBulk }] =
    useDeleteMaterialsBulkMutation()
  const isLoading = isDeletingSingle || isDeletingBulk || isDeletingFolder

  const handleDelete = async () => {
    try {
      if (item.type === "bulk" && item.items) {
        const folderIds = item.items
          .filter((i) => i._type === "folder" || (i.folderId && !i.fileName))
          .map((i) => i.id || i.folderId)
        const materialIds = item.items
          .filter((i) => i._type === "file" || i.fileName)
          .map((i) => i.id)

        const result = await deleteMaterialsBulk({
          folderIds,
          materialIds,
        }).unwrap()
        const resData = result?.data || result
        if (resData?.totalFailed > 0) {
          const partialSuccessMsg = t.materials.deleteBulkPartialSuccess
            ?.replace("{{total}}", resData.totalRequested)
            ?.replace("{{success}}", resData.totalSucceeded)
            ?.replace("{{fail}}", resData.totalFailed)
          toast(partialSuccessMsg, { icon: "⚠️" })
        } else {
          toast.success(
            t.materials.deletedMultipleSuccess.replace(
              "{{count}}",
              resData?.totalSucceeded ?? item.items.length,
            ),
          )
        }
      } else {
        const isFolder =
          item.type === "folder" ||
          item._type === "folder" ||
          (item.type !== "file" &&
            item._type !== "file" &&
            !item.fileName &&
            !item.fileUrl)

        if (isFolder) {
          await deleteFolder(item.id || item.folderId).unwrap()
        } else {
          await deleteMaterial(item.id).unwrap()
        }
        toast.success(
          isFolder
            ? t.materials.deletedFolderSuccess
            : t.materials.deletedFileSuccess,
        )
      }
      if (onSuccess) onSuccess()
      else onClose()
    } catch (err) {
      console.error(err)
      const errCode = err?.data?.message
      const errMsg = errCode
        ? t.materials.errors?.[errCode] || errCode
        : err?.message || t.materials.deleteError
      toast.error(errMsg)
    }
  }

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <PillButton
        onClick={handleDelete}
        loading={isLoading}
        disabled={isLoading || item.isImpactLoading}
      >
        {t.materials.delete}
      </PillButton>
    </div>
  )

  // Hiển thị chi tiết ảnh hưởng
  const renderImpactSection = () => {
    if (item.type === "bulk" || item.type === "file") return null

    if (item.isImpactLoading) {
      return (
        <div className="bg-[#f3f3f3] rounded-xl h-14 px-4 flex items-center gap-4">
          <Loader2 className="w-6 h-6 shrink-0 animate-spin" />
          <span>{t.materials.loadingData || "Đang tải thông tin"}</span>
        </div>
      )
    }

    if (item.affectedDetail) {
      const { folders, materials } = item.affectedDetail
      if (folders > 0 || materials > 0) {
        return (
          <div className="bg-[#f3f3f3] rounded-xl h-14 px-4 flex items-center gap-4">
            <FolderMinus className="w-6 h-6 shrink-0" />
            <span>
              {t.materials.deleteFolderImpactMsg
                .replace("{{name}}", item.name)
                .replace("{{folders}}", folders)
                .replace("{{materials}}", materials)}
            </span>
          </div>
        )
      }
    }

    // Fallback cho count cũ
    if (item.count > 0) {
      return (
        <div className="bg-[#f3f3f3] rounded-xl h-14 px-4 flex items-center gap-4">
          <FolderMinus className="w-6 h-6 shrink-0" />
          <span>
            {t.materials.deleteFolderWarning
              .split("{{count}}")
              .map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <span className="font-bold">{item.count}</span>
                  )}
                </React.Fragment>
              ))}
          </span>
        </div>
      )
    }

    return null
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.materials.confirmDelete}
      className="md:max-w-[420px] w-full"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        <div>
          {t.materials.deleteConfirmMessage
            .split('"{{name}}"')
            .map((part, index, array) => (
              <React.Fragment key={index}>
                {part}
                {index < array.length - 1 && (
                  <span className="font-bold">"{item.name}"</span>
                )}
              </React.Fragment>
            ))}
        </div>

        {renderImpactSection()}
      </div>
    </Modal>
  )
}

export default DeleteFolderModal
