import React from 'react';
import { IconButton } from '@/shared/components/ui/buttons';
import { X, Download, Trash2, FolderInput } from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';

const BulkActionBar = ({ selectedCount, onClearSelection, onMove, onDelete, onDownload }) => {
  const { t } = useLanguage();
  if (selectedCount === 0) return null;

  return (
    <div className="fixed right-4 bottom-4 z-[100]">
      <div className="flex items-center gap-2 bg-white rounded-full shadow-faq-card pl-3 pr-3 h-12">
        <div className="flex items-center gap-1">
          <IconButton
            variant="ghost"
            onClick={onClearSelection}
          >
            <X className="w-5 h-5 text-[#1A1C1C]" />
          </IconButton>
          <span className="text-base font-medium text-[#1A1C1C] px-2 mr-2 whitespace-nowrap">
            {t.materials.selectedItemsCount.replace('{{count}}', selectedCount)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onDownload && (
            <IconButton variant="ghost"
              onClick={onDownload}
              title={t.materials.download}
            >
              <Download className="w-5 h-5 text-[#1A1C1C]" />
            </IconButton>
          )}

          {onMove && (
            <IconButton
              variant="ghost"
              onClick={onMove}
              title={t.materials.move}
            >
              <FolderInput className="w-5 h-5 text-[#1A1C1C]" />
            </IconButton>
          )}

          {onDelete && (
            <IconButton
              variant="ghost"
              onClick={onDelete}
              title={t.materials.delete}
            >
              <Trash2 className="w-5 h-5 text-[#1A1C1C]" />
            </IconButton>
          )}
        </div>

      </div>
    </div>
  );
};

export default BulkActionBar;

