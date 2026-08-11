import React, { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { FileText, Search, X, Copy, Download, FolderInput, Trash2, Eye, ZoomIn } from 'lucide-react';
import Switch from '@/shared/components/ui/inputs/Switch';
import TextInput from '@/shared/components/ui/inputs/TextInput';
import { IconButton, PillButton } from '@/shared/components/ui/buttons';

const FileDetailModal = ({ open, onClose }) => {
  const [isPublic, setIsPublic] = useState(true);
  const [allowDownload, setAllowDownload] = useState(true);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={null}
      showCloseButton={false}
      className="md:max-w-[1200px] w-full h-[100dvh] md:h-[640px]"
      bodyClassName="p-0 flex flex-col md:flex-row h-full"
    >
      {/* Left Column - Preview */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header Left */}
        <div className="h-[64px] px-4 border-b border-[#E3BEBA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#E3BEBA]/50 rounded flex items-center justify-center text-[#6E0009]">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-semibold text-[#1A1C1C] text-lg">Bài giảng Ngữ pháp Cơ bản - Bài 1.pdf</span>
          </div>
          <IconButton variant='ghost' className='cursor-pointer'>
            <ZoomIn className='text-[#5B403E]' />
          </IconButton>
        </div>

        <div className="flex-1 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500">Preview placeholder</span>
        </div>
      </div>

      {/* Right Column - Details & Settings */}
      <div className="w-full md:w-[32%] flex flex-col border-l border-[#E3BEBA] bg-white shrink-0">
        {/* Header Right */}
        <div className="h-[64px] px-6 border-b border-[#E3BEBA] flex items-center justify-between shrink-0">
          <span className="font-semibold text-[#1A1C1C] text-lg">Chi tiết & Cài đặt</span>
          <IconButton variant='ghost' onClick={onClose}>
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Scrollable Settings */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Info Box */}
          <div>
            <h4 className="text-lg font-bold text-[#1A1C1C] mb-2">Thông tin tệp</h4>
            <div className="bg-[#F9F9F9] border border-[#E3BEBA] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#5B403E]">Loại:</span>
                <span className="font-medium text-[#1A1C1C]">PDF</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#5B403E]">Kích thước:</span>
                <span className="font-medium text-[#1A1C1C]">2.4MB</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#5B403E]">Ngày tải lên:</span>
                <span className="font-medium text-[#1A1C1C]">15/10/2023</span>
              </div>
            </div>
          </div>

          <div className="border border-[#E3BEBA] w-full" />

          {/* Public Share */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#1A1C1C]">Chia sẻ công khai</span>
                <span className="text-sm text-[#5B403E]">Bất kỳ ai có liên kết đều có thể xem</span>
              </div>
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                colorClass="peer-checked:bg-[#8e1115]"
              />
            </div>

            <div className="mb-1">
              <span className="text-sm text-[#5B403E] mb-1 block font-medium">Liên kết chia sẻ</span>
              <div className="flex items-center gap-2">
                <TextInput
                  readOnly
                  value="https://catspeak.edu/doc/a1b2c3d4"
                  className="!h-10 text-sm bg-[#F9F9F9] border-[#E3BEBA] !rounded-xl"
                  containerClassName="flex-1"
                />
                <PillButton
                  variant="outline"
                  roundedClass="rounded-xl"
                  startIcon={<Copy className="w-4 h-4" />}
                  onClick={() => navigator.clipboard.writeText("https://catspeak.edu/doc/a1b2c3d4")}
                >
                  Sao chép
                </PillButton>
              </div>
            </div>
          </div>

          <div className="border border-[#E3BEBA] w-full" />

          {/* Download Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#1A1C1C]">Cho phép người khác tải xuống</span>
              <span className="text-sm text-[#5B403E] mt-0.5">Người xem có thể lưu bản sao</span>
            </div>
            <Switch
              checked={allowDownload}
              onChange={(e) => setAllowDownload(e.target.checked)}
              colorClass="peer-checked:bg-[#8e1115]"
            />
          </div>

          <div className="border border-[#E3BEBA] w-full" />

          {/* Stats */}
          <div>
            <h4 className="text-lg font-bold text-[#5B403E] mb-2">Thống kê</h4>
            <div className="flex gap-3">
              <div className="flex-1 bg-[#F9F9F9] border border-[#E3BEBA] rounded-xl flex flex-col items-center justify-center p-3">
                <Eye className="w-5 h-5 text-[#6E0009] mb-1" />
                <span className="text-xl font-bold text-[#1A1C1C]">124</span>
                <span className="text-xs text-[#5B403E] font-medium mt-0.5">lượt xem</span>
              </div>
              <div className="flex-1 bg-[#F9F9F9] border border-[#E3BEBA] rounded-xl flex flex-col items-center justify-center p-3">
                <Download className="w-5 h-5 text-[#6E0009] mb-1" />
                <span className="text-xl font-bold text-[#1A1C1C]">45</span>
                <span className="text-xs text-[#5B403E] font-medium mt-0.5">lượt tải xuống</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-2 shrink-0">
            <div className="flex gap-2">
              <PillButton
                startIcon={<Download className="w-4 h-4" />}
                className="flex-1"
                roundedClass="rounded-xl"
              >
                Tải xuống
              </PillButton>
              <PillButton
                startIcon={<FolderInput className="w-4 h-4" />}
                variant="outline"
                className="flex-1"
                roundedClass="rounded-xl"
                textColor="#5B403E"
                borderColor="#E3BEBA"
              >
                Di chuyển
              </PillButton>
            </div>
            <PillButton
              startIcon={<Trash2 className="w-4 h-4" />}
              variant="secondary-no-outline"
              textColor="#BA1A1A"
              className="mt-1"
              roundedClass="rounded-xl"
            >
              Xóa
            </PillButton>
          </div>

        </div>
      </div>
    </Modal>
  );
};

export default FileDetailModal;
