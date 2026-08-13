import React, { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { FileText, X, Copy, Download, FolderInput, Trash2, Eye, Info, ChevronLeft } from 'lucide-react';
import Switch from '@/shared/components/ui/inputs/Switch';
import TextInput from '@/shared/components/ui/inputs/TextInput';
import { IconButton, PillButton } from '@/shared/components/ui/buttons';
import { useUpdateMaterialSettingsMutation, useRecordMaterialDownloadMutation, useGenerateMaterialShareTokenMutation, useRecordMaterialViewMutation } from '@/store/api/materialApi';
import FilePreview from '@/shared/components/ui/FilePreview';
import { useLanguage } from '@/shared/context/LanguageContext';

import { useTimezone } from "@/shared/hooks/useTimezone";
import toast from 'react-hot-toast';
import { formatSize } from "../../utils/materialUtils";


const FileDetailModal = ({ open, onClose, item, onDelete, onMove }) => {
  const { t } = useLanguage();
  const { formatDate } = useTimezone();
  const [isPublic, setIsPublic] = useState(item?.isPublic ?? true);
  const [allowDownload, setAllowDownload] = useState(item?.allowDownload ?? true);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  const [updateSettings] = useUpdateMaterialSettingsMutation();
  const [recordDownload] = useRecordMaterialDownloadMutation();
  const [generateMaterialShareToken] = useGenerateMaterialShareTokenMutation();

  const [localToken, setLocalToken] = useState(item?.shareToken || null);
  const [recordView] = useRecordMaterialViewMutation();

  React.useEffect(() => {
    if (open && item?.id) {
      recordView(item.id).catch(err => console.error("Failed to record view", err));
    }
  }, [open, item?.id, recordView]);

  // Sync state when item changes
  React.useEffect(() => {
    if (item) {
      setIsPublic(item.isPublic);
      setAllowDownload(item.allowDownload);
      setLocalToken(item.shareToken || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  const shareLink = (localToken && isPublic)
    ? `${window.location.origin}/shared-material/${localToken}`
    : "";

  if (!item) return null;

  const handleTogglePublic = async (checked) => {
    setIsPublic(checked);
    try {
      await updateSettings({ id: item.id, isPublic: checked, allowDownload }).unwrap();

      if (checked) {
        const res = await generateMaterialShareToken(item.id).unwrap();
        const responseData = res?.data || res;
        setLocalToken(responseData?.shareToken || null);
      } else {
        setLocalToken(null);
      }

      toast.success(t.materials.updateShareStatusSuccess);
    } catch {
      setIsPublic(!checked); // revert
      toast.error(t.materials.updateShareStatusError);
    }
  };

  const handleToggleDownload = async (checked) => {
    setAllowDownload(checked);
    try {
      await updateSettings({ id: item.id, isPublic, allowDownload: checked }).unwrap();
      toast.success(t.materials.updateDownloadPermSuccess);
    } catch {
      setAllowDownload(!checked); // revert
      toast.error(t.materials.updateDownloadPermError);
    }
  };

  const handleDownload = async () => {
    if (item.fileUrl) {
      recordDownload(item.id);
      try {
        const response = await fetch(item.fileUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = item.fileName || item.name || 'download';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed, falling back to new tab:', error);
        window.open(item.fileUrl, '_blank');
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={null}
      showCloseButton={false}
      className="md:max-w-[1200px] w-full h-[100dvh] md:h-[640px] !m-0 md:!m-4 !rounded-none md:!rounded-2xl"
      bodyClassName="p-0 flex flex-col md:flex-row h-full overflow-hidden"
    >
      {/* Left Column - Preview */}
      <div className={`${showMobileDetails ? 'hidden md:flex' : 'flex'} h-full md:h-auto md:flex-1 flex-col bg-white shrink-0 md:shrink min-w-0`}>
        {/* Header Left */}
        <div className="h-[56px] md:h-[64px] px-4 border-b border-[#E3BEBA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-[#E3BEBA]/50 rounded flex items-center justify-center text-[#6E0009] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-semibold text-[#1A1C1C] text-base md:text-lg truncate">{item.fileName || item.name}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <IconButton variant='ghost' onClick={() => setShowMobileDetails(true)} className="md:hidden">
              <Info className="w-5 h-5 text-[#1A1C1C]" />
            </IconButton>
            <IconButton variant='ghost' onClick={onClose} className="md:hidden">
              <X className="w-5 h-5 text-[#1A1C1C]" />
            </IconButton>
          </div>
        </div>

        <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden min-h-0">
          <FilePreview url={item.fileUrl} fileName={item.fileName || item.name} />
        </div>
      </div>

      {/* Right Column - Details & Settings */}
      <div className={`${showMobileDetails ? 'flex' : 'hidden md:flex'} flex-1 md:flex-none w-full md:w-[32%] flex-col border-t md:border-t-0 md:border-l border-[#E3BEBA] bg-white overflow-hidden`}>
        {/* Header Right */}
        <div className="h-[56px] md:h-[64px] px-4 md:px-6 border-b border-[#E3BEBA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <IconButton variant='ghost' onClick={() => setShowMobileDetails(false)} className="md:hidden -ml-2">
              <ChevronLeft className="w-5 h-5 text-[#1A1C1C]" />
            </IconButton>
            <span className="font-semibold text-[#1A1C1C] text-base md:text-lg">{t.materials.detailsAndSettingsHeader}</span>
          </div>
          <IconButton variant='ghost' onClick={onClose} className="hidden md:flex">
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Scrollable Settings */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-5 md:gap-6">
          {/* Info Box */}
          <div>
            <h4 className="text-base md:text-lg font-bold text-[#1A1C1C] mb-2">{t.materials.fileInfo}</h4>
            <div className="bg-[#F9F9F9] border border-[#E3BEBA] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#5B403E]">{t.materials.type}</span>
                <span className="font-medium text-[#1A1C1C]">{item.fileName?.split('.').pop().toUpperCase() || t.materials.file}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#5B403E]">{t.materials.size}</span>
                <span className="font-medium text-[#1A1C1C]">{formatSize(item.fileSize || item.size || item.sizeBytes)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#5B403E]">{t.materials.uploadDate}</span>
                <span className="font-medium text-[#1A1C1C]">{item.uploadedAt || item.createdAt ? formatDate(item.uploadedAt || item.createdAt) : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="border border-[#E3BEBA] w-full" />

          {/* Public Share */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col pr-2">
                <span className="text-base md:text-lg font-bold text-[#1A1C1C]">{t.materials.publicShare}</span>
                <span className="text-xs md:text-sm text-[#5B403E]">{t.materials.publicShareDesc}</span>
              </div>
              <Switch
                checked={isPublic}
                onChange={(e) => handleTogglePublic(e.target.checked)}
                colorClass="peer-checked:bg-[#8e1115]"
              />
            </div>

            <div className="mb-1">
              <span className="text-xs md:text-sm text-[#5B403E] mb-1 block font-medium">{t.materials.shareLink}</span>
              <div className="flex items-center gap-2">
                <TextInput
                  readOnly
                  value={shareLink || t.materials.noLink}
                  className="!h-10 text-xs md:text-sm bg-[#F9F9F9] border-[#E3BEBA] !rounded-xl"
                  containerClassName="flex-1"
                />
                <PillButton
                  variant="outline"
                  roundedClass="rounded-xl"
                  startIcon={<Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  className="!text-xs md:!text-sm px-3 md:px-4"
                  onClick={() => {
                    if (shareLink) {
                      navigator.clipboard.writeText(shareLink);
                      toast?.success?.(t.materials.copiedLink) || alert(t.materials.copiedLink);
                    }
                  }}
                >
                  {t.materials.copy}
                </PillButton>
              </div>
            </div>
          </div>

          <div className="border border-[#E3BEBA] w-full" />

          {/* Download Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col pr-2">
              <span className="text-base md:text-lg font-bold text-[#1A1C1C]">{t.materials.allowDownload}</span>
              <span className="text-xs md:text-sm text-[#5B403E] mt-0.5">{t.materials.allowDownloadDescShort}</span>
            </div>
            <Switch
              checked={allowDownload}
              onChange={(e) => handleToggleDownload(e.target.checked)}
              colorClass="peer-checked:bg-[#8e1115]"
            />
          </div>

          <div className="border border-[#E3BEBA] w-full" />

          {/* Stats */}
          <div>
            <h4 className="text-base md:text-lg font-bold text-[#5B403E] mb-2">{t.materials.statistics}</h4>
            <div className="flex gap-3">
              <div className="flex-1 bg-[#F9F9F9] border border-[#E3BEBA] rounded-xl flex flex-col items-center justify-center p-2.5 md:p-3">
                <Eye className="w-4 h-4 md:w-5 md:h-5 text-[#6E0009] mb-1" />
                <span className="text-lg md:text-xl font-bold text-[#1A1C1C]">{item.viewCount || 0}</span>
                <span className="text-[11px] md:text-xs text-[#5B403E] font-medium mt-0.5">{t.materials.views}</span>
              </div>
              <div className="flex-1 bg-[#F9F9F9] border border-[#E3BEBA] rounded-xl flex flex-col items-center justify-center p-2.5 md:p-3">
                <Download className="w-4 h-4 md:w-5 md:h-5 text-[#6E0009] mb-1" />
                <span className="text-lg md:text-xl font-bold text-[#1A1C1C]">{item.downloadCount || 0}</span>
                <span className="text-[11px] md:text-xs text-[#5B403E] font-medium mt-0.5">{t.materials.downloads}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-2 flex flex-col gap-2 shrink-0">
            <div className="flex gap-2">
              <PillButton
                startIcon={<Download className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                className="flex-1 !text-sm"
                roundedClass="rounded-xl"
                onClick={handleDownload}
              >
                {t.materials.download}
              </PillButton>
              <PillButton
                startIcon={<FolderInput className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                variant="outline"
                className="flex-1 !text-sm"
                roundedClass="rounded-xl"
                textColor="#5B403E"
                borderColor="#E3BEBA"
                onClick={onMove}
              >
                {t.materials.move}
              </PillButton>
            </div>
            <PillButton
              startIcon={<Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              variant="secondary-no-outline"
              textColor="#BA1A1A"
              className="mt-1 !text-sm"
              roundedClass="rounded-xl"
              onClick={onDelete}
            >
              {t.materials.delete}
            </PillButton>
          </div>

        </div>
      </div>
    </Modal>
  );
};

export default FileDetailModal;
