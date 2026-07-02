export const CONTENT_CLASSES = [
  // Base text — Figma: Web/P1/Regular (Nunito 20px, line-height 1.4)
  "font-nunito text-[20px] leading-[1.4] text-black",

  // Inline formatting
  "[&_strong]:font-bold [&_b]:font-bold",
  "[&_em]:italic [&_i]:italic",
  "[&_u]:underline [&_s]:line-through",

  // Paragraphs
  "[&_p]:mb-4",

  // Headings
  "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4",
  "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3",
  "[&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2",
  "[&_h4]:text-lg [&_h4]:font-bold [&_h4]:mt-4 [&_h4]:mb-2",

  // Lists
  "[&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-4 [&_ul]:space-y-1",
  "[&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-4 [&_ol]:space-y-1",

  // Links
  "[&_a]:text-cath-red-700 [&_a]:underline [&_a]:hover:text-cath-red-800",

  // Blockquote
  "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-gray-600",

  // Code
  "[&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-red-600 [&_code]:font-mono",
  "[&_pre]:bg-slate-800 [&_pre]:text-slate-200 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:text-sm",
  "[&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0",

  // Horizontal rule
  "[&_hr]:border-t-2 [&_hr]:border-gray-200 [&_hr]:my-6",

  // Images
  "[&_img]:inline-block [&_img]:max-w-full [&_img]:h-auto [&_img]:py-2 [&_img]:rounded-md",

  // Figure & caption — Figma: centered, muted color
  "[&_figure]:my-4 [&_figure]:table [&_figure]:text-center [&_figure]:mx-auto [&_figure]:clear-both",
  "[&_figcaption]:text-center [&_figcaption]:font-nunito [&_figcaption]:text-base [&_figcaption]:font-medium [&_figcaption]:text-[#7b7979] [&_figcaption]:mt-3",

  // Tables
  "[&_table]:w-full [&_table]:mb-4 [&_td]:align-top [&_td]:p-2 [&_th]:p-2 [&_th]:text-left [&_th]:font-bold",
].join("\n  ")
