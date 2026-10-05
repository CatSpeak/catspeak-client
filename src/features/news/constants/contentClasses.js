export const CONTENT_CLASSES = [
  // Base text — JetBrains island style typography with container overflow protection
  "text-[15px] sm:text-[16px] leading-[1.65] text-slate-800 break-words [overflow-wrap:anywhere] max-w-full",

  // Inline formatting
  "[&_strong]:font-bold [&_b]:font-bold [&_strong]:text-slate-900 [&_b]:text-slate-900 [&_strong]:[-webkit-text-stroke:0.2px_currentColor] [&_b]:[-webkit-text-stroke:0.2px_currentColor]",
  "[&_em]:italic [&_i]:italic",
  "[&_u]:underline [&_s]:line-through [&_del]:line-through [&_strike]:line-through",
  "[&_sub]:text-[0.75em] [&_sub]:align-sub [&_sub]:leading-none",
  "[&_sup]:text-[0.75em] [&_sup]:align-super [&_sup]:leading-none",
  "[&_mark]:bg-amber-100 [&_mark]:text-slate-900 [&_mark]:px-1 [&_mark]:py-0.5 [&_mark]:rounded-sm",
  "[&_small]:text-[0.85em] [&_small]:text-slate-500",

  // Paragraphs
  "[&_p]:mb-3.5 [&_p:last-child]:mb-0",

  // Headings
  "[&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3.5 [&_h1]:text-slate-900 [&_h1]:leading-tight",
  "[&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-slate-900 [&_h2]:leading-snug",
  "[&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2.5 [&_h3]:text-slate-900",
  "[&_h4]:text-base [&_h4]:sm:text-lg [&_h4]:font-semibold [&_h4]:mt-3.5 [&_h4]:mb-2 [&_h4]:text-slate-900",
  "[&_h5]:text-sm [&_h5]:sm:text-base [&_h5]:font-semibold [&_h5]:mt-3 [&_h5]:mb-1.5 [&_h5]:text-slate-900",
  "[&_h6]:text-xs [&_h6]:sm:text-sm [&_h6]:font-semibold [&_h6]:mt-2.5 [&_h6]:mb-1 [&_h6]:text-slate-900",

  // Lists
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3.5 [&_ul]:space-y-1.5 [&_ul]:marker:text-slate-400",
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3.5 [&_ol]:space-y-1.5 [&_ol]:marker:text-slate-500",
  "[&_li]:pl-1",
  "[&_ul_ul]:mt-1.5 [&_ul_ul]:mb-1 [&_ul_ul]:list-[circle]",
  "[&_ul_ul_ul]:list-[square]",
  "[&_ol_ol]:mt-1.5 [&_ol_ol]:mb-1",

  // Links
  "[&_a]:text-cath-red-700 [&_a]:underline [&_a]:font-medium [&_a]:hover:text-cath-red-800 [&_a]:break-words [&_a]:[overflow-wrap:anywhere]",

  // Blockquote
  "[&_blockquote]:border-l-4 [&_blockquote]:border-cath-red-700/60 [&_blockquote]:bg-slate-50/60 [&_blockquote]:pl-4 [&_blockquote]:py-1.5 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-slate-700 [&_blockquote]:rounded-r-lg",
  "[&_blockquote_blockquote]:border-slate-300 [&_blockquote_blockquote]:my-2 [&_blockquote_blockquote]:bg-slate-100/50",

  // Code
  "[&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs [&_code]:text-cath-red-700 [&_code]:font-mono [&_code]:break-words",
  "[&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:text-xs [&_pre]:leading-relaxed [&_pre]:font-mono",
  "[&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0 [&_pre_code]:text-xs [&_pre_code]:break-normal",

  // Horizontal rule
  "[&_hr]:border-t [&_hr]:border-slate-200 [&_hr]:my-6",

  // Images
  "[&_img]:inline-block [&_img]:max-w-full [&_img]:h-auto [&_img]:my-2.5 [&_img]:rounded-xl [&_img]:shadow-sm",

  // Figure & caption — centered, muted color
  "[&_figure]:my-4 [&_figure]:table [&_figure]:text-center [&_figure]:mx-auto [&_figure]:clear-both",
  "[&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:font-medium [&_figcaption]:text-slate-500 [&_figcaption]:mt-2",

  // Tables
  "[&_table]:w-full [&_table]:mb-4 [&_table]:text-sm [&_table]:border-collapse [&_table]:border [&_table]:border-slate-200 [&_table]:rounded-lg [&_table]:overflow-hidden",
  "[&_thead]:bg-slate-100/80 [&_th]:border [&_th]:border-slate-200 [&_th]:p-2.5 [&_th]:font-bold [&_th]:text-slate-900",
  "[&_td]:border [&_td]:border-slate-200 [&_td]:p-2.5 [&_td]:align-top",
  "[&_tbody_tr:nth-child(even)]:bg-slate-50/50",
  "[&_th[align=center]]:text-center [&_td[align=center]]:text-center",
  "[&_th[align=right]]:text-right [&_td[align=right]]:text-right",
  "[&_th[align=left]]:text-left [&_td[align=left]]:text-left",
].join("\n  ")
