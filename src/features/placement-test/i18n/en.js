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
  },
}
