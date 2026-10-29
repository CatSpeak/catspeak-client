const stopStream = (stream) => {
  if (!stream || typeof stream.getTracks !== "function") return
  stream.getTracks().forEach((track) => track.stop())
}

export const requestMicrophoneAccess = async () => {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return false
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stopStream(stream)
    return true
  } catch {
    return false
  }
}
