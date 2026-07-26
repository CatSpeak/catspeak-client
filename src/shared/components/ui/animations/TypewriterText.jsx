import React, { useState, useEffect } from "react"

/**
 * TypewriterText Component
 * Renders a clean typewriter animation cycling through single or multiple phrases.
 */
const TypewriterText = ({
  words,
  speed = 80,
  deleteSpeed = 40,
  delay = 2200,
  className = "",
  cursorClassName = "animate-pulse text-rose-300 font-light ml-0.5 select-none",
  reserveText,
}) => {
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentWord = Array.isArray(words) ? words[index % words.length] : words

  useEffect(() => {
    if (!currentWord) return

    if (!isDeleting && subIndex === currentWord.length) {
      if (!Array.isArray(words) || words.length <= 1) return
      const timeout = setTimeout(() => setIsDeleting(true), delay)
      return () => clearTimeout(timeout)
    }

    if (isDeleting && subIndex === 0) {
      setIsDeleting(false)
      setIndex((prev) => (prev + 1) % words.length)
      return
    }

    const timeout = setTimeout(
      () => {
        setSubIndex((prev) => prev + (isDeleting ? -1 : 1))
      },
      isDeleting ? deleteSpeed : speed
    )

    return () => clearTimeout(timeout)
  }, [subIndex, isDeleting, currentWord, words, speed, deleteSpeed, delay])

  // Reset when words array or translation changes
  useEffect(() => {
    setSubIndex(0)
    setIsDeleting(false)
  }, [words])

  const displayedText = currentWord ? currentWord.substring(0, subIndex) : ""

  const longestText =
    reserveText ||
    (Array.isArray(words)
      ? words.reduce((a, b) => (a.length > b.length ? a : b), "")
      : words)

  return (
    <span className={`inline-grid grid-cols-1 grid-rows-1 justify-items-center ${className}`}>
      {/* Invisible Height & Width Reservation Layer to eliminate layout shifts */}
      <span
        className="col-start-1 row-start-1 opacity-0 pointer-events-none select-none invisible"
        aria-hidden="true"
      >
        {longestText}
        <span className="font-light ml-0.5">|</span>
      </span>

      {/* Visible Active Typing Layer */}
      <span className="col-start-1 row-start-1 text-center">
        {displayedText}
        <span className={cursorClassName}>|</span>
      </span>
    </span>
  )
}

export default TypewriterText
