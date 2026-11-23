# Cloudflare Cache Rule cho `GET /api/og/resolve`

Tài liệu vận hành cho Phase 2 của kế hoạch Social Preview. Mục tiêu: cache JSON OG
tại Cloudflare Edge để mỗi lượt bot crawl không phải đi qua Cloudflare Tunnel về
`catspeak-api`, trong khi vẫn tuyệt đối không cache response private
(shared token / invite / blocked).

> [!WARNING]
> Chỉ bật cache cho endpoint JSON `GET /api/og/resolve` trên domain API.
> **Không** bật “Cache Everything” cho `catspeak.com.vn/*`: cùng một URL frontend
> phục vụ SPA cho người dùng thật và OG HTML cho bot, cache chung sẽ hỏng một trong hai.

---

## 1. Phạm vi

| Môi trường | Zone / Hostname áp dụng |
| :--- | :--- |
| Production | `api.catspeak.com.vn` |
| Staging | `staging-api.catspeak.com.vn` |

Không áp dụng cho `catspeak.com.vn` (frontend Vercel). Frontend đã tự trả
`Cache-Control: no-store` + `Vary: User-Agent` từ Edge Middleware.

---

## 2. Điều kiện trước khi tạo rule

1. Backend Phase 1 đã deploy và endpoint trả JSON:
   ```bash
   curl -s "https://api.catspeak.com.vn/api/og/resolve?path=%2Fexplore-courses%2Fdetails%2F1"
   ```
   Kỳ vọng: `200 OK` với `found`, `title`, `description`, `imageUrl`, `cachePolicy`.
2. Endpoint trả đúng header cache (kiểm tra bằng `curl -I`, xem mục 5).
3. Không có Page Rule / Cache Rule cũ đang `Bypass cache` cho
   `/api/og/resolve`. Nếu có, sửa hoặc xoá trước.
4. Có quyền `Zone → Cache Rules → Edit` trên zone `catspeak.com.vn`
   (và zone staging tương ứng).

---

## 3. Tạo rule trên Dashboard

Đường dẫn:

```
Cloudflare Dashboard
  → chọn zone catspeak.com.vn
  → Caching
  → Cache Rules
  → Create rule
```

### 3.1. Rule name

```
Cache CatSpeak OG Resolve API
```

### 3.2. When incoming requests match

Chọn **Custom filter expression** → **Edit expression**, dán:

```txt
(http.host in {"api.catspeak.com.vn" "staging-api.catspeak.com.vn"} and http.request.uri.path eq "/api/og/resolve")
```

Nếu muốn chắc chắn chỉ cache GET/HEAD, dùng thêm điều kiện method:

```txt
(http.host in {"api.catspeak.com.vn" "staging-api.catspeak.com.vn"} and http.request.uri.path eq "/api/og/resolve" and http.request.method in {"GET" "HEAD"})
```

Không thêm điều kiện `http.request.uri.query`: query string (`path`,
`occurrenceId`, `token`, `sharedMaterialToken`) là một phần của cache key và
phải được phân biệt.

### 3.3. Then — Cache settings

| Trường trên Dashboard | Giá trị |
| :--- | :--- |
| **Cache eligibility** | `Eligible for cache` |
| **Edge TTL** | `Use cache-control header if present, bypass cache if not` |
| **Browser TTL** | `Respect origin TTL` |
| **Cache key → Query string** | `Include all query strings` |
| **Serve stale content while updating** | Bật (nếu plan hiện tại hiển thị toggle này) |

Giải thích nhanh:

- **Eligible for cache**: cho phép rule tham gia cache. Quyết định cache thật sự
  vẫn do `Cache-Control` / `Cloudflare-CDN-Cache-Control` của origin quyết định.
- **Edge TTL**: origin trả `s-maxage=300` → Cloudflare giữ 300 giây; origin trả
  `no-store` → Cloudflare bypass, không lưu.
- **Browser TTL**: tôn trọng `max-age=60` cho public; `no-store` cho private.
- **Include all query strings**: bắt buộc, vì `path` nằm trong query string.
  Nếu chọn “Ignore query strings”, mọi bài viết sẽ dùng chung một cache entry.
- **Serve stale**: cho phép trả bản cũ trong lúc revalidate, tận dụng
  `stale-while-revalidate=3600` từ origin.

### 3.4. Lưu và kiểm tra thứ tự rule

- Bấm **Deploy** / **Save**.
- Rule mới nên nằm **trước** mọi rule `Bypass cache` chung cho `/api/*` (nếu có).
- Rule này chỉ áp dụng cho đúng hostname + path ở trên; không ảnh hưởng API khác.

---

## 4. Cấu hình tương đương cho staging

Lặp lại mục 3 với zone/hostname staging, hoặc dùng cùng một rule nếu hai hostname
nằm trong cùng zone (như expression ở trên đã bao gồm cả hai). Tên rule gợi ý:

```
Cache CatSpeak OG Resolve API (staging)
```

---

## 5. Xác minh sau khi tạo rule

### 5.1. Public page — phải HIT ở lần request thứ hai

```bash
curl -sI "https://api.catspeak.com.vn/api/og/resolve?path=%2Fexplore-courses%2Fdetails%2F1" \
  | grep -iE "^(HTTP|cache-control|cloudflare-cdn-cache-control|cf-cache-status|age):"
```

Kỳ vọng:

```http
HTTP/2 200
cache-control: public, max-age=60, s-maxage=300, stale-while-revalidate=3600
cloudflare-cdn-cache-control: public, max-age=300, stale-while-revalidate=3600
cf-cache-status: HIT
age: <số giây>
```

Lần đầu có thể là `MISS` (hoặc `EXPIRED`), các lần sau phải là `HIT`.

