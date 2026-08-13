import React from 'react';
import { X, FileText, Image, Video, File, Check } from 'lucide-react';
import ProgressBar from '@/shared/components/ui/ProgressBar';
import { IconButton } from '@/shared/components/ui/buttons';
import { useLanguage } from '@/shared/context/LanguageContext';
import { formatSize } from '../../utils/materialUtils';

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


const UploadItem = ({
  name,
  sizeBytes,
  uploadedBytes,
  progress,
  status,
  type,
  onCancel
}) => {
  const { t } = useLanguage();
  // status: 'reading' | 'ready' | 'uploading' | 'success' | 'error'

  return (
    <div className={`border rounded-xl p-3 flex items-center gap-4 transition-colors border-[#E2E2E2] bg-[#F9F9F9]`}>
      <div className={`w-10 h-10 bg-[#EEEEEE] rounded-xl flex items-center justify-center shrink-0`}>
        {getFileIcon(type)}
      </div>

      <div className="flex-1 min-w-0">
        {status === 'reading' ? (
          <>
            <div className="flex justify-between items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-[#5B403E] truncate min-w-0">{name}</span>
              <span className="text-xs text-[#5B403E] shrink-0 whitespace-nowrap">
                {progress}% ({formatSize(sizeBytes * progress / 100)} / {formatSize(sizeBytes)})
              </span>
            </div>
            <ProgressBar progress={progress} heightClass="h-1.5" colorClass="bg-[#5B403E]" />
          </>
        ) : status === 'ready' ? (
          <div className="flex justify-between items-center gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-[#1A1C1C] truncate">{name}</span>
              <span className="text-xs text-[#5B403E] mt-0.5">{formatSize(sizeBytes)}</span>
            </div>
            <div className="flex items-center gap-1 text-green-600 shrink-0">
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{t.materials.ready}</span>
            </div>
          </div>
        ) : status === 'uploading' ? (
          <>
            <div className="flex justify-between items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-[#5B403E] truncate min-w-0">{name}</span>
              <span className="text-xs text-[#5B403E] shrink-0 whitespace-nowrap">
                {progress}% ({formatSize(uploadedBytes)} / {formatSize(sizeBytes)})
              </span>
            </div>
            <ProgressBar progress={progress} heightClass="h-1.5" colorClass="bg-[#990011]" />
          </>
        ) : status === 'success' ? (
          <div className="flex justify-between items-center gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-[#1A1C1C] truncate">{name}</span>
              <span className="text-xs text-green-600 mt-0.5">{formatSize(sizeBytes)}</span>
            </div>
            <span className="text-xs text-green-600 font-medium shrink-0">{t.materials.complete}</span>
          </div>
        ) : status === 'error' ? (
          <div className="flex justify-between items-center gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-[#1A1C1C] truncate">{name}</span>
              <span className="text-xs text-red-500 mt-0.5">{t.materials.uploadErrorStatus}</span>
            </div>
            <span className="text-xs text-red-500 font-medium shrink-0">{t.materials.failed}</span>
          </div>
        ) : null}
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
