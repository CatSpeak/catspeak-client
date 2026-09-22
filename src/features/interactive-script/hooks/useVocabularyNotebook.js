import { useState, useEffect, useMemo, useCallback } from 'react';
import { mockVocabularyData } from '../mock/mockVocabularyNotebook';

const LOCAL_STORAGE_KEY = 'catspeak_vocabulary_notebook';

export const useVocabularyNotebook = () => {
  const [words, setWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [scriptFilter, setScriptFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjustable

  // Initialize data from localStorage or mock data
  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWords(parsed);
        } else {
          // If empty, load mock data for UI testing purposes
          setWords(mockVocabularyData);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockVocabularyData));
        }
      } catch (error) {
        console.error('Failed to parse vocabulary from localStorage:', error);
        setWords(mockVocabularyData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockVocabularyData));
      }
    } else {
      setWords(mockVocabularyData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockVocabularyData));
    }
  }, []);

  // Save to localStorage whenever words change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(words));
  }, [words]);

  // Handle search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Derived state for available scripts based on current words
  const availableScripts = useMemo(() => {
    const scriptMap = new Map();
    words.forEach(word => {
      if (!scriptMap.has(word.scriptId)) {
        scriptMap.set(word.scriptId, {
          id: word.scriptId,
          name: word.scriptName,
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
    if (debouncedSearchQuery) {
      const lowerQuery = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        word =>
          word.word.toLowerCase().includes(lowerQuery) ||
          word.meaning.toLowerCase().includes(lowerQuery)
      );
    }

    // Language filter
    if (languageFilter !== 'all') {
      result = result.filter(word => word.language === languageFilter);
    }

    // Script filter
    if (scriptFilter !== 'all') {
      result = result.filter(word => word.scriptId === scriptFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.savedAt) - new Date(a.savedAt);
        case 'oldest':
          return new Date(a.savedAt) - new Date(b.savedAt);
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
  }, [words, debouncedSearchQuery, languageFilter, scriptFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedWords.length / itemsPerPage);
  const paginatedWords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedWords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedWords, currentPage, itemsPerPage]);

  // Actions
  const deleteWord = useCallback((id) => {
    setWords(prev => prev.filter(word => word.id !== id));
  }, []);

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
        'ja': 'ja-JP'
      };

      utterance.lang = langMap[language] || 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech Synthesis not supported in this browser.");
    }
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
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
    resetFilters
  };
};
