export default {
  placementTest: {
    title: "Level Assessment",
    consent: {
      pill: "Live conversation with AI",
      heading: "Adaptive HSK Speaking Test with AI",
      intro:
        "A smart speaking assessment that simulates the real HSK 3.0 exam. The AI Tutor interacts with you live and automatically adjusts the difficulty to your responses.",
      features: [
        {
          title: "5 Flexible Adaptive Questions",
          desc: "Optimised for a 5-7 minute test that accurately measures your HSK 1-6 band.",
        },
        {
          title: "Live Conversation with a Native AI",
          desc: "Standard Beijing pronunciation, natural tone, and instant interactive feedback.",
        },
        {
          title: "4-Dimension Report & Roadmap",
          desc: "Measures pronunciation, vocabulary, grammar, and fluency with a 5-day roadmap.",
        },
      ],
      agreementTitle: "Audio Data Agreement",
      agreementBody:
        "To analyse your speech and issue an accurate HSK level certificate, CatSpeak will capture audio through your microphone under strict security standards.",
      privacyTitle: "International PDPA Privacy Commitment:",
      bulletAudioOnly:
        "Audio is used only for scoring and improving the response model.",
      bulletNoShare:
        "Never shared with third parties; encrypted and stored for up to 30 days.",
      checkbox:
        "I consent to CatSpeak using my microphone and processing my audio for this placement test.",
      startCta: "Start Microphone Check",
      recommend:
        "Tip: Wear a headset with a microphone and sit in a quiet room for the most accurate acoustic result.",
    },
    blocked: {
      title: "Your Browser Is Blocking Microphone Access",
      body: "CatSpeak needs microphone access to connect you to the speaking exam room and score your HSK responses.",
      consequencesTitle: "What happens without permission:",
      consequences: [
        "You cannot complete the speaking assessment.",
        "The system cannot issue a valid HSK level certificate.",
        "It cannot build an accurate personalised study roadmap.",
      ],
      stepsTitle: "3 Steps to Unblock the Microphone",
      steps: [
        {
          title: "1. Click the Lock / Permissions icon",
          desc: "Click the lock icon on the left of the browser address bar.",
        },
        {
          title: "2. Allow the Microphone",
          desc: "Switch Microphone from Block to Allow.",
        },
        {
          title: "3. Click Retry to connect",
          desc: "Press the button below so the system can detect and reconnect the microphone.",
        },
      ],
      retryCta: "Unblocked, Check Again",
      trust: "CatSpeak guarantees 100% encryption and security of your audio data.",
    },
    device: {
      title: "Speaking Voice Test",
      statusReady: "Volume is good",
      statusListening: "Listening…",
      statusNoSignal: "No voice detected",
      statusError: "Microphone unavailable",
      instruction:
        "Read the Chinese sample sentence below out loud to check your voice quality:",
      sampleHanzi: "你好！欢迎来到 CatSpeak。",
      samplePinyin: "Nǐ hǎo! Huānyíng lái dào CatSpeak.",
      sampleTranslation: "(Hello! Welcome to CatSpeak.)",
      record: "Tap to record a voice sample",
      recording: "Recording… tap to stop",
      replay: "Replay the sample you just recorded ({{duration}}s)",
      deviceTitle: "Input Device Settings",
      deviceCaption: "System default · Working properly",
      devicePlaceholder: "No microphone found",
      checklist: [
        "Audio signal is clear, with no background noise",
        "Connection is stable and responds quickly",
        "Recording device is ready for the test",
      ],
      continueCta: "Sound Is Good, Continue",
      errorTitle: "Cannot Access the Microphone",
      errorBody:
        "CatSpeak could not connect to your recording device. Check your microphone permission and try again.",
      errorRetryCta: "Retry Microphone Check",
    },
    noAudio: {
      instruction:
        "The system received no audio from your microphone after 5 seconds of sample recording.",
      meterLabel: "No audio signal (0 dB)",
      info: "Please try the fixes on the side before retrying.",
      guideTitle: "Recording Troubleshooting Guide",
      switchHint: "Tap to switch to another microphone source",
      fixes: [
        {
          title: "1. Check the physical Mute switch",
          desc: "Slide the mic switch on your headset cable or computer keyboard to on.",
        },
        {
          title: "2. Re-plug the microphone jack firmly",
          desc: "Unplug and firmly reinsert the 3.5mm plug or USB port.",
        },
        {
          title: "3. Raise the volume in Sound Settings",
          desc: "Increase the Input Volume level to 80 - 100%.",
        },
      ],
      retryCta: "Try Speaking Again",
    },
    band: {
      title: "Choose Your Estimated Target Level",
      subtitle:
        "The AI Tutor will start the first question at this level, then automatically adjust the difficulty to your actual responses.",
      difficultyLabel: "Difficulty:",
      startCta: "Start Speaking Practice ({{band}})",
      lockedNote:
        "The adaptive assessment has 5 questions · Difficulty adjusts automatically to your responses",
      items: {
        hsk1_2: {
          level: "Beginner",
          title: "HSK 1 - 2",
          desc: "Start with pronunciation and get comfortable with greetings and basic vocabulary.",
          vocab: "Target vocabulary: 150 – 300 words",
          time: "Study time: 0 – 3 months",
          topics: ["Greetings", "Shopping"],
          difficulty: "Light",
        },
        hsk3_4: {
          level: "Most popular",
          title: "HSK 3 - 4",
          desc: "You have studied 6–12 months and can communicate naturally in daily life and travel.",
          vocab: "Target vocabulary: 600 – 1,200 words",
          time: "Study time: 6 – 12 months",
          topics: ["Work", "Travel", "Hobbies"],
          difficulty: "Balanced",
        },
        hsk5_6: {
          level: "Advanced",
          title: "HSK 5 - 6",
          desc: "Fast reflexes, deep debate and negotiation about economics and culture.",
          vocab: "Target vocabulary: 2,500 – 5,000 words",
          time: "Study time: Over 1.5 years",
          topics: ["Presentations", "Negotiation"],
          difficulty: "Challenging",
        },
      },
    },
    session: {
      title: "Speaking Exam Room",
      body: "Your session was created and stored safely. The live speaking room will be finished in the next step.",
      codeLabel: "Session code",
      backCta: "Back to device check",
    },
    room: {
      title: "Speaking Practice Room",
      subtitle: "Adaptive AI conversation • HSK 3.0",
      connection: "Stable connection",
      configure: "AI settings",
      pause: "Pause test",
      casual: "Casual Chat",
      placement: "Placement Test",
      progress: "Progress: Question {{current}} / {{total}}",
      aiLabel: "AI (Minh Minh)",
      replay: "Replay",
      pinyinLabel: "Pinyin: {{pinyin}}",
      scriptHanzi: "Hanzi",
      scriptPinyin: "Pinyin",
      youLabel: "YOU",
      statusWaiting: "Listening...",
      statusRecognized: "● Recognised",
      statusSubmitted: "Submitted",
      statusNoAudio: "No audio yet",
      transcriptPlaceholder: "Your answer will appear here...",
      analyzingSubline: "Automatically analysing pronunciation & grammar...",
      waitingSubline: "Say your answer in Chinese.",
      aiListening: "The AI is listening to your voice...",
      aiAnalyzing: "The AI is analysing your answer...",
      aiNotHearing: "The AI is listening more carefully...",
      timerRecording: "{{time}} / 00:45 • Recording response",
      timerWaiting: "{{time}} / 00:45 • Waiting for audio",
      submitCta: "Finish answer",
      skipCta: "Skip this question (0 points) →",
      scoringSummary: "Compiling your score...",
      retryBanner:
        "The AI did not catch your answer. Please say it again. (Attempt {{attempt}} / {{max}})",
      noHearingBanner:
        "The AI could not hear your voice. Please check your microphone or raise the input volume.",
      volumeHint:
        "The volume is quite low. Speak louder or increase the microphone volume.",
      configureNotice: "AI settings will be available soon.",
      pauseTitle: "Survey Paused",
      pauseBody:
        "The timer for the current question has stopped. You can grab a drink or take a break before continuing.",
      pauseSafeData:
        "Data is safe: Your previous answers ({{answered}} questions) have been encrypted and stored successfully on the server.",
      pauseBudgetLabel: "Maximum pause time remaining:",
      pauseBudgetChip: "⏳ {{time}} min",
      pauseLeaveCta: "Leave Exam Room Temporarily",
      pauseResumeCta: "Resume the Test Now ▷",
      reconnectTitle: "Connection Lost",
      reconnectBody:
        "The audio connection to the AI exam room was interrupted by an unstable network signal. The system is trying to reconnect.",
      reconnectSafeData:
        "Progress saved: All previous answer data ({{answered}} questions) has been safely stored at Question {{order}}/{{total}}. Your score will not be affected.",
      reconnectProgressLabel: "Automatic reconnection progress:",
      reconnectProgressChip:
        "🔄 In {{seconds}} seconds... (Attempt {{attempt}}/{{max}})",
      reconnectRetryCta: "Reconnect Now 🔄",
    },
    scoring: {
      title: "Calculating Your Speaking Result",
      subtitle: "HSK 3.0 Proficiency Assessment",
      analyzingPill: "● Analysing data...",
      heading: "Compiling Your Speaking Proficiency...",
      body: "The AI model is cross-checking your 5 answers against the native speech bank and the HSK 3.0 assessment standard.",
      stepPronunciation: "Pronunciation & 4 Tones analysis",
      stepVocabulary: "Vocabulary & Grammar scoring",
      stepRanking: "HSK 3.0 level ranking",
      statusDone: "Completed",
      statusActive: "Calculating ({{percent}}%)...",
      statusPending: "Waiting...",
      errorTitle: "Scoring Server Connection Error",
      errorSubtitle: "Server Connection Incident",
      helpCta: "Technical help",
      helpNotice:
        "Your technical help request has been sent. The CatSpeak team will reach out shortly.",
      errorHeading: "Unable to Load the Assessment Result",
      errorBody:
        "Your exam data is safely stored, but the connection to the AI scoring server was interrupted. Please resubmit to receive your result.",
      safeTitle:
        "All {{answered}}/{{total}} spoken answers have been safely preserved",
      safeBody:
        "The CatSpeak cloud has fully stored your audio files. When you retry, the AI will continue the analysis without you redoing the test from the start.",
      safeMeta:
        "Session code: #{{code}}  ·  PDPA-compliant security  ·  Auto-retry once the network is stable",
      retryCta: "Retry scoring now",
      saveLaterCta: "Save & view later on Dashboard",
    },
    result: {
      title: "Placement Assessment Result",
      body: "Your HSK speaking result report is ready. The detailed screen will be finished in the next step.",
      backCta: "Back to Placement Test",
    },
  },
}
