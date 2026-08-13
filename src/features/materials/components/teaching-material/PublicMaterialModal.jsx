import React, { useState, useEffect } from 'react';
import Modal from '@/shared/components/ui/Modal';
import {
  FileText, X, Download, Eye, Info, ChevronLeft, Folder,
  User, Bookmark, Calendar, HardDrive
} from 'lucide-react';
import { IconButton, PillButton } from '@/shared/components/ui/buttons';
import FilePreview from '@/shared/components/ui/FilePreview';
import { useLanguage } from '@/shared/context/LanguageContext';
import FileDetailModal from './FileDetailModal';
import SaveSharedMaterialModal from './SaveSharedMaterialModal';
import { useRecordMaterialDownloadMutation, useRecordMaterialViewMutation } from '@/store/api/materialApi';
import { useTimezone } from "@/shared/hooks/useTimezone";
import { formatSize } from "../../utils/materialUtils";
import toast from 'react-hot-toast';


const PublicMaterialModal = ({ open, onClose, item, isOwner, onDelete, onMove }) => {
  const { t } = useLanguage();
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [recordDownload] = useRecordMaterialDownloadMutation();
  const [recordView] = useRecordMaterialViewMutation();
  const { formatDate } = useTimezone();

  useEffect(() => {
    if (open && item?.id && !isOwner) {
      recordView(item.id).catch(err => console.error("Failed to record view", err));
    }
  }, [open, item?.id, isOwner, recordView]);

  // If the user is the owner, fallback to FileDetailModal for full edit permissions
  if (isOwner) {
    return (
      <FileDetailModal
        open={open}
        onClose={onClose}
        item={item}
        onDelete={onDelete}
        onMove={onMove}
      />
    );
  }

  if (!item) return null;

  const isFolder = item && (item.type === 'folder' || item.isFolder || item.folders !== undefined || item.subFolderCount !== undefined || (!item.fileUrl && !item.contentType));

  const handleDownload = async () => {
    if (item.fileUrl) {
      recordDownload(item.id);
      try {
        const response = await fetch(item.fileUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = item.fileName || item.name || 'download';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed, falling back to new tab:', error);
        window.open(item.fileUrl, '_blank');
      }
    } else if (isFolder) {
      // Future: Download folder as zip
      toast(t.materials.folderDownloadDev || "Chức năng tải thư mục đang được phát triển.");
    }
  };

  const handleSave = () => {
    setIsSaveModalOpen(true);
  };

  // Mock folder data for UI purpose
  const mockFolderItems = [
    { id: 1, name: 'Bài 1: Giới thiệu.pdf', type: 'file', size: 1024500, date: '2024-01-15' },
    { id: 2, name: 'Tài liệu tham khảo', type: 'folder', size: 0, date: '2024-01-16' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={null}
      showCloseButton={false}
      className="md:max-w-[1200px] w-full h-[100dvh] md:h-[640px] !m-0 md:!m-4 !rounded-none md:!rounded-2xl"
      bodyClassName="p-0 flex flex-col md:flex-row h-full overflow-hidden"
    >
      {/* Left Column - Preview or Folder List */}
      <div className={`${showMobileDetails ? 'hidden md:flex' : 'flex'} h-full md:h-auto md:flex-1 flex-col bg-white shrink-0 md:shrink min-w-0`}>
        {/* Header Left */}
        <div className="h-[56px] md:h-[64px] px-4 border-b border-[#E3BEBA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-[#E3BEBA]/50 rounded flex items-center justify-center text-[#6E0009] shrink-0">
              {isFolder ? <Folder className="w-5 h-5 fill-current" /> : <FileText className="w-5 h-5" />}
            </div>
            <span className="font-semibold text-[#1A1C1C] text-base md:text-lg truncate">
              {item.fileName || item.name}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <IconButton variant='ghost' onClick={() => setShowMobileDetails(true)} className="md:hidden">
              <Info className="w-5 h-5 text-[#1A1C1C]" />
            </IconButton>
            <IconButton variant='ghost' onClick={onClose} className="md:hidden">
              <X className="w-5 h-5 text-[#1A1C1C]" />
            </IconButton>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 relative">
          {!isFolder ? (
            <div className="flex-1 flex items-center justify-center h-full w-full">
              <FilePreview url={item.fileUrl} fileName={item.fileName || item.name} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Folder List UI */}
              <div className="bg-white rounded-xl border border-[#E3BEBA] shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-[#F9F9F9] border-b border-[#E3BEBA]">
                        <th className="py-3 px-4 font-semibold text-sm text-[#5B403E] whitespace-nowrap">{t.materials.nameColumn || "Tên"}</th>
                        <th className="py-3 px-4 font-semibold text-sm text-[#5B403E] whitespace-nowrap">{t.materials.typeColumn || "Loại"}</th>
                        <th className="py-3 px-4 font-semibold text-sm text-[#5B403E] whitespace-nowrap">{t.materials.sizeColumn || "Kích thước"}</th>
                        <th className="py-3 px-4 font-semibold text-sm text-[#5B403E] whitespace-nowrap">{t.materials.uploadDate || "Ngày đăng"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {((item.folders || item.subFolders || item.materials)
                        ? [...(item.folders || item.subFolders || []).map(f => ({ ...f, isFolder: true, id: f.folderId || f.id, name: f.folderName || f.name })),
                        ...(item.materials || []).map(m => ({ ...m, isFolder: false, id: m.materialId || m.id }))]
                        : (item.children || mockFolderItems)).map((child) => (
                          <tr key={child.id} className="border-b border-[#E3BEBA]/50 hover:bg-[#FFF5F5] cursor-pointer transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {child.type === 'folder' || child.isFolder ? (
                                  <Folder className="w-5 h-5 text-[#8e1115] fill-current shrink-0" />
                                ) : (
                                  <FileText className="w-5 h-5 text-[#5B403E] shrink-0" />
                                )}
                                <span className="font-medium text-[#1A1C1C] truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
                                  {child.name || child.fileName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-[#5B403E] whitespace-nowrap">
                              {child.type === 'folder' || child.isFolder ? (t.materials.folder || "Thư mục") : ((child.name || child.fileName)?.split('.').pop()?.toUpperCase() || (t.materials.file || "Tài liệu"))}
                            </td>
                            <td className="py-3 px-4 text-sm text-[#5B403E] whitespace-nowrap">
                              {child.type === 'folder' || child.isFolder ? '-' : formatSize(child.size || child.fileSize || 0)}
                            </td>
                            <td className="py-3 px-4 text-sm text-[#5B403E] whitespace-nowrap">
                              {formatDate(child.uploadedAt || child.createdAt)}
                            </td>
                          </tr>
                        ))}
                      {(!item.children && mockFolderItems.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-[#5B403E]">
                            {t.materials.emptyFolder || "Thư mục trống"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Details & Info */}
      <div className={`${showMobileDetails ? 'flex' : 'hidden md:flex'} flex-1 md:flex-none w-full md:w-[32%] flex-col border-t md:border-t-0 md:border-l border-[#E3BEBA] bg-white overflow-hidden`}>
        {/* Header Right */}
        <div className="h-[56px] md:h-[64px] px-4 md:px-6 border-b border-[#E3BEBA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <IconButton variant='ghost' onClick={() => setShowMobileDetails(false)} className="md:hidden -ml-2">
              <ChevronLeft className="w-5 h-5 text-[#1A1C1C]" />
            </IconButton>
            <span className="font-semibold text-[#1A1C1C] text-base md:text-lg">{t.materials.detailsInfo || "Thông tin chi tiết"}</span>
          </div>
          <IconButton variant='ghost' onClick={onClose} className="hidden md:flex">
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Scrollable Info */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-5 md:gap-6">

          {/* Owner Info */}
          <div>
            <h4 className="text-sm font-bold text-[#5B403E] mb-2 uppercase tracking-wide">{t.materials.sharedBy || "Người chia sẻ"}</h4>
            <div className="bg-[#F9F9F9] border border-[#E3BEBA] rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E3BEBA]/50 flex items-center justify-center shrink-0">
                {(item.owner?.avatarUrl || item.ownerAvatar) ? (
                  <img src={item.owner?.avatarUrl || item.ownerAvatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User className="w-6 h-6 text-[#6E0009]" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#1A1C1C] text-lg">{item.owner?.name || item.ownerName || item.author || t.materials.anonymousUser || "Người dùng ẩn danh"}</span>
              </div>
            </div>
          </div>

          <div className="border border-[#E3BEBA] w-full" />

          {/* File/Folder Info */}
          <div>
            <h4 className="text-sm font-bold text-[#5B403E] mb-2 uppercase tracking-wide">
              {isFolder ? (t.materials.folderInfo || 'Thông tin thư mục') : (t.materials.fileInfo || 'Thông tin tệp')}
            </h4>
            <div className="bg-[#F9F9F9] border border-[#E3BEBA] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-[#5B403E]">
                  <FileText className="w-4 h-4" />
                  <span>{t.materials.typeColumn || "Loại"}</span>
                </div>
                <span className="font-medium text-[#1A1C1C]">
                  {isFolder ? 'Thư mục' : (item.fileName?.split('.').pop().toUpperCase() || item.fileType?.toUpperCase() || t.materials.file || 'Tệp')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-[#5B403E]">
                  <HardDrive className="w-4 h-4" />
                  <span>{t.materials.sizeColumn || "Kích thước"}</span>
                </div>
                <span className="font-medium text-[#1A1C1C]">
                  {isFolder ? '-' : formatSize(item.fileSize || item.size || item.sizeBytes)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-[#5B403E]">
                  <Calendar className="w-4 h-4" />
                  <span>{t.materials.shareDate || "Ngày chia sẻ"}</span>
                </div>
                <span className="font-medium text-[#1A1C1C]">
                  {item.uploadedAt || item.createdAt ? formatDate(item.uploadedAt || item.createdAt) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-[#E3BEBA] w-full" />

          {/* Stats */}
          <div>
            <h4 className="text-sm font-bold text-[#5B403E] mb-2 uppercase tracking-wide">{t.materials.statistics || "Thống kê"}</h4>
            <div className="flex gap-3">
              <div className="flex-1 bg-[#F9F9F9] border border-[#E3BEBA] rounded-xl flex flex-col items-center justify-center p-2.5 md:p-3">
                <Eye className="w-4 h-4 md:w-5 md:h-5 text-[#6E0009] mb-1" />
                <span className="text-lg md:text-xl font-bold text-[#1A1C1C]">{item.viewCount || 0}</span>
                <span className="text-xs md:text-xs text-[#5B403E] font-medium mt-0.5">{t.materials.views || "Lượt xem"}</span>
              </div>
              <div className="flex-1 bg-[#F9F9F9] border border-[#E3BEBA] rounded-xl flex flex-col items-center justify-center p-2.5 md:p-3">
                <Download className="w-4 h-4 md:w-5 md:h-5 text-[#6E0009] mb-1" />
                <span className="text-lg md:text-xl font-bold text-[#1A1C1C]">{item.downloadCount || 0}</span>
                <span className="text-xs md:text-xs text-[#5B403E] font-medium mt-0.5">{t.materials.downloads || "Lượt tải"}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-4 flex flex-col gap-3 shrink-0">
            {(item.allowDownload !== false && item.downloadAllowed !== false) && (
              <div className='flex gap-3'>
                <PillButton
                  startIcon={<Download className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  className="flex-1 !text-sm"
                  roundedClass="rounded-xl"
                  onClick={handleDownload}
                >
                  {t.materials.download || "Tải xuống"}
                </PillButton>
                <PillButton
                  startIcon={<Bookmark className="w-4 h-4 md:w-5 md:h-5" />}
                  variant="outline"
                  className="flex-1 !text-sm"
                  roundedClass="rounded-xl"
                  textColor="#5B403E"
                  borderColor="#E3BEBA"
                  onClick={handleSave}
                >
                  {t.materials.bookmark || "Lưu"}
                </PillButton>
              </div>
            )}
          </div>

        </div>
      </div>

      <SaveSharedMaterialModal
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        item={item}
        onSuccess={() => {
          setIsSaveModalOpen(false);
        }}
      />
    </Modal>
  );
};

export default PublicMaterialModal;