import { PillButton } from '@/shared/components/ui/buttons';
import React from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';
import CannotFoundMaterialImg from '../../assets/Cannot_found_material.png';

const EmptySearchState = ({ searchQuery, onClearFilters }) => {
  const { t } = useLanguage();
  return (
    <div className="w-full flex flex-col items-center justify-center py-10 px-4">
      {/* Image */}
      <img 
        src={CannotFoundMaterialImg} 
        alt="Cannot found material" 
        className="w-48 h-auto mb-6 object-contain" 
      />

      {/* Text Content */}
      <h3 className="text-3xl font-bold text-[#1A1C1C] dark:text-white mb-4 text-center">
        {t.materials.emptySearchTitle}
      </h3>

      <p className="text-center text-base text-[#5B403E] dark:text-neutral-300 max-w-lg mb-8 leading-relaxed">
        {searchQuery ? (
          <>
            {t.materials.emptySearchDescQuery.split('"{{query}}"').map((part, index, array) => (
              <React.Fragment key={index}>
                {part}
                {index < array.length - 1 && <span className="font-semibold text-[#6E0009] dark:text-[#FF7A8A]">"{searchQuery}"</span>}
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
        innerClassName="!text-[#6E0009] !border-[#E3BEBA] dark:!text-[#FF7A8A] dark:!border-[#FF7A8A]/70"
        onClick={onClearFilters}
      >
        {t.materials.clearSearchFilters}
      </PillButton>
    </div>
  );
};

export default EmptySearchState;
