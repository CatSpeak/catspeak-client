import React from 'react';
import { FileText, Image as ImageIcon, Film, Music, FileSpreadsheet, FileIcon, Download, Loader2 } from 'lucide-react';
import { getImageUrl } from '@/shared/utils/imageUtils';
import { downloadAuthenticatedFile, useAuthenticatedMediaUrl } from '@/shared/utils/authenticatedMedia';

const FilePreview = ({ url, fileName, isThumbnail = false, className = '' }) => {
  const resolvedInputUrl = getImageUrl(url);
  const { url: mediaUrl, isLoading: isMediaLoading } = useAuthenticatedMediaUrl(
    resolvedInputUrl,
  );

  const getExtension = () => {
    if (fileName && fileName.includes('.')) {
      return fileName.split('.').pop().toLowerCase();
    }
    if (resolvedInputUrl && resolvedInputUrl.includes('.')) {
      const cleanUrl = resolvedInputUrl.split('?')[0];
      return cleanUrl.split('.').pop().toLowerCase();
    }
    return '';
  };

  const extension = getExtension();

  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension);
  const isVideo = ['mp4', 'webm', 'ogg'].includes(extension);
  const isAudio = ['mp3', 'wav', 'ogg'].includes(extension);
  const isPdf = extension === 'pdf';
  const isWord = ['doc', 'docx'].includes(extension);
  const isExcel = ['xls', 'xlsx', 'csv'].includes(extension);
  const isPowerpoint = ['ppt', 'pptx'].includes(extension);

  const isOffice = isWord || isExcel || isPowerpoint;

  const renderPlaceholder = () => {
    let Icon = FileIcon;
    let colorClass = 'text-[#5B403E]';

    if (isImage) { Icon = ImageIcon; colorClass = 'text-blue-500'; }
    else if (isVideo) { Icon = Film; colorClass = 'text-purple-500'; }
    else if (isAudio) { Icon = Music; colorClass = 'text-yellow-500'; }
    else if (isPdf) { Icon = FileText; colorClass = 'text-red-500'; }
    else if (isWord) { Icon = FileText; colorClass = 'text-blue-600'; }
    else if (isExcel) { Icon = FileSpreadsheet; colorClass = 'text-green-600'; }
    else if (isPowerpoint) { Icon = FileText; colorClass = 'text-orange-500'; }

    return (
      <div className={`flex flex-col items-center justify-center w-full h-full bg-[#F3F3F3] dark:bg-[#222222] ${className}`}>
        <Icon className={`w-1/3 h-1/3 max-w-[64px] max-h-[64px] min-w-[24px] min-h-[24px] ${colorClass} opacity-80`} />
      </div>
    );
  };

  if (!resolvedInputUrl) {
    return renderPlaceholder();
  }

  if (isOffice) {
    if (isThumbnail) return renderPlaceholder();
    return (
      <div className={`flex flex-col items-center justify-center gap-3 p-6 bg-[#F3F3F3] dark:bg-[#222222] text-center ${className}`}>
        {renderPlaceholder()}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-xs">
            {fileName || 'Document'}
          </p>
          <button
            type="button"
            onClick={() => downloadAuthenticatedFile(resolvedInputUrl, fileName || 'document')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#990011] hover:bg-[#80000e] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download to view safely
          </button>
        </div>
      </div>
    );
  }

  if (isMediaLoading || !mediaUrl) {
    if (isThumbnail) return renderPlaceholder();
    return (
      <div className={`flex items-center justify-center w-full h-full bg-[#F3F3F3] dark:bg-[#222222] ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isImage) {
    return (
      <div className={`flex items-center justify-center overflow-hidden bg-[#F3F3F3] dark:bg-[#222222] ${className}`}>
        <img
          src={mediaUrl}
          alt={fileName || 'Preview'}
          className={`w-full h-full ${isThumbnail ? 'object-cover' : 'object-contain'}`}
          loading="lazy"
        />
      </div>
    );
  }

  if (isVideo) {
    if (isThumbnail) return renderPlaceholder();
    return (
      <div className={`flex items-center justify-center bg-black ${className}`}>
        <video src={mediaUrl} controls className="w-full h-full max-h-full object-contain" />
      </div>
    );
  }

  if (isAudio) {
    if (isThumbnail) return renderPlaceholder();
    return (
      <div className={`flex items-center justify-center bg-[#F3F3F3] dark:bg-[#222222] p-4 ${className}`}>
        <audio src={mediaUrl} controls className="w-full" />
      </div>
    );
  }

  if (isPdf) {
    if (isThumbnail) return renderPlaceholder();
    return (
      <iframe
        src={mediaUrl}
        className={`w-full h-full border-none ${className}`}
        title={fileName}
      />
    );
  }

  return renderPlaceholder();
};

export default FilePreview;
