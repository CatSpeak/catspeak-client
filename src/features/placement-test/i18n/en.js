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
      grantedTitle: "Microphone Access Granted",
      grantedBody:
        "Your microphone is ready. The device check step will be added in the next stage.",
    },
  },
}
