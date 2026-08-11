import React from 'react';
import { MoreVertical, Star, Download, Share2, Edit2, FolderInput, StarOff, Settings, Trash2 } from 'lucide-react';
import Dropdown from '@/shared/components/ui/Dropdown';

const FileItem = ({ title, size, date, isPublic, isStarred, onShare, onDetails, onClick, layout = 'grid' }) => {
  const isList = layout === 'list';

  return (
    <div
      className={`border rounded-xl p-4 flex ${isList ? 'flex-row items-center w-full' : 'flex-col w-[264px]'} bg-[#F9F9F9] border-[#E3BEBA] cursor-pointer hover:shadow-faq-card hover:border-[#6E0009] hover:bg-[#FFDAD6] transition-all`}
      onClick={onClick}
    >
      {isList ? (
        // List Layout 
        <>
          <div className="w-12 h-12 rounded-lg bg-[#F3F3F3] mr-4 shrink-0 flex items-center justify-center">
          </div>
          <div className="flex-1 flex items-center justify-between min-w-0">
            <div className="flex flex-col truncate pr-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-[#1A1C1C] text-base truncate" title={title}>{title}</h3>
                {isStarred && <Star className="w-4 h-4 text-[#FF9C4F] fill-[#FF9C4F] shrink-0" />}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#5B403E]">{size} • {date}</p>
                {isPublic && (
                  <span className="text-[10px] px-2.5 py-0.5 bg-[#FFDDAF] text-[#281800] rounded-full font-semibold">
                    Công khai
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center">
              <Dropdown
                align="right"
                dropdownClassName="w-56"
                maxHeightClass="max-h-[360px]"
                onChange={(val) => {
                  if (val === 'share' && onShare) onShare();
                  if (val === 'settings' && onDetails) onDetails();
                }}
                options={[
                  { value: 'download', label: 'Tải xuống', icon: <Download className="w-4 h-4" /> },
                  { value: 'share', label: 'Chia sẻ', icon: <Share2 className="w-4 h-4" /> },
                  { value: 'rename', label: 'Đổi tên', icon: <Edit2 className="w-4 h-4" /> },
                  { value: 'move', label: 'Di chuyển', icon: <FolderInput className="w-4 h-4" /> },
                  { value: 'unfavorite', label: 'Bỏ yêu thích', icon: <StarOff className="w-4 h-4" /> },
                  { value: 'settings', label: 'Chi tiết và Cài đặt', icon: <Settings className="w-4 h-4" /> },
                  {
                    value: 'delete',
                    label: <span className="text-[#BA1A1A]">Xóa</span>,
                    icon: <Trash2 className="w-4 h-4 text-[#BA1A1A]" />
                  },
                ]}
                trigger={(isOpen, selectedOption, toggleDropdown) => (
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown();
                    }}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              />
            </div>
          </div>
        </>
      ) : (
        // Grid Layout
        <>
          <div className="flex justify-between items-start mb-2">
            <div className="pt-1">
              {isStarred ? (
                <Star className="w-5 h-5 text-[#FF9C4F] fill-[#FF9C4F]" />
              ) : (
                <div className="w-5 h-5"></div>
              )}
            </div>

            <Dropdown
              align="left"
              dropdownClassName="w-56"
              maxHeightClass="max-h-[360px]"
              onChange={(val) => {
                if (val === 'share' && onShare) onShare();
                if (val === 'settings' && onDetails) onDetails();
              }}
              options={[
                { value: 'download', label: 'Tải xuống', icon: <Download className="w-4 h-4" /> },
                { value: 'share', label: 'Chia sẻ', icon: <Share2 className="w-4 h-4" /> },
                { value: 'rename', label: 'Đổi tên', icon: <Edit2 className="w-4 h-4" /> },
                { value: 'move', label: 'Di chuyển', icon: <FolderInput className="w-4 h-4" /> },
                { value: 'unfavorite', label: 'Bỏ yêu thích', icon: <StarOff className="w-4 h-4" /> },
                { value: 'settings', label: 'Chi tiết và Cài đặt', icon: <Settings className="w-4 h-4" /> },
                {
                  value: 'delete',
                  label: <span className="text-[#BA1A1A]">Xóa</span>,
                  icon: <Trash2 className="w-4 h-4 text-[#BA1A1A]" />
                },
              ]}
              trigger={(isOpen, selectedOption, toggleDropdown) => (
                <button
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown();
                  }}
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              )}
            />
          </div>

          <div className='space-y-3'>
            <div className={`h-32 rounded-xl flex items-center justify-center bg-[#F3F3F3]`}>
            </div>

            <div>
              <h3 className="font-semibold text-[#1A1C1C] text-base truncate" title={title}>{title}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-xs text-[#5B403E]">{size} • {date}</p>
                {isPublic && (
                  <span className="text-[10px] px-2.5 py-0.5 bg-[#FFDDAF] text-[#281800] rounded-full font-semibold">
                    Công khai
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
