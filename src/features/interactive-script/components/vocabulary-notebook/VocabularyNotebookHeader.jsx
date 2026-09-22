import React from 'react';
import { Gamepad } from 'lucide-react';
import Breadcrumb from '@/shared/components/ui/navigation/Breadcrumb';
import PillButton from '@/shared/components/ui/buttons/PillButton';

export const VocabularyNotebookHeader = ({ totalWords }) => {
  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Sổ từ vựng', href: '/workspace/vocabulary' }
  ];

  return (
    <div className="flex flex-col gap-4 mb-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sổ từ vựng</h1>
            <p className="text-sm text-gray-500">
              Lưu trữ và ôn tập toàn bộ từ vựng đã lưu trong các buổi trò chuyện và script phòng học.
            </p>
          </div>
        </div>

        <PillButton
          variant="primary"
          startIcon={<Gamepad className="w-6 h-6" />}
        >
          Ôn tập ngay <span className='rounded-full shadow-faq-card px-3 py-1 bg-cath-red-400'>{totalWords} từ</span>
        </PillButton>
      </div>
    </div>
  );
};
