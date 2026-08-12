import React, { useRef } from 'react';
import { MoreVertical, Download, Share2, Edit2, FolderInput, Trash2, Bookmark, Star, StarOff, Settings } from 'lucide-react';
import FilePreview from '@/shared/components/ui/FilePreview';
import Dropdown from '@/shared/components/ui/Dropdown';
import { IconButton } from '@/shared/components/ui/buttons';
import Checkbox from '@/shared/components/ui/inputs/Checkbox';
import { useLanguage } from '@/shared/context/LanguageContext';

const ProfileFileItem = ({
  title,
  size,
  date,
  isPublic,
  fileUrl,
  isOwnProfile,
  isBookmarked,
  isList = false,
  onDownload,
  onShare,
  onRename,
  onMove,
  onDelete,
  onBookmark,
  onEdit,
  onClick,
  isSelected,
  isSelectionMode,
  onToggleSelect
}) => {
  const { t } = useLanguage();
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.button !== undefined) return;
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (!isSelectionMode && onToggleSelect) {
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }
        onToggleSelect();
      }
    }, 500);
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePointerLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e) => {
    if (isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (isSelectionMode) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect && onToggleSelect();
    } else {
      onClick && onClick(e);
    }
  };

  const renderDropdown = () => (
    <Dropdown
      align="left"
      dropdownClassName="w-56"
      maxHeightClass="max-h-[360px]"
      onChange={(val) => {
        if (val === 'download' && onDownload) onDownload();
        if (val === 'share' && onShare) onShare();
        if (val === 'rename' && onRename) onRename();
        if (val === 'edit' && onEdit) onEdit();
        if (val === 'move' && onMove) onMove();
        if (val === 'delete' && onDelete) onDelete();
        if (val === 'bookmark' && onBookmark) onBookmark();
      }}
      options={
        isOwnProfile
          ? [
            { value: 'download', label: t.materials.download, icon: <Download className="w-4 h-4" /> },
            { value: 'share', label: t.materials.share, icon: <Share2 className="w-4 h-4" /> },
            { value: 'rename', label: t.materials.rename, icon: <Edit2 className="w-4 h-4" /> },
            { value: 'edit', label: t.materials.edit, icon: <Settings className="w-4 h-4" /> },
            { value: 'move', label: t.materials.move, icon: <FolderInput className="w-4 h-4" /> },
            { value: 'delete', label: <span className="text-[#BA1A1A]">{t.materials.delete}</span>, icon: <Trash2 className="w-4 h-4 text-[#BA1A1A]" /> },
          ]
          : [
            { value: 'download', label: t.materials.download, icon: <Download className="w-4 h-4" /> },
            { value: 'share', label: t.materials.share, icon: <Share2 className="w-4 h-4" /> },
            { value: 'bookmark', label: t.materials.bookmark, icon: <Bookmark className="w-4 h-4" /> }
          ]
      }
      trigger={(isOpen, selectedOption, toggleDropdown) => (
        <IconButton
          variant="iconOnly"
          className="w-6 h-6 text-gray-500 hover:text-[#6E0009]"
          onClick={(e) => {
            e.stopPropagation();
            toggleDropdown();
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </IconButton>
      )}
    />
  );

  return (
    <div
      className={`group relative border rounded-xl p-4 flex ${isList ? 'flex-row items-center w-full' : 'flex-col md:w-[264px]'} cursor-pointer transition-all select-none ${
        isSelected
          ? 'bg-[#FFDAD6] border-[#6E0009] shadow-faq-card'
          : 'bg-white border-[#E3BEBA] hover:bg-[#FFDAD6] hover:border-[#6E0009] hover:shadow-faq-card'
      }`}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={(e) => {
        if (isLongPressRef.current || isSelectionMode) {
          e.preventDefault();
        }
      }}
    >
      {isList ? (
        <>
          <div className="relative w-12 h-12 mr-4 shrink-0">
            <div className="w-full h-full rounded-lg bg-[#F3F3F3] flex items-center justify-center overflow-hidden">
              <FilePreview url={fileUrl} fileName={title} isThumbnail={true} />
            </div>
            <div
              className={`absolute -top-2 -left-2 bg-white rounded flex items-center justify-center transition-opacity z-10 ${
                isSelected || isSelectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect && onToggleSelect();
              }}
            >
              <Checkbox
                checked={isSelected}
                readOnly
                className="w-4 h-4 pointer-events-none"
              />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-between min-w-0">
            <div className="flex flex-col truncate pr-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-[#1A1C1C] text-base truncate" title={title}>{title}</h3>
                {isBookmarked && <Star className="w-4 h-4 text-[#FF9C4F] fill-[#FF9C4F] shrink-0" />}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#5B403E]">{size} • {date}</p>
                {isPublic ? (
                  <span className="text-[10px] px-2 py-0.5 bg-[#E6F4EA] text-[#137333] rounded-full font-semibold">{t.materials.public}</span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 bg-[#F1F3F4] text-[#5F6368] rounded-full font-semibold">{t.materials.private}</span>
                )}
              </div>
            </div>
            <div className="shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
              {renderDropdown()}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2 relative">
            <div
              className={`transition-opacity z-10 ${
                isSelected || isSelectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect && onToggleSelect();
              }}
            >
              <Checkbox
                checked={isSelected}
                readOnly
                className="w-5 h-5 pointer-events-none"
              />
            </div>
            <div className="shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
              {renderDropdown()}
            </div>
          </div>

          <div className='space-y-3'>
            <div className={`relative h-32 rounded-xl flex items-center justify-center overflow-hidden bg-[#F3F3F3]`}>
              <FilePreview url={fileUrl} fileName={title} isThumbnail={true} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#1A1C1C] text-base truncate" title={title}>{title}</h3>
                {isBookmarked && <Star className="w-4 h-4 text-[#FF9C4F] fill-[#FF9C4F] shrink-0" />}
              </div>
              <div className="flex items-start gap-2 mt-1.5 flex-col md:flex-row md:items-center">
                <p className="text-xs text-[#5B403E]">{size} • {date}</p>
              </div>
              <div className="mt-2">
                {isPublic ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4EA] text-[#137333]">
                    {t.materials.public}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F3F4] text-[#5F6368]">
                    {t.materials.private}
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileFileItem;
