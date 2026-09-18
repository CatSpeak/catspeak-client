export const STRIP_PARTICIPANT_LIMIT = 6

/**
 * Pure selection seam for MediaParticipantStrip (unit-testable).
 *
 * Shows every human participant with an avatar fallback when the camera is
 * off (YouTube-app style). Non-humans are already excluded upstream by
 * useParticipantList. (H1: the old `isLocal || isCameraEnabled` filter hid
 * remote camera-off users, so a 2-user room showed only 1.)
 */
export const getVisibleStripParticipants = (
  participants,
  limit = STRIP_PARTICIPANT_LIMIT,
) => (participants || []).slice(0, limit)
