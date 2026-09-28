import React from 'react';
import { BookX, BookOpen } from 'lucide-react';
import PillButton from '@/shared/components/ui/buttons/PillButton';
import { useLanguage } from '@/shared/context/LanguageContext';

export const VocabularyEmptyState = ({ isSearch, onReset, onAction }) => {
  const { t } = useLanguage();
  const v = t.vocabularyNotebook?.emptyState;

  if (isSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-border border-dashed">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
          <BookX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{v?.titleSearch}</h3>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          {v?.descSearch}
        </p>
        <PillButton variant="secondary" onClick={onReset}>
          {v?.clearBtn}
        </PillButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-border border-dashed">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
        <BookOpen className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{v?.titleEmpty}</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        {v?.descEmpty}
      </p>
      <PillButton variant="primary" onClick={onAction}>
        {v?.exploreBtn}
      </PillButton>
    </div>
  );
};
