# Corner Radius & Shape Rules

This document defines corner radius conventions and architectural principles for the CatSpeak UI.

---

## 1. Card Corner Radius

- Standard card corner radius is **12px** (`rounded-xl`).
- Anything that represents a card container uses `rounded-xl`.

---

## 2. Dialog & Modal Standards (Material Design 3 Baseline)

- **Corner Radius**:
  - **Basic Dialog (Desktop / standard)**: **28dp** corner radius (`rounded-[28px]`).
  - **Full-Screen Dialog (Mobile / small screen)**: **0dp** corner radius (`rounded-none`).
- **Centralized Padding Standard (`p-4` / 16px)**:
  - All dialog and modal internal spacing is centralized to **16px** (`p-4` / `px-4` / `pt-4` / `pb-4`).
  - **Never use breakpoint padding jumps to 24px** (e.g. `md:p-6`, `sm:p-6`, `px-6`, `pt-6`, `pb-6`). Use consistent 16px (`p-4`) across all screen sizes.
  - Viewport gutter: `p-4` (or `p-0 md:p-4` when full-screen on mobile).
  - Header: `px-4 pt-4 pb-0` (desktop icon close button at `top-4 right-4`).
  - Body container: `px-4 pt-4` (`pb-4` if no footer).
  - Footer / Action bar: `p-4` (mobile full-screen bar: `px-4`).
- **Optical Roundness Alignment**:
  - Outer modal `rounded-[28px]` (28px) with `p-4` (16px padding) yields $\text{inner\_radius} = 28\text{px} - 16\text{px} = 12\text{px} \rightarrow \texttt{rounded-xl}$. Nested cards or surfaces inside a modal must therefore use `rounded-xl`.

---

## 3. Optical Roundness (Nested Objects)

When nesting rounded objects, **never** apply identical corner radii to both the outer container and the inner element. This produces visual distortion (corners look unbalanced or disconnected).

Always calculate inner corner radius using the formula:
$$\text{Inner Radius} = \text{Outer Radius} - \text{Padding}$$

- **Example**: Outer card has `rounded-xl` (12px) with `p-1` (4px padding). The inner media/child must use:
  $12\text{px} - 4\text{px} = 8\text{px} \rightarrow \texttt{rounded-lg}$.

---

## 4. No Arbitrary Radius Drift

- Do not introduce random arbitrary radius classes (e.g., `rounded-[7px]`, `rounded-[10px]`, `rounded-[14px]`). Always round to standard Tailwind tokens (`rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-[28px]`, `rounded-full`, etc.).
