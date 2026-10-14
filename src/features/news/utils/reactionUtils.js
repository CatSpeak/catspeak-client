/**
 * Utilities for normalizing and aggregating post reactions.
 * Supports both detail API schema (array of objects) and list API schema (array of strings).
 */

export const normalizeReactions = (reactions) => {
  const result = {
    like: [],
    love: [],
    haha: [],
  };

  if (!reactions) return result;

  const raw = reactions?.data ?? reactions;

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const keys = Object.keys(raw);
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      const targetKey =
        lowerKey === "like"
          ? "like"
          : lowerKey === "love"
            ? "love"
            : lowerKey === "haha"
              ? "haha"
              : null;

      if (!targetKey) continue;

      const list = raw[key];
      if (Array.isArray(list)) {
        result[targetKey] = list.map((item) => {
          if (typeof item === "string") {
            return {
              accountId: null,
              username: item,
              avatarImageUrl: null,
              reactionType:
                targetKey.charAt(0).toUpperCase() + targetKey.slice(1),
            };
          }
          return {
            accountId: item.accountId || item.userId || item.id || null,
            username: item.username || item.name || item.authorName || "User",
            avatarImageUrl: item.avatarImageUrl || item.avatarUrl || null,
            reactionType:
              targetKey.charAt(0).toUpperCase() + targetKey.slice(1),
          };
        });
      }
    }
  }

  return result;
};

export const getAllReactionsList = (normalizedReactions) => {
  if (!normalizedReactions) return [];
  return [
    ...(normalizedReactions.like || []),
    ...(normalizedReactions.love || []),
    ...(normalizedReactions.haha || []),
  ];
};

export const getTotalReactionsCount = (normalizedReactions, fallbackTotal = 0) => {
  if (!normalizedReactions) return fallbackTotal;
  const computed =
    (normalizedReactions.like?.length || 0) +
    (normalizedReactions.love?.length || 0) +
    (normalizedReactions.haha?.length || 0);
  return Math.max(fallbackTotal || 0, computed);
};
