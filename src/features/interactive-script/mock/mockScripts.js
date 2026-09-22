/**
 * Mock data pool for Interactive Scripts (IS-LN-01 -> IS-LN-05)
 */

export const MOCK_SCRIPTS_POOL = [
  {
    id: "script-halloween",
    topic: "Halloween",
    tag: "Halloween",
    titlePart1: "Happy",
    titlePart2: "Halloween",
    allowTranslation: true,
    featuredQuote: "Trick or Treat",
    featuredQuoteTranslation: "Cho kẹo hay bị ghẹo",
    contentSegments: [
      { text: "Halloween is nominally a " },
      {
        text: "Christian holiday",
        isHighlighted: true,
        vocabKey: "christian-holiday",
      },
      { text: " honoring the souls of saints and other souls who have been blessed. It descends from an " },
      {
        text: "ancient Celtic festival",
        isHighlighted: true,
        vocabKey: "ancient-celtic-festival",
      },
      { text: " of the dead that marked the official end of the growing season." },
    ],
    fullTranslation: {
      "en-vi": {
        body: "Halloween về danh nghĩa là một ngày lễ Kitô giáo nhằm tôn vinh linh hồn của các vị thánh và các linh hồn đã được ban phước. Lễ hội này bắt nguồn từ một lễ hội Celtic cổ xưa về người đã khuất, đánh dấu sự kết thúc chính thức của mùa vụ trồng trọt.",
        highlightedMatches: ["ngày lễ Kitô giáo", "lễ hội Celtic cổ xưa"],
      },
      "en-zh": {
        body: "万圣节在名义上是一个基督教节日，旨在纪念圣徒的灵魂和其他受到保佑的灵魂。它起源于一个古老的凯尔特人死者节日，标志着农作物生长季节的正式结束。",
        highlightedMatches: ["基督教节日", "古老的凯尔特人死者节日"],
      },
    },
    dictionary: {
      "christian-holiday": {
        word: "Christian holiday",
        type: "CỤM TỪ",
        ipa: "/'krɪs.tʃən 'fes.tɪ.vəl/",
        meaning: "Lễ hội Kitô giáo",
        meaningSecondary: "(Christian festival)",
        instructorNote:
          "Đây là ngày lễ tôn giáo của Kitô giáo nhằm tưởng nhớ các vị thánh và linh hồn đã được ban phước. Hiện nay lễ hội này đã mang tính chất văn hóa đại chúng hơn là nghi lễ tôn giáo thuần túy.",
        examples: [
          "Halloween is originally a Christian festival celebrating saints and departed souls.",
          "Christmas is the most celebrated Christian holiday around the world.",
        ],
        relatedWords: ["trick-or-treat", "costume", "ghost"],
      },
      "ancient-celtic-festival": {
        word: "ancient Celtic festival",
        type: "CỤM TỪ",
        ipa: "/ˈeɪn.ʃənt ˈkel.tɪk ˈfes.tɪ.vəl/",
        meaning: "Lễ hội Celtic cổ xưa (Samhain)",
        meaningSecondary: "(Ancient Gaelic festival)",
        instructorNote:
          "Samhain là lễ hội cổ của người Celtic tổ chức vào đêm 31/10 để đón năm mới và xua đuổi tà ma trước khi mùa đông lạnh giá bắt đầu.",
        examples: [
          "Historians believe Halloween originated from an ancient Celtic festival known as Samhain.",
        ],
        relatedWords: ["Samhain", "folklore", "pagan", "harvest"],
      },
      halloween: {
        word: "Halloween",
        type: "DANH TỪ",
        ipa: "/ˌhæl.əʊˈiːn/",
        meaning: "Lễ hội Hóa lộ quỷ (31 tháng 10)",
        meaningSecondary: "(All Hallows' Eve)",
        instructorNote: "",
        examples: [
          "Children dress up in costumes and go trick-or-treating on Halloween.",
        ],
        relatedWords: ["pumpkin", "jack-o-lantern", "spooky"],
      },
      nominally: {
        word: "nominally",
        type: "PHÓ TỪ",
        ipa: "/ˈnɒm.ɪ.nəl.i/",
        meaning: "Trên danh nghĩa, chỉ có tên gọi",
        meaningSecondary: "(In name only)",
        instructorNote: "",
        examples: [
          "He is nominally the head of the company, but his partner makes all decisions.",
        ],
        relatedWords: ["officially", "theoretically"],
      },
      honoring: {
        word: "honoring",
        type: "ĐỘNG TỪ",
        ipa: "/ˈɒn.ər.ɪŋ/",
        meaning: "Tôn vinh, kính trọng, tưởng nhớ",
        meaningSecondary: "(Paying respect to)",
        instructorNote: "",
        examples: [
          "The memorial was built honoring soldiers who lost their lives.",
        ],
        relatedWords: ["respect", "commemorate", "celebrate"],
      },
      descends: {
        word: "descends",
        type: "ĐỘNG TỪ",
        ipa: "/dɪˈsendz/",
        meaning: "Bắt nguồn từ, có nguồn gốc từ",
        meaningSecondary: "(Originates from)",
        instructorNote: "",
        examples: [
          "The tradition descends from 18th-century folklore customs.",
        ],
        relatedWords: ["derives", "originates", "comes from"],
      },
      season: {
        word: "season",
        type: "DANH TỪ",
        ipa: "/ˈsiː.zən/",
        meaning: "Mùa trong năm, mùa vụ",
        meaningSecondary: "(Period of year)",
        instructorNote: "",
        examples: ["Autumn is the harvest season in many cultures."],
        relatedWords: ["harvest", "period", "quarter"],
      },
    },
  },
  {
    id: "script-coffee",
    topic: "Coffee Culture",
    tag: "Coffee Culture",
    titlePart1: "Vietnamese",
    titlePart2: "Coffee Culture",
    allowTranslation: true,
    featuredQuote: "A cup of coffee shared with a friend is happiness tasted and time well spent.",
    featuredQuoteTranslation: "Một tách cà phê cùng bạn bè là hương vị của hạnh phúc và thời gian ý nghĩa.",
    contentSegments: [
      { text: "In Vietnam, enjoying a slow-dripped " },
      {
        text: "phin coffee",
        isHighlighted: true,
        vocabKey: "phin-coffee",
      },
      { text: " on the sidewalk is not just a morning habit, but an iconic " },
      {
        text: "cultural ritual",
        isHighlighted: true,
        vocabKey: "cultural-ritual",
      },
      { text: " that connects generations of urban dwellers." },
    ],
    fullTranslation: {
      "en-vi": {
        body: "Tại Việt Nam, thưởng thức một tách cà phê phin nhỏ giọt chậm rãi trên vỉa hè không chỉ là một thói quen buổi sáng, mà còn là một nghi thức văn hóa biểu tượng kết nối các thế hệ cư dân đô thị.",
        highlightedMatches: ["cà phê phin", "nghi thức văn hóa"],
      },
    },
    dictionary: {
      "phin-coffee": {
        word: "phin coffee",
        type: "CỤM TỪ",
        ipa: "/fɪn ˈkɒf.i/",
        meaning: "Cà phê pha phin truyền thống Việt Nam",
        meaningSecondary: "(Vietnamese drip coffee)",
        instructorNote:
          "Cà phê phin sử dụng phin kim loại để chiết xuất từng giọt cà phê đậm đà, thường dùng với sữa đặc (cà phê sữa đá).",
        examples: [
          "Nothing beats starting the morning with an iced phin coffee by the street.",
        ],
        relatedWords: ["condensed milk", "robusta", "drip filter"],
      },
      "cultural-ritual": {
        word: "cultural ritual",
        type: "CỤM TỪ",
        ipa: "/ˈkʌl.tʃər.əl ˈrɪtʃ.u.əl/",
        meaning: "Nghi thức / phong tục văn hóa",
        meaningSecondary: "(Traditional cultural practice)",
        instructorNote:
          "Nghi thức văn hóa chỉ các hoạt động mang tính cộng đồng lặp đi lặp lại và định hình lối sống của người dân.",
        examples: [
          "Street tea and coffee drinking has become a cultural ritual across Southeast Asia.",
        ],
        relatedWords: ["tradition", "custom", "heritage"],
      },
    },
  },
]
