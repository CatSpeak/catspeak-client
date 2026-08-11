import React from 'react';
import { X, FileText, Image, Video, File } from 'lucide-react';
import ProgressBar from '@/shared/components/ui/ProgressBar';
import { IconButton } from '@/shared/components/ui/buttons';

const getFileIcon = (type) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-600" />;
    case 'image':
      return <Image className="w-5 h-5 text-gray-500" />;
    case 'video':
      return <Video className="w-5 h-5 text-blue-500" />;
    default:
      return <File className="w-5 h-5 text-gray-500" />;
  }
};

const formatSize = (bytes) => {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

const UploadItem = ({
  name,
  sizeBytes,
  uploadedBytes,
  progress,
  status,
  type,
  onCancel
}) => {
  const isWaiting = status === 'waiting';

  return (
    <div className={`border rounded-xl p-3 flex items-center gap-4 transition-colors ${isWaiting ? 'border-[#E2E2E2] bg-[#F9F9F9]' : 'border-[#E2E2E2] bg-[#F9F9F9]'}`}>
      <div className={`w-10 h-10 bg-[#EEEEEE] rounded-xl flex items-center justify-center shrink-0`}>
        {getFileIcon(type)}
      </div>

      <div className={`flex-1 min-w-0 ${isWaiting ? 'opacity-50' : ''}`}>
        {isWaiting ? (
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#1A1C1C] truncate">{name}</span>
              <span className="text-xs text-[#5B403E] mt-0.5">{formatSize(sizeBytes)}</span>
            </div>
            <span className="text-xs text-[#5B403E]">Đang chờ...</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-[#5B403E] truncate">{name}</span>
              <span className="text-xs text-[#5B403E]">
                {progress}% ({formatSize(uploadedBytes)} / {formatSize(sizeBytes)})
              </span>
            </div>
            <ProgressBar progress={progress} heightClass="h-1.5" colorClass="bg-[#990011]" />
          </>
        )}
      </div>

      <IconButton
        variant='iconOnly'
        onClick={onCancel}
      >
        <X className="w-4 h-4" />
      </IconButton>
    </div>
  );
};

export default UploadItem;
