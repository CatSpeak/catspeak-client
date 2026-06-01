export default {
  title: "Recordings",
  refresh: "Refresh",
  storage: {
    title: "Storage",
    used: "{{used}} / {{limit}} MB",
    percentUsed: "{{percent}}% used",
    limit_used: "of {{limit}} used",
    quotaExceeded: "Storage full — delete recordings to free space",
    warningAlmostFull: "Storage capacity is almost full. Recording may automatically stop if it exceeds the limit.",
    warningLimitReached: "Recording has automatically stopped due to exceeding storage capacity. Partial recording has been saved.",
  },
  errors: {
    noRoom: "No active room — cannot record.",
    noEgress: "Recording started but no egress ID received — stop may not work.",
    noMedia: "Please turn on your camera, microphone, or share your screen before recording.",
    interrupted: "The previous recording was interrupted. A partial recording file has been saved.",
    disconnected: "Connection interrupted. Recording paused...",
  },
  list: {
    emptyTitle: "No recordings yet",
    emptyDescription: "When you record your calls, they will appear here.",
    count_one: "1 recording",
    count_other: "{{count}} recordings",
    fileUnavailable: "File unavailable — recording may still be processing",
    error: "Failed to load recordings.",
    retry: "Retry"
  },
  status: {
    completed: "completed",
    failed: "failed",
    partialCompleted: "partial completed"
  },
  player: {
    title: "Recording",
    videoNotAvailable: "Video file is not available.",
    urlExpiry: "URL expires in 60 min",
    meetingIdFallback: "Recording #{{id}}"
  },
  deleteModal: {
    title: "Delete Recording?",
    description: "This will permanently delete the recording",
    cannotUndo: "This action cannot be undone.",
    cancel: "Cancel",
    confirm: "Delete",
    deleting: "Deleting…"
  },
  actions: {
    play: "Play recording",
    playUnavailable: "File not available",
    download: "Download recording",
    downloadUnavailable: "File not available",
    delete: "Delete recording",
    startSuccess: "Recording started",
    stopSuccess: "Recording stopped — processing upload…",
    deleteSuccess: "Recording deleted",
    deleteFailed: "Failed to delete recording.",
    viewRecordings: "View Recordings",
    reconnected: "Connection restored. Recording continues.",
  }
}
