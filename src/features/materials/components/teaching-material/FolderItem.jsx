import React from 'react';
import { Star, MoreVertical, Share2, Edit2, FolderInput, Trash2, FolderOpen, StarOff, Download } from 'lucide-react';
import { FcFolder } from 'react-icons/fc';
import Dropdown from '@/shared/components/ui/Dropdown';
import { IconButton } from '@/shared/components/ui/buttons';
import Checkbox from '@/shared/components/ui/inputs/Checkbox';
import { useLanguage } from '@/shared/context/LanguageContext';
import useLongPress from '../../hooks/useLongPress';

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
  onDownload,
  isSelected,
  isSelectionMode,
  onToggleSelect }) => {
  const { t } = useLanguage();
  const { handlers } = useLongPress({ isSelectionMode, onToggleSelect, onClick });

  return (
    <div
      {...handlers}
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
            {totalItems ? `${totalItems} ${updatedAt ? `• ${updatedAt}` : ''}` : updatedAt}
          </p>

        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <Dropdown
          align="left"
          dropdownClassName="w-56"
          maxHeightClass="max-h-[360px]"
          onChange={(val) => {
            if (val === 'download' && onDownload) onDownload();
            if (val === 'share' && onShare) onShare();
            if (val === 'rename' && onRename) onRename();
            if (val === 'move' && onMove) onMove();
            if ((val === 'bookmark' || val === 'unfavorite') && onBookmark) onBookmark();
            if (val === 'delete' && onDelete) onDelete();
          }}
          options={[
            { value: 'download', label: t.materials.download, icon: <Download className="w-4 h-4" /> },
            { value: 'share', label: t.materials.share, icon: <Share2 className="w-4 h-4" /> },
            { value: 'rename', label: t.materials.rename, icon: <Edit2 className="w-4 h-4" /> },
            { value: 'move', label: t.materials.move, icon: <FolderInput className="w-4 h-4" /> },
            { value: isBookmarked ? 'unfavorite' : 'bookmark', label: isBookmarked ? t.materials.unfavorite : t.materials.addToFavorites, icon: isBookmarked ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" /> },
            {
              value: 'delete',
              label: <span className="text-[#BA1A1A]">{t.materials.delete}</span>,
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
