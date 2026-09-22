export default {
  vocabularyNotebook: {
    title: "Vocabulary Notebook",
    subtitle: "Store and review all your saved vocabulary from conversations and room scripts.",
    reviewNow: "Review Now",
    wordCount: "{{count}} words",
    
    filters: {
      searchPlaceholder: "Search vocabulary, meaning...",
      language: "Language",
      script: "Script",
      sort: "Sort by",
      all: "All",
      sortOptions: {
        newest: "Newest",
        oldest: "Oldest",
        az: "A → Z",
        za: "Z → A",
        length: "Word Length"
      }
    },
    
    card: {
      noun: "Noun",
      verb: "Verb",
      adj: "Adj",
      adv: "Adv",
      teacherNote: "Teacher's Note",
      relatedWords: "Related words:",
      scriptLabel: "Script:",
      expand: "Details",
      collapse: "Collapse"
    },
    
    emptyState: {
      titleEmpty: "Your vocabulary notebook is empty",
      descEmpty: "You haven't saved any words yet. Go back to the interactive scripts and select \"Save\" to add words to your notebook.",
      exploreBtn: "Explore Scripts",
      
      titleSearch: "No results found",
      descSearch: "There are no words matching your search criteria and filters.",
      clearBtn: "Clear filters"
    },
    
    deleteModal: {
      title: "Remove from notebook",
      message: "The word \"{{word}}\" will be deleted from your learning list and review history.",
      cancel: "Cancel",
      confirm: "Remove"
    }
  }
};
