# Input & Form Control Architecture Rules

This rule defines the architectural standard for input fields, search inputs, and form controls in the CatSpeak repository.

---

## 1. Core Rule: Flexbox Container Pattern

When building or updating input components that include adornments (leading icons, trailing action buttons, clear triggers, password visibility toggles, or currency badges), **always style the outer container `<div>` as the visual box and keep the inner `<input>` or `<textarea>` unstyled inside it using Flexbox**.

```jsx
// ✅ CORRECT: Flexbox Container Pattern
<div
  onClick={() => inputRef.current?.focus()}
  className="group flex items-center w-full h-14 bg-white dark:bg-[#272727] border border-border dark:border-[#3F3F3F] rounded-xl focus-within:border-cath-red-700 transition-colors"
>
  {/* Left icon / prefix */}
  {icon && <Icon className="shrink-0 ml-3.5 mr-2 text-secondary dark:text-[#AAAAAA]" />}

  {/* Input fills available space */}
  <input
    ref={inputRef}
    className="flex-1 min-w-0 h-full bg-transparent border-none outline-none px-4 text-gray-900 dark:text-white placeholder:text-secondary dark:placeholder:text-[#AAAAAA]"
    {...props}
  />

  {/* Right button / suffix sits naturally in the flex flow */}
  {rightContent && <div className="shrink-0 mr-2 flex items-center">{rightContent}</div>}
</div>
```

---

## 2. Anti-Pattern: Absolute Overlay Hacks

**DO NOT apply visual box styling (borders, backgrounds, heights) directly to the `<input>` element and then overlay icons or buttons with `position: absolute`.**

```jsx
// ❌ INCORRECT (Anti-pattern): Absolute positioning over <input>
<div className="relative">
  <input
    className="w-full h-14 border rounded-xl bg-white !pr-14 !pl-10" // fragile padding hacks!
  />
  <button className="absolute right-2 top-1/2 -translate-y-1/2" /> // breaks responsive layouts!
</div>
```

### Why Absolute Positioning is Banned for Input Adornments:
1. **Fragile Padding Hacks**: Forces developers to inject arbitrary padding overrides (`!pr-12`, `!pr-14`, `!pl-10`) into the `<input>`.
2. **Text Collision**: Long user text or localized placeholders will slide underneath the button or icon if padding does not match the exact pixel size of the overlay.
3. **Breaks Dynamic Resizing**: When buttons or badges change size dynamically (e.g. loading spinner, badge counts), the input cannot adapt.
4. **Vertical Misalignment**: Centering with `top-1/2 -translate-y-1/2` causes sub-pixel blurring and alignment drift across mobile and desktop viewports.

---

## 3. The Only Exception: Floating Labels

The only acceptable use of `position: absolute` in form controls is for **animated floating labels** (`floatingLabel={true}`), where the label physically transitions from the center of the input to float across the top border using Tailwind CSS `peer-focus:` utilities.

---

## 4. Required Focus & Accessibility Behaviors

1. **`focus-within` for Container Borders**: Because the outer `<div>` holds the border, use `focus-within:border-[...]` (and `hover:border-[...]`) so the container lights up when the user clicks or tabs into the `<input>`.
2. **Container Click-to-Focus**: Clicking empty padding or space around icons in the container should focus the input:
   ```jsx
   const handleContainerClick = (e) => {
     if (e.target.tagName !== "BUTTON" && !e.target.closest("button") && e.target.tagName !== "INPUT") {
       inputRef.current?.focus()
     }
   }
   ```
3. **Disabled State**: Apply `has-[:disabled]:opacity-60 has-[:disabled]:cursor-not-allowed` on the container so the whole control reflects the disabled state.

---

## 5. Material Design 3 Baseline Dimensions & Spacing

All text inputs and form controls follow the Material Design 3 Text Field baseline specification:

| Attribute | Baseline Value | Tailwind CSS Token |
| :--- | :--- | :--- |
| **Default container height** | `56dp` | `h-14 min-h-[56px]` |
| **Target size** | `56dp` | `min-h-[56px]` |
| **Label alignment (unpopulated)** | Vertically centered | `top-1/2 -translate-y-1/2` |
| **Top/bottom container padding** | `4dp` | `py-1` |
| **Left/right padding without icons** | `16dp` | `pl-4` / `pr-4` |
| **Left/right padding with icon button / content** | `0` (or `4dp` if pill) | `pl-0` / `pr-0` (or `pl-1` / `pr-1` for `variant="rounded-full"`) |
| **Left/right padding with standalone icon** | `12dp` | `pl-3` / `pr-3` |
| **Icon alignment** | Vertically centered | `items-center` / `flex items-center justify-center` |
| **Padding between left, input, and right** | `4dp` | `gap-1` |
| **Supporting text / counter top spacing** | `4dp` | `gap-1` (on parent container) |
| **Padding between supporting text and counter** | `16dp` | `gap-4` |

### Spacing Flow Diagram:
```
With Icon Buttons (e.g. StoryInputBar):
[Left Edge] --0/4dp (pl-0/pl-1)--> [IconButton] --4dp (gap-1)--> [Input Text] --4dp (gap-1)--> [IconButton] --0/4dp (pr-0/pr-1)--> [Right Edge]

Without Icons / Adornments:
[Left Edge] --16dp (pl-4)--> [Input Text] --16dp (pr-4)--> [Right Edge]
```
The `<input>` tag itself has `p-0` so the outer container padding and `gap-1` reliably define the layout.


