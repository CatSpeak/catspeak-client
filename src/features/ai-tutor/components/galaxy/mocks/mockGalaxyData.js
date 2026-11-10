// Mock/Fixture cho FE-01: 12 chủ đề, nhân các từ gốc lên thành ~2.000 từ.
// Id ổn định (không dùng Math.random) để bố cục sao luôn giống nhau sau mỗi lần tải lại.
// S4 (FE-07) sẽ thay bằng dữ liệu API thật cùng schema { id, word, pinyin, meaning, clusterId }.

export const GALAXY_CLUSTERS = [
  { id: "food", label: "Ẩm thực", color: "#f2c46d" },
  { id: "travel", label: "Du lịch", color: "#7fc4ff" },
  { id: "economy", label: "Kinh tế", color: "#9be38f" },
  { id: "family", label: "Gia đình", color: "#ff9fa8" },
  { id: "work", label: "Công việc", color: "#c6a7ff" },
  { id: "school", label: "Học tập", color: "#8fd0c8" },
  { id: "health", label: "Sức khỏe", color: "#ffb38a" },
  { id: "nature", label: "Thiên nhiên", color: "#b5e48c" },
  { id: "tech", label: "Công nghệ", color: "#9fb8ff" },
  { id: "culture", label: "Văn hóa", color: "#ff8fc3" },
  { id: "shopping", label: "Mua sắm", color: "#ffd36b" },
  { id: "emotion", label: "Cảm xúc", color: "#e0b0ff" },
]

