export default {
  title: "AI Tutor",
  onlyChineseNotice: {
    title: "AI Tutor currently supports the Chinese community only",
    description:
      "AI Tutor speaking rooms, the 5-day learning path and vocabulary tools are currently designed for the Chinese (zh) community. Switch to Chinese to continue, or go back to your current community.",
    switchToChinese: "Switch to Chinese (zh)",
    backToCommunity: "Back to community",
  },
  levelAssessment: {
    title: "Level Assessment",
  },
  learningPath: {
    title: "5-Day Learning Path",
  },
  speakingRoom: {
    title: "Speaking Room",
    headerTitle: "Two-way interactive speaking room",
    headerBadge: "50+ real-life topics",
    levelLabel: "Level:",
    quota: {
      title: "Today's quota:",
      freePlan: "Free plan: {{count}} sessions/day",
      proPlan: "Pro plan: Unlimited",
      resetNote: "Resets at {{time}} · Premium has unlimited sessions",
      remaining: "Remaining {{remaining}} / {{total}} sessions ({{percent}}%)",
      upgrade: "Upgrade to Premium",
      zeroSessions: "0 sessions",
      totalSessions: "{{total}} sessions (max)",
    },
    searchPlaceholder:
      "Search topics, vocabulary (e.g. shopping, 买水果, mai cai, travel...)",
    randomPick: "AI random pick",
    tabs: {
      all: "All",
    },
    sections: {
      searchResults: "🔍 SEARCH RESULTS",
      searchBadge: "{{count}} matching topics",
      recommended: "⭐ AI PICKS FOR YOU",
      recommendedBadge: "{{count}} suggested topics (HSK {{level}})",
      standard: "📌 HSK 1-3 CONVERSATION TOPICS",
      advanced: "🔒 WORKPLACE & ADVANCED CHALLENGES (HSK 4+)",
      tabRecommended: "⭐ HSK {{level}} SUGGESTIONS",
      others: "📌 OTHER TOPICS",
      fallback: "TOPIC LIST",
      countBadge: "{{count}} topics",
    },
    loadingTopics: "Loading conversation topics...",
    topicError: "Unable to load the topic list.",
    activeSession: {
      notice:
        "You still have an unfinished speaking session. Continue or close it before starting a new one.",
      continue: "Continue session",
      closing: "Closing session...",
      closeOld: "Close old session",
      closeFailed: "Unable to close the old session. Please try again.",
      conflictStart:
        "Continue or close the old session before starting a new one.",
    },
    topicCard: {
      questions: "{{count}} sentences",
      premium: "⭐ Premium",
      twoWay: "Two-way conversation",
      vocabulary: "Vocabulary:",
    },
    topicList: {
      errorTitle: "Unable to load topics",
      errorDesc:
        "An error occurred while loading topics from the server. Please check again.",
      retry: "Retry",
      emptyTitle: "No topics available yet",
      emptyDesc:
        "The system has no conversation topics available. Please come back later.",
      noMatchTitle: "No matching topics found",
      noMatchDesc: "Try another keyword or select all filters.",
    },
    sticky: {
      selected: "Selected: {{title}}",
      turns: "4-6 sentences",
      quotaExceededDetail:
        "You have used today's quota (2/2 sessions). Upgrade to continue.",
      quotaNote: "One session is deducted after completing the session",
      start: "Start speaking now",
      outOfQuota: "Today's quota is used up",
      upgradeHint: "You have used today's quota. Please upgrade your plan.",
    },
    speaking: {
      sessionTitle: "Chinese speaking practice",
      connectingTitle: "Connecting to the speaking room...",
      connectingTopic: "Connecting to the assistant for topic:",
      pleaseWait: "Please wait a moment...",
      cancelBack: "Cancel and return to the topic list",
      failedTitle: "Unable to connect to the speaking room",
      failedFallback:
        "Unable to connect to the assistant. Please check your network and retry.",
      retryConnect: "🔄 Reconnect",
      backToTopics: "Back to the topic list",
      restoringTitle: "Restoring connection",
      restoringDesc:
        "The session will end automatically if the connection is not restored within 15 seconds.",
      retry: "Reconnect",
      joined: "Joined the speaking room",
      connectingShort: "Connecting to the assistant...",
      turnLabel: "Turn {{current}}/{{total}}",
      end: "End",
      grantAgain: "Grant permission again",
      points: "Score",
      aiSpeaking: "AI Tutor Cat Speak is speaking...",
      aiListening: "AI is listening to you...",
      aiTutorName: "AI TUTOR CAT SPEAK",
      replayPlaying: "Playing...",
      replay: "Replay",
      studentName: "YOU (LEARNER)",
      micOn: "✓ Microphone on",
      micOff: "✕ Microphone off",
      listeningYou: "Listening to you...",
      hintButton: "💡 Hint",
      hintLabel: "💡 Hint:",
      hintTitle: "Tap to hear a slow AI sample",
      correctionLabel: "INSTANT CORRECTION TIP:",
      correctionPrefix: "You said:",
      correctionArrow: "➔ Try saying:",
      timerSuffix: "Reflex recording",
      micTitleOn: "Tap to turn off the microphone",
      micTitleOff: "Tap to turn on the microphone and start speaking",
      micCaptionOn: "Microphone on · Tap to turn off",
      micCaptionOff: "Microphone off · Tap to turn on & grant permission",
      tokenMissing: "No valid LiveKit token found to join the room.",
      connectFailed: "Unable to connect to the LiveKit server.",
      notSupported: "This browser does not support microphone access.",
      permissionDenied:
        "Microphone permission not granted. Please allow microphone access to practice speaking.",
      endRequestFailed: "Unable to send the end request. Please try again.",
      warnSilence: "Need AI support? Try pronouncing one suggested word!",
      warnTime: "The speaking session is about to end (1 minute left).",
      placeholder: "Hi! Are you ready?",
    },
    complete: {
      title: "SPEAKING SESSION COMPLETE!",
      subtitle:
        "The AI Tutor is calculating scores and extracting vocabulary into flashcards...",
      processing: "Processing {{percent}}% ({{time}})",
      done: "Done",
      extracting: "Extracting...",
      processingItem: "Processing...",
      viewReport: "View the summary report now",
      estimatedNow: "done",
      estimatedTwoSeconds: "about 2 seconds",
      estimatedSoon: "almost done",
    },
    result: {
      pageTitle: "SPEAKING SESSION SUMMARY REPORT",
      topicMeta: "Topic: {{topic}} · Duration: {{duration}} · {{date}}",
      backToCatalog: "← Back to catalog",
      totalScore: "OVERALL SCORE",
      levelPrefix: "Level assessment: ",
      metrics: {
        fluency: "Fluency",
        pronunciation: "Pronunciation & tones",
        grammar: "Grammar & vocabulary",
      },
      strengthsTitle: "NOTABLE STRENGTHS:",
      improvementsTitle: "AREAS TO IMPROVE & PRONUNCIATION FIXES:",
      pronunciationDetail:
        "👉 View detailed syllable analysis & 1-on-1 mouth shape video →",
      savedTitle: "SAVED {{count}} WORDS TO FLASHCARDS — WILL REMIND YOU:",
      practiceNow: "Practice these {{count}} words now",
      goHome: "Back to Home",
      retry: "Retry",
      defaultTopic: "Practice speaking with AI",
      sessionFallback: "Speaking session",
      savedNotice: "Your speaking session has been saved.",
      forbidden: "You do not have permission to view this session report.",
      timeout:
        "The report generation timed out. You can tap retry below.",
      loadFailed: "Unable to load the report. Please reload in a few minutes.",
      finalizing:
        "The report is being finalised and will update automatically shortly.",
      emptySession:
        "No answers were recorded in this session. Next time, try answering with a short sentence and AI will help you continue.",
      abandoned:
        "The session stopped before completion. This is the available data from the session.",
      partial:
        "Detailed feedback and vocabulary meanings are being finalised; the report will update automatically.",
    },
    pronunciation: {
      unavailable:
        "Detailed pronunciation analysis is temporarily off. Please come back later.",
      loadFailed:
        "Unable to load pronunciation analysis. Please try again in a few minutes.",
      noAudio:
        "This session has no recording to analyse. Next time remember to keep the microphone on.",
      allGood:
        "Your pronunciation is great — no words need extra practice in this session!",
      retryNotHeard: "We could not hear you clearly. Please speak louder.",
      retryFailed: "We could not score this attempt. Please try again.",
    },
    modals: {
      close: "Close",
      early: {
        title: "Finish and view results now?",
        subtitle:
          "Sentences practised: {{completed}} / {{total}} reflex sentences.",
        infoTitle: "Early submission information",
        infoDesc:
          "You can submit at any time! The system will score and comment based on the sentences you spoke in this session.",
        resultTitle: "What you will receive after submitting",
        resultDesc:
          "A detailed pronunciation report plus new/mistaken vocabulary automatically saved to your spaced-repetition flashcards!",
        submit: "Submit",
        stay: "Keep practising",
      },
      network: {
        title: "Connection Lost",
        subtitle:
          "The audio signal to the AI speaking room was interrupted by an unstable network.",
        reconnecting: "Audio disconnected. Reconnecting... ({{seconds}}s)",
        keepScreen:
          "Please keep this screen open; AI will resume as soon as the network returns.",
        safe:
          "Your previous voice data is safely saved. After {{seconds}}s the session will be summarised automatically.",
        endAndSave: "End & save results",
        retryNow: "Reconnect now",
      },
      quota: {
        title: "Today's free quota is used up",
        desc:
          "A Free account gets 2 full speaking sessions per day. You have used today's quota; upgrade to practise without limits:",
        benefitsTitle: "Unlock everything with Premium:",
        benefit1: "Unlimited speaking sessions 24/7 with AI Tutor",
        benefit2: "Unlock all 50+ in-depth topics from HSK 1 to HSK 6",
        benefit3: "Exclusive pronunciation mouth-shape analysis & 1-on-1 Shorts videos",
        benefit4: "Automatically sync vocabulary to spaced-repetition flashcards",
        priceLabel: "Launch offer:",
        price: "VND 99,000 / month",
        upgrade: "Upgrade to Premium now",
        later: "Practise again tomorrow",
      },
      conflict: {
        title: "An active session was detected",
        subtitle: "You have a speaking session on another device.",
        device: "Device:",
        topic: "Topic:",
        status: "Status:",
        securityNote:
          "For security and two-way audio quality, each account can join only one speaking room at a time.",
        understood: "Understood",
        closeHome: "Close & return home",
        transfer: "Move the session to this device",
      },
      micro: {
        title: "How to enable microphone access",
        desc:
          "Your browser is blocking microphone access. CatSpeak needs the microphone so AI can recognise your voice and talk with you in real time:",
        stepsTitle: "3 quick steps to enable the microphone:",
        step1:
          "Click the lock icon next to the browser URL bar at the top left.",
        step2: "Find Microphone and switch it to Allow.",
        step3:
          "Click 'Microphone is on, retry now' below so the system can check the signal again.",
        retry: "Microphone is on, retry now",
        backToTopics: "Back to topic selection",
      },
      hsk: {
        title: "Choose a temporary HSK level",
        desc:
          "Haven't taken the placement test? Pick an estimated level so AI can optimise conversation difficulty:",
        tip:
          "Recommended: take the 3-minute Placement Test so the system can determine your most accurate level.",
        confirm: "Confirm & continue",
        takeTest: "Take the placement test",
        options: {
          hsk1: "HSK 1 - Beginner (basic vocabulary: greetings, numbers)",
          hsk2: "HSK 2 - Elementary (short conversations: shopping, time, weather)",
          hsk3: "HSK 3 - Lower intermediate (natural conversation, food) ★ Recommended",
          hsk4: "HSK 4 - Intermediate (social topics, hobbies, interviews)",
          hsk56: "HSK 5-6 - Advanced (presentations, business topics)",
        },
      },
      mouth: {
        stepsTitle: "3 standard mouth-shape steps:",
        tipTitle: "Tip from AI Tutor CatSpeak:",
        practiceNow: "Got it, practise now",
        videoUpdating:
          "The mouth-shape video is being updated by the teacher. Please follow the three steps beside it.",
        duration: "Duration: {{duration}} · CatSpeak",
      },
      pronunciation: {
        title: "Deep pronunciation analysis",
        analyzing: "Analysing each syllable from your speaking session...",
        accuracy: "Accuracy: {{score}}% ({{status}})",
        syllablesTitle: "Syllables & tones breakdown:",
        syllableLine:
          "Syllable {{index}}: \"{{syllable}}\" ({{tone}}) ➔ You pronounced: {{status}} ({{score}}%)",
        pitchTitle: "Pitch curve comparison:",
        userVoice: "Your voice:",
        userVoiceTitle: "Replay your voice",
        aiModel: "AI model:",
        aiModelTitle: "Listen to a slow model pronunciation",
        recordTitle: "Record this syllable again now:",
        recordAria: "Tap to record",
        recording: "Recording... tap again to stop",
        retestResult: "Latest re-score: {{score}}%",
        close: "Close",
        watchShorts: "Watch mouth-shape Shorts",
      },
    },
  },
  vocabularyNotebook: {
    title: "Vocabulary Notebook",
  },
  historyProgress: {
    title: "History & Progress",
    badge: "Coming soon",
    comingSoonDesc:
      "Detailed progress statistics are being finished. Meanwhile, you can continue the 5-day learning path, enter the speaking room or review your vocabulary notebook.",
    learningPathCta: "5-day learning path",
    speakingRoomCta: "Speaking room",
    vocabularyCta: "Vocabulary notebook",
  },
}
