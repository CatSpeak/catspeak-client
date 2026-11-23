// Chụp ảnh giao diện Practice/Galaxy với API giả lập. Chạy: node shoot.mjs <outDir> [only]
import { chromium } from "playwright-core"
import fs from "node:fs"
import path from "node:path"

const BASE = "http://127.0.0.1:5175"
const OUT = process.argv[2]
const ONLY = process.argv[3]
fs.mkdirSync(OUT, { recursive: true })

const TOPICS = {
  food: ["Ẩm thực", [
    ["米饭", "mǐfàn", "cơm", "danh từ", "我每天中午吃米饭。"],
    ["面条", "miàntiáo", "mì sợi", "danh từ", "这家店的面条很好吃。"],
    ["饺子", "jiǎozi", "sủi cảo", "danh từ", "过年的时候我们一起包饺子。"],
    ["咖啡", "kāfēi", "cà phê", "danh từ", "早上我喜欢喝一杯咖啡。"],
    ["好吃", "hǎochī", "ngon", "tính từ", "妈妈做的菜特别好吃。"],
    ["菜单", "càidān", "thực đơn", "danh từ", "服务员，请给我菜单。"],
  ]],
  travel: ["Du lịch", [
    ["旅游", "lǚyóu", "du lịch", "động từ", "我们打算夏天去北京旅游。"],
    ["机场", "jīchǎng", "sân bay", "danh từ", "我们几点去机场？"],
    ["护照", "hùzhào", "hộ chiếu", "danh từ", "出国一定要带护照。"],
    ["酒店", "jiǔdiàn", "khách sạn", "danh từ", "这个酒店离海边很近。"],
    ["地图", "dìtú", "bản đồ", "danh từ", "你能在地图上找到这里吗？"],
    ["行李", "xíngli", "hành lý", "danh từ", "我的行李太重了。"],
  ]],
  work: ["Công việc", [
    ["工作", "gōngzuò", "công việc", "danh từ", "他的工作很忙。"],
    ["会议", "huìyì", "cuộc họp", "danh từ", "下午三点有一个会议。"],
    ["经理", "jīnglǐ", "giám đốc", "danh từ", "我们经理今天不在。"],
    ["同事", "tóngshì", "đồng nghiệp", "danh từ", "我和同事一起吃午饭。"],
    ["加班", "jiābān", "tăng ca", "động từ", "这个星期我每天都加班。"],
    ["简历", "jiǎnlì", "sơ yếu lý lịch", "danh từ", "请把简历发给我。"],
  ]],
  family: ["Gia đình", [
    ["你好", "nǐ hǎo", "xin chào", "cụm từ", "你好，很高兴认识你。"],
    ["妈妈", "māma", "mẹ", "danh từ", "我妈妈是老师。"],
    ["哥哥", "gēge", "anh trai", "danh từ", "我哥哥在上海工作。"],
    ["孩子", "háizi", "con, đứa trẻ", "danh từ", "孩子们在公园里玩。"],
    ["结婚", "jiéhūn", "kết hôn", "động từ", "他们明年结婚。"],
    ["谢谢", "xièxie", "cảm ơn", "động từ", "谢谢你的帮助。"],
  ]],
  school: ["Học tập", [
    ["学习", "xuéxí", "học tập", "động từ", "我在学习汉语。"],
    ["考试", "kǎoshì", "kỳ thi", "danh từ", "明天有汉语考试。"],
    ["老师", "lǎoshī", "giáo viên", "danh từ", "老师，我有一个问题。"],
    ["作业", "zuòyè", "bài tập về nhà", "danh từ", "今天的作业很多。"],
    ["图书馆", "túshūguǎn", "thư viện", "danh từ", "我常常去图书馆看书。"],
    ["绿", "lǜ", "màu xanh lá", "tính từ", "春天来了，树都绿了。"],
  ]],
  health: ["Sức khỏe", [
    ["医院", "yīyuàn", "bệnh viện", "danh từ", "他生病了，去了医院。"],
    ["感冒", "gǎnmào", "cảm cúm", "động từ", "我感冒了，有点儿发烧。"],
    ["运动", "yùndòng", "vận động", "động từ", "每天运动对身体好。"],
    ["休息", "xiūxi", "nghỉ ngơi", "động từ", "你累了，休息一下吧。"],
    ["健康", "jiànkāng", "khỏe mạnh", "tính từ", "祝你身体健康！"],
    ["药", "yào", "thuốc", "danh từ", "饭后记得吃药。"],
  ]],
}

