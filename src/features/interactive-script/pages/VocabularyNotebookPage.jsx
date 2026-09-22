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
    resetFilters
  } = useVocabularyNotebook();

  const handleDeleteConfirm = (id) => {
    deleteWord(id);
    setWordToDelete(null);
  };

  return (
    <div className="w-full">
      <VocabularyNotebookHeader totalWords={allWordsCount} />

      {allWordsCount > 0 ? (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
                <div className="flex justify-center mt-6 mb-8">
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
