# 📏 Hướng dẫn tính năng quản lý Sizes

## 🎯 Tổng quan

Tính năng quản lý sizes cho phép bạn thêm, sửa, xóa các kích thước sản phẩm trong hệ thống. Được thiết kế theo pattern giống với Colors management.

## 🚀 Tính năng đã triển khai

### ✅ **Trang danh sách sizes** (`/admin/sizes`)

- Hiển thị tất cả sizes trong hệ thống
- Sắp xếp theo thứ tự (sortOrder)
- Thống kê tổng số sizes
- Nút thêm size mới
- Nút sửa và xóa cho từng size
- Modal xác nhận xóa

### ✅ **Trang thêm size** (`/admin/sizes/add`)

- Form thêm size mới
- Validation đầy đủ
- Tự động uppercase mã size
- Tự động set sortOrder tiếp theo
- Kiểm tra mã size trùng lặp

### ✅ **Trang sửa size** (`/admin/sizes/edit/[id]`)

- Form sửa size hiện có
- Load dữ liệu size cần sửa
- Validation giống trang thêm
- Kiểm tra mã size trùng lặp (trừ chính nó)

### ✅ **Store management** (`sizeStore.ts`)

- Zustand store với persistence
- CRUD operations đầy đủ
- Mock data integration
- Type safety

## 📋 Cấu trúc dữ liệu Size

```typescript
interface Size {
  id: number; // ID duy nhất
  code: string; // Mã size (XS, S, M, L, XL...)
  name: string; // Tên đầy đủ (Extra Small, Small...)
  sortOrder: number; // Thứ tự hiển thị
}
```

## 🎨 UI/UX Features

### **Danh sách sizes**

- Table hiển thị với Badge cho mã size
- Thứ tự hiển thị theo sortOrder
- Icons trực quan (Ruler icon)
- Responsive design

### **Form validation**

- Mã size: Bắt buộc, tối đa 10 ký tự, không trùng lặp
- Tên size: Bắt buộc, tối đa 50 ký tự
- Sort order: Bắt buộc, phải > 0
- Real-time error clearing

### **User Experience**

- Loading states
- Toast notifications (từ store)
- Confirmation modals cho delete
- Auto-redirect sau save
- Breadcrumb navigation

## 🔧 Technical Implementation

### **Store Integration**

```typescript
const { sizes, addSize, updateSize, deleteSize, getSize } = useSizeStore();
```

### **Mock Data**

- Sử dụng `mockSizes` từ `productv2.ts`
- Persistence với localStorage
- Seamless integration với existing data

### **Navigation**

- Đã có sẵn trong sidebar menu
- Links: "Thêm kích thước" và "Danh sách kích thước"
- Nằm trong section "Quản lý danh mục"

## 📱 Responsive Design

- **Desktop**: Full table layout
- **Mobile**: Responsive table với horizontal scroll
- **Form**: Stack layout trên mobile
- **Buttons**: Adaptive sizing

## 🔒 Security & Validation

### **Frontend Validation**

- Required field validation
- Length constraints
- Duplicate code checking
- Type safety với TypeScript

### **Data Integrity**

- Unique code enforcement
- Sort order management
- Proper error handling
- Loading state management

## 🚀 Cách sử dụng

### **1. Truy cập tính năng**

- Đăng nhập với tài khoản Admin/Staff
- Vào sidebar → "Quản lý danh mục" → "Danh sách kích thước"

### **2. Thêm size mới**

- Click nút "Thêm size" (Plus icon)
- Nhập thông tin:
  - **Mã size**: XS, S, M, L, XL, XXL...
  - **Tên size**: Extra Small, Small, Medium...
  - **Thứ tự**: Số thứ tự hiển thị (nhỏ hơn = hiển thị trước)
- Click "Tạo size"

### **3. Sửa size**

- Click nút Edit (pencil icon) bên cạnh size
- Cập nhật thông tin cần thiết
- Click "Cập nhật size"

### **4. Xóa size**

- Click nút Delete (trash icon)
- Xác nhận trong modal
- Size sẽ bị xóa vĩnh viễn

## 📊 Mock Data hiện có

```typescript
const mockSizes = [
  { id: 1, code: "XS", name: "Extra Small", sortOrder: 1 },
  { id: 2, code: "S", name: "Small", sortOrder: 2 },
  { id: 3, code: "M", name: "Medium", sortOrder: 3 },
  { id: 4, code: "L", name: "Large", sortOrder: 4 },
  { id: 5, code: "XL", name: "Extra Large", sortOrder: 5 },
];
```

## 🔄 Tích hợp với Backend

Khi có backend, chỉ cần:

1. **Uncomment API calls** trong store
2. **Thay thế mock data** bằng API endpoints
3. **Cập nhật error handling** cho server responses
4. **Giữ nguyên UI/UX** hiện tại

## 🎯 Tính năng nâng cao có thể thêm

- [ ] Bulk import sizes từ CSV/Excel
- [ ] Drag & drop để sắp xếp thứ tự
- [ ] Filter và search sizes
- [ ] Export danh sách sizes
- [ ] Audit log cho thay đổi sizes
- [ ] Soft delete thay vì hard delete

## 🐛 Troubleshooting

### **Lỗi thường gặp**

1. **"Mã size đã tồn tại"**

   - Kiểm tra xem có size nào khác dùng mã tương tự
   - Mã size không phân biệt hoa thường

2. **Form không submit**

   - Kiểm tra validation errors
   - Đảm bảo tất cả required fields đã điền

3. **Size không hiển thị**
   - Kiểm tra sortOrder
   - Refresh page để reload data

### **Debug**

- Mở DevTools → Application → Local Storage
- Kiểm tra key "size-storage"
- Console logs cho store actions

## 📈 Performance

- **Lazy loading**: Components chỉ load khi cần
- **Memoization**: Store state được cache
- **Persistence**: Data được lưu local, không cần reload
- **Optimistic updates**: UI update ngay lập tức

---

**Tính năng sizes đã sẵn sàng sử dụng! 🎉**
