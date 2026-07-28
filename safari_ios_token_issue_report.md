# Báo Cáo Phân Tích & Hướng Dẫn Kỹ Thuật: Xử Lý Lỗi Tự Động Đăng Xuất Token Trên Safari iOS (iPhone)

**Ngày lập báo cáo:** 23/07/2026  
**Dự án:** CatSpeak Web Application  
**Dành cho:** Frontend Developer Team  

---

## 1. 📌 Hiện Tượng (Symptom)
Khi test ứng dụng web CatSpeak trên trình duyệt **Safari trên điện thoại iPhone (iOS)**, người dùng thỉnh thoảng bị **tự động đăng xuất (logout)** và bị đẩy về màn hình Đăng nhập do token hết hạn.

---

## 2. 🔍 Nguyên Nhân Kỹ Thuật (Root Cause Analysis)

Được xác định là **sự kết hợp giữa cơ chế quản lý ứng dụng/bộ nhớ đặc thù của Safari iOS** và **cách xử lý refresh token chưa có Request Queue / Interceptor Lock ở phía Frontend (FE)**:

### a. Safari iOS Đóng Băng JavaScript Timers (Tab Suspension)
- Trên iOS Safari, khi người dùng chuyển tab, khóa màn hình iPhone hoặc chuyển ứng dụng ra background, hệ điều hành iOS **ngay lập tức tạm dừng (freeze/suspend)** tất cả các bộ đếm `setInterval` / `setTimeout` chạy ngầm.
- Sau khoảng thời gian 30-60 phút (lúc Access Token đã hết hạn) khi người dùng mở lại tab Safari:
  - Bộ đếm thời gian tự động refresh token ngầm chưa kịp thực thi.
  - Ngay khi màn hình resume, ứng dụng FE đồng thời bắn ra 3–5 request dữ liệu song song (ví dụ: `getProfile`, `getNotifications`, `getCustomRooms`, kết nối `SignalR`,...).

### b. Race Condition Trong Axios / Fetch Interceptor (Nguyên nhân trực tiếp gây Logout)
- Khi 3–5 request đồng thời nhận phản hồi `401 Unauthorized` từ Server tại cùng một thời điểm:
  - Nếu FE interceptor **chưa triển khai Request Queue / Single-flight Lock**, FE sẽ gửi đồng thời 3–5 API `POST /api/auth/refresh-token` lên Backend với **cùng một `refreshToken` cũ**.
  - Theo cơ chế bảo mật **Token Rotation** phía Backend:
    1. Request đầu tiên lên BE đổi token thành công $\rightarrow$ `refreshToken` cũ bị đánh dấu đã hủy (`Revoked`) và trả về `refreshToken` mới.
    2. Request thứ 2 và 3 bắn trùng ngay sau đó vẫn mang `refreshToken` cũ $\rightarrow$ BE phát hiện `refreshToken` này đã bị revoked $\rightarrow$ BE từ chối và trả về `401 Unauthorized`.
  - FE Interceptor bắt được lỗi `401` của request trùng này và thực thi hàm `logout()`, xóa bộ nhớ và đẩy người dùng ra trang Login.

### c. Cài Đặt Lưu Trữ & Bộ Nhớ Trên Safari iOS (Storage Eviction)
- Safari iOS giải phóng bộ nhớ rất nghiêm ngặt (đặc biệt khi thiết bị chạy nhiều ứng dụng hoặc khi ở chế độ Tab Riêng Tư / Private Browsing).
- Nếu FE lưu trữ token trong `sessionStorage`, mỗi khi iOS Safari khôi phục lại trang từ trạng thái bị tạm dừng, `sessionStorage` có thể bị làm sạch khiến người dùng bị mất phiên làm việc.

---

## 3. 🛠️ Hướng Giải Quyết Chi Tiết Cho FE Developer

FE Developer cần triển khai 3 giải pháp dưới đây để xử lý triệt để vấn đề:

### 3.1. Triển Khai Request Queue / Interceptor Lock (Bắt buộc)
Đảm bảo khi có lỗi `401`, **chỉ duy nhất 1 request refresh token** được gửi đi. Tất cả các request `401` khác phát sinh đồng thời phải đưa vào hàng chờ (`Queue`) cho đến khi có Token mới.

#### 💡 Code mẫu minh họa (Axios Interceptor):

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.catspeak.com',
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 và request này chưa từng retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đã có request khác đang thực hiện refresh token -> Xếp hàng chờ
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const accessToken = localStorage.getItem('accessToken');

        // Gọi API refresh token của BE
        const { data } = await axios.post('https://api.catspeak.com/api/auth/refresh-token', {
          token: accessToken,
          refreshToken: refreshToken,
        });

        const newAccessToken = data.token;
        const newRefreshToken = data.refreshToken;

        // Lưu token mới
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Giải phóng các request đang chờ trong Queue
        processQueue(null, newAccessToken);

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh Token thất bại thực sự -> Giải phóng Queue với lỗi và Logout
        processQueue(refreshError, null);
        handleUserLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function handleUserLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}

export default api;
```

---

### 3.2. Lắng Nghe Sự Kiện Resume Tab (`visibilitychange`)
Chủ động kiểm tra và refresh token khi người dùng mở lại tab ứng dụng trên Safari iOS **trước khi** các component tự động fetch dữ liệu:

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Kiểm tra nếu Access Token đã gần hết hạn (ví dụ < 5 phút)
    checkAndRefreshTokenIfNeeded();
  }
});
```

---

### 3.3. Đảm Bảo Lưu Trữ Đăng Nhập Trên `localStorage`
- Đảm bảo `accessToken` và `refreshToken` được lưu trong `localStorage` thay vì `sessionStorage` để không bị mất khi Safari reload lại tab do giải phóng bộ nhớ RAM trên iOS.
