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
} from "lucide-react"

export const RESOURCE_CATEGORIES = {
  all: { labelEn: "All Resources", labelZh: "全部资源" },
  test: {
    labelEn: "Practice Tests",
    labelZh: "模拟考试",
    icon: BookOpenCheckIcon,
  },
  platform: {
    labelEn: "Learning Platforms",
    labelZh: "综合平台",
    icon: LibraryBig,
  },
  listening: { labelEn: "Listening", labelZh: "听力训练", icon: Headphones },
  grammar: { labelEn: "Grammar", labelZh: "语法学习", icon: Puzzle },
  vocabulary: { labelEn: "Vocabulary", labelZh: "词汇积累", icon: NotebookPen },
  pronunciation: {
    labelEn: "Pronunciation",
    labelZh: "发音与拼音",
    icon: MicVocal,
  },
  news: {
    labelEn: "News & Articles",
    labelZh: "分级阅读与新闻",
    icon: Newspaper,
  },
  exam: {
    labelEn: "IELTS / HSK Prep",
    labelZh: "备考专区",
    icon: BookOpenCheck,
  },
  reading: {
    labelEn: "Graded Readers",
    labelZh: "阅读拓展",
    icon: BookOpenText,
  },
  dictionary: {
    labelEn: "Dictionaries",
    labelZh: "实用词典",
    icon: LibraryBig,
  },
  writing: { labelEn: "Hanzi Writing", labelZh: "汉字书写", icon: NotebookPen },
  kids: { labelEn: "For Kids", labelZh: "少儿学习", icon: Baby },
}

