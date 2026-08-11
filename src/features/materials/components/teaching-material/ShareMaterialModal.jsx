import React, { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { FileText, Copy, Link as LinkIcon, Save, ChevronDown, FolderInput } from 'lucide-react';
import Switch from '@/shared/components/ui/inputs/Switch';
import { PillButton } from '@/shared/components/ui/buttons';
import Dropdown from '@/shared/components/ui/Dropdown';

const ShareMaterialModal = ({ open, onClose }) => {
  const [isPublic, setIsPublic] = useState(true);
  const [allowDownload, setAllowDownload] = useState(true);

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
      >
        <Save className="w-4 h-4" />
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
            <span className="text-base font-bold text-[#1A1C1C]">Bai_Giang_Cac_Thi_2023.pdf</span>
            <span className="text-sm text-[#5B403E]">PDF • 4.2 MB</span>
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
                value="https://lumina.edu.vn/share/doc/vhn83x29m"
                className="w-full h-10 bg-[#F3F3F3] border border-[#E2E2E2] rounded-lg pl-9 pr-3 text-base text-[#1A1C1C] outline-none"
              />
            </div>
            <PillButton
              startIcon={<Copy className="w-4 h-4" />}
              variant='outline'
              roundedClass='rounded-xl'
              onClick={() => navigator.clipboard.writeText("https://lumina.edu.vn/share/doc/vhn83x29m")}
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
