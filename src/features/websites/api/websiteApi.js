import { baseApi } from "@/store/api/baseApi"
import { getWebsiteCount } from "../config/websitesData"

export const websiteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Mock fetcher: looks up a single resource by lang and id instead of hitting a real endpoint
    getWebsiteById: builder.query({
      queryFn: (params) => {
        const id = typeof params === "object" ? params?.id : params
        const lang = typeof params === "object" ? params?.lang : undefined

        let website = lang
          ? resources.find((item) => item.id === id && item.lang === lang)
          : null
        if (!website) {
          website = resources.find((item) => item.id === id)
        }

        if (!website) {
          return {
            error: {
              status: 404,
              data: {
                message: lang
                  ? `Website with id "${id}" and lang "${lang}" not found`
                  : `Website with id "${id}" not found`,
              },
            },
          }
        }

        return { data: website }
      },
      providesTags: (result, error, params) => {
        const id = typeof params === "object" ? params?.id : params
        const lang = typeof params === "object" ? params?.lang : undefined
        return [{ type: "Website", id: lang ? `${lang}-${id}` : id }]
      },
    }),

    // Get count of websites by lang ("ja" | "zh" | "en") and optional category
    getWebsiteCount: builder.query({
      queryFn: (params) => {
        let lang, category
        if (typeof params === "object" && params !== null) {
          lang = params.lang
          category = params.category
        } else if (typeof params === "string") {
          lang = params
        }
        const count = getWebsiteCount(lang, category)
        return { data: count }
      },
      providesTags: (result, error, params) => {
        const lang = typeof params === "object" ? params?.lang : params
        const category =
          typeof params === "object" ? params?.category : undefined
        return [
          {
            type: "Website",
            id: `count-${lang || "all"}-${category || "all"}`,
          },
        ]
      },
    }),

    // Bonus: list resources
    getWebsites: builder.query({
      queryFn: () => {
        return { data: resources }
      },
      providesTags: ["Website"],
    }),
  }),
})

export { getWebsiteCount }

export const {
  useGetWebsiteByIdQuery,
  useGetWebsiteCountQuery,
  useGetWebsitesQuery,
} = websiteApi

