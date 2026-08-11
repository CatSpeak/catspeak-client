import React, { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { FileText, Copy, Link as LinkIcon, Save, ChevronDown, FolderInput } from 'lucide-react';
import Switch from '@/shared/components/ui/inputs/Switch';
import { PillButton } from '@/shared/components/ui/buttons';
import Dropdown from '@/shared/components/ui/Dropdown';
import { useUpdateMaterialSettingsMutation } from '@/store/api/materialApi';
import toast from 'react-hot-toast';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const ShareMaterialModal = ({ open, onClose, item }) => {
  const [isPublic, setIsPublic] = useState(item?.isPublic ?? true);
  const [allowDownload, setAllowDownload] = useState(item?.allowDownload ?? true);

  const [updateSettings, { isLoading }] = useUpdateMaterialSettingsMutation();

  // Sync state when item changes
  React.useEffect(() => {
    if (item) {
      setIsPublic(item.isPublic);
      setAllowDownload(item.allowDownload);
    }
  }, [item]);

  if (!item) return null;

  const handleSave = async () => {
    try {
      await updateSettings({ id: item.id, isPublic, allowDownload }).unwrap();
      toast.success('Cập nhật cài đặt chia sẻ thành công');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi cập nhật cài đặt');
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <PillButton
        onClick={onClose}
        variant='outline'
        roundedClass='rounded-xl'
      >
        Đóng
      </PillButton>
      <PillButton
        roundedClass='rounded-xl'
        onClick={handleSave}
        loading={isLoading}
        startIcon={<Save className="w-4 h-4" />}
      >

        Lưu thay đổi
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
          <span className="text-[20px] font-bold">Chia sẻ tài liệu</span>
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
            <span className="text-base font-bold text-[#1A1C1C]">{item.fileName || item.name}</span>
            <span className="text-sm text-[#5B403E]">{item.fileName?.split('.').pop().toUpperCase() || 'TỆP'} • {formatSize(item.fileSize || item.size || item.sizeBytes)}</span>
          </div>
        </div>

        {/* Public Share Toggle */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#1A1C1C]">Bật chia sẻ công khai</span>
              <span className="text-sm text-[#5B403E]">Bất kỳ ai có liên kết đều có thể xem</span>
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
                value={item.fileUrl || "Không có liên kết"}
                className="w-full h-10 bg-[#F3F3F3] border border-[#E2E2E2] rounded-lg pl-9 pr-3 text-base text-[#1A1C1C] outline-none"
              />
            </div>
            <PillButton
              startIcon={<Copy className="w-4 h-4" />}
              variant='outline'
              roundedClass='rounded-xl'
              onClick={() => {
                if (item.fileUrl) {
                  navigator.clipboard.writeText(item.fileUrl);
                  toast.success('Đã sao chép liên kết');
                }
              }}
            >Sao chép</PillButton>
          </div>
        </div>

        <div className="h-px bg-[#E2E2E2] w-full" />

        {/* Allow Download Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#1A1C1C]">Cho phép tải xuống</span>
            <span className="text-sm text-[#5B403E]">Người xem có thể tải bản sao về máy</span>
          </div>
          <Switch
            checked={allowDownload}
            onChange={(e) => setAllowDownload(e.target.checked)}
            colorClass="peer-checked:bg-[#8e1115]"
          />
        </div>

        {/* Advanced Options */}
        <Dropdown
          align="left"
          dropdownClassName="w-full"
          roundedClass='rounded-xl'
          options={[
            { value: 'current', label: 'Học liệu kỳ Fall 2024 (Thư mục hiện tại)' },
            { value: '1', label: 'Bài giảng' },
            { value: '2', label: 'Tài liệu tham khảo' },
          ]}
          triggerClassName="h-[42px] border-[#fde9eb] bg-[#fffafb] w-full text-[13px] hover:bg-[#fff5f5]"
        />

      </div>
    </Modal>
  );
};

export default ShareMaterialModal;
