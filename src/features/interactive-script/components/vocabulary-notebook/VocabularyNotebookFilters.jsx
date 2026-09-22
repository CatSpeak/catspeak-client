import React from 'react';
import SearchInput from '@/shared/components/ui/inputs/SearchInput';
import Dropdown from '@/shared/components/ui/Dropdown';
import IconButton from '@/shared/components/ui/buttons/IconButton';
import { LayoutGrid, List } from 'lucide-react';
import { PillButton } from '@/shared/components/ui/buttons';

export const VocabularyNotebookFilters = ({
  searchQuery,
  setSearchQuery,
  languageFilter,
  setLanguageFilter,
  scriptFilter,
  setScriptFilter,
  sortBy,
  setSortBy,
  availableScripts,
  viewMode,
  setViewMode
}) => {
  const languageOptions = [
    { label: 'Tất cả ngôn ngữ', value: 'all' },
    { label: 'Tiếng Anh (EN)', value: 'en' },
    { label: 'Tiếng Trung (ZH)', value: 'zh' },
    { label: 'Tiếng Nhật (JA)', value: 'ja' }
  ];

  const scriptOptions = [
    { label: 'Tất cả kịch bản', value: 'all' },
    ...availableScripts.map(script => ({
      label: `${script.name} (${script.count} từ)`,
      value: script.id
    }))
  ];

  const sortOptions = [
    { label: 'Mới lưu nhất', value: 'newest' },
    { label: 'Cũ nhất', value: 'oldest' },
    { label: 'A → Z', value: 'a-z' },
    { label: 'Z → A', value: 'z-a' },
    { label: "Độ dài từ", value: "length" }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
      <div className="w-full sm:w-1/3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm kiếm từ vựng, ý nghĩa..."
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
        <Dropdown
          options={languageOptions}
          value={languageFilter}
          onChange={(val) => setLanguageFilter(val)}
          placeholder="Ngôn ngữ"
          dropdownClassName="w-48"
        />

        <Dropdown
          options={scriptOptions}
          value={scriptFilter}
          onChange={(val) => setScriptFilter(val)}
          placeholder="Kịch bản"
          dropdownClassName="w-64"
        />

        <Dropdown
          options={sortOptions}
          value={sortBy}
          onChange={(val) => setSortBy(val)}
          placeholder="Sắp xếp"
          dropdownClassName="w-48"
        />

        <div className="flex rounded-full items-center">
          <IconButton
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          // startIcon={ }
          >
            {/* Danh sách */}
            <List className="w-4 h-4" />
          </IconButton>
          <IconButton
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('grid')}
          // startIcon={ }
          >
            {/* Lưới */}
            <LayoutGrid className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};