const resources = [
  // 1. Test trình độ tiếng Anh miễn phí
  {
    id: "ef-set",
    lang: "en",
    url: "https://www.efset.org/",
    embeddable: true,
  },
  // 2. Nền tảng học tổng hợp miễn phí
  {
    id: "fluentez",
    lang: "en",
    url: "https://fluentez.com/",
    embeddable: true,
  },
  {
    id: "questsme",
    lang: "en",
    url: "https://play.questsme.com/",
    embeddable: true,
  },
  {
    id: "eflnet",
    lang: "en",
    url: "https://www.eflnet.com/",
    embeddable: true,
  },
  {
    id: "agenda-web",
    lang: "en",
    url: "https://agendaweb.org/",
    embeddable: true,
  },
  {
    id: "free-daily-english",
    lang: "en",
    url: "https://www.freedailyenglish.com/",
    embeddable: true,
  },
  {
    id: "esl-tests",
    lang: "en",
    url: "https://www.esl-tests.com/",
    embeddable: true,
  },
  {
    id: "english-maven",
    lang: "en",
    url: "https://www.englishmaven.org/",
    embeddable: true,
  },
  {
    id: "talkdrill",
    lang: "en",
    url: "https://www.talkdrill.com/",
    embeddable: true,
  },
  {
    id: "englishpage",
    lang: "en",
    url: "https://www.englishpage.com/",
    embeddable: false,
  },
  {
    id: "learnenglishfeelgood",
    lang: "en",
    url: "https://www.learnenglishfeelgood.com/",
    embeddable: true,
  },
  // 3. Luyện nghe
  {
    id: "elllo",
    lang: "en",
    url: "https://elllo.org/",
    embeddable: true,
  },
  {
    id: "randalls-esl-cyber-listening-lab",
    lang: "en",
    url: "https://www.esl-lab.com/",
    embeddable: true,
  },
  {
    id: "esl-yes",
    lang: "en",
    url: "https://eslyes.com/",
    embeddable: true,
  },
  {
    id: "esl-podcast",
    lang: "en",
    url: "https://www.eslpod.com/",
    embeddable: true,
  },
  {
    id: "listeninenglish",
    lang: "en",
    url: "https://www.listeninenglish.com/",
    embeddable: true,
  },
  {
    id: "dailydictation",
    lang: "en",
    url: "https://dailydictation.com/",
    embeddable: true,
  },
  {
    id: "levelupesl",
    lang: "en",
    url: "https://www.levelupesl.com/",
    embeddable: true,
  },

  // 4. Luyện ngữ pháp
  {
    id: "perfect-english-grammar",
    lang: "en",
    url: "https://www.perfect-english-grammar.com/",
    embeddable: true,
  },
  {
    id: "english-grammar-online",
    lang: "en",
    url: "https://www.english-grammar.at/",
    embeddable: true,
  },
  {
    id: "learngrammar",
    lang: "en",
    url: "https://www.learngrammar.net/practice",
    embeddable: true,
  },

  // 5. Luyện từ vựng
  {
    id: "quizlet",
    lang: "en",
    url: "https://quizlet.com/",
    embeddable: false,
  },
  {
    id: "gamestolearnenglish",
    lang: "en",
    url: "https://www.gamestolearnenglish.com/",
    embeddable: true,
  },

  // 6. Luyện phát âm
  {
    id: "eztalking-ai",
    lang: "en",
    url: "https://app.eztalking.vn/",
    embeddable: true,
  },
  {
    id: "howtopronounce",
    lang: "en",
    url: "https://www.howtopronounce.com/",
    embeddable: true,
  },
  {
    id: "shadola",
    lang: "en",
    url: "https://shadola.com/english",
    embeddable: false,
  },

  // 7. Đọc tin tức theo trình độ
  {
    id: "english-news-in-levels",
    lang: "en",
    url: "https://englishnewsinlevels.com/",
    embeddable: true,
  },
  {
    id: "breaking-news-english",
    lang: "en",
    url: "https://breakingnewsenglish.com/",
    embeddable: true,
  },
  {
    id: "read-in-levels",
    lang: "en",
    url: "https://readinlevels.com/",
    embeddable: true,
  },
  {
    id: "newslish",
    lang: "en",
    url: "https://www.newslish.com/",
    embeddable: false,
  },

  // 8. Luyện thi IELTS/TOEFL
  {
    id: "mini-ielts",
    lang: "en",
    url: "https://mini-ielts.com/",
    embeddable: false,
  },
  {
    id: "ielts-free-tests",
    lang: "en",
    url: "https://www.ieltsfreetests.com/",
    embeddable: true,
  },
  {
    id: "alfa-ielts",
    lang: "en",
    url: "https://alfaielts.com/",
    embeddable: true,
  },

  // 9. Học tiếng Anh cho trẻ em
  {
    id: "nat-geo-kids",
    lang: "en",
    url: "https://kids.nationalgeographic.com/",
    embeddable: true,
  },

  // 10. Đọc mở rộng / Graded Readers
  {
    id: "esol-courses",
    lang: "en",
    url: "https://www.esolcourses.com/",
    embeddable: true,
  },
  {
    id: "free-graded-readers",
    lang: "en",
    url: "https://freegradedreaders.com/",
    embeddable: false,
  },
  {
    id: "english-e-reader",
    lang: "en",
    url: "https://english-e-reader.net/",
    embeddable: true,
  },
  {
    id: "extensive-reading-foundation",
    lang: "en",
    url: "https://erfoundation.org/wordpress/",
    embeddable: true,
  },

  // 11. Từ điển
  {
    id: "merriam-webster-learners-dictionary",
    lang: "en",
    url: "https://www.learnersdictionary.com/",
    embeddable: false,
  },
  // 13. Đa ngôn ngữ
  {
    id: "language-transfer",
    lang: "en",
    url: "https://www.languagetransfer.org/",
    embeddable: true,
  },

  // --- Tiếng Trung (zh) ---
  // 1. Học liệu chuẩn GDPT 2018
  {
    id: "hanh-trang-so",
    lang: "zh",
    url: "https://hanhtrangso.nxbgd.vn/",
    embeddable: true,
  },
  {
    id: "hoc10",
    lang: "zh",
    url: "https://www.hoc10.vn/",
    embeddable: true,
  },
  // 2. Luyện thi HSK miễn phí
  {
    id: "mandarin-bean-hsk-test",
    lang: "zh",
    url: "https://mandarinbean.com/hsk-chinese-test-online/",
    embeddable: true,
  },
  {
    id: "hsk-mock-test",
    lang: "zh",
    url: "https://hskmocktest.com/",
    embeddable: true,
  },

  // 3. Nền tảng học tổng hợp miễn phí
  {
    id: "mandarin-bean",
    lang: "zh",
    url: "https://mandarinbean.com/",
    embeddable: true,
  },
  {
    id: "little-fox",
    lang: "zh",
    url: "https://chinese.littlefox.com/en/story",
    embeddable: true,
  },

  // 4. Luyện nghe
  {
    id: "mandarin-bean-all-lessons",
    lang: "zh",
    url: "https://mandarinbean.com/all-lessons/",
    embeddable: true,
  },
  {
    id: "chinese-extensive-listening",
    lang: "zh",
    url: "https://hanyufanting.com/",
    embeddable: false,
  },

  // 5. Ngữ pháp
  {
    id: "chinese-grammar-wiki",
    lang: "zh",
    url: "https://resources.allsetlearning.com/chinese/grammar/",
    embeddable: true,
  },
  {
    id: "mandarin-bean-grammar-points",
    lang: "zh",
    url: "https://mandarinbean.com/grammar-points/",
    embeddable: true,
  },
  {
    id: "mandarin-bean-grammar-test",
    lang: "zh",
    url: "https://mandarinbean.com/chinese-grammar-test/",
    embeddable: true,
  },
  {
    id: "dig-mandarin-free-grammar-lessons",
    lang: "zh",
    url: "https://www.digmandarin.com/chinese-grammar-lessons",
    embeddable: true,
  },

  // 6. Phát âm — Pinyin & Thanh điệu
  {
    id: "ut-austin-pinyin-pronunciation-practice",
    lang: "zh",
    url: "https://laits.utexas.edu/ppp/practice.php?unit=1",
    embeddable: true,
  },

  // 7. Viết chữ Hán / Thứ tự nét
  {
    id: "stroke-order",
    lang: "zh",
    url: "https://www.strokeorder.com/",
    embeddable: true,
  },
  {
    id: "arch-chinese",
    lang: "zh",
    url: "https://www.archchinese.com/",
    embeddable: true,
  },
  {
    id: "hanzi-guide",
    lang: "zh",
    url: "https://www.hanzi.guide/",
    embeddable: true,
  },
  {
    id: "hanzi-stroke",
    lang: "zh",
    url: "https://www.hanzistroke.com/",
    embeddable: true,
  },

  // 8. Từ điển hữu ích cho người học
  {
    id: "mdbg-chinese-dictionary",
    lang: "zh",
    url: "https://www.mdbg.net/chinese/dictionary",
    embeddable: true,
  },
  {
    id: "hanzii",
    lang: "zh",
    url: "https://hanzii.net/",
    embeddable: true,
  },

  // 9. Đọc theo trình độ (Graded reading)
  {
    id: "mandarin-bean-graded-reading",
    lang: "zh",
    url: "https://mandarinbean.com/",
    embeddable: true,
  },
  {
    id: "pandaist",
    lang: "zh",
    url: "https://pandaist.com/",
    embeddable: true,
  },
  {
    id: "hskatlas",
    lang: "zh",
    url: "https://hskatlas.com/",
    embeddable: true,
  },
  {
    id: "hskheadlines",
    lang: "zh",
    url: "https://hskheadlines.com/",
    embeddable: true,
  },
  {
    id: "readchinese",
    lang: "zh",
    url: "https://www.readchinese.org/",
    embeddable: true,
  },
  {
    id: "realhsk",
    lang: "zh",
    url: "https://realhsk.com/",
    embeddable: true,
  },
  {
    id: "chinesehskreading",
    lang: "zh",
    url: "https://chinesehskreading.com/",
    embeddable: true,
  },

  // 11. Website tự học tiếng Trung nội địa (giao diện tiếng Việt)
  {
    id: "tieng-trung-tai-nha",
    lang: "zh",
    url: "https://tiengtrungtainha.com/",
    embeddable: true,
  },
  {
    id: "tiengtrungthuonghai",
    lang: "zh",
    url: "https://tiengtrungthuonghai.vn/",
    embeddable: true,
  },
  {
    id: "tiengtrungpanda",
    lang: "zh",
    url: "https://tiengtrungpanda.vn/",
    embeddable: true,
  },

  // --- Tiếng Nhật (ja) ---
  // 1. Luyện thi JLPT
  {
    id: "on-jlpt",
    lang: "ja",
    url: "https://onjlpt.com/",
    embeddable: true,
  },

  // 2. Nền tảng học tổng hợp
  {
    id: "mlc-japanese",
    lang: "ja",
    url: "https://www.mlcjapanese.co.jp/",
    embeddable: false,
  },
  {
    id: "corodomo",
    lang: "ja",
    url: "https://corodomo.com/",
    embeddable: true,
  },

  // 3. Luyện đọc hiểu & Dokkai

  // 4. Ngữ pháp
  {
    id: "tufs-grammar-module",
    lang: "ja",
    url: "https://www.coelang.tufs.ac.jp/mt/ja/gmod/",
    embeddable: true,
  },

  // 5. Luyện nghe
  {
    id: "nhk-world-japan",
    lang: "ja",
    url: "https://www3.nhk.or.jp/nhkworld/lesson/vi/lessons/",
    embeddable: true,
  },

  // 6. Phát âm & Ngữ điệu
  {
    id: "ojad-search",
    lang: "ja",
    url: "https://www.gavo.t.u-tokyo.ac.jp/ojad/search",
    embeddable: true,
  },
  {
    id: "ojad-phrasing",
    lang: "ja",
    url: "https://www.gavo.t.u-tokyo.ac.jp/ojad/phrasing/index",
    embeddable: true,
  },

  // 7. Từ vựng & Kanji
  {
    id: "kanjieasy",
    lang: "ja",
    url: "https://kanjieasy.vercel.app/",
    embeddable: true,
  },

  // 8. Từ điển
  {
    id: "takoboto",
    lang: "ja",
    url: "https://takoboto.jp/?w=1362530",
    embeddable: false,
  },
  {
    id: "kanjipedia",
    lang: "ja",
    url: "https://www.kanjipedia.jp/",
    embeddable: true,
  },

  // 9. Trò chơi / Games
  {
    id: "xe-tang-hoc-kanji",
    lang: "ja",
    url: "https://gametiengnhat.onhat.vn/?nhom=xe-tang-hoc-kanji#games",
    embeddable: true,
  },
  {
    id: "hansha-dojo",
    lang: "ja",
    url: "https://gametiengnhat.onhat.vn/games/hansha-dojo/",
    embeddable: true,
  },
  {
    id: "wakamono",
    lang: "ja",
    url: "https://gametiengnhat.onhat.vn/games/wakamono/",
    embeddable: true,
  },

  // 10. Dành cho trẻ em / Nhập môn
]
