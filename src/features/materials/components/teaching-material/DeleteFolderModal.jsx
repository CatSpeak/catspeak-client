import React from 'react';
import Modal from '@/shared/components/ui/Modal';
import { AlertTriangle, FolderMinus } from 'lucide-react';
import { PillButton } from '@/shared/components/ui/buttons';

const DeleteFolderModal = ({ open, onClose, folderName, fileCount }) => {
  const footer = (
    <div className="flex items-center justify-end gap-3">
      <PillButton
        onClick={onClose}
        variant="outline"
        roundedClass='rounded-xl'
      >
        Hủy
      </PillButton>
      <PillButton
        roundedClass='rounded-xl'
      >
        Xóa
      </PillButton>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFDAD6] rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#BA1A1A]" />
          </div>
          <span className="text-[20px] font-bold text-gray-800">Xác nhận xóa</span>
        </div>
      }
      className="md:max-w-[420px] w-full"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        <div className="text-base text-[#5B403E]">
          Bạn có chắc muốn xóa <span className="font-bold text-[#1A1C1C]">"{folderName}"</span>?
          Hành động này không thể hoàn tác.
        </div>

        {fileCount > 0 && (
          <div className="bg-[#E8E8E8] border-[#E2E2E2] rounded-xl p-4 flex items-center gap-3">
            <FolderMinus className="w-5 h-5 text-[#5B403E]" strokeWidth={1.5} />
            <span className="text-[14px] text-[#5B403E]">
              Toàn bộ <span className="font-bold text-[#1A1C1C]">{fileCount} file</span> bên trong sẽ bị xóa.
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DeleteFolderModal;
