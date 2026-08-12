import { PillButton } from '@/shared/components/ui/buttons';
import React from 'react';

const EmptySearchState = ({ searchQuery, onClearFilters }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-10 px-4">
      {/* Text Content */}
      <h3 className="text-3xl font-bold text-[#1A1C1C] mb-4 text-center">
        Không tìm thấy tài liệu nào phù hợp
      </h3>

      <p className="text-center text-base text-[#5B403E] max-w-lg mb-8 leading-relaxed">
        {searchQuery ? (
          <>
            Chúng tôi không thể tìm thấy kết quả nào cho <span className="font-semibold text-[#6E0009]">"{searchQuery}"</span>.<br />
            Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
          </>
        ) : (
          "Chúng tôi không thể tìm thấy tài liệu nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi bộ lọc."
        )}
      </p>

      {/* Action Button */}
      <PillButton
        variant='outline'
        roundedClass="rounded-xl"
        textColor="#6E0009"
        borderColor="#E3BEBA"
        onClick={onClearFilters}
      >
        Xóa bộ lọc tìm kiếm
      </PillButton>
    </div>
  );
};

export default EmptySearchState;
