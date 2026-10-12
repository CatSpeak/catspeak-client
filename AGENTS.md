# AI Agent Guidelines & Repository Rules

This document defines core behavior, efficiency standards, and coding conventions for AI pair programmers working in the `catspeak-client` repository.

---

## 1. Operating Principles & Token Efficiency

- **Static Code Analysis First:** Always prioritize direct file reading (`view_file`), pattern searching (`grep_search`), and directory inspection (`list_dir`) over running shell commands or browser subagents.
- **No Unsolicited Browser Automation:** Do NOT launch browser subagents or automated headless sessions unless the user explicitly asks for visual testing or recording.
- **No Unsolicited Shell Probing:** Do not execute exploratory terminal commands (e.g., `netstat`, port checks, arbitrary process inspection) when the answer can be determined directly from the codebase.
- **Direct & Action-Oriented:** Give concise, code-centric answers. Identify the exact files, lines, and root causes before proposing or applying fixes.

---

## 2. Project Architecture & Conventions

- **Styling:** Vanilla Tailwind CSS with customized theme tokens.
  - Border token: `border-border` (e.g., `border-b border-border`).
  - Colors: CatSpeak brand colors (`cath-red-700`, `bg-primaryBg`, `bg-primary2`, etc.).
  - Header height: Standard application header is `64px` (`h-[64px]` / `h-16`). All header containers must account for border box sizing to avoid layout shifts or 1px vertical overflows.
- **Component Structure:**
  - Common UI primitives in `src/shared/components/ui/`.
  - Feature-specific logic isolated in `src/features/<feature-name>/`.
  - Shared layout components in `src/layouts/` and `src/shared/components/layout/`.
- **Links & References:** Use clickable GitHub-style links with line references (e.g., `[FileName.jsx](file:///path/to/file#L10-L20)`) when referencing code.

---

## 3. How to Extend Rules (For Developers)

To add new rules or guidelines for your team:

1. **Global/Workspace Rules:** Edit this file (`AGENTS.md`) directly. The agent automatically loads it at the root of the workspace.
2. **Modular Rules:** Create markdown rule files under `.agents/rules/` (e.g., `.agents/rules/components.md`, `.agents/rules/api-conventions.md`).
3. **Directory-Specific Rules:** Place a localized `AGENTS.md` or `GEMINI.md` within any sub-directory (e.g., `src/features/video-call/AGENTS.md`) to apply rules scoped only to that feature.
