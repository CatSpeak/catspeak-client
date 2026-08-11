import React from 'react';
import { ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { FcFolder } from 'react-icons/fc';
import { IconButton } from '@/shared/components/ui/buttons';

const FolderNode = ({ folder, level, selectedId, onSelect, expandedIds, toggleExpand }) => {
  const hasChildren = folder.children && folder.children.length > 0;
  const isExpanded = expandedIds.includes(folder.id);
  const isSelected = selectedId === folder.id;

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-[#FFDAD6]/20 border border-[#FFDAD6]' : 'hover:bg-gray-50 border border-transparent'}`}
        style={{ marginLeft: level > 0 ? `${level * 20}px` : '0px' }}
        onClick={() => onSelect(folder)}
      >
        <div className="flex items-center gap-2">
          <IconButton
            variant='iconOnly'
            className="!w-4 !h-4"
            innerClassName="!w-4 !h-4"
            onClick={(e) => {
              if (hasChildren) {
                e.stopPropagation();
                toggleExpand(folder.id);
              }
            }}
          >
            {hasChildren ? (
              isExpanded ?
                <ChevronDown className="w-4 h-4 text-[#5B403E]" />
                : <ChevronRight className="w-4 h-4 text-[#5B403E]" />
            ) : <div className="w-4 h-4" />}
          </IconButton>

          <FcFolder className="w-5 h-5" />
          <span className={`text-base truncate flex-1 ${isSelected ? 'font-bold text-[#6E0009]' : 'text-[#1A1C1C]'}`}>
            {folder.name}
          </span>
        </div>

        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#6E0009] shrink-0 mr-1" />}
      </div>

      {
        hasChildren && isExpanded && (
          <div className="flex flex-col">
            {folder.children.map(child => (
              <FolderNode
                key={child.id}
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
