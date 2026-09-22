import React from 'react';
import { BookX, BookOpen } from 'lucide-react';
import PillButton from '@/shared/components/ui/buttons/PillButton';

export const VocabularyEmptyState = ({ isSearch, onReset, onAction }) => {
  if (isSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-border border-dashed">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
          <BookX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy từ vựng nào</h3>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          Không có từ vựng nào khớp với bộ lọc và tìm kiếm của bạn. Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc.
        </p>
        <PillButton variant="secondary" onClick={onReset}>
          Xóa bộ lọc
        </PillButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-border border-dashed">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
        <BookOpen className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Sổ từ vựng của bạn đang trống</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Bạn chưa lưu từ vựng nào. Hãy quay lại các kịch bản tương tác và chọn "Lưu từ" để thêm vào sổ từ vựng của bạn.
      </p>
      <PillButton variant="primary" onClick={onAction}>
        Khám phá kịch bản
      </PillButton>
    </div>
  );
};