export const websites = [
  {
    key: "test",
    category: "test",
    icon: BookOpenCheckIcon,
    lang: "en",
    subItems: [
      {
        key: "ef-set",
        label: "EF SET",
        path: "/resources/ef-set",
        img: "https://www.efset.org/favicon.ico",
        color: "#db008f",
        description:
          "Free standardized English test with instant score report aligned to CEFR levels.",
      },
    ],
  },
  {
    key: "platform",
    category: "platform",
    icon: LibraryBig,
    lang: "en",
    subItems: [
      {
        key: "fluentez",
        label: "Fluentez",
        path: "/resources/fluentez",
        img: "https://fluentez.com/vitefavicon.svg",
        color: "#00b6e3",
        description:
          "Comprehensive video-based platform to learn English online for free.",
      },
      {
        key: "questsme",
        label: "Questsme",
        path: "/resources/questsme",
        img: "https://play.questsme.com/favicon.png",
        color: "#f7ca14",
        description:
          "A journey to enhance knowledge about your favorite brands.",
      },
      {
        key: "eflnet",
        label: "Eflnet",
        path: "/resources/eflnet",
        color: "#c7420e",
        description: "Free, focused practice for every part of your English.",
      },
      {
        key: "agenda-web",
        label: "Agenda Web",
        path: "/resources/agenda-web",
        description:
          "English exercises online to practise grammar, vocabulary, verbs, listening, reading and phonetics. Interactive ESL activities and practice tests for all levels.",
      },
      {
        key: "free-daily-english",
        label: "Free Daily English",
        path: "/resources/free-daily-english",
        color: "#ba652d",
        description:
          "Get FREE daily English lessons for all CEFR levels (A1-B2). Master vocabulary, grammar, phrasal verbs & idioms with audio examples. Join thousands of learners improving daily. Start learning English for free now!",
      },
      {
        key: "esl-tests",
        label: "ESL Tests",
        path: "/resources/esl-tests",
        color: "#3aafba",
        img: "https://www.esl-tests.com/logotip.svg",
        description:
          "Free English practice tests for every CEFR level — A1 to C2. Grammar, reading, listening and vocabulary. Find your exact level and start improving today. No sign-up.",
      },
      {
        key: "english-maven",
        label: "EnglishMaven",
        path: "/resources/english-maven",
        color: "#048cc7",
        description:
          "Take free online English lessons and exercises here. English Maven offers hundreds of English grammar and vocabulary lessons to help you study English online.",
      },
      {
        key: "talkdrill",
        label: "TalkDrill",
        path: "/resources/talkdrill",
        color: "#4d40e3",
        img: "https://www.talkdrill.com/favicon.ico",
        description: "Master English conversations Anytime, Anywhere.",
      },
      {
        key: "englishpage",
        label: "Englishpage",
        path: "/resources/englishpage",
        color: "#326699",
        img: "https://www.englishpage.com/image/englishpage-logo.gif",
        description: "Quality Resources for English Learners.",
      },
      {
        key: "learnenglishfeelgood",
        label: "Learn English Feel Good",
        path: "/resources/learnenglishfeelgood",
        color: "#006699",
        img: "https://www.learnenglishfeelgood.com/favicon.png",
        description: "Free ESL Grammar, Vocabulary & Listening Exercises.",
      },
    ],
  },
  {
    key: "listening",
    category: "listening",
    icon: Headphones,
    lang: "en",
    subItems: [
      {
        key: "elllo",
        label: "ELLLO",
        path: "/resources/elllo",
        img: "https://elllo.org/elllo_new.ico",
        color: "#003366",
        description:
          "Over 3,000 free listening activities with transcripts and quizzes for all levels.",
      },
      {
        key: "randalls-esl-cyber-listening-lab",
        label: "Randall's ESL Cyber Listening Lab",
        path: "/resources/randalls-esl-cyber-listening-lab",
        img: "/website-icons/esl-lab.webp",
        color: "#124c75",
        description:
          "Everyday conversation audio quizzes for beginner, intermediate, and advanced learners.",
      },
      {
        key: "esl-yes",
        label: "ESL Yes",
        path: "/resources/esl-yes",
        color: "#00bf00",
        description:
          "1,600+ short audio stories with scripts and vocabulary practice.",
      },
      {
        key: "esl-podcast",
        label: "ESL Podcast (ESLPod)",
        path: "/resources/esl-podcast",
        img: "https://www.eslpod.com/wp-content/uploads/2016/06/cropped-ESLPodcastLogoRecWeb300.jpg",
        color: "#8bc73e",
        description:
          "Slow, clear English podcasts explaining cultural context and idioms.",
      },
      {
        key: "listeninenglish",
        label: "Listen in English",
        path: "/resources/listeninenglish",
        img: "https://www.listeninenglish.com/android-chrome-512x512.png?v=20251120",
        description:
          "Free ESL listening practice with BBC news, TV and movie clips, and podcasts. Improve comprehension, vocabulary, and pronunciation.",
      },
      {
        key: "dailydictation",
        label: "DailyDictation",
        path: "/resources/dailydictation",
        img: "https://dailydictation.com/dailydictation.svg",
        color: "#1d73bf",
        description:
          "Online dictation exercises for learners to improve English listening skills quickly. All levels from basic, intermediate to advanced. 100% Free.",
      },
      {
        key: "levelupesl",
        label: "LevelUpESL",
        path: "/resources/levelupesl",
        color: "#4f47e6",
        img: "https://www.levelupesl.com/favicon.svg",
        description: "Master English by Playing.",
      },
    ],
  },
  {
    key: "grammar",
    category: "grammar",
    icon: Puzzle,
    lang: "en",
    subItems: [
      {
        key: "perfect-english-grammar",
        label: "Perfect English Grammar",
        path: "/resources/perfect-english-grammar",
        img: "https://www.perfect-english-grammar.com/xfavicon-144x144.png.pagespeed.ic.AiUH3K-8ok.webp",
        color: "#00918a",
        description:
          "Clear explanations and interactive exercises for English verb tenses & grammar rules.",
      },
      {
        key: "english-grammar-online",
        label: "English Grammar Online",
        path: "/resources/english-grammar-online",
        img: "https://www.english-grammar.at/img/favicon.png",
        description:
          "Free online grammar, vocabulary, reading, and listening exercises.",
      },
      {
        key: "learngrammar",
        label: "LearnGrammar.net",
        path: "/resources/learngrammar",
        img: "https://www.learngrammar.net/public/images/logo.png",
        color: "#657e80",
        description: "Structured grammar reference guide and practice quizzes.",
      },
    ],
  },
  {
    key: "vocabulary",
    category: "vocabulary",
    icon: NotebookPen,
    lang: "en",
    subItems: [
      {
        key: "quizlet",
        label: "Quizlet",
        path: "/resources/quizlet",
        img: "/website-icons/quizlet.png",
        color: "#4255ff",
        description:
          "Create and study digital flashcards, practice tests, and interactive memory games.",
      },
      {
        key: "gamestolearnenglish",
        label: "Games to Learn English",
        path: "/resources/gamestolearnenglish",
        img: "https://www.gamestolearnenglish.com/favicon.png",
        color: "#000066",
        description:
          "Free online ESL games to help students learn English in a fun and interactive way.",
      },
    ],
  },
  {
    key: "pronunciation",
    category: "pronunciation",
    icon: MicVocal,
    lang: "en",
    subItems: [
      {
        key: "eztalking-ai",
        label: "EZTalking AI",
        path: "/resources/eztalking-ai",
        img: "https://app.eztalking.vn/eztalking-logo.png",
        color: "#edba1f",
        description:
          "AI-powered pronunciation scoring and speaking practice assistant.",
      },
      {
        key: "howtopronounce",
        label: "HowToPronounce.com",
        path: "/resources/howtopronounce",
        img: "https://www.howtopronounce.com/android-icon-192x192.png",
        color: "#a4cc37",
        description:
          "Audio pronunciation dictionary featuring global accents and audio recordings.",
      },
      {
        key: "shadola",
        label: "Shadola",
        path: "/resources/shadola",
        img: "https://shadola.com/icon.svg",
        color: "#6d5ef7",
        description: "Master spoken English with the Shadowing technique.",
      },
    ],
  },
  {
    key: "graded-news",
    category: "news",
    icon: Newspaper,
    lang: "en",
    subItems: [
      {
        key: "english-news-in-levels",
        label: "English News in Levels",
        path: "/resources/english-news-in-levels",
        img: "https://levelread.com/logo.svg",
        description:
          "World news articles written in 3 different English difficulty levels with audio.",
      },
      {
        key: "breaking-news-english",
        label: "Breaking News English",
        path: "/resources/breaking-news-english",
        description:
          "Free interactive lessons on current events with 7 levels of difficulty.",
      },
      {
        key: "read-in-levels",
        label: "Read in Levels",
        path: "/resources/read-in-levels",
        img: "https://readinlevels.com/favicon.ico?favicon.16c-1ygoukkmw.ico",
        color: "#ffb833",
        description: "One story a day, hand-adapted from A1 to C1.",
      },
      {
        key: "newslish",
        label: "Newslish",
        path: "/resources/newslish",
        img: "https://www.newslish.com/favicon.ico",
        color: "#f7f5f0",
        description: "Learn English with real news. 10 minutes a day.",
      },
    ],
  },
  {
    key: "exam",
    category: "exam",
    icon: BookOpenCheck,
    lang: "en",
    subItems: [
      {
        key: "mini-ielts",
        label: "Mini IELTS",
        path: "/resources/mini-ielts",
        img: "https://mini-ielts.com/favicon.ico",
        description:
          "Short 10-minute IELTS Reading and Listening practice tests with answers.",
      },
      {
        key: "ielts-free-tests",
        label: "IELTS Free Tests",
        path: "/resources/ielts-free-tests",
        img: "https://www.ieltsfreetests.com/favicon.ico",
        description:
          "Full mock exams and practice exercises for Academic and General IELTS.",
      },
      {
        key: "alfa-ielts",
        label: "Alfa IELTS",
        path: "/resources/alfa-ielts",
        img: "https://alfaielts.com/assets/svgs/header/header_logo.svg",
        description:
          "AI-evaluated IELTS practice platform for speaking and writing modules.",
      },
    ],
  },
  {
    key: "kids",
    category: "kids",
    icon: Baby,
    lang: "en",
    subItems: [
      {
        key: "nat-geo-kids",
        label: "Nat Geo Kids",
        path: "/resources/nat-geo-kids",
        color: "#009900",
        description:
          "Fun science, animal articles, and educational games for younger learners.",
      },
    ],
  },
  {
    key: "reading",
    category: "reading",
    icon: BookOpenText,
    lang: "en",
    subItems: [
      {
        key: "esol-courses",
        label: "ESOL Courses",
        path: "/resources/esol-courses",
        description:
          "Free online English lessons, reading comprehension, and song quizzes.",
      },
      {
        key: "free-graded-readers",
        label: "Free Graded Readers",
        path: "/resources/free-graded-readers",
        description:
          "E-books adapted for English learners at various proficiency levels.",
      },
      {
        key: "english-e-reader",
        label: "English e-Reader",
        path: "/resources/english-e-reader",
        img: "https://english-e-reader.net/images/eyeglasses_mini_logo_png8.png",
        description:
          "Extensive online library of graded readers in EPUB, MOBI, and FB2 formats.",
      },
      {
        key: "extensive-reading-foundation",
        label: "Extensive Reading Foundation",
        path: "/resources/extensive-reading-foundation",
        img: "https://erfoundation.org/wordpress/wp-content/uploads/2017/02/cropped-wc-icon-redman-192x192.jpg",
        description:
          "Resources and reading lists to promote pleasure reading in foreign languages.",
      },
    ],
  },
  {
    key: "dictionary",
    category: "dictionary",
    icon: LibraryBig,
    lang: "en",
    subItems: [
      {
        key: "merriam-webster-learners-dictionary",
        label: "Merriam-Webster Learner's Dictionary",
        path: "/resources/merriam-webster-learners-dictionary",
        img: "https://www.britannica.com/dictionary/dist/images/logos/LearnersLogo.png",
        color: "#398596",
        description:
          "Clear definitions, example sentences, and audio pronunciations for English learners.",
      },
    ],
  },
  {
    key: "multilingual",
    category: "platform",
    icon: Languages,
    lang: "en",
    subItems: [
      {
        key: "language-transfer",
        label: "Language Transfer",
        path: "/resources/language-transfer",
        img: "https://images.squarespace-cdn.com/content/v1/5c69bfa4f4e531370e74fa44/1552332444504-XTB4M4HKJW5ENFL593QI/favicon.ico",
        description:
          "Free audio courses using Thinking Method to master language structures quickly.",
      },
    ],
  },

  // --- Tiếng Trung (zh) ---
  {
    key: "gdpt-materials",
    category: "platform",
    icon: Library,
    lang: "zh",
    subItems: [
      {
        key: "hanh-trang-so",
        label: "Hành Trang Số (NXBGD)",
        path: "/resources/hanh-trang-so",
        img: "/website-icons/nxbgd.png",
        description:
          "Kho sách giáo khoa & học liệu số chuẩn NXB Giáo dục Việt Nam.",
      },
      {
        key: "hoc10",
        label: "Hoc10",
        path: "/resources/hoc10",
        img: "https://www.hoc10.vn/faviconlogo2.ico",
        color: "#304a59",
        description:
          "Nền tảng sách giáo khoa điện tử Cánh Diều và bài tập tương tác.",
      },
    ],
  },
  {
    key: "hsk-prep",
    category: "exam",
    icon: BookOpenCheck,
    lang: "zh",
    subItems: [
      {
        key: "mandarin-bean-hsk-test",
        label: "HSK Test - MandarinBean",
        path: "/resources/mandarin-bean-hsk-test",
        img: "https://mandarinbean.com/wp-content/uploads/2019/06/mb_2.png",
        description: "Free online HSK level mock tests and vocabulary lists.",
      },
      {
        key: "hsk-mock-test",
        label: "HSKMockTest.com",
        path: "/resources/hsk-mock-test",
        img: "https://hskmocktest.com/img/favicon.png",
        description:
          "Simulated HSK exam environment to practice timing and scoring.",
      },
    ],
  },
  {
    key: "zh-platform",
    category: "platform",
    icon: LibraryBig,
    lang: "zh",
    subItems: [
      {
        key: "mandarin-bean",
        label: "MandarinBean",
        path: "/resources/mandarin-bean",
        img: "https://mandarinbean.com/wp-content/uploads/2019/06/mb_2.png",
        description:
          "Comprehensive Chinese learning portal covering grammar, reading, and listening.",
      },
    ],
  },
  {
    key: "zh-listening",
    category: "listening",
    icon: Headphones,
    lang: "zh",
    subItems: [
      {
        key: "mandarin-bean-all-lessons",
        label: "All Lessons - MandarinBean",
        path: "/resources/mandarin-bean-all-lessons",
        img: "https://mandarinbean.com/wp-content/uploads/2019/06/mb_2.png",
        description:
          "Graded listening audio lessons with pinyin and English translations.",
      },
      {
        key: "chinese-extensive-listening",
        label: "Chinese Extensive Listening (汉语泛听)",
        path: "/resources/chinese-extensive-listening",
        img: "https://hanyufanting.com/wp-content/uploads/2017/06/profile-picture-2.jpg?w=192",
        description:
          "Authentic audio practice for upper-intermediate Chinese learners.",
      },
    ],
  },
  {
    key: "zh-grammar",
    category: "grammar",
    icon: Puzzle,
    lang: "zh",
    subItems: [
      {
        key: "chinese-grammar-wiki",
        label: "Chinese Grammar Wiki",
        path: "/resources/chinese-grammar-wiki",
        img: "https://resources.allsetlearning.com/favicon.ico",
        description:
          "The premier free reference guide for Mandarin grammar rules and sentence structures.",
      },
      {
        key: "mandarin-bean-grammar-points",
        label: "Grammar Points - MandarinBean",
        path: "/resources/mandarin-bean-grammar-points",
        img: "https://mandarinbean.com/wp-content/uploads/2019/06/mb_2.png",
        description:
          "Grammar points categorized by HSK levels with practical examples.",
      },
      {
        key: "mandarin-bean-grammar-test",
        label: "Grammar Test - MandarinBean",
        path: "/resources/mandarin-bean-grammar-test",
        img: "https://mandarinbean.com/wp-content/uploads/2019/06/mb_2.png",
        description:
          "Test your Mandarin grammar accuracy across different difficulty levels.",
      },
      {
        key: "dig-mandarin-free-grammar-lessons",
        label: "DigMandarin Grammar Lessons",
        path: "/resources/dig-mandarin-free-grammar-lessons",
        img: "https://www.digmandarin.com/wp-content/uploads/2018/06/Panda_favicon.png",
        description:
          "Easy-to-understand explanations of complex Mandarin sentence patterns.",
      },
    ],
  },
  {
    key: "zh-pronunciation",
    category: "pronunciation",
    icon: MicVocal,
    lang: "zh",
    subItems: [
      {
        key: "ut-austin-pinyin-pronunciation-practice",
        label: "UT Austin – Pinyin Practice",
        path: "/resources/ut-austin-pinyin-pronunciation-practice",
        description:
          "Interactive audio Pinyin chart and tone discrimination drills.",
      },
    ],
  },
  {
    key: "zh-stroke-order",
    category: "writing",
    icon: NotebookPen,
    lang: "zh",
    subItems: [
      {
        key: "stroke-order",
        label: "StrokeOrder.com",
        path: "/resources/stroke-order",
        img: "https://www.strokeorder.com/assets/favicons/favicon-96x96.png",
        description:
          "Animated Chinese character stroke order diagrams and stroke count.",
      },
      {
        key: "arch-chinese",
        label: "ArchChinese",
        path: "/resources/arch-chinese",
        img: "https://www.archchinese.com/favicon.ico",
        description:
          "Premier learning system for Chinese character handwriting and stroke animation.",
      },
      {
        key: "hanzi-guide",
        label: "Hanzi Guide",
        path: "/resources/hanzi-guide",
        img: "https://www.hanzi.guide/favicon.ico",
        description:
          "Etymology and component breakdown of Chinese Hanzi characters.",
      },
      {
        key: "hanzi-stroke",
        label: "HanziStroke.com",
        path: "/resources/hanzi-stroke",
        img: "https://www.hanzistroke.com/website-icon-56.webp",
        description:
          "Step-by-step character writing guides and printable practice sheets.",
      },
    ],
  },
  {
    key: "zh-dictionary",
    category: "dictionary",
    icon: BookOpenText,
    lang: "zh",
    subItems: [
      {
        key: "mdbg-chinese-dictionary",
        label: "MDBG Chinese Dictionary",
        path: "/resources/mdbg-chinese-dictionary",
        color: "#4b66a3",
        description:
          "Popular online English-Chinese dictionary with Pinyin, audio, and character lookups.",
      },
      {
        key: "hanzii",
        label: "Hanzii",
        path: "/resources/hanzii",
        color: "#47619e",
        img: "https://hanzii.net/assets/images/ic_logo.ico",
        description:
          "Online Chinese dictionary for words, meanings, examples, writing, grammar, and free HSK & TOCFL practice tests.",
      },
    ],
  },
  {
    key: "zh-graded-reading",
    category: "reading",
    icon: Newspaper,
    lang: "zh",
    subItems: [
      {
        key: "mandarin-bean-graded-reading",
        label: "MandarinBean Graded Reading",
        path: "/resources/mandarin-bean-graded-reading",
        img: "https://mandarinbean.com/wp-content/uploads/2019/06/mb_2.png",
        description: "Short Chinese stories categorized from HSK 1 to HSK 6.",
      },
      {
        key: "pandaist",
        label: "Pandaist",
        path: "/resources/pandaist",
        img: "https://pandaist.com/favicon.ico",
        color: "#e381a2",
        description: "Master Chinese through immersive reading.",
      },
      {
        key: "hskatlas",
        label: "HSK Atlas",
        path: "/resources/hskatlas",
        img: "https://hskatlas.com/favicon.svg",
        color: "#18403b",
        description: "Learn Chinese through the HSK 3.0 level system.",
      },
      {
        key: "hskheadlines",
        label: "HSK Headlines",
        path: "/resources/hskheadlines",
        img: "https://hskheadlines.com/favicons/favicon-32x32.png",
        color: "#0c9bab",
        description: "Learn Mandarin through live news.",
      },
      {
        key: "readchinese",
        label: "Read Chinese",
        path: "/resources/readchinese",
        img: "https://www.readchinese.org/logo-trans-56.webp",
        color: "#e68483",
        description:
          "Daily Mandarin reading challenges, audio, and quizzes that keep beginners and intermediate learners progressing through stories curated for every HSK level.",
      },
      {
        key: "realhsk",
        label: "Real HSK",
        path: "/resources/realhsk",
        color: "#1d4f4b",
        description: "Read Chinese at the level that is right for you.",
      },
      {
        key: "chinesehskreading",
        label: "Chinese HSK Reading",
        path: "/resources/chinesehskreading",
        description:
          "Welcome to ChineseHSKreading.com, your go-to free resource for Mandarin reading practices! Please select your current Mandarin level below.",
      },
    ],
  },
  {
    key: "zh-self-study-vn",
    category: "platform",
    icon: LaptopMinimal,
    lang: "zh",
    subItems: [
      {
        key: "tieng-trung-tai-nha",
        label: "Tiếng Trung Tại Nhà",
        path: "/resources/tieng-trung-tai-nha",
        color: "#870430",
        description:
          "Website tự học tiếng Trung giao diện tiếng Việt dễ hiểu cho người mới bắt đầu.",
      },
      {
        key: "tiengtrungthuonghai",
        label: "Trung tâm tiếng Trung Thượng Hải",
        path: "/resources/tiengtrungthuonghai",
        color: "#4aba7f",
        img: "https://tiengtrungthuonghai.vn/wp-content/themes/tiengtrungthuonghai/favicon.ico",
        description:
          "Trung tâm tiếng Trung uy tín và chất lượng tại Mỹ Đình, Hà Nội. Chúng tôi tự hào đã giúp hàng nghìn học viên giao tiếp tiếng Trung thành thạo và thi đỗ HSK điểm cao",
      },
    ],
  },
  {
    key: "ja-exam",
    category: "exam",
    icon: BookOpenCheck,
    lang: "ja",
    subItems: [
      {
        key: "on-jlpt",
        label: "Ôn JLPT",
        path: "/resources/on-jlpt",
        description: "Đủ kiến thức tổng hợp các trình độ từ N5 tới N1.",
        color: "#145efc",
        img: "https://onjlpt.com/favicon.ico",
      },
    ],
  },
  {
    key: "ja-platform",
    category: "platform",
    icon: LibraryBig,
    lang: "ja",
    subItems: [
      {
        key: "mlc-japanese",
        label: "MLC Japanese",
        path: "/resources/mlc-japanese",
        description: "Giáo trình học tiếng Nhật bằng tiếng Nhật N5 - N1.",
      },
    ],
  },
  // {
  //   key: "ja-reading",
  //   category: "reading",
  //   icon: BookOpenText,
  //   lang: "ja",
  //   subItems: [
  //   ],
  // },
  {
    key: "ja-grammar",
    category: "grammar",
    icon: Puzzle,
    lang: "ja",
    subItems: [
      {
        key: "tufs-grammar-module",
        label: "Ôn tiếng Nhật của Trường Đại Học Ngoại Ngữ Tokyo",
        path: "/resources/tufs-grammar-module",
        description: "Tham khảo ngữ pháp bằng tiếng Nhật.",
        color: "#c7819a",
      },
    ],
  },
  {
    key: "ja-listening",
    category: "listening",
    icon: Headphones,
    lang: "ja",
    subItems: [
      {
        key: "nhk-world-japan",
        label: "NHK World Japan",
        path: "/resources/nhk-world-japan",
        description:
          "Web của NHK. Bạn sẽ được hướng dẫn về nội dung đoạn video, sau đó luyện tập các mẫu câu quan trọng. Học xong 1 video là vận dụng được luôn mẫu câu đó vào đời sống.",
        img: "https://www3.nhk.or.jp/nhkworld/common/site_images/nw_webapp_152x152.png",
      },
    ],
  },
  {
    key: "ja-pronunciation",
    category: "pronunciation",
    icon: MicVocal,
    lang: "ja",
    subItems: [
      {
        key: "ojad-search",
        label: "Từ Điển Các Thể Trong Tiếng Nhật",
        path: "/resources/ojad-search",
        description:
          "Web giúp luyện và kiểm tra phát âm, trọng âm, trường âm các từ vựng tiếng Nhật. Rất hữu ích để luyện phát âm chuẩn.",
        color: "#ffd06b",
      },
      {
        key: "ojad-phrasing",
        label: "Đọc Ngữ Điệu",
        path: "/resources/ojad-phrasing",
        description: "Web tra accent (cách đọc từ & câu tiếng Nhật).",
        color: "#ffd06b",
      },
    ],
  },
  {
    key: "ja-vocabulary",
    category: "vocabulary",
    icon: NotebookPen,
    lang: "ja",
    subItems: [
      {
        key: "kanjieasy",
        label: "KanjiEasy",
        path: "/resources/kanjieasy",
        description: "Mindmap Kanji N5 - N3.",
        img: "https://kanjieasy.vercel.app/favicon.svg",
        color: "#152238",
      },
    ],
  },
  {
    key: "ja-dictionary",
    category: "dictionary",
    icon: LibraryBig,
    lang: "ja",
    subItems: [
      {
        key: "takoboto",
        label: "TAKOBOTO",
        path: "/resources/takoboto",
        description: "Tra cứu từ điển tiếng Nhật.",
        img: "https://takoboto.jp/takoboto_48x48.png",
        color: "#fa0000",
      },
      {
        key: "kanjipedia",
        label: "Từ Điển Kanji",
        path: "/resources/kanjipedia",
        description: "Web tra cứu kanji của Kanken.",
      },
    ],
  },
  // {
  //   key: "ja-kids",
  //   category: "kids",
  //   icon: Baby,
  //   lang: "ja",
  //   subItems: [

  //   ],
  // },
]
