import React from 'react';
import { MoreVertical } from 'lucide-react';
import { FcFolder } from 'react-icons/fc';
import Dropdown from '@/shared/components/ui/Dropdown';
import { IconButton } from '@/shared/components/ui/buttons';

const FolderItem = ({ title, totalItems, status, onDelete }) => {

  return (
    <div className="border border-[#E3BEBA] rounded-xl p-3 flex items-center justify-between bg-[#F9F9F9] cursor-pointer hover:shadow-faq-card hover:border-[#6E0009] hover:bg-[#FFDAD6]">
      <div className="flex items-center gap-3 flex-1">
        <FcFolder className="text-4xl" />
        <div>
          <h3 className="font-semibold text-[#1A1C1C] text-base">{title}</h3>
          <p className="text-sm text-[#5B403E]">{totalItems} • {status}</p>

        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <Dropdown
          align="right"
          dropdownClassName="w-24"
          onChange={(val) => {
            if (val === 'delete' && onDelete) onDelete();
          }}
          options={[
            { value: 'open', label: 'Mở' },
            { value: 'rename', label: 'Đổi tên' },
            {
              value: 'delete',
              label: <span className="text-cath-red-700">Xóa</span>
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
