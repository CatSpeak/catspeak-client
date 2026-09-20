# Nối giao diện bài kiểm tra đầu vào vào động cơ chấm điểm thật

Nhánh `TASK-161-suggest`, PR vào `feature/TASK-161`. Viết ngày 20/09 bởi Khôi
(TASK-AI-14, động cơ đo lường).

Đây là một đề xuất, không phải một bản sửa đã chốt. Phần giao diện, luồng hội
thoại, ngân hàng câu hỏi và i18n giữ nguyên hoàn toàn — chỗ đổi là **ai tính ra
cấp HSK**.

---

## 1. Ba chỗ cần xem lại trong `engine/scoring.js`

### 1.1 Ngữ pháp đang làm TRẦN, trong khi SRS nói nó là SÀN

```js
// engine/scoring.js
const grammarCap = grammarFloor > 0 ? grammarFloor : HSK_MIN
const band = clampHsk(Math.min(vocabBand, grammarCap, ceiling))
```

`grammarFloor` là cấp cao nhất trong số mẫu ngữ pháp khớp được, và bằng `0` khi
không khớp mẫu nào. Khi đó `grammarCap = 1`, nên `Math.min(...)` kéo cả kết quả
xuống **HSK 1**, bất kể từ vựng tốt đến đâu.

Nghĩa là: học viên nói trôi chảy, dùng từ HSK 5, nhưng không câu nào khớp một
regex ngữ pháp nào trong `hskBank` — ra HSK 1.

BR-PT-003 nói ngược lại. Ngữ pháp là **bằng chứng dương**: dùng được câu chữ 把
chứng minh học viên ít nhất ở HSK 3. Nó chỉ được **đẩy lên**, không bao giờ kéo
xuống. Thứ kéo xuống là trần bằng chứng (BR-PT-004), và trần đó tính từ số nhóm
liên từ dùng được, không phải từ ngữ pháp.

Sửa tối thiểu nếu giữ chấm điểm ở client:

```js
const band = clampHsk(Math.min(Math.max(vocabBand, grammarFloor), ceiling))
```

### 1.2 Điểm "phát âm" không đo phát âm

```js
const pronunciation = clampScore(
  Math.round(100 * (0.5 * coverage + 0.5 * (avgLevel / HSK_MAX))) -
    totalRetries * 5,
)
```

`coverage` là số câu đã trả lời chia 5, `avgLevel` là cấp trung bình của các câu
hỏi. Không có biến nào đến từ âm thanh. Trả lời đủ 5 câu ở cấp 3 thì ra 75 điểm
phát âm mà chưa ai nghe học viên nói một chữ.

Lý do gốc: `services/speech/createSpeechRecognizer.js` dùng Web Speech API của
trình duyệt, và API đó không trả dữ liệu chấm phát âm nào. Chấm phát âm cần
Azure Pronunciation Assessment, mà nó đi kèm STT phía máy chủ.

Lộ trình v1.1 đã chốt cách xử lý ca này (Q2): *"pronunciation_score nullable +
ẩn thanh trên sc09"*. Tức là để `null` và **ẩn hẳn thanh**, đừng vẽ thanh 0/100
— chưa đo và phát âm rất tệ là hai chuyện khác nhau, và học viên đọc thanh 0 sẽ
hiểu thành chuyện thứ hai.

Nhánh này sửa phần hiển thị: `getDimensionScores` bỏ qua kỹ năng có giá trị
`null`. Đo thử trên một kết quả thật, điểm tổng đổi từ **45 lên 60** chỉ vì
không còn tính kỹ năng chưa đo là 0.

### 1.3 Điểm yếu ở mức kỹ năng thì tuần 2 không dùng được

```js
const weaknesses = dimensions
  .filter((dimension) => dimension.score < WEAKNESS_THRESHOLD)
  .sort((a, b) => a.score - b.score)
// -> [{ dimension: "grammar", score: 42 }]
```

Bốn ô: phát âm, từ vựng, ngữ pháp, trôi chảy. Learning Path Engine ở tuần 2 là
một actor chính thức trong SRS §2, và việc của nó là sinh bài tập từ danh sách
này. Từ "ngữ pháp 42 điểm" thì không sinh được gì cụ thể hơn "ôn lại ngữ pháp".

Động cơ máy chủ trả mã tra được:

```json
{ "skill": "grammar", "kind": "grammar_pattern", "ref_code": "ba_construction",
  "hsk_level": 3, "severity": 3, "note": "Chưa dùng cấu trúc ba_construction ở cấp 3" }
{ "skill": "vocabulary", "kind": "vocab_gap", "ref_code": "HSK4:虽然",
  "hsk_level": 4, "severity": 1 }
```

Mã nằm trong một tập đóng, kiểm được bằng test: mã luật ngữ pháp, nhóm liên từ,
`HSK<cấp>:<từ>`, hoặc `PHONEME:<âm vị>`.

### 1.4 Một chuyện nhỏ hơn, để biết

