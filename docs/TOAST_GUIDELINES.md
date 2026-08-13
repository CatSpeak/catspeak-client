# CatSpeak Toast Guidelines

This document outlines standard practices, conventions, and examples for displaying toast notifications in CatSpeak.

---

## 🎯 When to Use Toasts vs. Other UI Patterns

| Pattern | When to Use | Example |
| :--- | :--- | :--- |
| **Toast** | Temporary, non-disruptive feedback for user actions or background events. Does not block the screen. | *"Link copied to clipboard"*, *"Room settings saved"* |
| **Inline Field Error** | Validation errors specific to a form field. Should appear directly next to/below the input. | *"Email is invalid"*, *"Password must be at least 8 characters"* |
| **Modal / Dialog** | Destructive actions, mandatory decisions, or critical flows requiring explicit user confirmation. | *"Are you sure you want to delete this workspace?"* |

---

## ✍️ Copy & Formatting Rules

1. **Keep Titles Short & Direct**:
   - Target **3 to 6 words** for the title (`message`).
   - Use sentence case (*"Room created successfully"* instead of *"ROOM CREATED SUCCESSFULLY"*).
   - Use past tense for completed actions (*"Link copied"*, *"Nickname updated"*).

2. **Use Descriptions Sparingly**:
   - Only add a `description` if it provides essential context not obvious from the title.
   - Keep descriptions to 1 concise sentence max.

3. **Tone**:
   - **Success**: Positive, encouraging, brief.
   - **Error**: Helpful, empathetic, actionable (*"Failed to connect. Please check your internet connection."* instead of *"NetworkError 500"*).

---

## 💻 API & Usage Cheat Sheet

Import `toast` exclusively from `@/components/ui/toast`:

```javascript
import { toast } from "@/components/ui/toast"
```

### 1. Success Toast
Use for positive confirmation of completed actions.
```javascript
toast.success("Room created successfully!")

// With optional description
toast.success("Room created!", {
  description: "Your room is ready to join.",
})
```

### 2. Error Toast
Use when an operation fails. Avoid technical stack traces in the title.
```javascript
toast.error("Failed to delete room")

toast.error("Upload failed", {
  description: "File size exceeds the 200MB limit.",
})
```

### 3. Info Toast
Use for neutral status updates or copy-to-clipboard feedback.
```javascript
toast.info("Link copied to clipboard")
```

### 4. Warning Toast
Use for system limits or caution alerts that don't block work.
```javascript
toast.warning("Storage limit almost full", {
  description: "You have used 90% of your free storage.",
})
```

### 5. Action Button (Undo, Retry, View)
Use when the user can undo an action or take immediate recovery steps.
```javascript
toast.info("Message deleted", {
  action: {
    label: "Undo",
    onClick: () => restoreMessage(),
  },
})
```

### 6. Promise Toast (Async Operations)
Automatically updates from **Loading ➔ Success / Error**.
```javascript
toast.promise(updateNicknameApi(newNickname), {
  loading: "Updating nickname...",
  success: "Nickname updated!",
  error: (err) => err?.data?.message || "Could not update nickname",
})
```

---

## ⚙️ Customization & Design System Alignment

- **Width & Layout**: Fixed `344px` width (max-width `calc(100vw - 32px)` on mobile).
- **Theme**: Dark mode card (`#212121` background, `#F4F0F4` text, `border-white/10`).
- **Sonner Engine**: Stacked & list hover transitions are handled automatically by Sonner. Do not add `overflow: hidden` to the outer `<Toaster>` or `[data-sonner-toast]` element.