let id = 0
const CARDS = []
for (const [topic, [, words]] of Object.entries(TOPICS)) {
  words.forEach(([word, pinyin, meaning, pos, ex], i) => {
    id += 1
    const s = id % 7
    CARDS.push({
      card_id: id, word, pinyin, meaning_vi: meaning, part_of_speech_vi: pos, example_sentence: ex,
      topic, hsk_level: 1 + (id % 4),
      is_known: s === 3 || s === 4, is_long_term: s === 4, is_due: s === 1 || s === 2 || s === 5,
      review_count: s === 0 ? 0 : s,
    })
  })
}
const byWord = (w) => CARDS.find((c) => c.word === w)
const order = (words) => words.map(byWord)

// Thứ tự thẻ cố định cho từng lượt chụp
let deckOverride = null

const json = (route, body, status = 200) =>
  route.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" }, body: JSON.stringify(body) })

const RATING_MS = { 1: 10 * 60e3, 2: 86400e3, 3: 3 * 86400e3, 4: 9 * 86400e3 }

async function mockApi(page) {
  await page.route(/^http:\/\/mock\.(api|ai)\//, async (route) => {
    const req = route.request()
    if (req.method() === "OPTIONS") return json(route, {})
    const url = new URL(req.url())
    const p = url.pathname
    if (/refresh-token/i.test(p)) return json(route, { token: FAKE_JWT, refreshToken: "refresh" })
    if (p === "/v1/flashcards/home") return json(route, { total_cards: CARDS.length, due_today_count: 12, overdue_count: 3, recent_wrong_count: 5, streak_days: 6 })
    if (p === "/v1/flashcards/decks") {
      return json(route, [
        { id: "all", name: "Toàn bộ sổ", category: "system", total_cards: CARDS.length },
        { id: "recent-wrong", name: "Từ sai gần đây", category: "system", total_cards: 5 },
        ...Object.entries(TOPICS).map(([k, [label]]) => ({ id: `topic-${k}`, name: label, category: "topic", total_cards: 6 })),
      ])
    }
    const m = p.match(/^\/v1\/flashcards\/decks\/([^/]+)\/cards$/)
    if (m) {
      const deck = decodeURIComponent(m[1])
      let items = deck.startsWith("topic-") ? CARDS.filter((c) => `topic-${c.topic}` === deck) : CARDS
      if (deck !== "all" && !deck.startsWith("topic-")) items = CARDS.slice(0, 5)
      if (deckOverride && !deck.startsWith("topic-")) items = deckOverride
      return json(route, { items, next_cursor: null, total: items.length })
    }
    const g = p.match(/^\/v1\/flashcards\/cards\/(\d+)\/grade$/)
    if (g) {
      const body = JSON.parse(req.postData() || "{}")
      console.log("  grade", g[1], JSON.stringify(body))
      return json(route, { card_id: Number(g[1]), due_at: new Date(Date.now() + RATING_MS[body.rating]).toISOString(), scheduled_days: 3, state: 2 })
    }
    return json(route, p.includes("notification") || p.endsWith("s") ? [] : {})
  })
}

const FAKE_JWT = `x.${Buffer.from(JSON.stringify({ exp: 4102444800, sub: "1" })).toString("base64url")}.y`

