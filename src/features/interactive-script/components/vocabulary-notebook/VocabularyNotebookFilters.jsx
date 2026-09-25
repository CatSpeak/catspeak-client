import React from 'react';
import SearchInput from '@/shared/components/ui/inputs/SearchInput';
import Dropdown from '@/shared/components/ui/Dropdown';
import IconButton from '@/shared/components/ui/buttons/IconButton';
import { LayoutGrid, List } from 'lucide-react';
import { PillButton } from '@/shared/components/ui/buttons';
import { useLanguage } from '@/shared/context/LanguageContext';

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
  const { t } = useLanguage();
  const v = t.vocabularyNotebook?.filters;
  const common = t.header?.languages;

  const languageOptions = [
    { label: `${v?.all || 'Tất cả'} ${v?.language?.toLowerCase() || 'ngôn ngữ'}`, value: 'all' },
    { label: `${common?.en || 'Tiếng Anh'} (EN)`, value: 'en' },
    { label: `${common?.zh || 'Tiếng Trung'} (ZH)`, value: 'zh' },
    { label: `${common?.ja || 'Tiếng Nhật'} (JA)`, value: 'ja' }
  ];

  const scriptOptions = [
    { label: `${v?.all || 'Tất cả'} ${v?.script?.toLowerCase() || 'kịch bản'}`, value: 'all' },
    ...availableScripts.map(script => ({
      label: `${script.name} (${script.count} ${t.vocabularyNotebook?.wordCount?.split(' ')?.[1] || 'từ'})`,
      value: script.id
    }))
  ];

  const sortOptions = [
    { label: v?.sortOptions?.newest || 'Mới lưu nhất', value: 'newest' },
    { label: v?.sortOptions?.oldest || 'Cũ nhất', value: 'oldest' },
    { label: v?.sortOptions?.az || 'A → Z', value: 'a-z' },
    { label: v?.sortOptions?.za || 'Z → A', value: 'z-a' },
    { label: v?.sortOptions?.length || 'Độ dài từ', value: 'length' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
      <div className="w-full sm:w-1/3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={v?.searchPlaceholder || 'Tìm kiếm từ vựng, ý nghĩa...'}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto pb-2 sm:pb-0">
        <Dropdown
          options={languageOptions}
          value={languageFilter}
          onChange={(val) => setLanguageFilter(val)}
          placeholder={v?.language || 'Ngôn ngữ'}
          dropdownClassName="w-48"
        />

        <Dropdown
          options={scriptOptions}
          value={scriptFilter}
          onChange={(val) => setScriptFilter(val)}
          placeholder={v?.script || 'Kịch bản'}
          dropdownClassName="w-64"
        />

        <Dropdown
          options={sortOptions}
          value={sortBy}
          onChange={(val) => setSortBy(val)}
          placeholder={v?.sort || 'Sắp xếp'}
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
