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
  },
  widget: {
    shuffleTopic: "Shuffle Topic",
    translateFull: "Translate Full Paragraph",
    hint: "Click any word to see its meaning and save it to your personal learning list",
    translationPanel: {
      title: "Reference Translation",
      featuredQuote: "Featured Quote",
      hideBtn: "Hide Translation",
      reportInaccurate: "Report inaccuracy",
      reportTitle: "Suggest a better translation:",
      reportSuccess: "Thank you for your feedback!",
      reportPlaceholder: "Enter a more accurate translation...",
      cancel: "Cancel",
      submitReport: "Send Feedback",
      aiDisclaimer: "AI translation is for reference only",
      reasons: {
        wrongMeaning: "Incorrect meaning",
        unnatural: "Unnatural translation",
        missingWords: "Missing or extra words",
        other: "Other reason"
      }
    },
    langPairs: {
      "en-vi": "English → Vietnamese",
      "en-zh": "English → Chinese",
      "en-ja": "English → Japanese",
      "vi-en": "Vietnamese → English"
    },
    lookup: {
      meaning: "MEANING",
      instructorNote: "DETAILED EXPLANATION (CAT SPEAK INSTRUCTOR)",
      example: "EXAMPLE",
      relatedWords: "Related words:",
      saved: "Saved to notebook",
      save: "Add to notebook",
      collapseExamples: "Collapse examples",
      moreExamples: "View more examples",
      langPlaceholder: "English -> English",
      listenBtn: "Listen to pronunciation",
      closeBtn: "Close popup"
    },
    notFound: {
      title: "No definition found for this word.",
      desc: "The system currently has no meaning data for this word in the current dictionary.",
      tryOther: "Try another language:",
      contribute: "Contribute meaning",
      openDict: "Look up in open dictionary",
      contributeNew: "Contribute new meaning",
      type: "Contribution type:",
      defaultType: "Standard Definition",
      meaningYouKnow: "Meaning you know:",
      meaningPlaceholder: "Enter definition or explanation for this word...",
      cancel: "Cancel",
      submitting: "Submitting...",
      submit: "Submit contribution",
      errorEmpty: "Please enter a definition for the word.",
      success: "Thank you for contributing!",
      types: {
        definition: "Standard Definition",
        context: "Specific Term / Context",
        example: "Example sentence"
      }
    }
  }
};
