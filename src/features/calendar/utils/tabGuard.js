/**
 * R1-1: while the role is still resolving `isTeacher` can be null. Deriving the
 * effective tab (instead of mutating state during render) keeps a Teacher's
 * `state.activeTab === "event"` request intact until the role resolves.
 */
export const resolveEffectiveTab = (isTeacher, activeTab) =>
  !isTeacher && activeTab === "event" ? "calendar" : activeTab
