import { PillButton } from '@/shared/components/ui/buttons';
import React from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';

const EmptySearchState = ({ searchQuery, onClearFilters }) => {
  const { t } = useLanguage();
  return (
    <div className="w-full flex flex-col items-center justify-center py-10 px-4">
      {/* Text Content */}
      <h3 className="text-3xl font-bold text-[#1A1C1C] mb-4 text-center">
        {t.materials.emptySearchTitle}
      </h3>

      <p className="text-center text-base text-[#5B403E] max-w-lg mb-8 leading-relaxed">
        {searchQuery ? (
          <>
            {t.materials.emptySearchDescQuery.split('"{{query}}"').map((part, index, array) => (
              <React.Fragment key={index}>
                {part}
                {index < array.length - 1 && <span className="font-semibold text-[#6E0009]">"{searchQuery}"</span>}
              </React.Fragment>
            ))}<br />
            {t.materials.emptySearchTryAgain}
          </>
        ) : (
          t.materials.emptySearchDescFilter
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
        {t.materials.clearSearchFilters}
      </PillButton>
    </div>
  );
};

export default EmptySearchState;
