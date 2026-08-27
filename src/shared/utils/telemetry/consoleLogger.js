/**
 * In-memory ring buffer to capture console logs, warnings, errors, and unhandled exceptions.
 */

const MAX_LOGS = 60
const logsBuffer = []
let isInitialized = false

/**
 * Safely serialize arguments to string, avoiding circular references
 */
function serializeArg(arg) {
  if (arg === null) return "null"
  if (arg === undefined) return "undefined"
  if (typeof arg === "string") return arg
  if (typeof arg === "number" || typeof arg === "boolean") return String(arg)
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}\n${arg.stack || ""}`
  }
  try {
    return JSON.stringify(arg, getCircularReplacer(), 2)
  } catch {
    return String(arg)
  }
}

function getCircularReplacer() {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]"
      }
      seen.add(value)
    }
    return value
  }
}

function addLogEntry(level, args) {
  const entry = {
    timestamp: new Date().toISOString(),
    level, // 'log' | 'info' | 'warn' | 'error'
    message: Array.from(args).map(serializeArg).join(" "),
  }

  if (logsBuffer.length >= MAX_LOGS) {
    logsBuffer.shift()
  }
  logsBuffer.push(entry)
}

export function initConsoleLogger() {
  if (isInitialized || typeof window === "undefined") return
  isInitialized = true

  const originalLog = console.log
  const originalInfo = console.info
  const originalWarn = console.warn
  const originalError = console.error

  console.log = (...args) => {
    addLogEntry("log", args)
    originalLog.apply(console, args)
  }

  console.info = (...args) => {
    addLogEntry("info", args)
    originalInfo.apply(console, args)
  }

  console.warn = (...args) => {
    addLogEntry("warn", args)
    originalWarn.apply(console, args)
  }

  console.error = (...args) => {
    addLogEntry("error", args)
    originalError.apply(console, args)
  }

  // Global uncaught error listener
  window.addEventListener("error", (event) => {
    const errorMsg = event.error ? serializeArg(event.error) : event.message
    addLogEntry("error", [`[Uncaught Error] ${errorMsg} at ${event.filename}:${event.lineno}:${event.colno}`])
  })

  // Global unhandled promise rejection listener
  window.addEventListener("unhandledrejection", (event) => {
    const reasonMsg = event.reason ? serializeArg(event.reason) : "Unknown rejection"
    addLogEntry("error", [`[Unhandled Rejection] ${reasonMsg}`])
  })
}

export function getRawConsoleLogs() {
  return [...logsBuffer]
}
