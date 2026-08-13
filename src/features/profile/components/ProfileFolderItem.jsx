import React, { useRef } from 'react';
import { FcFolder } from 'react-icons/fc';
import { Star, MoreVertical, Share2, Edit2, FolderInput, Trash2, Bookmark, FolderOpen, StarOff, Download } from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import Dropdown from '@/shared/components/ui/Dropdown';
import { IconButton } from '@/shared/components/ui/buttons';
import Checkbox from '@/shared/components/ui/inputs/Checkbox';

const ProfileFolderItem = ({
  title,
  totalItems,
  updatedAt,
  isPublic,
  isOwnProfile,
  onClick,
  onShare,
  onRename,
  onMove,
  onDelete,
  onDownload,
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
        if (val === 'move' && onMove) onMove();
        if (val === 'delete' && onDelete) onDelete();
      }}
      options={
        isOwnProfile
          ? [
            { value: 'download', label: t.materials.download, icon: <Download className="w-4 h-4" /> },
            { value: 'share', label: t.materials.share, icon: <Share2 className="w-4 h-4" /> },
            { value: 'rename', label: t.materials.rename, icon: <Edit2 className="w-4 h-4" /> },
            { value: 'move', label: t.materials.move, icon: <FolderInput className="w-4 h-4" /> },
            {
              value: 'delete',
              label: <span className="text-[#BA1A1A]">{t.materials.delete}</span>,
              icon: <Trash2 className="w-4 h-4 text-[#BA1A1A]" />
            },
          ]
          : [
            { value: 'download', label: t.materials.download, icon: <Download className="w-4 h-4" /> },
            { value: 'share', label: t.materials.share, icon: <Share2 className="w-4 h-4" /> },
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
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={(e) => {
        if (isLongPressRef.current || isSelectionMode) {
          e.preventDefault();
        }
      }}
      className={`relative group border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all select-none ${isSelected
        ? 'bg-[#FFDAD6] border-[#6E0009] shadow-faq-card'
        : 'bg-white border-[#E3BEBA] hover:bg-[#FFDAD6] hover:border-[#6E0009] hover:shadow-faq-card'
        }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <FcFolder className="text-4xl shrink-0 mt-0.5" />
            <div
              className={`absolute -top-1 -left-1 bg-white rounded flex items-center justify-center transition-opacity z-10 ${isSelected || isSelectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
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
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#1A1C1C] text-[15px] line-clamp-2 pr-4">{title}</h3>
            </div>
            <p className="text-xs text-[#5B403E] mt-1">{t.materials.itemsUpdatedInfo.replace('{{count}}', totalItems).replace('{{date}}', updatedAt)}</p>
          </div>
        </div>
        <div className="shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
          {renderDropdown()}
        </div>
      </div>

      <div className="mt-3">
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
  );
};

export default ProfileFolderItem;
