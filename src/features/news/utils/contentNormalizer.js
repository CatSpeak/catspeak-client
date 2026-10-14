/**
 * Chuẩn hóa nội dung bài viết trước khi đưa vào CMS renderer (PostContent):
 * 1. Unescape các ký tự escape sequences (\\n, \\r\\n, \\t, \\", \\', unicode \\uXXXX).
 * 2. Giải mã các thẻ HTML bị escape (&lt;u&gt; -> <u>, &lt;sub&gt; -> <sub>) mà KHÔNG làm mất thẻ HTML thật.
 * 3. Nếu là Rich Text HTML:
 *    - Bảo toàn 100% cấu trúc thẻ HTML (h1-h6, strong, em, table, ul, ol, blockquote, pre, code, sub, sup, mark, small, img, hr,...).
 *    - Hỗ trợ thêm cú pháp inline markdown như ~~gạch ngang~~.
 *    - Chuyển \\n trong thẻ <p> thành <br /> để ngắt dòng đúng vị trí.
 * 4. Nếu là Markdown / Plain Text:
 *    - Phân tích headings (#, ##, ###,...), danh sách (- , 1. ), trích dẫn (> ), đoạn văn (\\n\\n).
 * 5. Chống tràn khung (overflow) và chống ngắt dòng xấu ở dấu gạch nối (vd: awudia-awdua):
 *    - Thay thế dấu '-' trong text hiển thị bằng Non-Breaking Hyphen (\\u2011), giữ nguyên URL trong href.
 */

export function normalizeContent(rawContent) {
  if (rawContent === null || rawContent === undefined) return "";
  let text = String(rawContent).trim();
  if (!text) return "";

  // 1. Unescape các ký tự literal escape sequences (ví dụ dữ liệu từ JSON double-escaped)
  text = text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "    ")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");

  // Giải mã unicode escape sequence dạng \uXXXX nếu có
  text = text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return `\\u${hex}`;
    }
  });

  // 2. Decode an toàn các thẻ HTML bị escape (ví dụ: &lt;u&gt; -> <u>, &lt;sub&gt; -> <sub>, &lt;mark&gt; -> <mark>)
  // TUYỆT ĐỐI KHÔNG dùng doc.body.textContent vì sẽ nuốt chửng toàn bộ thẻ HTML thật!
  text = text.replace(
    /&lt;(\/?(?:[a-zA-Z][a-zA-Z0-9]*)(?:\s+[^<>&]*)?)&gt;/gi,
    "<$1>",
  );

  // 3. Kiểm tra xem nội dung đã là HTML hay là Markdown / Plain Text
  const isHtml = /<\/?(?:p|div|h[1-6]|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|pre|figure|hr|img|strong|em|b|i|u|del|s|code|span)[\s>]/i.test(
    text,
  );

  if (isHtml) {
    // 3A. NỘI DUNG ĐÃ LÀ HTML: Bảo toàn 100% thẻ HTML gốc
    // Hỗ trợ inline strikethrough (~~text~~) nếu có
    text = text.replace(/~~(.*?)~~/g, "<del>$1</del>");

    // Chuyển \n trong thẻ <p> thành <br /> nếu có
    text = text.replace(/<p>([\s\S]*?)<\/p>/gi, (_, inner) => {
      return `<p>${inner.replace(/\n/g, "<br />")}</p>`;
    });

    // Tự động nhận diện URL thuần trong text (không nằm trong thuộc tính hoặc thẻ a)
    text = linkifyTextNodes(text);

    // Chống ngắt dòng xấu ở dấu gạch nối trong text hiển thị
    text = protectHyphenBreaks(text);

    return text;
  }

  // 3B. NỘI DUNG LÀ MARKDOWN / PLAIN TEXT
  text = parseMarkdownAndPlainContent(text);
  text = protectHyphenBreaks(text);

  return text;
}

/**
 * Phân tích và chuyển đổi Markdown / Plain text sang HTML chuẩn.
 */
