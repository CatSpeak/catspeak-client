/**
 * Converts raw AI interaction objects into flat message arrays
 * suitable for rendering in MessageList.
 *
 * Each interaction produces 1–2 messages: a user prompt + an AI response
 * (or loading indicator), or a single starter greeting message.
 *
 * This is a pure function — no hooks, no side effects.
 *
 * @param {Array} interactions - The raw aiInteractions state array
 * @returns {Array} Flat array of displayable message objects
 */
export const flattenAiInteractions = (interactions) =>
  interactions.flatMap((interaction) => {
    // Special: Starter greeting item (FR-001, FR-007)
    if (interaction.type === "starter-greeting") {
      return [
        {
          id: interaction.id,
          interactionId: interaction.id,
          type: "starter-greeting",
          isStarterGreeting: true,
          timestamp: interaction.timestamp,
          topicInfo: interaction.topicInfo,
          suggestions: interaction.suggestions,
          from: interaction.aiFrom || {
            name: "Cat Speak",
            isSystem: false,
            isAi: true,
          },
        },
      ]
    }

    const msgs = []

    // 1. The user's prompt
    msgs.push({
      id: interaction.id + "-prompt",
      interactionId: interaction.id,
      timestamp: interaction.timestamp,
      message: interaction.prompt,
      promptRaw: interaction.promptRaw || interaction.prompt,
      topic: interaction.topic,
      isPublic: interaction.topic === "public-ai",
      questioner: interaction.questioner,
      from: interaction.from,
      replyTo: interaction.replyTo,
    })

    // 2. The AI response (or loading / error state)
    const replyTo = {
      message: interaction.prompt,
      name: interaction.from?.name || "User",
    }

    if (interaction.status === "loading") {
      msgs.push({
        id: interaction.id + "-response",
        interactionId: interaction.id,
        timestamp: interaction.timestamp + 1,
        message: null,
        status: "loading",
        replyTo,
        topic: interaction.topic,
        isPublic: interaction.topic === "public-ai",
        questioner: interaction.questioner,
        from: { name: "Cat Speak", isSystem: false, isAi: true },
      })
    } else if (
      interaction.status === "done" ||
      interaction.status === "error"
    ) {
      msgs.push({
        id: interaction.id + "-response",
        interactionId: interaction.id,
        timestamp: interaction.timestamp + 1,
        message: interaction.response,
        followUpSuggestions: interaction.followUpSuggestions || [],
        promptRaw: interaction.promptRaw || interaction.prompt,
        status: interaction.status,
        replyTo,
        topic: interaction.topic,
        isPublic: interaction.topic === "public-ai",
        questioner: interaction.questioner,
        from: interaction.aiFrom || {
          name: "Cat Speak",
          isSystem: false,
          isAi: true,
        },
      })
    }

    return msgs
  })
