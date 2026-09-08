/**
 * Single source of truth for telling real users apart from non-human
 * LiveKit participants (STT agent, watch-together media ingress, EGRESS/SIP
 * workers, AI tutors, ...).
 *
 * Waiting-room / community counts, avatar previews and `isRoomFull` must use
 * this — never raw `participants.length` or `NumParticipants`.
 *
 * Detection order (first match wins):
 *  1. `isAgent === true` / non-STANDARD `kind` (LiveKit SDK, available in-call)
 *  2. `metadata.is_stt_agent === true` / `metadata.type === "media"`
 *     (set by the agent itself via `set_metadata`)
 *  3. `attributes` map equivalents (no JSON.parse needed)
 *  4. Identity prefixes `agent*` / `room-stt-*` / `media-agent-*`
 *     (fallback for agents that haven't set metadata yet)
 *
 * Plain API DTOs (`{ accountId, username, avatarUrl }` from `GET /rooms`)
 * have no identity/kind/metadata and are always treated as human.
 */

const NON_HUMAN_IDENTITY_PREFIXES = ["agent", "room-stt-", "media-agent-"]

export const parseParticipantMetadata = (metadata) => {
  if (!metadata) return {}
  if (typeof metadata === "object") return metadata
  try {
    return JSON.parse(metadata)
  } catch {
    return {}
  }
}

const getIdentity = (p) =>
  p?.identity ?? p?.participantId ?? p?.participant_id ?? ""

const getKind = (p) => p?.kind ?? p?.participantKind ?? undefined

const hasNonHumanAttributes = (attributes) => {
  if (!attributes || typeof attributes !== "object") return false
  const flag =
    attributes.is_stt_agent ?? attributes.isSttAgent ?? attributes["lk.agent_name"]
  if (typeof flag === "string" && flag.toLowerCase() === "true") return true
  if (flag === true) return true
  // LiveKit agent workers carry an `lk.agent_name` attribute (e.g. "assistant-stt").
  if (
    typeof attributes["lk.agent_name"] === "string" &&
    attributes["lk.agent_name"].trim() !== ""
  )
    return true
  const type = attributes.type ?? attributes.kind
  return typeof type === "string" && type.toLowerCase() === "media"
}

/**
 * Returns true when the participant is a bot/agent/ingress/egress — i.e. it
 * must be excluded from human counts.
 */
export const isNonHumanParticipant = (participant) => {
  const p = participant
  if (!p) return true

  // Plain API DTOs from GET /rooms are always real users.
  if (p.accountId != null && getIdentity(p) === "" && getKind(p) === undefined) {
    return false
  }

  // 1. LiveKit SDK signals (strongest, no race with set_metadata).
  if (p.isAgent === true) return true
  const kind = getKind(p)
  if (kind !== undefined && kind !== null) {
    if (typeof kind === "number") {
      // ParticipantInfo_Kind: 0 = STANDARD (human), everything else is not.
      if (kind !== 0) return true
    } else if (typeof kind === "string") {
      const normalized = kind.trim().toLowerCase()
      if (normalized !== "" && normalized !== "standard" && normalized !== "0")
        return true
    }
  }

  // Top-level flags used by speaking-stats payloads.
  if (p.is_stt_agent === true) return true

  // 2. Metadata flag set by the agent itself.
  const meta = parseParticipantMetadata(p.metadata)
  if (meta.is_stt_agent === true) return true
  if (
    typeof meta.type === "string" &&
    meta.type.toLowerCase() === "media"
  )
    return true

  // 3. Attributes map (same signals, no JSON.parse needed).
  if (hasNonHumanAttributes(p.attributes)) return true

  // 4. Identity prefix fallback (agent hasn't set metadata/kind yet).
  const identity = String(getIdentity(p) || "")
  const lowered = identity.toLowerCase()
  return NON_HUMAN_IDENTITY_PREFIXES.some((prefix) =>
    lowered.startsWith(prefix.toLowerCase()),
  )
}

/** Returns true for real users that count toward room occupancy. */
export const isHumanParticipant = (participant) =>
  !isNonHumanParticipant(participant)

/** Filters a list down to real users (null-safe). */
export const filterHumanParticipants = (participants) =>
  Array.isArray(participants) ? participants.filter(isHumanParticipant) : []
