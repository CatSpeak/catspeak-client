import React from 'react';
import { MoreVertical, FolderOpen, Share2, Edit2, FolderInput, Trash2 } from 'lucide-react';
import { FcFolder } from 'react-icons/fc';
import Dropdown from '@/shared/components/ui/Dropdown';
import { IconButton } from '@/shared/components/ui/buttons';

const FolderItem = ({ title, totalItems, updatedAt, onDelete, onClick, onShare, onRename, onMove }) => {

  return (
    <div onClick={onClick} className="border border-[#E3BEBA] rounded-xl p-3 flex items-center justify-between bg-[#F9F9F9] cursor-pointer hover:shadow-faq-card hover:border-[#6E0009] hover:bg-[#FFDAD6]">
      <div className="flex items-center gap-3 flex-1">
        <FcFolder className="text-4xl" />
        <div>
          <h3 className="font-semibold text-[#1A1C1C] text-base">{title}</h3>
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
            if (val === 'delete' && onDelete) onDelete();
          }}
          options={[
            { value: 'open', label: 'Mở', icon: <FolderOpen className="w-4 h-4" /> },
            { value: 'share', label: 'Chia sẻ', icon: <Share2 className="w-4 h-4" /> },
            { value: 'rename', label: 'Đổi tên', icon: <Edit2 className="w-4 h-4" /> },
            { value: 'move', label: 'Di chuyển', icon: <FolderInput className="w-4 h-4" /> },
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
