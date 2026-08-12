import React, { useRef } from 'react';
import { MoreVertical, FolderOpen, Share2, Edit2, FolderInput, Trash2, Star, StarOff } from 'lucide-react';
import { FcFolder } from 'react-icons/fc';
import Dropdown from '@/shared/components/ui/Dropdown';
import { IconButton } from '@/shared/components/ui/buttons';
import Checkbox from '@/shared/components/ui/inputs/Checkbox';

const FolderItem = ({
  title,
  totalItems,
  updatedAt,
  isBookmarked,
  onDelete,
  onClick,
  onShare,
  onRename,
  onMove,
  onBookmark,
  isSelected,
  isSelectionMode,
  onToggleSelect }) => {

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
      className={`relative group border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all select-none ${isSelected
        ? 'bg-[#FFDAD6] border-[#6E0009] shadow-faq-card'
        : 'bg-[#F9F9F9] border-[#E3BEBA] hover:bg-[#FFDAD6] hover:border-[#6E0009] hover:shadow-faq-card'
        }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="relative">
          <FcFolder className="text-4xl" />
          <div
            className={`absolute -top-1 -left-1 bg-white rounded flex items-center justify-center transition-opacity z-10 ${isSelected || isSelectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
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
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#1A1C1C] text-base">{title}</h3>
            {isBookmarked && <Star className="w-4 h-4 text-[#FF9C4F] fill-[#FF9C4F]" />}
          </div>
          <p className="text-sm text-[#5B403E]">
            {totalItems} {updatedAt ? `• ${updatedAt}` : ''}
          </p>

        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <Dropdown
          align="left"
          dropdownClassName="w-56"
          maxHeightClass="max-h-[360px]"
          onChange={(val) => {
            if (val === 'open' && onClick) onClick();
            if (val === 'share' && onShare) onShare();
            if (val === 'rename' && onRename) onRename();
            if (val === 'move' && onMove) onMove();
            if ((val === 'bookmark' || val === 'unfavorite') && onBookmark) onBookmark();
            if (val === 'delete' && onDelete) onDelete();
          }}
          options={[
            { value: 'open', label: 'Mở', icon: <FolderOpen className="w-4 h-4" /> },
            { value: 'share', label: 'Chia sẻ', icon: <Share2 className="w-4 h-4" /> },
            { value: 'rename', label: 'Đổi tên', icon: <Edit2 className="w-4 h-4" /> },
            { value: 'move', label: 'Di chuyển', icon: <FolderInput className="w-4 h-4" /> },
            { value: isBookmarked ? 'unfavorite' : 'bookmark', label: isBookmarked ? 'Bỏ yêu thích' : 'Thêm vào yêu thích', icon: isBookmarked ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" /> },
            {
              value: 'delete',
              label: <span className="text-[#BA1A1A]">Xóa</span>,
              icon: <Trash2 className="w-4 h-4 text-[#BA1A1A]" />
            },
          ]}
          trigger={(isOpen, selectedOption, toggleDropdown) => (
            <IconButton
              variant="iconOnly"
              className='w-4 h-4'
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown();
              }}
            >
              <MoreVertical className="w-4 h-4 hover:text-[#6E0009]" />
            </IconButton>
          )}
        />
      </div>
    </div>

  );
};

export default FolderItem;
