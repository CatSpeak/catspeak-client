# Material 3 Shape & Corner Radius Scale Rules

This rule defines the shape and corner radius standard for the CatSpeak design system, adapted from Material 3 (M3) shape tokens to Tailwind CSS.

---

## 1. Shape Scale & Tailwind Token Mapping

All rectangular UI components (buttons, inputs, cards, dialogs, dropdowns, etc.) must adhere to the 10-step size-based scale:

| Scale Step | Radius (px) | Tailwind Utility | Target Components |
| :--- | :--- | :--- | :--- |
| **None** | `0px` | `rounded-none` | Full-bleed banners, dividers, square tabs |
| **Extra Small** | `4px` | `rounded` | Compact tags, subtle badge corners, progress bars |
| **Small** | `8px` | `rounded-lg` | Dropdown items, tooltips, list item hover targets, filter chips |
| **Medium** | `12px` | `rounded-xl` | Text inputs, dropdown menus, popovers, nested sub-cards |
| **Large** | `16px` | `rounded-2xl` | Room cards, workshop cards, chat bubbles, action cards, panels |
| **Large Increased** | `20px` | `rounded-[20px]` | Intermediate cards between standard cards and modals |
| **Extra Large** | `24px` | `rounded-3xl` | Modals, bottom sheets, help popups, hero carousel containers |
| **Extra Large Increased** | `32px` | `rounded-[32px]` | Floating large action sheets, decorative display widgets |
| **Extra Extra Large** | `48px` | `rounded-[48px]` | Giant hero banners, onboarding illustrations |
| **Full** | `9999px` | `rounded-full` | `PillButton`, `IconButton`, avatars, status indicators, badges |

---

## 2. Core Architectural Principles

### 1. Optical Roundness (Nested Objects)
When nesting rounded objects, **never** apply identical corner radii to both the outer container and the inner element. This produces visual distortion (corners look unbalanced or disconnected).

Always calculate inner corner radius using the formula:
$$\text{Inner Radius} = \text{Outer Radius} - \text{Padding}$$

- **Example 1**: Outer card has `rounded-2xl` (16px) with `p-2` (8px padding). The inner media/child must use:
  $16\text{px} - 8\text{px} = 8\text{px} \rightarrow \texttt{rounded-lg}$.
- **Example 2**: Outer modal has `rounded-3xl` (24px) with `p-3` (12px padding). The inner card should use:
  $24\text{px} - 12\text{px} = 12\text{px} \rightarrow \texttt{rounded-xl}$.

### 2. Information Density vs. Roundedness
- **High-Density Containers**: Avoid applying `rounded-2xl` or `rounded-3xl` to text-heavy, information-dense components (e.g. data tables, dense lists). Excessively rounded corners cut off corner content and require excessive padding.
- **Micro-Components**: Small targets ($\le 32\text{px}$ height) should use `rounded-lg` or `rounded-full`, avoiding intermediate radii that clash with line height.

### 3. Asymmetric Rounding (Connected & Split Controls)
- Grouped or connected elements (e.g., split buttons, input groups with addons, segmented tabs) must use directional corner tokens:
  - Left element: `rounded-l-xl rounded-r-none`
  - Right element: `rounded-r-xl rounded-l-none`
  - Middle element: `rounded-none`

### 4. No Arbitrary Radius Drift
- Do not introduce random arbitrary radius classes (e.g., `rounded-[7px]`, `rounded-[10px]`, `rounded-[14px]`). Always round to the nearest established Tailwind token (`rounded-lg`, `rounded-xl`, `rounded-2xl`, etc.).

