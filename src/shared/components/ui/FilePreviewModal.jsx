import React, { useEffect } from 'react';
import Modal from '@/shared/components/ui/Modal';
import FilePreview from '@/shared/components/ui/FilePreview';
import { useRecordMaterialViewMutation } from '@/store/api/materialApi';
import { getImageUrl } from '@/shared/utils/imageUtils';
import { Download, ExternalLink } from 'lucide-react';
import IconButton from '@/shared/components/ui/buttons/IconButton';

const FilePreviewModal = ({ open, onClose, item, recordMaterialView = true }) => {
  const [recordView] = useRecordMaterialViewMutation();

  useEffect(() => {
    if (
      open &&
      item?.id &&
      recordMaterialView &&
      item?.isMaterial !== false &&
      !item?.postMediaId
    ) {
      recordView(item.id).catch((err) => console.error("Failed to record view", err));
    }
  }, [open, item?.id, recordMaterialView, item?.isMaterial, item?.postMediaId, recordView]);

  if (!item) return null;

  const rawUrl = item.fileUrl || item.mediaUrl || item.url;
  const fileName = item.fileName || item.name || item.title || 'Tài liệu';
  const resolvedUrl = getImageUrl(rawUrl);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full min-w-0 pr-2">
          <h2
            className="text-[18px] sm:text-[20px] leading-[26px] font-semibold truncate min-w-0 mr-3"
            title={fileName}
          >
            {fileName}
          </h2>
          {resolvedUrl && (
            <div className="flex items-center gap-1 shrink-0">
              <IconButton
                as="a"
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="xs"
                title="Mở trong tab mới"
                className="text-gray-600 hover:text-black"
              >
                <ExternalLink size={16} />
              </IconButton>
              <IconButton
                as="a"
                href={resolvedUrl}
                download={fileName}
                variant="ghost"
                size="xs"
                title="Tải xuống"
                className="text-gray-600 hover:text-black"
              >
                <Download size={16} />
              </IconButton>
            </div>
          )}
        </div>
      }
      className="w-full h-full md:w-[90vw] md:max-w-5xl md:h-[90vh]"
      bodyClassName="p-0 flex-1 overflow-hidden bg-[#F3F3F3] flex flex-col"
      headerClassName="flex items-center justify-between p-4 border-b bg-white"
    >
      <FilePreview
        url={resolvedUrl}
        fileName={fileName}
        className="w-full h-full"
      />
    </Modal>
  );
};

export default FilePreviewModal;
