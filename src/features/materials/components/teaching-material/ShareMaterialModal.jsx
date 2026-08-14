import React, { useState } from "react";
import Modal from "@/shared/components/ui/Modal";
import {
  FileText,
  Copy,
  Link as LinkIcon,
  Save,
  ChevronDown,
  FolderInput,
} from "lucide-react";
import Switch from "@/shared/components/ui/inputs/Switch";
import { PillButton } from "@/shared/components/ui/buttons";
import {
  useUpdateMaterialSettingsMutation,
  useUpdateFolderSettingsMutation,
  useGenerateMaterialShareTokenMutation,
  useGenerateFolderShareTokenMutation,
} from "@/store/api/materialApi";
import toast from "react-hot-toast";
import { useLanguage } from "@/shared/context/LanguageContext";
import { formatSize } from "../../utils/materialUtils";


const ShareMaterialModal = ({ open, onClose, item }) => {
  const { t } = useLanguage();
  const [isPublic, setIsPublic] = useState(item?.isPublic ?? true);
  const [allowDownload, setAllowDownload] = useState(
    item?.allowDownload ?? true,
  );

  const [updateMaterialSettings, { isLoading: isUpdatingMaterial }] =
    useUpdateMaterialSettingsMutation();
  const [updateFolderSettings, { isLoading: isUpdatingFolder }] =
    useUpdateFolderSettingsMutation();
  const [generateMaterialShareToken, { isLoading: isGeneratingShare }] =
    useGenerateMaterialShareTokenMutation();
  const [generateFolderShareToken, { isLoading: isGeneratingFolderShare }] =
    useGenerateFolderShareTokenMutation();

  const isFolder = item && !item.fileName && !item.fileUrl;

  const extractToken = (source) => {
    if (source?.shareToken) return source.shareToken;
    if (source?.publicShareUrl) {
      const parts = source.publicShareUrl.split("/").filter(Boolean);
      return parts.pop() || null;
    }
    return null;
  };

  const [localToken, setLocalToken] = useState(() => extractToken(item));

  React.useEffect(() => {
    if (open) {
      setIsPublic(item?.isPublic ?? true);
      setAllowDownload(item?.allowDownload ?? true);
      setLocalToken(extractToken(item));
    }
  }, [open, item]);

  const shareLink = (localToken && isPublic)
    ? `${window.location.origin}/shared-material/${localToken}`
    : "";

  const isLoading =
    isUpdatingMaterial ||
    isUpdatingFolder ||
    isGeneratingShare ||
    isGeneratingFolderShare;

  if (!item) return null;

  const handleSave = async () => {
    try {
      if (isFolder) {
        await updateFolderSettings({
          id: item.id || item.folderId,
          isPublic,
          allowDownload,
        }).unwrap();

        if (isPublic) {
          const res = await generateFolderShareToken(item.id || item.folderId).unwrap();
          const responseData = res?.data || res;
          setLocalToken(responseData?.shareToken || null);
        } else {
          setLocalToken(null);
        }
      } else {
        await updateMaterialSettings({
          id: item.id,
          isPublic,
          allowDownload,
        }).unwrap();

        if (isPublic) {
          const res = await generateMaterialShareToken(item.id).unwrap();
          const responseData = res?.data || res;
          setLocalToken(responseData?.shareToken || null);
        } else {
          setLocalToken(null);
        }
      }

      toast.success(t.materials.updateShareSettingsSuccess);
    } catch (error) {
      console.error("Share error:", error);
      toast.error(t.materials.updateShareSettingsError);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <PillButton onClick={onClose} variant="outline" roundedClass="rounded-xl">
        {t.materials.close}
      </PillButton>
      <PillButton
        roundedClass="rounded-xl"
        onClick={handleSave}
        loading={isLoading}
        startIcon={<Save className="w-4 h-4" />}
      >
        {!item?.isPublic && isPublic
          ? (t.materials.saveAndCreateLink || "Lưu và tạo liên kết")
          : t.materials.saveChanges}
      </PillButton>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-gray-800">
          <FolderInput className="w-5 h-5 text-[#8e1115]" strokeWidth={2.5} />
          <span className="text-[20px] font-bold">
            {t.materials.shareMaterial}
          </span>
        </div>
      }
      className="md:max-w-xl w-full"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={footer}
    >
      <div className="flex flex-col gap-6 pt-2">
        {/* File Info */}
        <div className="bg-[#F3F3F3] border-[#E2E2E2] rounded-xl p-4 flex items-center gap-4">
          <FileText className="w-6 h-6 text-[#5B403E]" />
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#1A1C1C]">
              {item.fileName || item.name}
            </span>
            <span className="text-sm text-[#5B403E]">
              {item?.fileName
                ? item.fileName?.split(".").pop().toUpperCase() ||
                "" +
                " • " +
                formatSize(item.fileSize || item.size || item.sizeBytes)
                : null}
            </span>
          </div>
        </div>

        {/* Public Share Toggle */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#1A1C1C]">
                {t.materials.enablePublicShare}
              </span>
              <span className="text-sm text-[#5B403E]">
                {t.materials.publicShareDesc}
              </span>
            </div>
            <Switch
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              colorClass="peer-checked:bg-[#990011]"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B403E]">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                readOnly
                value={
                  shareLink ||
                  (isLoading
                    ? t.materials.loading
                    : isPublic
                      ? t.materials.saveToGenerateLink
                      : t.materials.noLink)
                }
                className="w-full h-10 bg-[#F3F3F3] border border-[#E2E2E2] rounded-lg pl-9 pr-3 text-base text-[#1A1C1C] outline-none"
              />
            </div>
            <PillButton
              startIcon={<Copy className="w-4 h-4" />}
              variant="outline"
              roundedClass="rounded-xl"
              onClick={() => {
                if (shareLink) {
                  navigator.clipboard.writeText(shareLink);
                  toast.success(t.materials.copiedLink);
                }
              }}
            >
              {t.materials.copy}
            </PillButton>
          </div>
        </div>

        <div className="h-px bg-[#E2E2E2] w-full" />

        {/* Allow Download Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#1A1C1C]">
              {t.materials.allowDownload}
            </span>
            <span className="text-sm text-[#5B403E]">
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
  );
};

export default ShareMaterialModal;