async function newPage(browser, { lang = "vi", dark = false, mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: mobile ? 2 : 1,
    colorScheme: dark ? "dark" : "light",
    locale: lang === "vi" ? "vi-VN" : "en-US",
  })
  await ctx.addInitScript(([jwt, lang, dark]) => {
    localStorage.setItem("token", jwt)
    localStorage.setItem("refreshToken", "refresh")
    localStorage.setItem("user", JSON.stringify({ accountId: 1, username: "huy.demo", fullName: "Huy Demo", roleName: "Student", email: "demo@example.com" }))
    localStorage.setItem("communityLanguage", "zh")
    localStorage.setItem("interfaceLanguage", lang)
    localStorage.setItem("theme", dark ? "dark" : "light")
    localStorage.setItem("hasSeenTour", "true")
  }, [FAKE_JWT, lang, dark])
  const page = await ctx.newPage()
  page.on("pageerror", (e) => console.log("  pageerror:", e.message.slice(0, 160)))
  await mockApi(page)
  return page
}

const shot = async (page, name, opts = {}) => {
  await page.waitForTimeout(opts.wait ?? 400)
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false, ...opts.clip ? { clip: opts.clip } : {} })
  console.log("saved", name)
}

const gotoPractice = async (page, q = "") => {
  await page.goto(`${BASE}/workspace/vocabulary-practice${q}`)
  await page.getByRole("button", { name: /Bắt đầu lượt ôn|Start a round/ }).waitFor({ timeout: 30000 })
  await page.waitForTimeout(1500)
}
const pick = async (page, mode, source = "Toàn bộ sổ") => {
  await page.getByRole("button", { name: new RegExp(mode) }).first().click()
  await page.getByRole("button", { name: source, exact: true }).click()
  await page.getByRole("button", { name: "Bắt đầu lượt ôn" }).click()
}
const input = (page) => page.locator("main input[type=text], input[lang=zh]").first()

