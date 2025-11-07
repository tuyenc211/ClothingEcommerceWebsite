# Hướng dẫn thanh toán VNPay

## Tổng quan

Hệ thống đã tích hợp thanh toán VNPay cho phép khách hàng thanh toán đơn hàng trực tuyến qua cổng thanh toán VNPay.

## Flow thanh toán VNPay

### 1. Khách hàng chọn phương thức thanh toán

- Tại trang checkout (`/checkout`), khách hàng chọn "Thanh toán qua VNPay"
- Điền đầy đủ thông tin giao hàng
- Nhấn nút "Đặt hàng"

### 2. Tạo đơn hàng và redirect đến VNPay

```
User -> Frontend -> Backend API (Create Order)
     -> Backend API (Create VNPay Payment URL)
     -> Redirect to VNPay Gateway
```

**Chi tiết kỹ thuật:**

- Frontend gọi `POST /api/v1/orders/{userId}` để tạo đơn hàng
- Frontend gọi `POST /api/v1/payment/create?amount={amount}&orderId={orderId}` để lấy payment URL
- Frontend redirect user đến VNPay gateway thông qua `window.location.href = paymentUrl`

### 3. Khách hàng thanh toán tại VNPay

- User được redirect đến trang thanh toán VNPay
- Nhập thông tin thẻ/tài khoản ngân hàng
- Xác nhận thanh toán

### 4. VNPay xử lý thanh toán

- VNPay xử lý giao dịch
- VNPay callback về backend endpoint: `GET /api/v1/payment/vn-pay-callback`

### 5. Backend xử lý callback

```java
@GetMapping("/vn-pay-callback")
public void handleVnPayCallback(@RequestParam Map<String, String> allParams, HttpServletResponse response) {
    // Verify signature
    // Update order payment status
    // Redirect to frontend
}
```

**Kết quả:**

- ✅ Thanh toán thành công: `orderService.updateOrderStatus(orderId, "PAID")`
  - Redirect: `http://localhost:3000/checkout?status=success`
- ❌ Thanh toán thất bại: `orderService.updateOrderStatus(orderId, "FAILED")`
  - Redirect: `http://localhost:3000/checkout?status=fail`

### 6. Frontend hiển thị kết quả

- Frontend (`/checkout`) nhận query param `status`
- Hiển thị thông báo tương ứng
- Redirect đến trang đơn hàng nếu thành công

## Cấu trúc code

### Frontend

**Services:**

- `src/services/paymentService.ts`: Service xử lý VNPay API
  - `createVNPayPayment(amount, orderId)`: Tạo payment URL

**Pages:**

- `src/app/checkout/page.tsx`: Trang checkout với VNPay integration
  - Xử lý submit order với VNPay
  - Xử lý callback từ VNPay (query params)
  - Hiển thị loading state khi processing payment

**Components:**

- `src/components/checkout/PaymentMethodSelector.tsx`: Component chọn phương thức thanh toán
  - COD (Cash on Delivery)
  - VNPay (WALLET)

**Stores:**

- `src/stores/orderStore.ts`: Zustand store quản lý orders
  - `createOrder()`: Tạo đơn hàng
  - `PaymentMethod`: "COD" | "WALLET"
  - `PaymentStatus`: "UNPAID" | "PAID" | "REFUNDED" | "PARTIAL"

### Backend

**Controllers:**

- `PaymentController.java`: REST API cho thanh toán
  - `POST /api/v1/payment/create`: Tạo VNPay payment URL
  - `GET /api/v1/payment/vn-pay-callback`: Callback từ VNPay

**Services:**

- `VNPayService.java`: Interface
- `VNPayServiceImpl.java`: Implementation
  - `createPaymentUrl()`: Tạo URL thanh toán với HMAC SHA512 signature
  - `verifyPaymentCallback()`: Verify callback từ VNPay

**Config:**

- `VnPayConfig.java`: Configuration cho VNPay
- `application.yml`: Cấu hình VNPay credentials
  ```yaml
  spring:
    vnpay:
      tmn-code: TROHKPHO
      secret-key: QKX2FE5Z3B8TRU4QE1I9GQTI8E05OE2H
      pay-url: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
      return-url: http://localhost:8088/api/v1/payment/vn-pay-callback
  ```

## Testing

### VNPay Sandbox Test Cards

VNPay cung cấp các thẻ test để thử nghiệm:

**Thẻ nội địa (NCB):**

- Số thẻ: `9704198526191432198`
- Tên chủ thẻ: `NGUYEN VAN A`
- Ngày phát hành: `07/15`
- Mật khẩu OTP: `123456`

### Test Flow

1. Thêm sản phẩm vào giỏ hàng
2. Vào trang checkout
3. Chọn "Thanh toán qua VNPay"
4. Điền thông tin giao hàng
5. Nhấn "Đặt hàng"
6. Tại trang VNPay sandbox:
   - Chọn ngân hàng NCB
   - Nhập thông tin thẻ test
   - Xác nhận thanh toán
7. Kiểm tra redirect về frontend
8. Kiểm tra order status trong database

## Lưu ý quan trọng

### Security

- ✅ Backend verify HMAC SHA512 signature từ VNPay
- ✅ Secret key không được expose ra frontend
- ✅ Frontend chỉ nhận payment URL, không tự tạo

### Order Management

- Đơn hàng được tạo trước khi redirect đến VNPay
- Payment status được update sau khi VNPay callback
- Nếu thanh toán thất bại, order vẫn tồn tại với status `FAILED`

### Error Handling

- ❌ Không thể tạo payment URL: Hiển thị lỗi, không redirect
- ❌ VNPay callback failed: Redirect về checkout với `status=fail`
- ❌ Invalid signature: Backend từ chối callback

### Production Deployment

Khi deploy lên production, cần update:

**Backend `application.yml`:**

```yaml
spring:
  vnpay:
    return-url: https://your-backend-domain.com/api/v1/payment/vn-pay-callback
```

**Backend `PaymentController.java`:**

```java
// Line 48, 51: Update frontend URLs
response.sendRedirect("https://your-frontend-domain.com/checkout?status=success");
response.sendRedirect("https://your-frontend-domain.com/checkout?status=fail");
```

## API Endpoints

### Create VNPay Payment

```http
POST /api/v1/payment/create
Content-Type: application/json

Query Params:
- amount: Long (VND amount)
- orderId: String (Order ID)

Response:
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
}
```

### VNPay Callback (Internal)

```http
GET /api/v1/payment/vn-pay-callback
Query Params: (from VNPay)
- vnp_Amount
- vnp_BankCode
- vnp_ResponseCode
- vnp_TxnRef (orderId)
- vnp_SecureHash
- ... (other VNPay params)
```

## Troubleshooting

### Lỗi: "Không thể tạo thanh toán VNPay"

- Kiểm tra backend có chạy không (port 8088)
- Kiểm tra VNPay credentials trong `application.yml`
- Xem console log để biết chi tiết lỗi

### Callback không hoạt động

- Kiểm tra `return-url` trong `application.yml`
- Đảm bảo backend endpoint `/api/v1/payment/vn-pay-callback` accessible
- VNPay sandbox có thể không callback về localhost, cần dùng ngrok hoặc deploy

### Order status không update

- Kiểm tra log backend khi VNPay callback
- Verify signature có hợp lệ không
- Kiểm tra `orderService.updateOrderStatus()` có được gọi không

## Resources

- VNPay Documentation: https://sandbox.vnpayment.vn/apis/
- VNPay Sandbox: https://sandbox.vnpayment.vn/
