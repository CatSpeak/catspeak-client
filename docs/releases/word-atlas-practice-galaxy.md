# Word Atlas → CatSpeak: Practice, FSRS, Galaxy, nhắc ôn (FE)

Phạm vi FE phần của Huy: FE-02, FE-05 (S2), FE-04 (S3), FE-07, FE-03, REL-01.
UI tạm bám word-atlas + màu CatSpeak hiện tại (class gom ở `vocabulary-practice/components/ui.js` để refactor theme sau).

## Tính năng

| Task | Nội dung | Vị trí |
| --- | --- | --- |
| FE-02 | 4 chế độ ôn: Gõ từ, Gõ câu, Nghe và điền, Flashcard. Nhận chữ Hán hoặc pinyin (dấu, số, `v`=ü); sai thanh = "partial" | `src/features/vocabulary-practice/` |
| FE-05 S2 | Gửi rating 1–4 + `elapsed_ms` + `hints_used`; hiện "Ôn lại sau …"; phím tắt; hàng đợi offline có `client_review_id` | `api/practiceApi.js`, `hooks/usePracticeSync.js`, `utils/gradeQueue.js` |
| FE-04 S3 | Dừng vẽ khi tab ẩn / canvas khuất; Reduce Motion đổi trực tiếp; xử lý mất WebGL context; fallback 2D cập nhật trạng thái sao | `vocabulary-galaxy/hooks/useGalaxyEngine.js`, `core/GalaxyRenderer.js` |
| FE-07 | Độ sáng sao theo trạng thái học thật (`toGalaxyState`); API Galaxy gọn (BE-05) sau flag; mini Galaxy; lối vào Practice ↔ Galaxy; nhãn trạng thái đa ngôn ngữ | `vocabulary-galaxy/core/galaxyState.js`, `api/galaxyApi.js`, `components/MiniGalaxy.jsx` |
| FE-03 | Banner số thẻ đến hạn + "Ôn ngay" + trạng thái quyền thông báo (chỉ in-app) | `vocabulary-practice/components/DueReminderBanner.jsx` |

Route mới: `/workspace/vocabulary-practice?mode=word|sentence|listen|flashcard&source=due|recent-wrong|all&autostart=1`

Phím tắt: `Enter` kiểm tra/tiếp · `Space` lật thẻ · `1–4` chấm · `Alt+H` gợi ý · `Alt+R` nghe lại.

## Feature flag (`src/shared/config/featureFlags.js`)

| Biến | Mặc định dev | Mặc định build | Ý nghĩa |
| --- | --- | --- | --- |
| `VITE_FF_VOCAB_PRACTICE` | bật | tắt | Route + menu Practice, banner nhắc ôn |
| `VITE_FF_PRACTICE_FSRS` | tắt | tắt | Gửi rating lên BE-02. Tắt thì Practice chỉ là luyện tay |
| `VITE_FF_VOCAB_GALAXY` | bật | tắt | Route + menu Galaxy, mini Galaxy |
| `VITE_FF_GALAXY_API` | tắt | tắt | Đọc `/v1/flashcards/galaxy` (BE-05) thay vì gom từ các deck |

Giá trị `1`/`true` là bật, `0`/`false` là tắt.

## Hợp đồng API cần BE xác nhận

**BE-02** `POST /v1/flashcards/cards/{card_id}/grade`

```json
{ "client_review_id": "uuid", "rating": 3, "mode": "word", "is_correct": true,
  "elapsed_ms": 4200, "hints_used": 0, "reviewed_at": "2026-11-23T09:00:00.000Z" }
```
→ `200 { "card_id", "due_at", "scheduled_days", "state", "stability" }`

- Phải idempotent theo `client_review_id` (FE gửi lại khi mất mạng / 5xx / 401 / 408 / 429).
- 4xx khác: FE bỏ mục đó khỏi hàng đợi.
- `reviewed_at` là giờ chấm thật ở máy học viên; gửi bù offline có thể đến muộn.
- Chế độ Gõ câu không gửi rating (chỉ luyện tay, giống word-atlas).

