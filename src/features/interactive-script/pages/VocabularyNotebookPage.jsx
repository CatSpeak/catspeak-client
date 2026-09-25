import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useVocabularyNotebook } from '../hooks/useVocabularyNotebook';
import { VocabularyNotebookHeader } from '../components/vocabulary-notebook/VocabularyNotebookHeader';
import { VocabularyNotebookFilters } from '../components/vocabulary-notebook/VocabularyNotebookFilters';
import { VocabularyListCard } from '../components/vocabulary-notebook/VocabularyListCard';
import { VocabularyGridCard } from '../components/vocabulary-notebook/VocabularyGridCard';
import { VocabularyEmptyState } from '../components/vocabulary-notebook/VocabularyEmptyState';
import { DeleteWordConfirmModal } from '../components/vocabulary-notebook/DeleteWordConfirmModal';
import Pagination from '@/shared/components/ui/navigation/Pagination';

const VocabularyNotebookPage = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [wordToDelete, setWordToDelete] = useState(null);

  const navigate = useNavigate();
  const { language } = useLanguage();

  const {
    words,
    allWordsCount,
    searchQuery,
    setSearchQuery,
    languageFilter,
    setLanguageFilter,
    scriptFilter,
    setScriptFilter,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    availableScripts,
    deleteWord,
    playAudio,
    resetFilters,
    isFetching
  } = useVocabularyNotebook();

  const handleDeleteConfirm = (id) => {
    deleteWord(id);
    setWordToDelete(null);
  };

  return (
    <div className="w-full">
      <VocabularyNotebookHeader totalWords={allWordsCount} />

      {isFetching && allWordsCount === 0 ? (
        <div className="py-12 flex justify-center items-center text-slate-400 italic">
          Đang tải danh sách từ vựng...
        </div>
      ) : allWordsCount > 0 ? (
        <>
          <VocabularyNotebookFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            languageFilter={languageFilter}
            setLanguageFilter={setLanguageFilter}
            scriptFilter={scriptFilter}
            setScriptFilter={setScriptFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            availableScripts={availableScripts}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {words.length > 0 ? (
            <>
              {viewMode === 'list' ? (
                <div className="flex flex-col gap-4 mb-8">
                  {words.map(word => (
                    <VocabularyListCard
                      key={word.id}
                      word={word}
                      onPlayAudio={playAudio}
                      onDelete={setWordToDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start mb-8">
                  {words.map(word => (
                    <VocabularyGridCard
                      key={word.id}
                      word={word}
                      onPlayAudio={playAudio}
                      onDelete={setWordToDelete}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 mb-8">
                  <button className="flex items-center gap-2 px-4 py-2 border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#4B5563] bg-white hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Xem thêm 10 từ khác
                  </button>
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChangePage={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <VocabularyEmptyState isSearch={true} onReset={resetFilters} />
          )}
        </>
      ) : (
        <VocabularyEmptyState isSearch={false} onAction={() => navigate(`/${language}/community`)} />
      )}

      {wordToDelete && (
        <DeleteWordConfirmModal
          open={!!wordToDelete}
          word={wordToDelete}
          onClose={() => setWordToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default VocabularyNotebookPage;
