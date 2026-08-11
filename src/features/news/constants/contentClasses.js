export const CONTENT_CLASSES = [
  // Base text — JetBrains island style typography
  "text-[15px] sm:text-[16px] leading-[1.65] text-slate-800",

  // Inline formatting
  "[&_strong]:font-bold [&_b]:font-bold [&_strong]:text-slate-900 [&_b]:text-slate-900 [&_strong]:[-webkit-text-stroke:0.2px_currentColor] [&_b]:[-webkit-text-stroke:0.2px_currentColor]",
  "[&_em]:italic [&_i]:italic",
  "[&_u]:underline [&_s]:line-through",

  // Paragraphs
  "[&_p]:mb-3.5",

  // Headings
  "[&_h1]:text-xl [&_h1]:sm:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-slate-900",
  "[&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:text-slate-900",
  "[&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-slate-900",
  "[&_h4]:text-sm [&_h4]:sm:text-base [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1.5 [&_h4]:text-slate-900",

  // Lists
  "[&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-3.5 [&_ul]:space-y-1",
  "[&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-3.5 [&_ol]:space-y-1",

  // Links
  "[&_a]:text-cath-red-700 [&_a]:underline [&_a]:hover:text-cath-red-800",

  // Blockquote
  "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3.5 [&_blockquote]:italic [&_blockquote]:my-3.5 [&_blockquote]:text-gray-600",

  // Code
  "[&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:text-red-600 [&_code]:font-mono",
  "[&_pre]:bg-slate-800 [&_pre]:text-slate-200 [&_pre]:p-3.5 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-3.5 [&_pre]:text-xs",
  "[&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0",

  // Horizontal rule
  "[&_hr]:border-t [&_hr]:border-border [&_hr]:my-5",

  // Images
  "[&_img]:inline-block [&_img]:max-w-full [&_img]:h-auto [&_img]:py-2 [&_img]:rounded-lg",

  // Figure & caption — centered, muted color
  "[&_figure]:my-3.5 [&_figure]:table [&_figure]:text-center [&_figure]:mx-auto [&_figure]:clear-both",
  "[&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:font-medium [&_figcaption]:text-[#7b7979] [&_figcaption]:mt-2",

  // Tables
  "[&_table]:w-full [&_table]:mb-3.5 [&_td]:align-top [&_td]:p-2 [&_th]:p-2 [&_th]:text-left [&_th]:font-bold [&_table]:text-sm",
].join("\n  ")
