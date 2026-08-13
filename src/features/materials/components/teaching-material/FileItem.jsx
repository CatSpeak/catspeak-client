import React from 'react';
import { MoreVertical, Star, Download, Share2, Edit2, FolderInput, StarOff, Settings, Trash2 } from 'lucide-react';
import Dropdown from '@/shared/components/ui/Dropdown';
import { IconButton } from '@/shared/components/ui/buttons';
import Checkbox from '@/shared/components/ui/inputs/Checkbox';
import { useLanguage } from '@/shared/context/LanguageContext';
import useLongPress from '../../hooks/useLongPress';

import FilePreview from '@/shared/components/ui/FilePreview';

const FileItem = ({
  title,
  size,
  date,
  fileUrl,
  isPublic,
  isBookmarked,
  onShare,
  onDetails,
  onClick,
  onDelete,
  onDownload,
  onRename,
  onMove,
  onBookmark,
  layout = 'grid',
  isSelected,
  isSelectionMode,
  onToggleSelect
}) => {
  const { t } = useLanguage();
  const isList = layout === 'list';
  const { handlers } = useLongPress({ isSelectionMode, onToggleSelect, onClick });

  return (
    <div
      className={`group relative border rounded-xl p-4 flex ${isList ? 'flex-row items-center w-full' : 'flex-col md:w-[264px]'} cursor-pointer transition-all select-none ${isSelected
        ? 'bg-[#FFDAD6] border-[#6E0009] shadow-faq-card'
        : 'bg-[#F9F9F9] border-[#E3BEBA] hover:bg-[#FFDAD6] hover:border-[#6E0009] hover:shadow-faq-card'
        }`}
      {...handlers}
    >
      {isList ? (
        // List Layout 
        <>
          <div className="relative w-12 h-12 mr-4 shrink-0">
            <div className="w-full h-full rounded-lg bg-[#F3F3F3] flex items-center justify-center overflow-hidden">
              <FilePreview url={fileUrl} fileName={title} isThumbnail={true} />
            </div>
            <div
              className={`absolute -top-2 -left-2 bg-white rounded flex items-center justify-center transition-opacity z-10 ${isSelected || isSelectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
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
                {isPublic && (
                  <span className="text-[10px] px-2.5 py-0.5 bg-[#FFDDAF] text-[#281800] rounded-full font-semibold">
                    {t.materials.public}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
              <Dropdown
                align="right"
                dropdownClassName="w-56"
                maxHeightClass="max-h-[360px]"
                onChange={(val) => {
                  if (val === 'share' && onShare) onShare();
                  if (val === 'settings' && onDetails) onDetails();
                  if (val === 'delete' && onDelete) onDelete();
                  if (val === 'download' && onDownload) onDownload();
                  if (val === 'rename' && onRename) onRename();
                  if (val === 'move' && onMove) onMove();
                  if ((val === 'bookmark' || val === 'unfavorite') && onBookmark) onBookmark();
                }}
                options={[
                  { value: 'download', label: t.materials.download, icon: <Download className="w-4 h-4" /> },
                  { value: 'share', label: t.materials.share, icon: <Share2 className="w-4 h-4" /> },
                  { value: 'rename', label: t.materials.rename, icon: <Edit2 className="w-4 h-4" /> },
                  { value: 'move', label: t.materials.move, icon: <FolderInput className="w-4 h-4" /> },
                  { value: isBookmarked ? 'unfavorite' : 'bookmark', label: isBookmarked ? t.materials.unfavorite : t.materials.addToFavorites, icon: isBookmarked ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" /> },
                  { value: 'settings', label: t.materials.detailsAndSettings, icon: <Settings className="w-4 h-4" /> },
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
        </>
      ) : (
        // Grid Layout
        <>
          <div className="flex justify-between items-center mb-2 relative">
            <div
              className={`absolute -top-2 -left-2 bg-white rounded flex items-center justify-center transition-opacity z-10 ${isSelected || isSelectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
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

            <div className="flex items-center">
              <div className="shrink-0 pt-1">
                {isBookmarked ? (
                  <Star className="w-5 h-5 text-[#FF9C4F] fill-[#FF9C4F]" />
                ) : (
                  <div className="w-5 h-5"></div>
                )}
              </div>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <Dropdown
                align="left"
                dropdownClassName="w-56"
                maxHeightClass="max-h-[360px]"
                onChange={(val) => {
                  if (val === 'share' && onShare) onShare();
                  if (val === 'settings' && onDetails) onDetails();
                  if (val === 'delete' && onDelete) onDelete();
                  if (val === 'download' && onDownload) onDownload();
                  if (val === 'rename' && onRename) onRename();
                  if (val === 'move' && onMove) onMove();
                  if ((val === 'bookmark' || val === 'unfavorite') && onBookmark) onBookmark();
                }}
                options={[
                  { value: 'download', label: t.materials.download, icon: <Download className="w-4 h-4" /> },
                  { value: 'share', label: t.materials.share, icon: <Share2 className="w-4 h-4" /> },
                  { value: 'rename', label: t.materials.rename, icon: <Edit2 className="w-4 h-4" /> },
                  { value: 'move', label: t.materials.move, icon: <FolderInput className="w-4 h-4" /> },
                  { value: isBookmarked ? 'unfavorite' : 'bookmark', label: isBookmarked ? t.materials.unfavorite : t.materials.addToFavorites, icon: isBookmarked ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" /> },
                  { value: 'settings', label: t.materials.detailsAndSettings, icon: <Settings className="w-4 h-4" /> },
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

          <div className='space-y-3'>
            <div className={`h-32 rounded-xl flex items-center justify-center overflow-hidden bg-[#F3F3F3]`}>
              <FilePreview url={fileUrl} fileName={title} isThumbnail={true} />
            </div>

            <div>
              <h3 className="font-semibold text-[#1A1C1C] text-base truncate" title={title}>{title}</h3>
              <div className="flex items-start gap-2 mt-1.5 flex-col md:flex-row md:items-center">
                <p className="text-xs text-[#5B403E]">{size} • {date}</p>
                {isPublic && (
                  <span className="text-[10px] px-2.5 py-0.5 bg-[#FFDDAF] text-[#281800] rounded-full font-semibold">
                    {t.materials.public}
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

export default FileItem;
