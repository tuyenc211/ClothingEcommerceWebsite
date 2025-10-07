# 🚀 Hướng dẫn sử dụng Mock Data

## 📋 Tổng quan

Hiện tại hệ thống đang sử dụng **mock data** thay vì kết nối với backend thật. Điều này cho phép bạn test và phát triển frontend mà không cần backend.

## 👥 Tài khoản Demo có sẵn

### 🔑 Tài khoản Admin

- **Email**: `admin@fashionstore.vn`
- **Họ tên**: Nguyễn Văn Admin
- **Vai trò**: Admin
- **Quyền**: Toàn quyền truy cập

### 🔑 Tài khoản Staff

- **Email**: `staff@fashionstore.vn`
- **Họ tên**: Trần Thị Staff
- **Vai trò**: Staff
- **Quyền**: Truy cập hạn chế

### 🚫 Tài khoản Customer (Không thể đăng nhập)

- **Email**: `khach1@gmail.com`, `khach2@gmail.com`, `khach3@gmail.com`
- **Vai trò**: Customer
- **Lưu ý**: Không thể đăng nhập vào dashboard admin

## 🎯 Cách đăng nhập

### Phương pháp 1: Đăng nhập thủ công

1. Nhập email: `admin@fashionstore.vn` hoặc `staff@fashionstore.vn`
2. Nhập bất kỳ mật khẩu nào (sẽ được bỏ qua trong mock mode)
3. Nhấn "Login"

### Phương pháp 2: Đăng nhập nhanh (Khuyến nghị)

1. Nhấn nút **"🚀 Đăng nhập nhanh với Admin"**
2. Hệ thống sẽ tự động đăng nhập với tài khoản Admin

## 🔒 Bảo mật và Phân quyền

### Middleware Protection

- Chỉ cho phép user có vai trò `Admin` hoặc `Staff` truy cập
- Tự động redirect về `/login` nếu không có quyền
- Kiểm tra vai trò ở cấp độ route và login

### Role-based Access Control

- **Admin**: Toàn quyền truy cập tất cả tính năng
- **Staff**: Truy cập hạn chế (có thể tùy chỉnh sau)
- **Customer**: Không thể truy cập dashboard

## 📁 File liên quan

### Mock Data

- `src/data/productv2.ts` - Chứa tất cả mock data
- `src/stores/useAuthStore.ts` - Logic xác thực với mock data

### Components

- `src/components/ui/login-form.tsx` - Form đăng nhập với nút quick login
- `middleware.ts` - Bảo vệ routes và kiểm tra quyền

## 🔄 Chuyển đổi sang Backend thật

Khi có backend, chỉ cần:

1. **Uncomment API calls** trong `useAuthStore.ts`:

   ```typescript
   // Uncomment dòng này
   const res = await privateClient.post("/auth/login", data);

   // Comment hoặc xóa mock logic
   // const user = mockUsers.find(u => u.email === data.email);
   ```

2. **Cập nhật checkAuth function** để gọi API thật

3. **Xóa hoặc ẩn nút "Đăng nhập nhanh"** trong login form

## 🎨 Tính năng Mock hiện tại

- ✅ Đăng nhập với mock users
- ✅ Kiểm tra vai trò và phân quyền
- ✅ Lưu trữ session trong localStorage
- ✅ Middleware protection
- ✅ Toast notifications
- ✅ Auto-redirect sau login
- ✅ Quick login button

## 📝 Lưu ý quan trọng

1. **Mật khẩu**: Trong mock mode, mật khẩu sẽ được bỏ qua
2. **Session**: Được lưu trong localStorage, sẽ persist qua browser sessions
3. **Validation**: Chỉ kiểm tra email có tồn tại trong mockUsers
4. **Security**: Middleware vẫn hoạt động đầy đủ như production

## 🐛 Troubleshooting

### Không thể đăng nhập?

- Đảm bảo sử dụng email đúng: `admin@fashionstore.vn` hoặc `staff@fashionstore.vn`
- Thử sử dụng nút "Đăng nhập nhanh"
- Kiểm tra console để xem lỗi

### Bị redirect về login?

- Kiểm tra vai trò user trong mockUsers
- Đảm bảo user có role "Admin" hoặc "Staff"

### Session bị mất?

- Kiểm tra localStorage có key "auth-storage"
- Clear localStorage và đăng nhập lại
