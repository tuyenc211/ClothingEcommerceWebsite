1. Clone dự án
- Mở terminal và chạy lệnh sau để tải mã nguồn về máy: git clone https://github.com/nguyenhuutruong6666/ClothingEcommerce
2. Cấu hình Cơ sở dữ liệu (MySQL)
- Khởi động Apache và MySQL từ XAMPP Control Panel.
- Truy cập http://localhost/phpmyadmin và tạo database mới tên là clothingshop
- Chọn tab Import, tải lên tệp clothingshop.sql từ thư mục dự án và nhấn Go.
- Thông tin kết nối mặc định: Host: localhost, Port: 3306, User: root, Password: (trống).
3. Chạy Backend (Spring Boot)
- Mở thư mục Backend bằng VS Code.
- Kiểm tra cấu hình DB tại src/main/resources/application.yml để đảm bảo khớp với thông tin MySQL của bạn.
- Chạy ứng dụng bằng cách nhấn F5 (Run) hoặc dùng terminal
- Backend sẽ lắng nghe tại: http://localhost:8080.
4. Chạy Frontend (Next.js)
Dự án có hai phân hệ frontend cần khởi chạy:
- Trang khách hàng (Client Website):
    cd Frontend/client-website
    npm install
    npm run dev
    Truy cập tại: http://localhost:3000.
- Trang quản trị (Dashboard Admin):
    cd Frontend/dashboard-admin
    npm install
    npm run dev
    Truy cập tại: http://localhost:3001.
