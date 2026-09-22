export default {
  placementTest: {
    title: "Level Assessment",
    planRequiredTitle: "Pro Plan Required",
    planRequiredSubtext:
      "The AI Placement Test feature is exclusively available for Pro subscribers. Please upgrade your plan to unlock this feature!",
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
      playUserAudio: "Replay recording",
      stopUserAudio: "Stop audio",
      pinyinLabel: "Pinyin: {{pinyin}}",
      scriptHanzi: "Hanzi",
      scriptPinyin: "Pinyin",
      scriptMeaning: "Vietnamese",
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
      recordedStatus: "Recorded",
      pressMicToRecord: "Tap mic to answer",
      reRecordCta: "Record again",
      stopRecordCta: "Stop recording",
      startRecordCta: "Start speaking",
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
      pauseCancelCta: "Cancel test and restart from beginning",
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
      topbarTitle: "HSK 3.0 Proficiency Report",
      topbarSub: "Student: {{name}} · Exam code: #{{code}}",
      studentFallback: "Student",
      shareCta: "Share result",
      shareNotice: "Your result share link is ready.",
      badge: "HSK 3.0 STANDARD",
      scoreLabel: "Score: {{score}} / 100",
      bandTitle: "HSK {{band}} · {{tier}}",
      cefrLabel: "European Reference Framework: CEFR {{cefr}}",
      heroDescription:
        "You can communicate in daily contexts with pronunciation and reflexes suited to HSK {{band}}. Your spoken vocabulary is well developed.",
      feedbackTitle: "Pedagogical feedback from AI Tutor",
      strengthLabel: "Strengths:",
      attentionLabel: "Needs attention:",
      strengthLine:
        "{{dimension}} scored {{score}}/100 — a solid base to break through.",
      weaknessLine:
        "{{dimension}} scored only {{score}}/100 — needs daily practice.",
      noWeaknessLine:
        "No significant weakness detected — keep up the current form.",
      roadmapTitle: "5-day roadmap to break through to HSK {{band}}",
      roadmapDays: [
        { tag: "D 1-2", text: "Work & interview speaking topics" },
        { tag: "D 3-4", text: "Compound-sentence reflexes with the AI Tutor" },
        { tag: "D 5", text: "Intermediate HSKK simulation challenge" },
      ],
      skillsTitle: "4-Dimension Speaking Skill Analysis",
      skillsSubtitle:
        "Standardised assessment via the AI Speech Recognition model",
      dimensions: {
        pronunciation: "Pronunciation & 4 tones",
        vocabulary: "Spoken vocabulary",
        grammar: "Sentence grammar structures",
        fluency: "Fluency & reflexes",
      },
      scoreOf: "{{score}} / 100",
      aiNote:
        "AI recommendation: HSK {{band}} is a great level to start practising natural conversational reflexes with the AI Tutor.",
      startCta: "Start the HSK {{band}} Learning Roadmap →",
      adjustCta: "Adjust Level (±1 Level)",
      adjustCaption:
        "* Students may adjust their level once before the roadmap is locked.",
      adjustLocked:
        "You have used your one-time level adjustment. The roadmap is now locked.",
      emptyTitle: "No assessment result yet",
      emptyBody:
        "Complete the speaking assessment to see your HSK 3.0 proficiency report.",
      emptyCta: "Back to Level Assessment",
    },
    tiers: {
      tierBeginner: "BEGINNER",
      tierIntermediate: "INTERMEDIATE",
      tierAdvanced: "ADVANCED",
    },
    adjust: {
      title: "Adjust Learning Level",
      currentSub: "Current AI-evaluated level: HSK {{band}} ({{tier}})",
      intro:
        "CatSpeak policy allows adjusting up to ±1 HSK level from the AI result. You may adjust only once.",
      optionDown: "Go down 1 level (lighter study, strengthen foundations)",
      optionKeep: "Keep the AI-recommended result",
      optionUp: "Go up 1 level (higher challenge, break through)",
      recommended: "Recommended",
      warning:
        "Note: After confirming, the 5-day roadmap will be regenerated for this level and the adjustment right will be locked permanently.",
      cancelCta: "Cancel / Keep HSK {{band}}",
      confirmCta: "Confirm Level Change",
      successToast: "Your learning level was updated to HSK {{band}}.",
      alreadyAdjustedToast: "You have already used your level adjustment.",
      errorToast: "Could not update the level. Please try again.",
    },
    profile: {
      topbarTitle: "Proficiency Profile & Student Status",
      topbarSub: "Manage your HSK 3.0 level · 14-day retake cycle",
      certificateBadge: "CURRENT CERTIFICATE",
      scoreLabel: "Score: {{score}} / 100",
      bandTitle: "HSK {{band}} · {{tier}}",
      cefrLabel: "CEFR: {{cefr}} · Speaking standard met",
      certificateDescription:
        "Fluent communication at work and in daily life. Completed the 5-question adaptive AI CAT assessment on {{date}}.",
      testDate: "Test date: {{date}}",
      testCode: "Test code: #{{code}}",
      roadmapTitle: "Roadmap to HSK {{band}}",
      roadmapProgress: "{{done}}/{{total}} Days ({{percent}}%)",
      roadmapDone: "Done",
      roadmapActive: "In progress",
      roadmapContinue: "Continue Day {{day}} lesson →",
      roadmapComplete: "🎉 You have completed the entire learning roadmap!",
      roadmapStages: [
        { tag: "Stage 1 (D 1-2)", text: "Workplace & interview speaking" },
        {
          tag: "Stage 2 (D 3-4)",
          text: "Complex sentence reflexes with AI Tutor",
        },
        { tag: "Stage 3 (D 5)", text: "HSKK Intermediate exam simulation" },
      ],
      skillsTitle: "Initial 4-Skill Speaking Assessment",
      cooldownTitle: "14-Day Retake Policy",
      cooldownActive: "Cooldown cycle is active",
      cooldownRemaining: "{{days}} days left",
      cooldownElapsedLabel: "Accumulated practice time:",
      cooldownElapsedValue: "{{elapsed}} / {{total}} days ({{percent}}%)",
      cooldownUnlockAt: "Expected unlock time: {{date}} (00:00)",
      cooldownPolicy:
        "Speaking assessment policy: students need at least 14 days of continuous practice so scores reflect real progress.",
      continueRoadmapCta: "Continue HSK {{band}} roadmap →",
      retakeLockedCta: "🔒 Retake not due yet (Unlocks {{date}})",
      eligibleTitle: "You Are Eligible for a New Test!",
      eligibleSub: "The 14-day cooldown has completed",
      eligibleBadge: "Ready to test",
      eligibleUnlocked: "✓ The adaptive CAT assessment gate is now unlocked",
      eligibleBody:
        "The 14-day cycle is over. You can take the 5-question adaptive CAT assessment now to check your progress and refresh your personalized roadmap.",
      retakeNowCta: "Retake Now →",
      continueCurrentCta: "Keep practising the current roadmap",
      historyTitle: "Speaking Assessment History",
      historyCountValid: "{{count}} valid test",
      historyCountCompleted: "{{count}} completed test",
      historyFirst: "Attempt 1 · Adaptive CAT (5 questions)",
      historyValid: "Valid",
      historySecondLocked: "Attempt 2 · Periodic band-up assessment",
      historySecondReady: "Attempt 2 · New placement assessment",
      historyScheduled: "Expected: {{date}} (after 14 days)",
      historyLocked: "Locked",
      historyReady: "Ready to take today",
      historyUnlocked: "Unlocked",
      adviceTitle: "✨ Pedagogical advice from AI Tutor",
      adviceCooling:
        "You have completed {{percent}}% of the HSK {{band}} roadmap with a solid pronunciation base. Finish the remaining stages to unlock your retake on {{date}} and break through to HSK {{nextBand}}!",
      adviceEligible:
        "You have completed the entire HSK {{band}} roadmap and the full 14-day cooldown! Tap \"Retake Now\" to take the 5-question adaptive assessment and confidently break through to HSK {{nextBand}}!",
      emptyTitle: "No Proficiency Profile Yet",
      emptyBody:
        "Complete the speaking assessment to see your proficiency profile and retake status.",
      emptyCta: "Start the placement test",
      confirm: {
        title: "Confirm Retaking the Test?",
        body: "This will start a new 5-question adaptive CAT assessment to determine your HSK 3.0 band again.",
        cooldownTitle: "Note on the cooldown cycle (14-day cooldown):",
        cooldownBody:
          "After completing it, you must wait at least 14 days of further practice before you can retake the test.",
        bullet1:
          "The new test result will update your proficiency profile directly.",
        bullet2:
          "The 5-day breakthrough roadmap will be reset from scratch by AI Tutor.",
        cancelCta: "Cancel",
        confirmCta: "Agree & Start Test →",
        errorToast: "Could not start a new test. Please try again.",
      },
    },
    lifecycle: {
      errorToast: "Could not start a new session. Please try again.",
      resume: {
        title: "Unfinished Test Detected",
        body: "We found an unfinished session of yours ({{answered}} / {{total}} questions completed). This session stays valid for another {{remaining}}.",
        safeTitle: "Your test data is safely preserved:",
        safeBody:
          "You will resume at Question {{order}} with no lost points, including the recordings of the {{answered}} submitted questions.",
        deadlineLabel: "Session retention deadline:",
        autoCancel: "Auto-cancels after: {{date}}",
        remainingChip: "⏳ {{remaining}} left",
        discardCta: "Discard & Restart",
        resumeCta: "Resume Question {{order}} →",
      },
      expired: {
        title: "Session Expired (>24h)",
        body: "Your previous session exceeded the 24-hour retention window. The temporary audio data was automatically destroyed under our security policy.",
        securityTitle: "CAT exam security rule:",
        securityBody:
          "To keep the assessment objective and the level ranking accurate, students must take a completely new test starting from Question 1.",
        startCta: "Start a New Test from the Beginning →",
        homeCta: "Back to Profile Home",
      },
      takeover: {
        title: "Multiple Tabs Detected",
        body: "To stay stable and avoid microphone conflicts, CatSpeak allows only one speaking room open at a time.",
        mechanismTitle: "Old session disconnect mechanism (Session Takeover):",
        mechanismBody:
          "If you continue in this tab, the other open tab will be disconnected and locked immediately to prevent duplicate data.",
        continueCta: "Continue in This Tab →",
        closeCta: "Close This Tab",
        takenOverTitle: "Session Taken Over in Another Tab",
        takenOverBody:
          "Your test is now running in another tab. The session in this tab has been paused and locked to prevent duplicate data.",
        takenOverCta: "Back to Profile Home",
      },
    },
  },
}
