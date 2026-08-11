import React from 'react';

const EmptySearchState = ({ searchQuery, onClearFilters }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-10 px-4">
      {/* Text Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
        Không tìm thấy tài liệu nào phù hợp
      </h3>

      <p className="text-center text-[15px] text-gray-500 max-w-lg mb-8 leading-relaxed">
        Chúng tôi không thể tìm thấy kết quả nào cho <span className="font-semibold text-gray-700">"{searchQuery}"</span>.
        Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
      </p>

      {/* Action Button */}
      <button
        onClick={onClearFilters}
        className="px-6 py-2.5 bg-white border border-[#6b1e22] text-[#6b1e22] rounded-lg font-medium text-sm hover:bg-red-50 transition-colors shadow-sm"
      >
        Xóa bộ lọc tìm kiếm
      </button>
    </div>
  );
};

export default EmptySearchState;
