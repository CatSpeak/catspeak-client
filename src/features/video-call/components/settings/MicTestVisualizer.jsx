import React, { useState, useEffect, useRef } from "react"
import { Play, Square } from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import ProgressBar from "@/shared/components/ui/ProgressBar"
import { buildAudioConstraint } from "@/shared/utils/mediaConstraintUtils"

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
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animFrameRef = useRef(null)

  useEffect(() => {
    if (!testMic) {
      setVolumeLevel(0)
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

  const barColor =
    volumeLevel > CLIP_THRESHOLD ? "bg-red-500" : "bg-emerald-500"

  return (
    <div className="flex flex-col gap-1">
      <span className="truncate text-xs text-neutral-700 dark:text-neutral-200">
        {label}
      </span>

      <div className="h-[56px] flex items-center gap-4">
        <IconButton
          type="button"
          onClick={onToggleTest}
          variant="primary"
          title={testMic ? stopLabel : label}
          aria-label={testMic ? stopLabel : label}
          className="shrink-0"
        >
          {testMic ? (
            <Square className="text-white" aria-hidden="true" />
          ) : (
            <Play className="text-white" aria-hidden="true" />
          )}
        </IconButton>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={testMic ? volumeLevel : 0}
          aria-label={label}
          className="min-w-0 flex-1"
        >
          <ProgressBar
            progress={testMic ? volumeLevel : 0}
            colorClass={`${barColor} transition-all !duration-75 ease-out`}
            trackColorClass="bg-neutral-200 dark:bg-neutral-800"
          />
        </div>
      </div>
    </div>
  )
}

export default MicTestVisualizer
