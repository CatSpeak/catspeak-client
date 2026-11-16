# AI Agent Guidelines

## 1. Clean Code
- **Simplicity & Readability:** Write clean, readable, self-documenting code. Avoid over-engineering, premature abstractions, and dead code.
- **Single Responsibility:** Keep components, functions, and hooks focused on a single task.
- **Dark Mode:** Always ensure UI components support dark mode.

## 2. Feature-Based Architecture
- **Features (`src/features/<feature-name>/`):** Colocate all feature-specific components, hooks, state, and API calls within their feature folder.
- **Shared (`src/shared/`):** Place reusable UI primitives, generic hooks, utilities, and layout wrappers used across multiple features here.