const scenes = {
  async setup(browser) {
    const page = await newPage(browser)
    await gotoPractice(page)
    await page.waitForTimeout(2500)
    await shot(page, "01-practice-setup")
    await page.close()
  },
  async word(browser) {
    deckOverride = order(["你好", "面条", "绿", "机场"])
    const page = await newPage(browser)
    await gotoPractice(page)
    // Thẻ được xáo ngẫu nhiên: đọc nghĩa đang hỏi để gõ đúng/sai theo ý
    await pick(page, "Gõ từ")
    const answerFor = async () => {
      const txt = await page.locator("p.text-2xl").first().innerText()
      return CARDS.find((c) => txt.startsWith(c.meaning_vi))
    }
    await input(page).waitFor()
    await shot(page, "02-word-question")
    let c = await answerFor()
    await page.getByRole("button", { name: "Gợi ý" }).click()
    await page.getByRole("button", { name: "Gợi ý" }).click()
    await shot(page, "03-word-hint")
    await input(page).fill(c.pinyin.replace(/\s/g, ""))
    await input(page).press("Enter")
    await shot(page, "04-word-correct-schedule", { wait: 900 })
    await page.getByRole("button", { name: "Tiếp tục" }).click()
    c = await answerFor()
    const toneless = c.pinyin.replace(/[ǖǘǚǜü]/g, "v").normalize("NFD").replace(/[̀-ͯ]/g, "")
    await input(page).fill(toneless)
    await input(page).press("Enter")
    await shot(page, "05-word-partial-tone", { wait: 900 })
    await page.getByRole("button", { name: "Tiếp tục" }).click()
    await input(page).fill("不知道")
    await input(page).press("Enter")
    await shot(page, "06-word-wrong", { wait: 900 })
    await page.close()
  },
  async sentence(browser) {
    deckOverride = order(["学习", "旅游"])
    const page = await newPage(browser)
    await gotoPractice(page)
    await pick(page, "Gõ câu")
    await input(page).waitFor()
    const target = await page.locator("p[lang=zh][aria-label]").getAttribute("aria-label")
    const core = Array.from(target.replace(/[，。！？、\s]/g, ""))
    const typed = core.slice(0, Math.ceil(core.length / 2)).join("")
    await input(page).fill(typed.slice(0, -1) + "错")
    await shot(page, "07-sentence-typing")
    await page.close()
  },
  async listen(browser) {
    deckOverride = order(["咖啡", "医院"])
    const page = await newPage(browser)
    await gotoPractice(page)
    await pick(page, "Nghe và điền")
    await input(page).waitFor()
    await shot(page, "08-listen-question")
    const blank = await page.locator("p.text-2xl[lang=zh]").first().innerText()
    const c = CARDS.find((x) => x.example_sentence.replace(x.word, "＿".repeat(Array.from(x.word).length)) === blank)
    await input(page).fill(c.word)
    await input(page).press("Enter")
    await shot(page, "09-listen-correct", { wait: 900 })
    await page.close()
  },
  async flashcard(browser) {
    deckOverride = order(["饺子", "会议", "健康"])
    const page = await newPage(browser)
    await gotoPractice(page)
    await pick(page, "Flashcard")
    await page.getByRole("button", { name: "Lật thẻ" }).waitFor()
    await shot(page, "10-flashcard-front")
    await page.keyboard.press("Space")
    await shot(page, "11-flashcard-back-rating")
    await page.keyboard.press("3")
    await page.waitForTimeout(800)
    await shot(page, "12-flashcard-next-with-schedule")
    // Offline giữa lượt
    await page.context().setOffline(true)
    await page.evaluate(() => window.dispatchEvent(new Event("offline")))
    await page.keyboard.press("Space")
    await page.keyboard.press("1")
    await shot(page, "13-offline-queue", { wait: 900 })
    await page.context().setOffline(false)
    await page.evaluate(() => window.dispatchEvent(new Event("online")))
    await page.waitForTimeout(1500)
    await page.keyboard.press("Space")
    await page.keyboard.press("4")
    await shot(page, "14-summary", { wait: 1500 })
    await page.close()
  },
  async galaxy(browser) {
    deckOverride = null
    const page = await newPage(browser)
    await page.goto(`${BASE}/workspace/vocabulary-galaxy`)
    await page.locator("canvas").first().waitFor({ timeout: 30000 })
    await page.waitForTimeout(4500)
    await shot(page, "15-galaxy-page")
    const box = await page.locator("canvas").first().boundingBox()
    // rê chuột tìm một ngôi sao để hiện Quick Flashcard
    for (let y = box.y + box.height * 0.3; y < box.y + box.height * 0.75; y += 14) {
      for (let x = box.x + box.width * 0.3; x < box.x + box.width * 0.7; x += 14) {
        await page.mouse.move(x, y)
        await page.waitForTimeout(25)
        const vis = await page.evaluate(() => [...document.querySelectorAll("[data-side]")].some((e) => e.style.visibility === "visible"))
        if (vis) {
          await page.waitForTimeout(300)
          await shot(page, "16-galaxy-hover")
          await page.close()
          return
        }
      }
    }
    console.log("  no star hovered")
    await page.close()
  },
  async dark(browser) {
    deckOverride = order(["老师", "简历"])
    const page = await newPage(browser, { dark: true })
    await gotoPractice(page)
    await page.waitForTimeout(2000)
    await shot(page, "17-dark-setup")
    await pick(page, "Flashcard")
    await page.keyboard.press("Space")
    await shot(page, "18-dark-flashcard")
    await page.close()
  },
  async english(browser) {
    const page = await newPage(browser, { lang: "en" })
    await page.goto(`${BASE}/workspace/vocabulary-practice`)
    await page.getByRole("button", { name: "Start a round" }).waitFor({ timeout: 30000 })
    await page.waitForTimeout(2500)
    await shot(page, "19-english-setup")
    await page.close()
  },
  async mobile(browser) {
    deckOverride = order(["你好", "谢谢"])
    const page = await newPage(browser, { mobile: true })
    await gotoPractice(page)
    await shot(page, "20-mobile-setup")
    await pick(page, "Gõ từ")
    await input(page).waitFor()
    await input(page).fill("ni3hao3")
    await input(page).press("Enter")
    await shot(page, "21-mobile-word", { wait: 900 })
    await page.close()
  },
}

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
})
try {
  for (const [name, fn] of Object.entries(scenes)) {
    if (ONLY && !ONLY.split(",").includes(name)) continue
    console.log("scene", name)
    try {
      await fn(browser)
    } catch (e) {
      console.log("  FAILED", name, e.message.split("\n")[0])
    }
  }
} finally {
  await browser.close()
}