### 5.2. Static resource / public event — cũng phải cache

```bash
curl -sI "https://api.catspeak.com.vn/api/og/resolve?path=%2Fzh%2Fcat-speak%2Fnews%2Fab12cd34" \
  | grep -iE "cf-cache-status|cache-control"
```

> Endpoint static `/resources/:id` không đi qua API (Edge xử lý local), nên chỉ
> test các path động như news/course/class/teacher/reel/room/profile.

### 5.3. Shared token / private — tuyệt đối không HIT

```bash
curl -sI "https://api.catspeak.com.vn/api/og/resolve?path=%2Fevents%2Fshared%2F<token>" \
  | grep -iE "cf-cache-status|cache-control|cloudflare-cdn-cache-control"
```

Kỳ vọng:

```http
cache-control: private, no-store, no-cache, must-revalidate
cloudflare-cdn-cache-control: no-store
cf-cache-status: BYPASS
```

`cf-cache-status` có thể là `DYNAMIC`/`MISS` ở một số thời điểm, nhưng **không
bao giờ được là `HIT`**. Chạy lặp 2–3 lần để chắc chắn.

### 5.4. Kiểm tra `UsedCount` không tăng

1. Tạo link shared material với `MaxUses = 1`.
2. Gọi endpoint OG bằng bot 3 lần.
3. Mở link trên trình duyệt thật: vẫn phải xem được.
4. Query DB: `UsedCount` vẫn là `0`.

### 5.5. Kiểm tra không rò rỉ `pwd` / `ver`

```bash
curl -s -A "TelegramBot" \
  "https://catspeak.com.vn/en/meet/5?pwd=MySecret123&ver=999999" \
  | grep -E "og:|twitter:" 
```

Response không được chứa `MySecret123` hay `999999`.

---

## 6. Vận hành

### 6.1. Sau mỗi lần deploy backend có thay đổi metadata

- Public cache tối đa 5 phút (`s-maxage=300`), nên có thể chờ hết TTL.
- Muốn cập nhật ngay: **Caching → Configuration → Purge Cache → Custom Purge**
  và purge theo URL, ví dụ:
  ```txt
  https://api.catspeak.com.vn/api/og/resolve?path=%2Fexplore-courses%2Fdetails%2F1
  ```
- Nếu cần purge hàng loạt, purge theo hostname `api.catspeak.com.vn` (chỉ endpoint
  này đang được cache) rồi kiểm tra lại API khác không bị ảnh hưởng.
- Hiện chưa gắn `Cache-Tag`; nếu sau này cần purge theo tag, bổ sung header
  `Cache-Tag` từ controller rồi dùng Purge by Tag.

### 6.2. Rollback

- Cách nhanh nhất: tắt (disable) rule trong **Caching → Cache Rules**.
- Hoặc đổi **Cache eligibility** thành `Bypass cache`.
- Không cần deploy lại backend/frontend.

### 6.3. Khi nào cần tăng/giảm TTL

| Tình huống | Điều chỉnh |
| :--- | :--- |
| Nội dung OG thay đổi thường xuyên | Giảm `s-maxage` trong controller (300 → 60–120) |
| Muốn giảm tải origin hơn nữa | Tăng `s-maxage` (ví dụ 600) và giữ `stale-while-revalidate` |
| Token/private bị cache nhầm | Kiểm tra `Cloudflare-CDN-Cache-Control: no-store` từ controller; không sửa rule để cache private |

---

## 7. Troubleshooting

| `cf-cache-status` | Nguyên nhân thường gặp | Cách xử lý |
| :--- | :--- | :--- |
| `DYNAMIC` | Response không đủ điều kiện cache (cookie, `Vary: *`, `Set-Cookie`, thiếu `Cache-Control` public) | Kiểm tra header origin; đảm bảo endpoint không set cookie |
| `BYPASS` | Origin gửi `no-store` / `private`, hoặc rule bypass khác khớp trước | Đúng với shared token; nếu public bị bypass, kiểm tra controller headers |
| `MISS` lặp lại | Query string không nằm trong cache key, hoặc mỗi request có query khác nhau | Đặt **Include all query strings**; kiểm tra URL thực tế |
| `EXPIRED` | TTL ngắn hơn tần suất crawl | Tăng `s-maxage` hoặc kiểm tra `Cache-Control` |
| `STALE` | Đang trả bản cũ trong lúc revalidate | Bình thường, không phải lỗi |
| `REVALIDATED` | Conditional request thành công | Bình thường |

Các nguyên nhân khác cần kiểm tra:

- Rule không khớp host: `http.host` là hostname **không kèm port**.
- Có Page Rule “Cache Everything” hoặc “Bypass Cache” cho `/api/*` chạy trước.
- Request thử nghiệm đi thẳng vào origin (không qua Cloudflare) → không có
  `cf-cache-status`.
- Endpoint trả `Vary: User-Agent` (không nên có). API JSON không được vary theo UA.

---

## 8. Checklist trước khi coi Phase 2 hoàn tất

- [ ] Rule đã deploy trên zone production.
- [ ] Rule đã deploy trên zone staging (hoặc expression bao gồm cả hai host).
- [ ] Public dynamic: lần 2 trả `cf-cache-status: HIT`.
- [ ] Shared token: không bao giờ `HIT`; `cache-control: private, no-store`.
- [ ] `UsedCount` không tăng sau nhiều lượt bot.
- [ ] Response HTML không chứa `pwd` / `ver`.
- [ ] Không có rule “Cache Everything” trên frontend `catspeak.com.vn`.
- [ ] Đã thử purge và xác nhận nội dung mới xuất hiện.
