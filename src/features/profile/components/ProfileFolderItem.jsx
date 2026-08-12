import React from 'react';
import { FcFolder } from 'react-icons/fc';
import { Star } from 'lucide-react';

const ProfileFolderItem = ({
  title,
  totalItems,
  updatedAt,
  isPublic,
  isBookmarked,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative group border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all select-none bg-white border-[#E3BEBA] hover:bg-[#FFDAD6] hover:border-[#6E0009] hover:shadow-faq-card`}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <FcFolder className="text-4xl shrink-0 mt-0.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#1A1C1C] text-[15px] line-clamp-2 pr-4">{title}</h3>
              {isBookmarked && <Star className="w-4 h-4 text-[#FF9C4F] fill-[#FF9C4F]" />}
            </div>
            <p className="text-xs text-[#5B403E] mt-1">{totalItems} tài liệu • Cập nhật {updatedAt}</p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        {isPublic ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4EA] text-[#137333]">
            Công khai
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F3F4] text-[#5F6368]">
            Riêng tư
          </span>
        )}
      </div>
    </div>
  );
};

export default ProfileFolderItem;
