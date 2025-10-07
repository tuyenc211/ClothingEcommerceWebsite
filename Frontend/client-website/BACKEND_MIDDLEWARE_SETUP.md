# Backend Middleware Authentication Setup

## Thay đổi từ Client-side sang Middleware với Backend API

Đã chuyển đổi từ client-side AuthGuard sang server-side middleware để bảo vệ các route `/user/*` với backend API thật.

## Middleware Configuration

### File: `middleware.ts`

- Tự động bảo vệ tất cả routes bắt đầu bằng `/user/*`
- Cho phép truy cập `/user/login` và `/user/register` mà không cần authentication
- Kiểm tra cookie `auth-token` để xác định trạng thái đăng nhập
- Redirect đến `/user/login` với query parameter `redirect` để quay lại sau khi đăng nhập

### Auth Store Updates

- Thêm function `syncAuthCookie()` để đồng bộ authentication token với cookies
- Middleware có thể đọc cookies để xác định trạng thái đăng nhập
- Cookies có thời hạn 7 ngày, SameSite=lax
- Sử dụng real API endpoints: `/auth/login`, `/auth/logout`, `/auth/check-auth`

### Backend Integration

```typescript
// Login API call
const res = await privateClient.post("/auth/login", data);
const token = res.data.token || res.data.accessToken;
syncAuthCookie(token); // Sync with cookies for middleware

// Check auth API call
const res = await privateClient.get("/auth/check-auth");
const user = res.data?.user;
const token = res.data?.token;

// Logout API call
await privateClient.post("/auth/logout");
syncAuthCookie(); // Clear cookie
```

## Cách hoạt động

1. **User truy cập `/user/profile`**

   - Middleware kiểm tra cookie `auth-token`
   - Nếu không có token → redirect về `/user/login?redirect=/user/profile`
   - Nếu có token → cho phép truy cập

2. **User đăng nhập**

   - Auth store gọi backend API `/auth/login`
   - Nhận token từ response và lưu vào Zustand store
   - Đồng thời sync token vào cookies để middleware có thể đọc
   - Login page sẽ redirect về trang được yêu cầu trong query parameter `redirect`

3. **User đăng xuất**
   - Auth store gọi backend API `/auth/logout`
   - Xóa token từ store và clear cookies
   - User tự động bị redirect về login khi truy cập protected routes

## Lợi ích

- ✅ **Server-side protection** - Bảo vệ ngay từ request đầu tiên, không có flash content
- ✅ **Real backend integration** - Sử dụng API thật thay vì mock data
- ✅ **Secure cookies** - Token được sync với httpOnly cookies (có thể upgrade)
- ✅ **Auto redirect** - Tự động quay lại trang ban đầu sau khi login
- ✅ **Better UX** - Không cần loading states cho authentication checks
- ✅ **Better SEO** - Server-side protection tốt cho crawlers

## API Endpoints Required

Backend cần implement các endpoints sau:

```typescript
POST /auth/login
- Body: { email: string, password: string }
- Response: { user: User, token: string }

POST /auth/logout
- No body required
- Response: { success: boolean }

GET /auth/check-auth
- Headers: Authorization với token
- Response: { user: User, token?: string }
```

## Configuration

### Axios Client

```typescript
// src/lib/axios.ts
const privateClient = axios.create({
  baseURL: "http://localhost:3001/api/v1",
  withCredentials: true, // Quan trọng cho cookies
});
```

### Cookie Settings

```typescript
// Set cookie với secure settings
document.cookie = `auth-token=${token}; path=/; max-age=${
  7 * 24 * 60 * 60
}; SameSite=lax`;
```

## Test

Để test middleware với backend:

1. **Vào `/user/profile` khi chưa đăng nhập** → redirect về login
2. **Đăng nhập với credentials hợp lệ** → backend validate và trả token
3. **Sau khi login thành công** → tự động redirect về page ban đầu
4. **Truy cập các protected routes** → hoạt động bình thường
5. **Refresh page** → vẫn authenticated (vì có cookies)
6. **Đăng xuất** → clear cookies, redirect về login khi truy cập protected routes

## Routes được bảo vệ

- `/user/` (profile page)
- `/user/orders` (orders list)
- `/user/orders/[id]` (order details)
- Tất cả routes `/user/*` trong tương lai

## Routes không bảo vệ

- `/user/login`
- `/user/register`
- Tất cả routes khác ngoài `/user/*`

## Security Notes

- Cookies có SameSite=lax để bảo vệ CSRF
- Token expiry 7 ngày, có thể customize
- Middleware chỉ check sự tồn tại của token, backend validation sẽ check tính hợp lệ
- Có thể upgrade thành httpOnly cookies cho security tốt hơn
