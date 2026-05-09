/**
 * Converts raw AI interaction objects into flat message arrays
 * suitable for rendering in MessageList.
 *
 * Each interaction produces 1–2 messages: a user prompt + an AI response
 * (or loading indicator).
 *
 * This is a pure function — no hooks, no side effects.
 *
 * @param {Array} interactions - The raw aiInteractions state array
 * @returns {Array} Flat array of displayable message objects
 */
export const flattenAiInteractions = (interactions) =>
  interactions.flatMap((interaction) => {
    const msgs = []

    // 1. The user's prompt
    msgs.push({
      id: interaction.id + "-prompt",
      interactionId: interaction.id,
      timestamp: interaction.timestamp,
      message: interaction.prompt,
      topic: interaction.topic,
      questioner: interaction.questioner,
      from: interaction.from,
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
        status: interaction.status,
        replyTo,
        topic: interaction.topic,
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
