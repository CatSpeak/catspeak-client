import { baseApi } from "@/store/api/baseApi"

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

    // Bonus: list resources
    getWebsites: builder.query({
      queryFn: () => {
        return { data: resources }
      },
      providesTags: ["Website"],
    }),
  }),
})

export const { useGetWebsiteByIdQuery, useGetWebsitesQuery } = websiteApi

const resources = [
  // 1. Test trình độ tiếng Anh miễn phí
  {
    id: "ef-set",
    lang: "en",
    url: "https://www.efset.org/",
  },
  // 2. Nền tảng học tổng hợp miễn phí
  {
    id: "fluentez",
    lang: "en",
    url: "https://fluentez.com/",
  },
  {
    id: "questsme",
    lang: "en",
    url: "https://play.questsme.com/",
  },
  {
    id: "eflnet",
    lang: "en",
    url: "https://www.eflnet.com/",
  },
  {
    id: "agenda-web",
    lang: "en",
    url: "https://agendaweb.org/",
  },
  {
    id: "free-daily-english",
    lang: "en",
    url: "https://www.freedailyenglish.com/",
  },
  {
    id: "esl-tests",
    lang: "en",
    url: "https://www.esl-tests.com/",
  },
  {
    id: "english-maven",
    lang: "en",
    url: "https://www.englishmaven.org/",
  },
  {
    id: "talkdrill",
    lang: "en",
    url: "https://www.talkdrill.com/",
  },
  {
    id: "englishpage",
    lang: "en",
    url: "https://www.englishpage.com/",
  },
  {
    id: "learnenglishfeelgood",
    lang: "en",
    url: "https://www.learnenglishfeelgood.com/",
  },
  // 3. Luyện nghe
  {
    id: "elllo",
    lang: "en",
    url: "https://elllo.org/",
  },
  {
    id: "randalls-esl-cyber-listening-lab",
    lang: "en",
    url: "https://www.esl-lab.com/",
  },
  {
    id: "esl-yes",
    lang: "en",
    url: "https://eslyes.com/",
  },
  {
    id: "esl-podcast",
    lang: "en",
    url: "https://www.eslpod.com/",
  },
  {
    id: "listeninenglish",
    lang: "en",
    url: "https://www.listeninenglish.com/",
  },
  {
    id: "dailydictation",
    lang: "en",
    url: "https://dailydictation.com/",
  },
  {
    id: "levelupesl",
    lang: "en",
    url: "https://www.levelupesl.com/",
  },

  // 4. Luyện ngữ pháp
  {
    id: "perfect-english-grammar",
    lang: "en",
    url: "https://www.perfect-english-grammar.com/",
  },
  {
    id: "english-grammar-online",
    lang: "en",
    url: "https://www.english-grammar.at/",
  },
  {
    id: "learngrammar",
    lang: "en",
    url: "https://www.learngrammar.net/practice",
  },

  // 5. Luyện từ vựng
  {
    id: "quizlet",
    lang: "en",
    url: "https://quizlet.com/",
  },
  {
    id: "gamestolearnenglish",
    lang: "en",
    url: "https://www.gamestolearnenglish.com/",
  },

  // 6. Luyện phát âm
  {
    id: "eztalking-ai",
    lang: "en",
    url: "https://app.eztalking.vn/",
  },
  {
    id: "howtopronounce",
    lang: "en",
    url: "https://www.howtopronounce.com/",
  },
  {
    id: "shadola",
    lang: "en",
    url: "https://shadola.com/english",
  },

  // 7. Đọc tin tức theo trình độ
  {
    id: "english-news-in-levels",
    lang: "en",
    url: "https://englishnewsinlevels.com/",
  },
  {
    id: "breaking-news-english",
    lang: "en",
    url: "https://breakingnewsenglish.com/",
  },
  {
    id: "read-in-levels",
    lang: "en",
    url: "https://readinlevels.com/",
  },
  {
    id: "newslish",
    lang: "en",
    url: "https://www.newslish.com/",
  },

  // 8. Luyện thi IELTS/TOEFL
  {
    id: "mini-ielts",
    lang: "en",
    url: "https://mini-ielts.com/",
  },
  {
    id: "ielts-free-tests",
    lang: "en",
    url: "https://www.ieltsfreetests.com/",
  },
  {
    id: "alfa-ielts",
    lang: "en",
    url: "https://alfaielts.com/",
  },

  // 9. Học tiếng Anh cho trẻ em
  {
    id: "nat-geo-kids",
    lang: "en",
    url: "https://kids.nationalgeographic.com/",
  },

  // 10. Đọc mở rộng / Graded Readers
  {
    id: "esol-courses",
    lang: "en",
    url: "https://www.esolcourses.com/",
  },
  {
    id: "free-graded-readers",
    lang: "en",
    url: "https://freegradedreaders.com/",
  },
  {
    id: "english-e-reader",
    lang: "en",
    url: "https://english-e-reader.net/",
  },
  {
    id: "extensive-reading-foundation",
    lang: "en",
    url: "https://erfoundation.org/wordpress/",
  },

  // 11. Từ điển
  {
    id: "merriam-webster-learners-dictionary",
    lang: "en",
    url: "https://www.learnersdictionary.com/",
  },
  // 13. Đa ngôn ngữ
  {
    id: "language-transfer",
    lang: "en",
    url: "https://www.languagetransfer.org/",
  },

  // --- Tiếng Trung (zh) ---
  // 1. Học liệu chuẩn GDPT 2018
  {
    id: "hanh-trang-so",
    lang: "zh",
    url: "https://hanhtrangso.nxbgd.vn/",
  },
  {
    id: "hoc10",
    lang: "zh",
    url: "https://www.hoc10.vn/",
  },
  // 2. Luyện thi HSK miễn phí
  {
    id: "mandarin-bean-hsk-test",
    lang: "zh",
    url: "https://mandarinbean.com/hsk-chinese-test-online/",
  },
  {
    id: "hsk-mock-test",
    lang: "zh",
    url: "https://hskmocktest.com/",
  },

  // 3. Nền tảng học tổng hợp miễn phí
  {
    id: "mandarin-bean",
    lang: "zh",
    url: "https://mandarinbean.com/",
  },

  // 4. Luyện nghe
  {
    id: "mandarin-bean-all-lessons",
    lang: "zh",
    url: "https://mandarinbean.com/all-lessons/",
  },
  {
    id: "chinese-extensive-listening",
    lang: "zh",
    url: "https://hanyufanting.com/",
  },

  // 5. Ngữ pháp
  {
    id: "chinese-grammar-wiki",
    lang: "zh",
    url: "https://resources.allsetlearning.com/chinese/grammar/",
  },
  {
    id: "mandarin-bean-grammar-points",
    lang: "zh",
    url: "https://mandarinbean.com/grammar-points/",
  },
  {
    id: "mandarin-bean-grammar-test",
    lang: "zh",
    url: "https://mandarinbean.com/chinese-grammar-test/",
  },
  {
    id: "dig-mandarin-free-grammar-lessons",
    lang: "zh",
    url: "https://www.digmandarin.com/chinese-grammar-lessons",
  },

  // 6. Phát âm — Pinyin & Thanh điệu
  {
    id: "ut-austin-pinyin-pronunciation-practice",
    lang: "zh",
    url: "https://laits.utexas.edu/ppp/practice.php?unit=1",
  },

  // 7. Viết chữ Hán / Thứ tự nét
  {
    id: "stroke-order",
    lang: "zh",
    url: "https://www.strokeorder.com/",
  },
  {
    id: "arch-chinese",
    lang: "zh",
    url: "https://www.archchinese.com/",
  },
  {
    id: "hanzi-guide",
    lang: "zh",
    url: "https://www.hanzi.guide/",
  },
  {
    id: "hanzi-stroke",
    lang: "zh",
    url: "https://www.hanzistroke.com/",
  },

  // 8. Từ điển hữu ích cho người học
  {
    id: "mdbg-chinese-dictionary",
    lang: "zh",
    url: "https://www.mdbg.net/chinese/dictionary",
  },
  {
    id: "hanzii",
    lang: "zh",
    url: "https://hanzii.net/",
  },

  // 9. Đọc theo trình độ (Graded reading)
  {
    id: "mandarin-bean-graded-reading",
    lang: "zh",
    url: "https://mandarinbean.com/",
  },
  {
    id: "pandaist",
    lang: "zh",
    url: "https://pandaist.com/",
  },
  {
    id: "hskatlas",
    lang: "zh",
    url: "https://hskatlas.com/",
  },
  {
    id: "hskheadlines",
    lang: "zh",
    url: "https://hskheadlines.com/",
  },
  {
    id: "readchinese",
    lang: "zh",
    url: "https://www.readchinese.org/",
  },
  {
    id: "realhsk",
    lang: "zh",
    url: "https://realhsk.com/",
  },
  {
    id: "chinesehskreading",
    lang: "zh",
    url: "https://chinesehskreading.com/",
  },

  // 11. Website tự học tiếng Trung nội địa (giao diện tiếng Việt)
  {
    id: "tieng-trung-tai-nha",
    lang: "zh",
    url: "https://tiengtrungtainha.com/",
  },
  {
    id: "tiengtrungthuonghai",
    lang: "zh",
    url: "https://tiengtrungthuonghai.vn/",
  },

  // --- Tiếng Nhật (ja) ---
  // 1. Luyện thi JLPT
  {
    id: "on-jlpt",
    lang: "ja",
    url: "http://onjlpt.com/",
  },

  // 2. Nền tảng học tổng hợp
  {
    id: "mlc-japanese",
    lang: "ja",
    url: "https://www.mlcjapanese.co.jp/",
  },

  // 3. Luyện đọc hiểu & Dokkai

  // 4. Ngữ pháp
  {
    id: "tufs-grammar-module",
    lang: "ja",
    url: "https://www.coelang.tufs.ac.jp/mt/ja/gmod/",
  },

  // 5. Luyện nghe
  {
    id: "nhk-world-japan",
    lang: "ja",
    url: "https://www3.nhk.or.jp/nhkworld/lesson/vi/lessons/",
  },

  // 6. Phát âm & Ngữ điệu
  {
    id: "ojad-search",
    lang: "ja",
    url: "https://www.gavo.t.u-tokyo.ac.jp/ojad/search",
  },
  {
    id: "ojad-phrasing",
    lang: "ja",
    url: "https://www.gavo.t.u-tokyo.ac.jp/ojad/phrasing/index",
  },

  // 7. Từ vựng & Kanji
  {
    id: "kanjieasy",
    lang: "ja",
    url: "https://kanjieasy.vercel.app/",
  },

  // 8. Từ điển
  {
    id: "takoboto",
    lang: "ja",
    url: "https://takoboto.jp/?w=1362530",
  },
  {
    id: "kanjipedia",
    lang: "ja",
    url: "https://www.kanjipedia.jp/",
  },

  // 9. Dành cho trẻ em / Nhập môn
]
