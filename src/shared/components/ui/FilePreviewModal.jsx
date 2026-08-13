import React, { useEffect } from 'react';
import Modal from '@/shared/components/ui/Modal';
import FilePreview from '@/shared/components/ui/FilePreview';
import { useRecordMaterialViewMutation } from '@/store/api/materialApi';

const FilePreviewModal = ({ open, onClose, item }) => {
  const [recordView] = useRecordMaterialViewMutation();

  useEffect(() => {
    if (open && item?.id) {
      recordView(item.id).catch(err => console.error("Failed to record view", err));
    }
  }, [open, item?.id, recordView]);

  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <h2
          className="text-[20px] leading-[26px] font-semibold truncate flex-1 min-w-0 mr-4"
          title={item.fileName || item.name}
        >
          {item.fileName || item.name}
        </h2>
      }
      className="w-full h-full md:w-[90vw] md:max-w-5xl md:h-[90vh]"
      bodyClassName="p-0 flex-1 overflow-hidden bg-[#F3F3F3] flex flex-col"
      headerClassName="flex items-center justify-between p-4 border-b bg-white"
    >
      <FilePreview
        url={item.fileUrl}
        fileName={item.fileName || item.name}
        className="w-full h-full"
      />
    </Modal>
  );
};

export default FilePreviewModal;