function parseMarkdownAndPlainContent(text) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) return "";

  const parsedBlocks = blocks.map((block) => {
    // 1. Headings (Markdown: #, ##, ###, ####, #####, ######)
    const headingMatch = block.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = parseInlineStyles(headingMatch[2].trim());
      return `<h${level}>${content}</h${level}>`;
    }

    // 2. Blockquotes (Markdown: > quote)
    if (block.startsWith(">")) {
      const quoteContent = block
        .split("\n")
        .map((line) => line.replace(/^>\s?/, "").trim())
        .join("<br />");
      return `<blockquote>${parseInlineStyles(quoteContent)}</blockquote>`;
    }

    // 3. Unordered Lists (- item, * item, + item)
    const lines = block.split("\n");
    const isUnorderedList = lines.every((line) => /^\s*[-*+]\s+(.+)/.test(line));
    if (isUnorderedList) {
      const items = lines
        .map((line) => {
          const match = line.match(/^\s*[-*+]\s+(.+)/);
          return match ? `<li>${parseInlineStyles(match[1].trim())}</li>` : "";
        })
        .join("");
      return `<ul>${items}</ul>`;
    }

    // 4. Ordered Lists (1. item, 2. item)
    const isOrderedList = lines.every((line) => /^\s*\d+\.\s+(.+)/.test(line));
    if (isOrderedList) {
      const items = lines
        .map((line) => {
          const match = line.match(/^\s*\d+\.\s+(.+)/);
          return match ? `<li>${parseInlineStyles(match[1].trim())}</li>` : "";
        })
        .join("");
      return `<ol>${items}</ol>`;
    }

    // 5. Regular Paragraph: dấu \n đơn chuyển thành <br />
    const withInline = parseInlineStyles(block);
    const withBreaks = withInline.replace(/\n/g, "<br />");
    return `<p>${withBreaks}</p>`;
  });

  return parsedBlocks.join("");
}

/**
 * Xử lý các định dạng inline Markdown:
 * - Chữ gạch ngang: ~~text~~ -> <del>text</del>
 * - In đậm: **text** hoặc __text__ -> <strong>text</strong>
 * - In nghiêng: *text* hoặc _text_ -> <em>text</em>
 * - Code: `code` -> <code>code</code>
 * - Link Markdown: [text](url) -> <a href="url">text</a>
 */
function parseInlineStyles(str) {
  let res = str;

  // Strikethrough (~~text~~)
  res = res.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // Bold (**text** hoặc __text__)
  res = res.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  res = res.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italic (*text* hoặc _text_)
  res = res.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  res = res.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, "<em>$1</em>");

  // Inline code (`code`)
  res = res.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Markdown link [text](url)
  res = res.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Linkify raw URLs
  res = linkifyTextNodes(res);

  return res;
}

/**
 * Tự động nhận diện URL thuần chỉ trong các node text (không nằm trong thẻ HTML hoặc thuộc tính href/src).
 */
function linkifyTextNodes(html) {
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (part.startsWith("<") && part.endsWith(">")) {
        return part;
      }
      return part.replace(
        /(^|[\s(])(https?:\/\/[^\s<)]+)/g,
        '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>',
      );
    })
    .join("");
}

/**
 * Chống ngắt dòng xấu ở dấu gạch nối trong các từ hoặc link (ví dụ: awudia-awdua).
 * Trong văn bản hiển thị, thay thế ký tự gạch nối thường (-) giữa các chữ cái / số
 * bằng Non-Breaking Hyphen (\u2011).
 * Không thay đổi dấu gạch nối trong các thuộc tính HTML (như href, class, src,...).
 */
function protectHyphenBreaks(html) {
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => {
      // Nếu là thẻ HTML, giữ nguyên toàn bộ (không đổi href="..." hay class="...")
      if (part.startsWith("<") && part.endsWith(">")) {
        return part;
      }
      // Thay thế dấu '-' giữa 2 từ / ký tự chữ-số bằng non-breaking hyphen (\u2011)
      return part.replace(
        /([a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]+)-([a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]+)/g,
        "$1\u2011$2",
      );
    })
    .join("");
}
