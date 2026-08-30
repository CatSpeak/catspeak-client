import React, { useRef, useState } from "react"
import { FcFolder } from "react-icons/fc"
import { Copy, Link as LinkIcon } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import Switch from "@/shared/components/ui/inputs/Switch"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { PillButton, IconButton } from "@/shared/components/ui/buttons"
import {
  useUpdateMaterialSettingsMutation,
  useUpdateFolderSettingsMutation,
  useGenerateMaterialShareTokenMutation,
  useGenerateFolderShareTokenMutation,
} from "@/store/api/materialApi"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { formatSize } from "../../utils/materialUtils"
import { getFileTypeIcon } from "../../utils/fileIconUtils"

const ShareMaterialModal = ({ open, onClose, item }) => {
  const { t } = useLanguage()
  const [isPublic, setIsPublic] = useState(item?.isPublic ?? true)
  const [allowDownload, setAllowDownload] = useState(
    item?.allowDownload ?? true,
  )

  const [updateMaterialSettings, { isLoading: isUpdatingMaterial }] =
    useUpdateMaterialSettingsMutation()
  const [updateFolderSettings, { isLoading: isUpdatingFolder }] =
    useUpdateFolderSettingsMutation()
  const [generateMaterialShareToken, { isLoading: isGeneratingShare }] =
    useGenerateMaterialShareTokenMutation()
  const [generateFolderShareToken, { isLoading: isGeneratingFolderShare }] =
    useGenerateFolderShareTokenMutation()

  const isFolder = item && !item.fileName && !item.fileUrl

  const extractToken = (source) => {
    if (source?.shareToken) return source.shareToken
    if (source?.publicShareUrl) {
      const parts = source.publicShareUrl.split("/").filter(Boolean)
      return parts.pop() || null
    }
    return null
  }

  const [localToken, setLocalToken] = useState(() => extractToken(item))
  const materialIsPublic = useRef(item?.isPublic ?? true)

  React.useEffect(() => {
    if (open) {
      setIsPublic(item?.isPublic ?? true)
      setAllowDownload(item?.allowDownload ?? true)
      setLocalToken(extractToken(item))
      materialIsPublic.current = item?.isPublic ?? true
    }
  }, [open, item])

  const shareLink =
    localToken && isPublic
      ? `${window.location.origin}/shared-material/${localToken}`
      : ""

  const isLoading =
    isUpdatingMaterial ||
    isUpdatingFolder ||
    isGeneratingShare ||
    isGeneratingFolderShare

  if (!item) return null

  const handleTogglePublic = async (e) => {
    const checked = e.target.checked
    setIsPublic(checked)
    if (checked) {
      if (!materialIsPublic.current) {
        try {
          if (isFolder) {
            await updateFolderSettings({
              id: item.id || item.folderId,
              isPublic: true,
              allowDownload,
            }).unwrap()
            materialIsPublic.current = true
            if (!localToken) {
              const res = await generateFolderShareToken(
                item.id || item.folderId,
              ).unwrap()
              const responseData = res?.data || res
              setLocalToken(responseData?.shareToken || null)
            }
          } else {
            await updateMaterialSettings({
              id: item.id,
              isPublic: true,
              allowDownload,
            }).unwrap()
            materialIsPublic.current = true
            if (!localToken) {
              const res = await generateMaterialShareToken(item.id).unwrap()
              const responseData = res?.data || res
              setLocalToken(responseData?.shareToken || null)
            }
          }
          toast.success(t.materials.updateShareSettingsSuccess)
        } catch (error) {
          console.error("Share error:", error)
          const errCode = error?.data?.message
          const errMsg = errCode
            ? t.materials.errors?.[errCode] || errCode
            : t.materials.updateShareSettingsError
          toast.error(errMsg)
          setIsPublic(false)
          materialIsPublic.current = false
        }
      }
    }
  }

  const handleSave = async () => {
    try {
      if (isFolder) {
        await updateFolderSettings({
          id: item.id || item.folderId,
          isPublic,
          allowDownload,
        }).unwrap()
        materialIsPublic.current = isPublic

        if (isPublic) {
          if (!localToken) {
            const res = await generateFolderShareToken(
              item.id || item.folderId,
            ).unwrap()
            const responseData = res?.data || res
            setLocalToken(responseData?.shareToken || null)
          }
        } else {
          setLocalToken(null)
        }
      } else {
        await updateMaterialSettings({
          id: item.id,
          isPublic,
          allowDownload,
        }).unwrap()
        materialIsPublic.current = isPublic

        if (isPublic) {
          if (!localToken) {
            const res = await generateMaterialShareToken(item.id).unwrap()
            const responseData = res?.data || res
            setLocalToken(responseData?.shareToken || null)
          }
        } else {
          setLocalToken(null)
        }
      }

      toast.success(t.materials.updateShareSettingsSuccess)
      onClose()
    } catch (error) {
      console.error("Share error:", error)
      const errCode = error?.data?.message
      const errMsg = errCode
        ? t.materials.errors?.[errCode] || errCode
        : t.materials.updateShareSettingsError
      toast.error(errMsg)
    }
  }

  const footer = (
    <div className="flex items-center justify-end">
      <PillButton onClick={handleSave} loading={isLoading}>
        {!item?.isPublic && isPublic
          ? t.materials.saveAndCreateLink || "Lưu và tạo liên kết"
          : t.materials.saveChanges}
      </PillButton>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.materials.shareMaterial}
      className="md:max-w-xl w-full"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={footer}
    >
      <div className="flex flex-col gap-6">
        {/* File / Folder Info Card */}
        <div className="bg-primaryBg border border-border rounded-xl p-4 flex items-center gap-3.5">
          <div className="shrink-0 flex items-center justify-center">
            {isFolder ? (
              <FcFolder className="text-2xl shrink-0" />
            ) : (
              getFileTypeIcon(item.fileName || item.name, item.fileUrl)
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="truncate" title={item.fileName || item.name}>
              {item.fileName || item.name}
            </span>
            <div className="flex items-center gap-2 text-sm text-secondary">
              {isFolder ? (
                <span>
                  {(t.materials?.itemsCount || "{{count}} items").replace(
                    "{{count}}",
                    item.itemsCount || item.materialCount || 0,
                  )}
                </span>
              ) : (
                <>
                  <span>
                    {item.fileName?.split(".").pop()?.toUpperCase() || "FILE"}
                  </span>
                  <span
                    className="w-1 h-1 rounded-full bg-current shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    {formatSize(item.fileSize || item.size || item.sizeBytes)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Public Share Toggle */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span>{t.materials.enablePublicShare}</span>
              <span className="text-sm text-secondary">
                {t.materials.publicShareDesc}
              </span>
            </div>
            <Switch
              checked={isPublic}
              onChange={handleTogglePublic}
              colorClass="peer-checked:bg-[#990011]"
            />
          </div>

          <TextInput
            readOnly
            disabled={!isPublic}
            variant="square"
            value={
              isPublic
                ? shareLink ||
                  (isLoading
                    ? t.materials.loading
                    : t.materials.saveToGenerateLink)
                : t.materials.noLink
            }
            containerClassName="w-full"
            rightContent={
              isPublic && shareLink ? (
                <IconButton
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink)
                    toast.success(t.materials.copiedLink)
                  }}
                  title={t.materials.copy}
                  className="text-secondary hover:text-[#1A1C1C]"
                >
                  <Copy />
                </IconButton>
              ) : null
            }
            rightContentWidthClass="!pr-12"
            rightContentClassName="right-0"
          />
        </div>

        {/* Allow Download Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span>{t.materials.allowDownload}</span>
            <span className="text-sm text-secondary">
              {t.materials.allowDownloadDesc}
            </span>
          </div>
          <Switch
            checked={allowDownload}
            onChange={(e) => setAllowDownload(e.target.checked)}
            colorClass="peer-checked:bg-[#8e1115]"
          />
        </div>

        {/* Advanced Options */}
        {/* <Dropdown
          align="left"
          dropdownClassName="w-full"
          roundedClass='rounded-xl'
          options={[
            { value: 'current', label: 'Học liệu kỳ Fall 2024 (Thư mục hiện tại)' },
            { value: '1', label: 'Bài giảng' },
            { value: '2', label: 'Tài liệu tham khảo' },
          ]}
          triggerClassName="h-[42px] border-[#fde9eb] bg-[#fffafb] w-full text-[13px] hover:bg-[#fff5f5]"
        /> */}
      </div>
    </Modal>
  )
}

export default ShareMaterialModal
