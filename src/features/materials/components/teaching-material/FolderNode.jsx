import React from 'react';
import { ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { FcFolder } from 'react-icons/fc';
import { IconButton } from '@/shared/components/ui/buttons';

const FolderNode = ({ folder, level, selectedId, onSelect, expandedIds, toggleExpand }) => {
  const hasChildren = folder.subFolders && folder.subFolders.length > 0;
  const isExpanded = expandedIds.includes(folder.folderId);
  const isSelected = selectedId === folder.folderId;



  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-[#FFDAD6]/20 border border-[#FFDAD6]' : 'hover:bg-gray-50 border border-transparent'}`}
        style={{ marginLeft: level > 0 ? `${level * 20}px` : '0px' }}
        onClick={() => onSelect(isSelected ? null : folder)}
      >
        <div className="flex items-center gap-2">
          <IconButton
            variant='iconOnly'
            className="!w-4 !h-4"
            innerClassName="!w-4 !h-4"
            onClick={(e) => {
              if (hasChildren) {
                e.stopPropagation();
                toggleExpand(folder.folderId);
              }
            }}
          >
            {hasChildren ? (
              isExpanded ?
                <ChevronDown className="w-6 h-6 text-[#5B403E] hover:text-[#6E0009]" />
                : <ChevronRight className="w-6 h-6 text-[#5B403E] hover:text-[#6E0009]" />
            ) : <div className="w-6 h-6" />}
          </IconButton>

          <FcFolder className="w-5 h-5" />
          <span className={`text-base truncate flex-1 ${isSelected ? 'font-bold text-[#6E0009]' : 'text-[#1A1C1C]'}`}>
            {folder.folderName}
          </span>
        </div>

        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#6E0009] shrink-0 mr-1" />}
      </div>

      {
        hasChildren && isExpanded && (
          <div className="flex flex-col">
            {folder.subFolders.map(child => (
              <FolderNode
                key={child.folderId}
                folder={child}
                level={level + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
              />
            ))}
          </div>
        )
      }
    </div >
  );
};

export default FolderNode;
