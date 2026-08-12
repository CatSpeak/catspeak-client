import React from 'react';
import { FileText, Image as ImageIcon, Film, Music, FileSpreadsheet, FileIcon } from 'lucide-react';

const FilePreview = ({ url, fileName, isThumbnail = false, className = '' }) => {
  const getExtension = () => {
    if (fileName && fileName.includes('.')) {
      return fileName.split('.').pop().toLowerCase();
    }
    if (url && url.includes('.')) {
      const cleanUrl = url.split('?')[0];
      return cleanUrl.split('.').pop().toLowerCase();
    }
    return '';
  };

  const extension = getExtension();

  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension);
  const isVideo = ['mp4', 'webm', 'ogg'].includes(extension);
  const isAudio = ['mp3', 'wav', 'ogg'].includes(extension);
  const isPdf = extension === 'pdf';
  const isWord = ['doc', 'docx'].includes(extension);
  const isExcel = ['xls', 'xlsx', 'csv'].includes(extension);
  const isPowerpoint = ['ppt', 'pptx'].includes(extension);

  const isOffice = isWord || isExcel || isPowerpoint;

  // Render Placeholder Icon if no URL or if we want to skip iframe in thumbnail mode
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
      <div className={`flex flex-col items-center justify-center w-full h-full bg-[#F3F3F3] ${className}`}>
        <Icon className={`w-1/3 h-1/3 max-w-[64px] max-h-[64px] min-w-[24px] min-h-[24px] ${colorClass} opacity-80`} />
      </div>
    );
  };

  if (!url) {
    return renderPlaceholder();
  }

  if (isImage) {
    return (
      <div className={`flex items-center justify-center overflow-hidden bg-[#F3F3F3] ${className}`}>
        <img
          src={url}
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
        <video src={url} controls className="w-full h-full max-h-full object-contain" />
      </div>
    );
  }

  if (isAudio) {
    if (isThumbnail) return renderPlaceholder();
    return (
      <div className={`flex items-center justify-center bg-[#F3F3F3] p-4 ${className}`}>
        <audio src={url} controls className="w-full" />
      </div>
    );
  }

  if (isPdf) {
    if (isThumbnail) return renderPlaceholder();
    return (
      <iframe
        src={url}
        className={`w-full h-full border-none ${className}`}
        title={fileName}
      />
    );
  }

  if (isOffice) {
    if (isThumbnail) return renderPlaceholder();

    // Microsoft Office Online Viewer requires public URL
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

    return (
      <iframe
        src={officeViewerUrl}
        className={`w-full h-full border-none ${className}`}
        title={fileName}
      />
    );
  }

  // Fallback for unsupported types
  return renderPlaceholder();
};

export default FilePreview;
