import React, { useState, useEffect, useRef } from "react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ProgressBar from "@/shared/components/ui/ProgressBar"
import { buildAudioConstraint } from "@/shared/utils/mediaConstraintUtils"

const MicTestVisualizer = ({
  testMic,
  onToggleTest,
  stream,
  selectedMic,
  label = "Test mic",
  stopLabel = "Stop testing",
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

  return (
    <div className="flex items-center gap-4 w-full">
      <PillButton
        type="button"
        onClick={onToggleTest}
        variant="primary"
        className="shrink-0 w-[110px]"
      >
        {testMic ? stopLabel : label}
      </PillButton>

      {/* Shared ProgressBar Component */}
      <div className="flex-1 flex items-center">
        <ProgressBar
          progress={testMic ? volumeLevel : 0}
          heightClass="h-2"
          colorClass="bg-cath-red-700 transition-all !duration-75 ease-out"
          trackColorClass="bg-gray-200"
        />
      </div>
    </div>
  )
}

export default MicTestVisualizer