// "chữ Hán|pinyin|nghĩa"
const BASE_WORDS = {
  food: ["米饭|mǐfàn|cơm", "面条|miàntiáo|mì sợi", "饺子|jiǎozi|sủi cảo", "包子|bāozi|bánh bao", "茶|chá|trà", "咖啡|kāfēi|cà phê", "苹果|píngguǒ|quả táo", "牛肉|niúròu|thịt bò", "鸡蛋|jīdàn|trứng gà", "汤|tāng|canh, súp", "辣|là|cay", "甜|tián|ngọt", "餐厅|cāntīng|nhà hàng", "菜单|càidān|thực đơn", "筷子|kuàizi|đũa", "好吃|hǎochī|ngon"],
  travel: ["机场|jīchǎng|sân bay", "火车|huǒchē|tàu hỏa", "护照|hùzhào|hộ chiếu", "酒店|jiǔdiàn|khách sạn", "地图|dìtú|bản đồ", "景点|jǐngdiǎn|điểm tham quan", "行李|xíngli|hành lý", "签证|qiānzhèng|thị thực", "旅行|lǚxíng|du lịch", "出租车|chūzūchē|taxi", "地铁|dìtiě|tàu điện ngầm", "预订|yùdìng|đặt trước", "迷路|mílù|lạc đường", "海边|hǎibiān|bờ biển", "导游|dǎoyóu|hướng dẫn viên", "票|piào|vé"],
  economy: ["经济|jīngjì|kinh tế", "市场|shìchǎng|thị trường", "价格|jiàgé|giá cả", "投资|tóuzī|đầu tư", "银行|yínháng|ngân hàng", "利润|lìrùn|lợi nhuận", "通货膨胀|tōnghuò péngzhàng|lạm phát", "出口|chūkǒu|xuất khẩu", "进口|jìnkǒu|nhập khẩu", "税|shuì|thuế", "贷款|dàikuǎn|khoản vay", "股票|gǔpiào|cổ phiếu", "预算|yùsuàn|ngân sách", "增长|zēngzhǎng|tăng trưởng", "货币|huòbì|tiền tệ", "竞争|jìngzhēng|cạnh tranh"],
  family: ["爸爸|bàba|bố", "妈妈|māma|mẹ", "哥哥|gēge|anh trai", "姐姐|jiějie|chị gái", "弟弟|dìdi|em trai", "妹妹|mèimei|em gái", "爷爷|yéye|ông nội", "奶奶|nǎinai|bà nội", "孩子|háizi|con cái", "丈夫|zhàngfu|chồng", "妻子|qīzi|vợ", "亲戚|qīnqi|họ hàng", "邻居|línjū|hàng xóm", "家庭|jiātíng|gia đình", "结婚|jiéhūn|kết hôn", "照顾|zhàogù|chăm sóc"],
  work: ["工作|gōngzuò|công việc", "公司|gōngsī|công ty", "老板|lǎobǎn|sếp", "同事|tóngshì|đồng nghiệp", "会议|huìyì|cuộc họp", "合同|hétong|hợp đồng", "面试|miànshì|phỏng vấn", "工资|gōngzī|lương", "加班|jiābān|làm thêm giờ", "经验|jīngyàn|kinh nghiệm", "项目|xiàngmù|dự án", "客户|kèhù|khách hàng", "辞职|cízhí|nghỉ việc", "升职|shēngzhí|thăng chức", "报告|bàogào|báo cáo", "任务|rènwu|nhiệm vụ"],
  school: ["学校|xuéxiào|trường học", "老师|lǎoshī|giáo viên", "学生|xuésheng|học sinh", "作业|zuòyè|bài tập", "考试|kǎoshì|kỳ thi", "课本|kèběn|sách giáo khoa", "图书馆|túshūguǎn|thư viện", "大学|dàxué|đại học", "成绩|chéngjì|điểm số", "毕业|bìyè|tốt nghiệp", "词典|cídiǎn|từ điển", "复习|fùxí|ôn tập", "练习|liànxí|luyện tập", "问题|wèntí|câu hỏi", "同学|tóngxué|bạn học", "汉语|Hànyǔ|tiếng Trung"],
  health: ["医生|yīshēng|bác sĩ", "医院|yīyuàn|bệnh viện", "药|yào|thuốc", "感冒|gǎnmào|cảm cúm", "发烧|fāshāo|sốt", "头疼|tóuténg|đau đầu", "休息|xiūxi|nghỉ ngơi", "运动|yùndòng|thể thao", "健康|jiànkāng|sức khỏe", "睡觉|shuìjiào|ngủ", "过敏|guòmǐn|dị ứng", "体检|tǐjiǎn|khám sức khỏe", "受伤|shòushāng|bị thương", "减肥|jiǎnféi|giảm cân", "咳嗽|késou|ho", "牙|yá|răng"],
  nature: ["山|shān|núi", "河|hé|sông", "海|hǎi|biển", "森林|sēnlín|rừng", "天气|tiānqì|thời tiết", "下雨|xiàyǔ|mưa", "雪|xuě|tuyết", "风|fēng|gió", "太阳|tàiyáng|mặt trời", "月亮|yuèliang|mặt trăng", "星星|xīngxing|ngôi sao", "花|huā|hoa", "树|shù|cây", "动物|dòngwù|động vật", "空气|kōngqì|không khí", "环境|huánjìng|môi trường"],
  tech: ["电脑|diànnǎo|máy tính", "手机|shǒujī|điện thoại", "网络|wǎngluò|mạng", "软件|ruǎnjiàn|phần mềm", "密码|mìmǎ|mật khẩu", "下载|xiàzài|tải xuống", "视频|shìpín|video", "人工智能|réngōng zhìnéng|trí tuệ nhân tạo", "数据|shùjù|dữ liệu", "屏幕|píngmù|màn hình", "充电|chōngdiàn|sạc pin", "邮件|yóujiàn|thư điện tử", "机器人|jīqìrén|robot", "应用|yìngyòng|ứng dụng", "键盘|jiànpán|bàn phím", "安全|ānquán|an toàn"],
  culture: ["春节|Chūnjié|Tết Nguyên Đán", "京剧|jīngjù|kinh kịch", "书法|shūfǎ|thư pháp", "功夫|gōngfu|võ thuật", "历史|lìshǐ|lịch sử", "传统|chuántǒng|truyền thống", "节日|jiérì|lễ hội", "音乐|yīnyuè|âm nhạc", "电影|diànyǐng|phim", "艺术|yìshù|nghệ thuật", "诗|shī|thơ", "龙|lóng|rồng", "红包|hóngbāo|bao lì xì", "月饼|yuèbǐng|bánh trung thu", "博物馆|bówùguǎn|bảo tàng", "习惯|xíguàn|thói quen"],
  shopping: ["商店|shāngdiàn|cửa hàng", "便宜|piányi|rẻ", "贵|guì|đắt", "打折|dǎzhé|giảm giá", "衣服|yīfu|quần áo", "鞋|xié|giày", "颜色|yánsè|màu sắc", "尺寸|chǐcùn|kích cỡ", "付款|fùkuǎn|thanh toán", "现金|xiànjīn|tiền mặt", "退货|tuìhuò|trả hàng", "超市|chāoshì|siêu thị", "购物袋|gòuwùdài|túi mua sắm", "试穿|shìchuān|mặc thử", "发票|fāpiào|hóa đơn", "讲价|jiǎngjià|mặc cả"],
  emotion: ["高兴|gāoxìng|vui", "难过|nánguò|buồn", "生气|shēngqì|giận", "害怕|hàipà|sợ", "担心|dānxīn|lo lắng", "紧张|jǐnzhāng|căng thẳng", "骄傲|jiāoào|tự hào", "孤独|gūdú|cô đơn", "感动|gǎndòng|xúc động", "失望|shīwàng|thất vọng", "惊讶|jīngyà|ngạc nhiên", "放松|fàngsōng|thư giãn", "兴奋|xīngfèn|phấn khích", "后悔|hòuhuǐ|hối hận", "满意|mǎnyì|hài lòng", "喜欢|xǐhuan|thích"],
}

/** Sinh danh sách từ mock. Deterministic: cùng tham số -> cùng kết quả. */
export function generateMockGalaxyWords(total = 2000) {
  const perCluster = Math.ceil(total / GALAXY_CLUSTERS.length)
  const words = []
  GALAXY_CLUSTERS.forEach((cluster) => {
    const base = BASE_WORDS[cluster.id]
    for (let i = 0; i < perCluster && words.length < total; i++) {
      const [word, pinyin, meaning] = base[i % base.length].split("|")
      words.push({
        id: `${cluster.id}-${String(i + 1).padStart(3, "0")}`,
        word,
        pinyin,
        meaning,
        clusterId: cluster.id,
      })
    }
  })
  return words
}

export const MOCK_GALAXY_WORDS = generateMockGalaxyWords(2000)
