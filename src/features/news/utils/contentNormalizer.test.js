import test from "node:test"
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import { normalizeContent } from "./contentNormalizer.js"

test("normalizeContent returns empty string for empty, null, or undefined", () => {
  assert.equal(normalizeContent(""), "")
  assert.equal(normalizeContent(null), "")
  assert.equal(normalizeContent(undefined), "")
  assert.equal(normalizeContent("   "), "")
})

test("normalizeContent formats headings (Markdown #, ##, ###)", () => {
  assert.equal(normalizeContent("# Tiêu đề 1"), "<h1>Tiêu đề 1</h1>")
  assert.equal(normalizeContent("## Tiêu đề 2"), "<h2>Tiêu đề 2</h2>")
  assert.equal(normalizeContent("### Tiêu đề 3"), "<h3>Tiêu đề 3</h3>")
})

test("normalizeContent formats strikethrough (~~text~~)", () => {
  const input = "Đây là ~~chữ gạch ngang~~ trong bài"
  const expected = "<p>Đây là <del>chữ gạch ngang</del> trong bài</p>"
  assert.equal(normalizeContent(input), expected)
})

test("normalizeContent formats bold (**text**) and italic (*text*)", () => {
  const input = "Đây là **in đậm** và *in nghiêng*"
  const expected = "<p>Đây là <strong>in đậm</strong> và <em>in nghiêng</em></p>"
  assert.equal(normalizeContent(input), expected)
})

test("normalizeContent formats unordered lists (- item)", () => {
  const input = "- Mục 1\n- Mục 2\n- Mục 3"
  const expected = "<ul><li>Mục 1</li><li>Mục 2</li><li>Mục 3</li></ul>"
  assert.equal(normalizeContent(input), expected)
})

test("normalizeContent formats ordered lists (1. item)", () => {
  const input = "1. Bước một\n2. Bước hai"
  const expected = "<ol><li>Bước một</li><li>Bước hai</li></ol>"
  assert.equal(normalizeContent(input), expected)
})

test("normalizeContent formats blockquotes (> quote)", () => {
  const input = "> Đây là trích dẫn"
  const expected = "<blockquote>Đây là trích dẫn</blockquote>"
  assert.equal(normalizeContent(input), expected)
})

test("normalizeContent formats single newlines to <br /> and double newlines to <p>", () => {
  const input = "Dòng 1\nDòng 2\n\nĐoạn 2"
  const expected = "<p>Dòng 1<br />Dòng 2</p><p>Đoạn 2</p>"
  assert.equal(normalizeContent(input), expected)
})

test("normalizeContent preserves non-breaking hyphen for words with hyphens (e.g. awudia-awdua)", () => {
  const input = "Kiểm tra từ awudia-awdua không bị ngắt dòng sau dấu trừ"
  const output = normalizeContent(input)
  // Should replace ASCII '-' with non-breaking hyphen '\u2011'
  assert.ok(output.includes("awudia\u2011awdua"))
  assert.ok(!output.includes("awudia-awdua"))
})

test("normalizeContent protects URLs and preserves href while protecting link text", () => {
  const input = "Truy cập [CatSpeak](https://catspeak.com/my-post-link)"
  const output = normalizeContent(input)
  assert.ok(output.includes('href="https://catspeak.com/my-post-link"'))
  assert.ok(output.includes(">CatSpeak</a>"))
})

test("normalizeContent auto-linkifies raw URLs and protects visible hyphen break", () => {
  const input = "Xem tại https://catspeak.com/awudia-awdua hôm nay"
  const output = normalizeContent(input)
  assert.ok(output.includes('href="https://catspeak.com/awudia-awdua"'))
  // Visible text contains non-breaking hyphen so it won't break awkwardly
  assert.ok(output.includes("awudia\u2011awdua"))
})

test("normalizeContent unescapes literal escape sequences (\\n, \\r\\n, \\t, \\\")", () => {
  const input = "Line 1\\nLine 2\\n\\nParagraph 2 with \\\"quotes\\\""
  const expected = '<p>Line 1<br />Line 2</p><p>Paragraph 2 with "quotes"</p>'
  assert.equal(normalizeContent(input), expected)
})

test("normalizeContent decodes HTML entities when HTML tags are escaped", () => {
  const input = "&lt;p&gt;Hello &lt;strong&gt;world&lt;/strong&gt;&lt;/p&gt;"
  const expected = "<p>Hello <strong>world</strong></p>"
  assert.equal(normalizeContent(input), expected)
})

test("normalizeContent preserves HTML elements and inline CMS blocks", () => {
  const input = '<div class="cms-carousel"><p>Text</p></div>'
  assert.equal(normalizeContent(input), input)
})

test("normalizeContent preserves full rich text HTML without stripping tags", () => {
  const input = '<h1>Tiêu đề</h1><p><strong>Đậm</strong>, <em>Nghiêng</em>, &lt;u&gt;Gạch chân&lt;/u&gt;, ~~gạch ngang~~, H&lt;sub&gt;2&lt;/sub&gt;O, &lt;mark&gt;highlight&lt;/mark&gt;</p><table><tr><th>Col 1</th></tr><tr><td>Val 1</td></tr></table>'
  const output = normalizeContent(input)
  assert.ok(output.includes("<h1>Tiêu đề</h1>"))
  assert.ok(output.includes("<strong>Đậm</strong>"))
  assert.ok(output.includes("<em>Nghiêng</em>"))
  assert.ok(output.includes("<u>Gạch chân</u>"))
  assert.ok(output.includes("<del>gạch ngang</del>"))
  assert.ok(output.includes("<sub>2</sub>"))
  assert.ok(output.includes("<mark>highlight</mark>"))
  assert.ok(output.includes("<table><tr><th>Col 1</th></tr><tr><td>Val 1</td></tr></table>"))
})
