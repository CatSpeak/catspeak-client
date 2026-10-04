import { useState, useMemo, useCallback } from 'react';
import { useGetVocabulariesQuery, useDeleteVocabularyMutation } from '@/store/api/interactiveScriptApi';

export const useVocabularyNotebook = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [scriptFilter, setScriptFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // We could do server-side filtering, but for now we'll do client-side filtering 
  // since the API might not support all these filters natively yet.
  const { data: apiResponse, isFetching, refetch } = useGetVocabulariesQuery();
  const words = apiResponse?.items || apiResponse?.data || (Array.isArray(apiResponse) ? apiResponse : []);

  const [deleteVocabularyMutation] = useDeleteVocabularyMutation();

  // Derived state for available scripts based on current words
  const availableScripts = useMemo(() => {
    const scriptMap = new Map();
    words.forEach(word => {
      if (!scriptMap.has(word.scriptId)) {
        scriptMap.set(word.scriptId, {
          id: word.scriptId,
          name: word.scriptName || `Script ${word.scriptId}`,
          count: 0
        });
      }
      scriptMap.get(word.scriptId).count += 1;
    });
    return Array.from(scriptMap.values());
  }, [words]);

  // Filter and sort words
  const filteredAndSortedWords = useMemo(() => {
    let result = [...words];

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        word =>
          word.word.toLowerCase().includes(lowerQuery) ||
          word.meaning.toLowerCase().includes(lowerQuery)
      );
    }

    // Language filter
    if (languageFilter !== 'all') {
      const langMap = {
        en: 'English',
        vi: 'Vietnamese',
        zh: 'Chinese',
        ja: 'Japanese'
      };
      const langName = langMap[languageFilter];
      result = result.filter(word => 
        word.targetLanguage === languageFilter || 
        word.sourceLanguage === languageFilter ||
        word.targetLanguage === langName ||
        word.sourceLanguage === langName
      );
    }

    // Script filter
    if (scriptFilter !== 'all') {
      result = result.filter(word => word.scriptId === scriptFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'a-z':
          return a.word.localeCompare(b.word);
        case 'z-a':
          return b.word.localeCompare(a.word);
        case 'lenght':
          return a.word.length - b.word.length;
        default:
          return 0;
      }
    });

    return result;
  }, [words, searchQuery, languageFilter, scriptFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedWords.length / itemsPerPage);
  const paginatedWords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedWords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedWords, currentPage, itemsPerPage]);

  // Actions
  const deleteWord = useCallback(async (id) => {
    try {
      await deleteVocabularyMutation(id).unwrap();
    } catch (e) {
      console.error(e);
    }
  }, [deleteVocabularyMutation]);

  const playAudio = useCallback((text, language, audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      // Map language code to BCP 47 locale
      const langMap = {
        'en': 'en-US',
        'zh': 'zh-CN',
        'ja': 'ja-JP',
        'English': 'en-US',
        'Chinese': 'zh-CN',
        'Japanese': 'ja-JP'
      };

      utterance.lang = langMap[language] || 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech Synthesis not supported in this browser.");
    }
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setLanguageFilter('all');
    setScriptFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  }, []);

  return {
    words: paginatedWords,
    totalWords: filteredAndSortedWords.length,
    allWordsCount: words.length,
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
  };
};
