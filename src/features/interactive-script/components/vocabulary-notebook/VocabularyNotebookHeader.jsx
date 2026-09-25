import React from 'react';
import { Gamepad } from 'lucide-react';
import Breadcrumb from '@/shared/components/ui/navigation/Breadcrumb';
import PillButton from '@/shared/components/ui/buttons/PillButton';
import { useLanguage } from '@/shared/context/LanguageContext';

export const VocabularyNotebookHeader = ({ totalWords }) => {
  const { t } = useLanguage();
  const v = t.vocabularyNotebook;

  const breadcrumbItems = [
    { label: t.nav?.home || 'Trang chủ', href: '/' },
    { label: v?.title || 'Sổ từ vựng', href: '/workspace/vocabulary' }
  ];

  return (
    <div className="flex flex-col gap-4 mb-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{v?.title}</h1>
            <p className="text-sm text-gray-500">
              {v?.subtitle}
            </p>
          </div>
        </div>

        <PillButton
          variant="primary"
          startIcon={<Gamepad className="w-6 h-6" />}
        >
          {v?.reviewNow} <span className='rounded-full shadow-faq-card px-3 py-1 bg-cath-red-400'>{v?.wordCount?.replace('{{count}}', totalWords) || `${totalWords} từ`}</span>
        </PillButton>
      </div>
    </div>
  );
};
