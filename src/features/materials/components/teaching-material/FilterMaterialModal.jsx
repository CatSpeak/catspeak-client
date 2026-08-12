import React, { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import { PillButton } from '@/shared/components/ui/buttons';
import Dropdown from '@/shared/components/ui/Dropdown';
import { ChevronDown } from 'lucide-react';

const FILE_TYPES = [
  { value: 'word', label: 'Word' },
  { value: 'excel', label: 'Excel' },
  { value: 'powerpoint', label: 'Powerpoint' },
  { value: 'image', label: 'Hình ảnh' }
];

const FilterMaterialModal = ({ open, onClose, currentFilters, onApply }) => {
  const [filterMode, setFilterMode] = useState(currentFilters?.filterMode || 'folder');
  const [filterFileType, setFilterFileType] = useState(currentFilters?.filterFileType || 'word');
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setFilterMode(currentFilters?.filterMode || 'folder');
      setFilterFileType(currentFilters?.filterFileType || 'word');
    }
  }

  const handleApply = () => {
    onApply({
      filterMode,
      filterFileType: filterMode === 'fileType' ? filterFileType : null
    });
    onClose();
  };

  const handleReset = () => {
    onApply({
      filterMode: null,
      filterFileType: null
    });
    onClose();
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <PillButton
        onClick={handleReset}
        variant="secondary-no-outline"
        textColor="#6E0009"
        roundedClass="rounded-xl"
      >
        Xóa bộ lọc
      </PillButton>
      <div className="flex items-center gap-3">
        <PillButton onClick={onClose} variant="outline" roundedClass="rounded-xl">
          Hủy
        </PillButton>
        <PillButton onClick={handleApply} roundedClass="rounded-xl">
          Áp dụng
        </PillButton>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bộ lọc tìm kiếm"
      footer={footer}
      className="md:max-w-[400px]"
      bodyClassName="px-4 md:px-6 flex-1 overflow-y-auto"
    >
      <div className="flex flex-col gap-6">
        {/* Option 1: Thư mục */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="filterMode"
            className="w-4 h-4 text-[#6E0009] focus:ring-[#6E0009] cursor-pointer"
            checked={filterMode === 'folder'}
            onChange={() => setFilterMode('folder')}
          />
          <span className="text-[#1A1C1C] text-base font-medium">Thư mục</span>
        </label>

        {/* Option 2: Loại file */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="filterMode"
              className="w-4 h-4 text-[#6E0009] focus:ring-[#6E0009] cursor-pointer"
              checked={filterMode === 'fileType'}
              onChange={() => setFilterMode('fileType')}
            />
            <span className="text-[#1A1C1C] text-base font-medium">Loại file</span>
          </label>

          {/* Dropdown for file type */}
          {filterMode === 'fileType' && (
            <div className="flex-1">
              <Dropdown
                value={filterFileType}
                onChange={setFilterFileType}
                options={FILE_TYPES}
                align="left"
                dropdownClassName="w-full"
                triggerClassName="h-[42px] border-[#fde9eb] w-full"
              />
            </div>
          )}
        </div>

        {/* Option 3: Đã lưu (Bookmark) */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="filterMode"
            className="w-4 h-4 text-[#6E0009] focus:ring-[#6E0009] cursor-pointer"
            checked={filterMode === 'bookmark'}
            onChange={() => setFilterMode('bookmark')}
          />
          <span className="text-[#1A1C1C] text-base font-medium">Đã yêu thích</span>
        </label>
      </div>
    </Modal>
  );
};

export default FilterMaterialModal;
