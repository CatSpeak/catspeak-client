import {
  BookOpenCheckIcon,
  Newspaper,
  LaptopMinimal,
  BookOpenCheck,
  LibraryBig,
  Headphones,
  NotebookPen,
  Puzzle,
  MicVocal,
  Baby,
  BookOpenText,
  Library,
  Languages,
} from "lucide-react";

export const websites = [
  {
    key: "test",
    icon: BookOpenCheckIcon,
    lang: "en",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "ef-set",
        label: "EF SET",
        path: "/website/ef-set",
        img: "https://www.efset.org/favicon.ico",
        color: "#db008f",
      },
      {
        key: "duolingo-english-test-practice",
        label: "Duolingo English Test",
        path: "/website/duolingo-english-test-practice",
        img: "https://dy8n3onijof8f.cloudfront.net/static/images/testcenter/favicon-juicy.png",
        color: "#5acc02",
      },
    ],
  },
  {
    key: "platform",
    icon: LibraryBig,
    lang: "en",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "usa-learns",
        label: "USA Learns",
        path: "/website/usa-learns",
        img: "https://www.usalearns.org/favicon.ico",
      },
    ],
  },
  {
    key: "listening",
    icon: Headphones,
    lang: "en",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "elllo",
        label: "ELLLO",
        path: "/website/elllo",
        img: "https://elllo.org/elllo_new.ico",
        color: "#003366",
      },
      {
        key: "randalls-esl-cyber-listening-lab",
        label: "Randall's ESL Cyber Listening Lab (ESL-Lab)",
        path: "/website/randalls-esl-cyber-listening-lab",
        img: "/website-icons/esl-lab.webp",
        color: "#124c75",
      },
      {
        key: "esl-yes",
        label: "ESL Yes",
        path: "/website/esl-yes",
        color: "#00bf00",
      },
      {
        key: "esl-podcast",
        label: "ESL Podcast (ESLPod)",
        path: "/website/esl-podcast",
        img: "https://www.eslpod.com/wp-content/uploads/2016/06/cropped-ESLPodcastLogoRecWeb300.jpg",
        color: "#8bc73e",
      },
    ],
  },
  {
    key: "grammar",
    icon: Puzzle,
    lang: "en",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "perfect-english-grammar",
        label: "Perfect English Grammar",
        path: "/website/perfect-english-grammar",
        img: "https://www.perfect-english-grammar.com/xfavicon-144x144.png.pagespeed.ic.AiUH3K-8ok.webp",
        color: "#00918a",
      },
      {
        key: "english-grammar-online",
        label: "English Grammar Online (english-grammar.at)",
        path: "/website/english-grammar-online",
        img: "https://www.english-grammar.at/img/favicon.png",
      },
      {
        key: "learngrammar",
        label: "LearnGrammar.net",
        path: "/website/learngrammar",
        img: "https://www.learngrammar.net/public/images/logo.png",
        color: "#657e80",
      },
    ],
  },
  {
    key: "vocabulary",
    icon: NotebookPen,
    lang: "en",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "quizlet",
        label: "Quizlet",
        path: "/website/quizlet",
        img: "/website-icons/quizlet.png",
        color: "#4255ff",
      },
    ],
  },
  {
    key: "pronunciation",
    icon: MicVocal,
    lang: "en",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "eztalking-ai",
        label: "EZTalking AI",
        path: "/website/eztalking-ai",
        img: "https://app.eztalking.vn/eztalking-logo.png",
        color: "#edba1f",
      },
      {
        key: "youglish",
        label: "YouGlish",
        path: "/website/youglish",
        img: "/website-icons/younglish.png",
        color: "#d12121",
      },
      {
        key: "howtopronounce",
        label: "HowToPronounce.com",
        path: "/website/howtopronounce",
        img: "https://www.howtopronounce.com/android-icon-192x192.png",
        color: "#a4cc37",
      },
    ],
  },
  {
    key: "graded-news",
    icon: Newspaper,
    lang: "en",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "english-news-in-levels",
        label: "English News in Levels",
        path: "/website/english-news-in-levels",
        img: "https://levelread.com/logo.svg",
      },
      {
        key: "breaking-news-english",
        label: "Breaking News English",
        path: "/website/breaking-news-english",
      },
    ],
  },
  {
    key: "exam",
    icon: BookOpenCheck,
    lang: "en",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "mini-ielts",
        label: "Mini IELTS",
        path: "/website/mini-ielts",
        img: "https://mini-ielts.com/favicon.ico",
      },
      {
        key: "ielts-free-tests",
        label: "IELTS Free Tests",
        path: "/website/ielts-free-tests",
        img: "https://www.ieltsfreetests.com/favicon.ico",
      },
      {
        key: "alfa-ielts",
        label: "Alfa IELTS",
        path: "/website/alfa-ielts",
        img: "https://alfaielts.com/assets/svgs/header/header_logo.svg",
      },
    ],
  },
  {
    key: "kids",
    icon: Baby,
    lang: "en",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "nat-geo-kids",
        label: "Nat Geo Kids",
        path: "/website/nat-geo-kids",
        color: "#009900",
      },
    ],
  },
  {
    key: "reading",
    icon: BookOpenText,
    lang: "en",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "esol-courses",
        label: "ESOL Courses",
        path: "/website/esol-courses",
      },
      {
        key: "free-graded-readers",
        label: "Free Graded Readers",
        path: "/website/free-graded-readers",
      },
      {
        key: "english-e-reader",
        label: "English e-Reader",
        path: "/website/english-e-reader",
        img: "https://english-e-reader.net/images/eyeglasses_mini_logo_png8.png",
      },
      {
        key: "extensive-reading-foundation",
        label: "Extensive Reading Foundation",
        path: "/website/extensive-reading-foundation",
        img: "https://erfoundation.org/wordpress/wp-content/uploads/2017/02/cropped-wc-icon-redman-192x192.jpg",
      },
    ],
  },
  {
    key: "dictionary",
    icon: LibraryBig,
    lang: "en",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "merriam-webster-learners-dictionary",
        label: "Merriam-Webster Learner's Dictionary",
        path: "/website/merriam-webster-learners-dictionary",
        img: "https://www.britannica.com/dictionary/dist/images/logos/LearnersLogo.png",
        color: "#398596",
      },
    ],
  },
  {
    key: "multilingual",
    icon: Languages,
    lang: "en",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "language-transfer",
        label: "Language Transfer",
        path: "/website/language-transfer",
        img: "https://images.squarespace-cdn.com/content/v1/5c69bfa4f4e531370e74fa44/1552332444504-XTB4M4HKJW5ENFL593QI/favicon.ico",
      },
    ],
  },
  {
    key: "gdpt-materials",
    icon: Library,
    lang: "zh",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "hanh-trang-so",
        label: "Hành Trang Số (NXBGD)",
        path: "/website/hanh-trang-so",
        img: "/website-icons/nxbgd.png",
      },
      {
        key: "hoc10",
        label: "Hoc10",
        path: "/website/hoc10",
        img: "https://www.hoc10.vn/faviconlogo2.ico",
        color: "#304a59",
      },
    ],
  },
  {
    key: "hsk-prep",
    icon: BookOpenCheck,
    lang: "zh",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "improve-mandarin-hsk-practice-tests",
        label: "ImproveMandarin – HSK Practice Tests",
        path: "/website/improve-mandarin-hsk-practice-tests",
        img: "https://improvemandarin.com/wp-content/uploads/cropped-improvemandarin-favicon-1-192x192.png",
      },
      {
        key: "mandarin-bean-hsk-test",
        label: "HSK Test - MandarinBean",
        path: "/website/mandarin-bean-hsk-test",
        img: "https://mandarinbean.com/wp-content/uploads/2019/06/mb_2.png",
      },
      {
        key: "hsk-mock-test",
        label: "HSKMockTest.com",
        path: "/website/hsk-mock-test",
        img: "https://hskmocktest.com/img/favicon.png",
      },
      {
        key: "hsk-course-free-hsk-mock-tests",
        label: "HSKCourse.com – Free HSK Mock Tests",
        path: "/website/hsk-course-free-hsk-mock-tests",
        img: "https://www.hskcourse.com/wp-content/uploads/2026/03/hskcourse-dark.jpg",
      },
    ],
  },
  {
    key: "zh-platform",
    icon: LibraryBig,
    lang: "zh",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "mandarin-bean",
        label: "MandarinBean",
        path: "/website/mandarin-bean",
        img: "https://mandarinbean.com/wp-content/uploads/2019/06/mb_2.png",
      },
      {
        key: "improve-mandarin-chinese-lessons",
        label: "ImproveMandarin",
        path: "/website/improve-mandarin-chinese-lessons",
        img: "https://improvemandarin.com/wp-content/uploads/cropped-improvemandarin-favicon-1-192x192.png",
      },
    ],
  },
  {
    key: "zh-listening",
    icon: Headphones,
    lang: "zh",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "mandarin-bean-all-lessons",
        label: "All Lessons - MandarinBean",
        path: "/website/mandarin-bean-all-lessons",
        img: "https://mandarinbean.com/wp-content/uploads/2019/06/mb_2.png",
      },
      {
        key: "chinese-extensive-listening",
        label: "Chinese Extensive Listening (汉语泛听)",
        path: "/website/chinese-extensive-listening",
        img: "https://hanyufanting.com/wp-content/uploads/2017/06/profile-picture-2.jpg?w=192",
      },
    ],
  },
  {
    key: "zh-grammar",
    icon: Puzzle,
    lang: "zh",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "chinese-grammar-wiki",
        label: "Chinese Grammar Wiki - AllSet Learning",
        path: "/website/chinese-grammar-wiki",
        img: "https://resources.allsetlearning.com/favicon.ico",
      },
      {
        key: "mandarin-bean-grammar-points",
        label: "Grammar Points - MandarinBean",
        path: "/website/mandarin-bean-grammar-points",
        img: "https://mandarinbean.com/wp-content/uploads/2019/06/mb_2.png",
      },
      {
        key: "mandarin-bean-grammar-test",
        label: "Grammar Test - MandarinBean",
        path: "/website/mandarin-bean-grammar-test",
        img: "https://mandarinbean.com/wp-content/uploads/2019/06/mb_2.png",
      },
      {
        key: "dig-mandarin-free-grammar-lessons",
        label: "DigMandarin – Free Grammar Lessons",
        path: "/website/dig-mandarin-free-grammar-lessons",
        img: "https://www.digmandarin.com/wp-content/uploads/2018/06/Panda_favicon.png",
      },
    ],
  },
  {
    key: "zh-pronunciation",
    icon: MicVocal,
    lang: "zh",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "chinese-pronunciation-wiki",
        label: "Chinese Pronunciation Wiki - AllSet Learning",
        path: "/website/chinese-pronunciation-wiki",
        img: "https://resources.allsetlearning.com/favicon.ico",
      },
      {
        key: "ut-austin-pinyin-pronunciation-practice",
        label: "UT Austin – Pinyin Pronunciation Practice",
        path: "/website/ut-austin-pinyin-pronunciation-practice",
      },
    ],
  },
  {
    key: "zh-stroke-order",
    icon: NotebookPen,
    lang: "zh",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "stroke-order",
        label: "StrokeOrder.com",
        path: "/website/stroke-order",
        img: "https://www.strokeorder.com/assets/favicons/favicon-96x96.png",
      },
      {
        key: "arch-chinese",
        label: "ArchChinese",
        path: "/website/arch-chinese",
        img: "https://www.archchinese.com/favicon.ico",
      },
      {
        key: "hanzi-guide",
        label: "Hanzi Guide",
        path: "/website/hanzi-guide",
        img: "https://www.hanzi.guide/favicon.ico",
      },
      {
        key: "hanzi-stroke",
        label: "HanziStroke.com",
        path: "/website/hanzi-stroke",
        img: "https://www.hanzistroke.com/website-icon-56.webp",
      },
    ],
  },
  {
    key: "zh-dictionary",
    icon: BookOpenText,
    lang: "zh",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "mdbg-chinese-dictionary",
        label: "MDBG Chinese Dictionary",
        path: "/website/mdbg-chinese-dictionary",
        color: "#4b66a3",
      },
    ],
  },
  {
    key: "zh-graded-reading",
    icon: Newspaper,
    lang: "zh",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "mandarin-bean-graded-reading",
        label: "MandarinBean",
        path: "/website/mandarin-bean-graded-reading",
        img: "https://mandarinbean.com/wp-content/uploads/2019/06/mb_2.png",
      },
    ],
  },
  {
    key: "zh-self-study-vn",
    icon: LaptopMinimal,
    lang: "zh",
    showOnHorizontalBar: false,
    hasDropdown: true,

    subItems: [
      {
        key: "tieng-trung-tai-nha",
        label: "Tiếng Trung Tại Nhà",
        path: "/website/tieng-trung-tai-nha",
        color: "#870430",
      },
    ],
  },
];
