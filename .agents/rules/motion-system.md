# Motion Physics System (Material Design 3 Baseline)

This document defines motion curves, durations, and animation standards for the CatSpeak UI, adhering to the Material Design 3 (M3) Motion Physics System.

---

## 1. Specification & Source Citation

- **Official Specification**: [Motion – Material Design 3](https://m3.material.io/styles/motion/overview/specs)
- **Concept**: Material Design 3 uses spring physics composites (damping + stiffness). For web animations without continuous gesture interruptions, M3 specifies corresponding cubic-bezier curves and matched durations that accurately mimic spring motion physics.

---

## 2. Motion Curve & Duration Matrix

| Style & Token Name | Cubic-Bezier Curve | Duration | Best Used For |
| :--- | :--- | :--- | :--- |
| **Expressive Fast Spatial** | `0.42, 1.67, 0.21, 0.90` | `350ms` | Small element movement, dropdown popovers, tooltips, chips |
| **Expressive Default Spatial** | `0.38, 1.21, 0.22, 1.00` | `500ms` | Modal dialogs, side drawers, bottom sheets, expanding cards |
| **Expressive Slow Spatial** | `0.39, 1.29, 0.35, 0.98` | `650ms` | Full-screen page transitions, major layout reflows |
| **Expressive Fast Effects** | `0.31, 0.94, 0.34, 1.00` | `150ms` | Micro-interactions, icon state toggles, quick button feedback |
| **Expressive Default Effects** | `0.34, 0.80, 0.34, 1.00` | `200ms` | Hover fades, scrims/overlays, color & elevation transitions |
| **Expressive Slow Effects** | `0.34, 0.88, 0.34, 1.00` | `300ms` | Complex opacity + blur filters, decorative ambient effects |
| **Standard Fast Spatial** | `0.27, 1.06, 0.18, 1.00` | `350ms` | Compact utility movement, utilitarian list item repositioning |
| **Standard Default Spatial** | `0.27, 1.06, 0.18, 1.00` | `500ms` | Standard containers, accordions, data table expands |
| **Standard Slow Spatial** | `0.27, 1.06, 0.18, 1.00` | `750ms` | Large complex data reflows, long-distance linear movements |
| **Standard Fast Effects** | `0.31, 0.94, 0.34, 1.00` | `150ms` | Standard hover color shifts, ripple fades |
| **Standard Default Effects** | `0.34, 0.80, 0.34, 1.00` | `200ms` | Standard cross-fades, tab switches, skeleton pulse |
| **Standard Slow Effects** | `0.34, 0.88, 0.34, 1.00` | `300ms` | Subtle background atmospheric fades |

---

## 3. How to Use in the Project

### A. Framer Motion (`framer-motion`)

Import pre-configured transitions or raw curves from `src/shared/constants/motion.js` (or `src/shared/utils/animations.js`):

```jsx
import { motion } from "framer-motion"
import { m3Transitions, m3Curves } from "@/shared/constants/motion"

// 1. Using pre-configured transition (includes ease & duration):
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={m3Transitions.expressiveDefaultSpatial}
>
  {children}
</motion.div>

// 2. Custom override with M3 curve:
<motion.div
  animate={{ x: 100 }}
  transition={{ ease: m3Curves.expressiveFastSpatial, duration: 0.35 }}
/>
```

### B. Tailwind CSS Utilities

The curves and durations are configured in `tailwind.config.js`:

```html
<!-- Easing classes: ease-m3-expressive-fast-spatial, ease-m3-standard-default-spatial, etc. -->
<!-- Duration classes: duration-150, duration-200, duration-300, duration-350, duration-500, duration-650, duration-750 -->

<div class="transition-transform duration-350 ease-m3-expressive-fast-spatial hover:scale-105">
  Interactive Card
</div>

<div class="transition-opacity duration-200 ease-m3-expressive-default-effects hover:opacity-80">
  Fade Element
</div>
```

### C. CSS Variables (`src/shared/styles/index.css`)

CSS custom properties are declared globally in `:root`:

```css
.my-custom-modal {
  transition: transform var(--motion-expressive-default-spatial-duration) var(--motion-expressive-default-spatial-curve);
}
```

---

## 4. Design Guidelines

1. **Spatial vs. Effects:**
   - Use **Spatial** tokens (`*Spatial`) for properties affecting geometry: `transform`, `translate`, `scale`, `width`, `height`, `top`, `left`, etc.
   - Use **Effects** tokens (`*Effects`) for appearance changes: `opacity`, `background-color`, `box-shadow`, `filter`.
2. **Expressive vs. Standard:**
   - Prefer **Expressive** tokens for user-facing, brand-forward, playful, or delight-oriented UI components (dialogs, drawers, hero banners, badges, gamification cards).
   - Use **Standard** tokens for data-dense, utilitarian, repetitive interactions (e.g. data tables, form validations, administrative panels).
3. **Respect Reduced Motion:**
   - Always respect `prefers-reduced-motion: reduce` for accessibility.