**BE-05** `GET /v1/flashcards/galaxy` (trả kèm ETag)

```json
{ "clusters": [{ "id": "food", "label": "Ẩm thực", "color": "#f2c46d" }],
  "words": [{ "id": "123", "word": "米饭", "pinyin": "mǐfàn", "meaning": "cơm",
              "cluster_id": "food", "galaxy_state": 1 }] }
```
`galaxy_state` 0..3 (chưa học / đang học / đã thuộc / nhớ lâu dài). Nếu chưa tính sẵn thì trả `fsrs_state` + `stability`; FE tự đổi (Review + stability ≥ 21 ngày = nhớ lâu dài).

**BE-06** (không bắt buộc): thêm `example_audio_url` và `example_blank` vào thẻ. Thiếu thì FE đọc câu bằng `speechSynthesis` và tự khoét từ.

**FE-03** dùng `due_today_count`, `overdue_count` có sẵn trong `/v1/flashcards/home`.

## Deploy staging

1. Merge `feature/huy-practice-galaxy` vào `staging` (branch này dựa trên `feature/vocabulary-galaxy`, nên merge branch đó trước).
2. Biến môi trường staging: `VITE_FF_VOCAB_PRACTICE=1`, `VITE_FF_VOCAB_GALAXY=1`. Bật thêm `VITE_FF_PRACTICE_FSRS=1` khi BE-02 lên staging, và `VITE_FF_GALAXY_API=1` khi BE-05 lên staging.
3. Build và deploy.

## Kiểm tra sau deploy

- [ ] Menu (ngôn ngữ học `zh`) có "Luyện tập từ vựng" và "Ngân hà từ vựng".
- [ ] Cả 4 chế độ chạy với nguồn "Thẻ đến hạn", "Từ sai gần đây" và "Toàn bộ sổ"; Gõ từ nhận `ni3hao3` và `nǐhǎo`.
- [ ] Khi bật FSRS: Network có `POST …/grade` cho mỗi thẻ, chấm xong hiện "Ôn lại sau …".
- [ ] Ngắt mạng giữa lượt (DevTools → Offline): vẫn ôn tiếp, có banner offline; bật mạng lại thì request được gửi bù, không gửi trùng.
- [ ] Banner nhắc ôn hiện khi `due_today_count > 0`; bấm "Ôn ngay" mở thẳng lượt Flashcard thẻ đến hạn.
- [ ] Galaxy: chuyển sang tab khác rồi quay lại, FPS (bản dev) không tụt; bật Reduce Motion trong OS thì sao ngừng tự xoay ngay. Thêm `?mock=1` để kiểm tra khi API chết.
- [ ] Sao đổi độ sáng sau khi ôn (đi qua cache tag `FlashcardDeck`).

## Rollback

- Nhanh nhất: đặt flag tương ứng về `0` rồi build lại, không cần revert code. Route và menu biến mất; nhãn chấm đang chờ vẫn nằm trong `localStorage` (`catspeak.practice.pendingGrades.v1`) và sẽ được gửi khi bật lại.
- Lỗi chỉ ở FSRS: tắt `VITE_FF_PRACTICE_FSRS`, Practice vẫn dùng được như luyện tay.
- Lỗi ở API Galaxy: tắt `VITE_FF_GALAXY_API`, Galaxy quay lại gom từ các deck.
- Cần gỡ hẳn: revert merge commit của branch này.

## Còn để ngỏ

- FE-05 S1 (Nhi) cũng thu thập tín hiệu. Hook `usePracticeSignals` ở đây tính thời gian, trừ lúc tab ẩn, tối đa 2 phút. Hai bên nên gộp về một hook.
- Chưa có Web Push khi đóng trình duyệt (ngoài scope).
- Ngưỡng chấm nhanh/chậm (`practiceModes.js`) là giá trị khởi đầu; nên chỉnh lại sau khi có dữ liệu thật.