`evaluateTurn` coi là đạt khi **một** từ hoặc **một** mẫu ngữ pháp khớp ở cấp
đang hỏi:

```js
const passed =
  matchedVocabulary.some((entry) => entry.level >= targetLevel) ||
  matchedGrammar.some((entry) => entry.level >= targetLevel)
```

Một từ HSK 6 lọt vào câu trả lời là qua cấp 6. Nó điều khiển việc chọn câu hỏi
tiếp theo, nên một từ may mắn đẩy cả phần còn lại của bài thi lên sai thang.

---

## 2. Nhánh này đổi gì

| File | Đổi |
|---|---|
| `api/realAdapter.js` | **mới** — `submitTurn` và `scoreSession` gọi `catspeak-ai` |
| `api/placementTestApi.js` | hai endpoint đó chuyển sang adapter thật, sau một cờ |
| `api/index.js` | xuất thêm `realAdapter` |
| `utils/result.js` | `normalizeServerResult`, và `getDimensionScores` bỏ qua `null` |
| `engine/cat.js` | `selectNextQuestion` nhận thêm tham số `level` (tuỳ chọn) |
| `store/api/baseApi.js` | `/placement/*` định tuyến sang `VITE_AI_API_BASE_URL` |

**Không xoá file nào.** `engine/scoring.js`, `evaluate.js`, `matching.js` giữ
nguyên và vẫn chạy khi tắt cờ. Ngân hàng câu hỏi `constants/hskBank.js` vẫn là
nguồn câu hỏi — máy chủ chỉ trả về **cấp** nên hỏi tiếp, chọn câu nào ở cấp đó
vẫn là việc của client.

Năm endpoint còn lại (`createSession`, `getActiveSession`, `resumeSession`,
`getRetakeStatus`, `adjustLevel`) **vẫn là mock trên localStorage**, vì chúng cần
bảng vòng đời phía máy chủ mà `PlacementController` của placement-agent chưa tồn
tại.

### Bật / tắt

```bash
# .env — mặc định BẬT khi không đặt gì
VITE_PLACEMENT_USE_REAL_ENGINE=0   # quay lại mock hoàn toàn, không cần backend
VITE_AI_API_BASE_URL=http://localhost:8080
```

### Chạy thử

```bash
# 1. dựng ai-api
cd catspeak-ai
uvicorn catspeak_ai.api.main:app --port 8080

# 2. dựng client
cd catspeak-client && npm run dev
```

Vào `/placement-test`, làm đủ 5 câu. Mỗi câu gọi `POST /placement/score-turn`,
câu thứ 5 xong gọi `POST /placement/finalize`. Mở tab Network để nhìn.

---

## 3. Còn mở

**Transcript vẫn do trình duyệt gửi, nên vẫn giả được.** Chuyển việc chấm về máy
chủ bịt được lỗ *sửa điểm* (trước đây chỉ cần
`localStorage.setItem("catspeak_pt_result", '{"band":6}')`), nhưng lỗ *giả lời
nói* chỉ bịt được khi STT chạy phía máy chủ. Vì thế máy chủ **không ghi kết quả
của đường này xuống database** — `persisted: false` trong response, và kết quả
vẫn chỉ nằm ở localStorage như trước.

**Đường JWT này là tạm.** Hiện trình duyệt gọi thẳng `ai-api` bằng token học
viên. Đúng ra phải là: trình duyệt → `PlacementController` (giữ phiên, giữ ngân
hàng câu hỏi) → `ai-api` bằng `X-Agent-Key`. Khi controller đó có thật thì đặt
`PLACEMENT_ALLOW_BROWSER=0` bên `catspeak-ai` và đổi adapter.

**`adjustLevel` chưa nối.** Cột `self_adjusted` nằm ở bảng vòng đời phía máy chủ.

**Nhãn của 40 golden vector chưa được giáo viên duyệt**, nên độ khớp 72% của
động cơ chưa nói được gì chắc chắn. Đây là việc chặn mọi kết luận về chất lượng
chấm điểm, không phải việc kỹ thuật.

---

## 4. Chỗ cần người quyết, không phải chỗ để code

Lộ trình v1.1 ghi: *"Chưa ai làm FE. Cần hỏi Đạt ai nhận FE."* Giờ FE đã có, nên
cần chốt lại phần giao nhau:

1. **Ngân hàng câu hỏi** nằm ở client (`hskBank.js`) hay ở máy chủ. Ở client thì
   học viên xem được toàn bộ câu hỏi trong bundle.
2. **STT** dùng Web Speech API của trình duyệt hay Azure phía máy chủ. Chọn
   Azure thì có luôn điểm phát âm thật, và hết giả được transcript.
3. **Hình thức bài thi** — hội thoại realtime qua LiveKit hay từng phase gọi API.
   Người phụ trách agent đang cân nhắc bỏ agent; FE hiện tại đã làm theo hướng
   từng phase, nên hai bên đang nghĩ giống nhau mà chưa ai chốt.
