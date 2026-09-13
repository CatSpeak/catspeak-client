import React, { useState, useEffect, useRef } from "react"
import { Play, Square } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ProgressBar from "@/shared/components/ui/ProgressBar"
import { buildAudioConstraint } from "@/shared/utils/mediaConstraintUtils"

const DETECT_THRESHOLD = 8
const CLIP_THRESHOLD = 85

const MicTestVisualizer = ({
  testMic,
  onToggleTest,
  stream,
  selectedMic,
  label = "Test mic",
  stopLabel = "Stop testing",
  hint,
  listeningLabel,
  detectedLabel,
}) => {
  const [volumeLevel, setVolumeLevel] = useState(0) // 0 to 100%
  const [hasDetected, setHasDetected] = useState(false)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animFrameRef = useRef(null)
  const detectedRef = useRef(false)

  useEffect(() => {
    if (!testMic) {
      setVolumeLevel(0)
      setHasDetected(false)
      detectedRef.current = false
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
        audioContextRef.current = null
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
      return
    }

    let activeStream = stream
    let internalStream = null
    let cancelled = false

    const setupAudio = async () => {
      try {
        if (!activeStream || activeStream.getAudioTracks().length === 0) {
          const constraints = {
            audio: buildAudioConstraint(selectedMic),
          }
          internalStream =
            await navigator.mediaDevices.getUserMedia(constraints)
          if (cancelled) {
            internalStream.getTracks().forEach((track) => track.stop())
            return
          }
          activeStream = internalStream
        }

        if (!activeStream || activeStream.getAudioTracks().length === 0) return

        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return

        const audioCtx = new AudioCtx()
        if (audioCtx.state === "suspended") {
          await audioCtx.resume()
        }
        audioContextRef.current = audioCtx

        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        analyserRef.current = analyser

        const source = audioCtx.createMediaStreamSource(activeStream)
        source.connect(analyser)

        const dataArray = new Uint8Array(analyser.fftSize)

        const updateMeter = () => {
          if (cancelled) return
          analyser.getByteTimeDomainData(dataArray)

          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            const amplitude = (dataArray[i] - 128) / 128
            sum += amplitude * amplitude
          }
          const rms = Math.sqrt(sum / dataArray.length)
          const pct = Math.min(100, Math.max(0, Math.round(rms * 280)))

          setVolumeLevel(pct)
          if (pct > DETECT_THRESHOLD && !detectedRef.current) {
            detectedRef.current = true
            setHasDetected(true)
          }
          animFrameRef.current = requestAnimationFrame(updateMeter)
        }

        updateMeter()
      } catch (err) {
        console.warn("[MicTestVisualizer] Audio setup failed:", err)
      }
    }

    setupAudio()

    return () => {
      cancelled = true
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
        audioContextRef.current = null
      }
      if (internalStream) {
        internalStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [testMic, stream, selectedMic])

  const barColor = volumeLevel > CLIP_THRESHOLD
    ? "bg-red-500"
    : "bg-emerald-500"

  const statusText = testMic
    ? hasDetected
      ? detectedLabel || "Audio detected"
      : listeningLabel || "Say a few words..."
    : hint || "Press Test mic and say a few words"

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-primaryBg/60 p-3">
      <div className="flex items-center gap-3">
        <PillButton
          type="button"
          onClick={onToggleTest}
          variant={testMic ? "secondary" : "primary"}
          textColor={testMic ? "#990011" : undefined}
          startIcon={
            testMic ? (
              <Square size={12} className="fill-current" aria-hidden="true" />
            ) : (
              <Play size={14} className="fill-current" aria-hidden="true" />
            )
          }
          className="shrink-0 min-w-[132px]"
        >
          {testMic ? stopLabel : label}
        </PillButton>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span
              role="status"
              aria-live="polite"
              className={`truncate text-[11px] font-medium ${
                testMic && hasDetected
                  ? "text-emerald-600"
                  : "text-neutral-500"
              }`}
            >
              {statusText}
            </span>
            {testMic && (
              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-neutral-700">
                {volumeLevel}%
              </span>
            )}
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={testMic ? volumeLevel : 0}
            aria-label={label}
          >
            <ProgressBar
              progress={testMic ? volumeLevel : 0}
              heightClass="h-2"
              colorClass={`${barColor} transition-all !duration-75 ease-out`}
              trackColorClass="bg-neutral-200"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MicTestVisualizer
