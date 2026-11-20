# Loading Guidelines

Standard wait time recommendations for loading states across CatSpeak:

| Expected wait time | Recommendation | UX Rationale & Implementation |
| :--- | :--- | :--- |
| **Instant (under 200ms)** | **No indicator** | Operations under 200ms feel immediate to human perception. Displaying a loader here causes a jarring flash. Debounce indicator display by ~200ms. |
| **Short (between 200ms and 5s)** | **Loading indicator** | Use an indeterminate circular indicator (`LoadingSpinner`), subtle pulse, or button loading state (`PillButton loading`). Proves the system received the action and is working. |
| **Long (Over 5s)** | **Progress indicator** | After 5 seconds, an indeterminate spinner causes anxiety ("is it frozen?"). Escalate to a progress bar (`ProgressBar`), step progress, or descriptive status messages (e.g., "Connecting to media servers... Still working, please wait"). |

---

### Implementation Guidelines:
1. **Debouncing Short Actions:**
   When triggering an async mutation or join, if the operation finishes in < 200ms, don't show a spinner. Disable interactions immediately to prevent double-submits, but wait 200ms before rendering spinner icons.
2. **5s Escalation for Calls/Rooms:**
   When connecting to video rooms or WebRTC sessions:
   - `0 - 200ms`: Render nothing or keep the existing screen steady.
   - `200ms - 5s`: Show the indeterminate circular loader with initial message (e.g., *"Connecting..."*).
   - `> 5s`: Transition to a progressive status indicator with a progress bar and reassurance message.
