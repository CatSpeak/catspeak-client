import { baseApi } from "./baseApi";

export const websiteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Mock fetcher: looks up a single resource by id instead of hitting a real endpoint
    getWebsiteById: builder.query({
      queryFn: (id) => {
        const website = resources.find((item) => item.id === id);

        if (!website) {
          return {
            error: {
              status: 404,
              data: { message: `Website with id "${id}" not found` },
            },
          };
        }

        return { data: website };
      },
      providesTags: (result, error, id) => [{ type: "Website", id }],
    }),

    // Bonus: list resources
    getWebsites: builder.query({
      queryFn: () => {
        return { data: resources };
      },
      providesTags: ["Website"],
    }),
  }),
});

export const { useGetWebsiteByIdQuery, useGetWebsitesQuery } = websiteApi;

const resources = [
  // 1. Test trình độ tiếng Anh miễn phí
  {
    id: "ef-set",
    url: "https://www.efset.org/",
  },
  {
    id: "duolingo-english-test-practice",
    url: "https://englishtest.duolingo.com/",
  },
  // 2. Nền tảng học tổng hợp miễn phí
  {
    id: "usa-learns",
    url: "https://www.usalearns.org/",
  },
  // 3. Luyện nghe
  {
    id: "elllo",
    url: "https://elllo.org/",
  },
  {
    id: "randalls-esl-cyber-listening-lab",
    url: "https://www.esl-lab.com/",
  },
  {
    id: "esl-yes",
    url: "https://eslyes.com/",
  },
  {
    id: "esl-podcast",
    url: "https://www.eslpod.com/",
  },

  // 4. Luyện ngữ pháp
  {
    id: "perfect-english-grammar",
    url: "https://www.perfect-english-grammar.com/",
  },
  {
    id: "english-grammar-online",
    url: "https://www.english-grammar.at/",
  },
  {
    id: "learngrammar",
    url: "https://www.learngrammar.net/practice",
  },

  // 5. Luyện từ vựng
  {
    id: "quizlet",
    url: "https://quizlet.com/",
  },

  // 6. Luyện phát âm
  {
    id: "eztalking-ai",
    url: "https://app.eztalking.vn/",
  },
  {
    id: "youglish",
    url: "https://youglish.com/",
  },
  {
    id: "howtopronounce",
    url: "https://www.howtopronounce.com/",
  },

  // 7. Đọc tin tức theo trình độ
  {
    id: "english-news-in-levels",
    url: "https://englishnewsinlevels.com/",
  },
  {
    id: "breaking-news-english",
    url: "https://breakingnewsenglish.com/",
  },

  // 8. Luyện thi IELTS/TOEFL
  {
    id: "mini-ielts",
    url: "https://mini-ielts.com/",
  },
  {
    id: "ielts-free-tests",
    url: "https://www.ieltsfreetests.com/",
  },
  {
    id: "alfa-ielts",
    url: "https://alfaielts.com/",
  },

  // 9. Học tiếng Anh cho trẻ em
  {
    id: "nat-geo-kids",
    url: "https://kids.nationalgeographic.com/",
  },

  // 10. Đọc mở rộng / Graded Readers
  {
    id: "esol-courses",
    url: "https://www.esolcourses.com/",
  },
  {
    id: "free-graded-readers",
    url: "https://freegradedreaders.com/",
  },
  {
    id: "english-e-reader",
    url: "https://english-e-reader.net/",
  },
  {
    id: "extensive-reading-foundation",
    url: "https://erfoundation.org/wordpress/",
  },

  // 11. Từ điển
  {
    id: "merriam-webster-learners-dictionary",
    url: "https://www.learnersdictionary.com/",
  },
  // 13. Đa ngôn ngữ
  {
    id: "language-transfer",
    url: "https://www.languagetransfer.org/",
  },

  // --- Tiếng Trung (zh) ---
  // 1. Học liệu chuẩn GDPT 2018
  {
    id: "hanh-trang-so",
    url: "https://hanhtrangso.nxbgd.vn/",
  },
  {
    id: "hoc10",
    url: "https://www.hoc10.vn/",
  },
  // 2. Luyện thi HSK miễn phí
  {
    id: "improve-mandarin-hsk-practice-tests",
    url: "https://improvemandarin.com/hsk-practice-test/",
  },
  {
    id: "mandarin-bean-hsk-test",
    url: "https://mandarinbean.com/hsk-chinese-test-online/",
  },
  {
    id: "hsk-mock-test",
    url: "https://hskmocktest.com/",
  },
  {
    id: "hsk-course-free-hsk-mock-tests",
    url: "https://www.hskcourse.com/hsk-sample-test/",
  },

  // 3. Nền tảng học tổng hợp miễn phí
  {
    id: "mandarin-bean",
    url: "https://mandarinbean.com/",
  },
  {
    id: "improve-mandarin-chinese-lessons",
    url: "https://improvemandarin.com/chinese-lessons/",
  },

  // 4. Luyện nghe
  {
    id: "mandarin-bean-all-lessons",
    url: "https://mandarinbean.com/all-lessons/",
  },
  {
    id: "chinese-extensive-listening",
    url: "https://hanyufanting.com/",
  },

  // 5. Ngữ pháp
  {
    id: "chinese-grammar-wiki",
    url: "https://resources.allsetlearning.com/chinese/grammar/",
  },
  {
    id: "mandarin-bean-grammar-points",
    url: "https://mandarinbean.com/grammar-points/",
  },
  {
    id: "mandarin-bean-grammar-test",
    url: "https://mandarinbean.com/chinese-grammar-test/",
  },
  {
    id: "dig-mandarin-free-grammar-lessons",
    url: "https://www.digmandarin.com/chinese-grammar-lessons",
  },

  // 6. Phát âm — Pinyin & Thanh điệu
  {
    id: "chinese-pronunciation-wiki",
    url: "https://resources.allsetlearning.com/chinese/pronunciation/",
  },
  {
    id: "ut-austin-pinyin-pronunciation-practice",
    url: "https://laits.utexas.edu/ppp/practice.php?unit=1",
  },

  // 7. Viết chữ Hán / Thứ tự nét
  {
    id: "stroke-order",
    url: "https://www.strokeorder.com/",
  },
  {
    id: "arch-chinese",
    url: "https://www.archchinese.com/",
  },
  {
    id: "hanzi-guide",
    url: "https://www.hanzi.guide/",
  },
  {
    id: "hanzi-stroke",
    url: "https://www.hanzistroke.com/",
  },

  // 8. Từ điển hữu ích cho người học
  {
    id: "mdbg-chinese-dictionary",
    url: "https://www.mdbg.net/chinese/dictionary",
  },

  // 9. Đọc theo trình độ (Graded reading)
  {
    id: "mandarin-bean-graded-reading",
    url: "https://mandarinbean.com/",
  },

  // 10. Học tiếng Trung cho trẻ em

  // 11. Website tự học tiếng Trung nội địa (giao diện tiếng Việt)
  {
    id: "tieng-trung-tai-nha",
    url: "https://tiengtrungtainha.com/",
  },
];
