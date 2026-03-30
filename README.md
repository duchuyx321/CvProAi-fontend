# 💼 Frontend - CVPROAI

## 👨‍💻 Người thực hiện
- **Đặng Văn Mạnh** – Frontend Developer
- **Lê Trung Nhân** – Frontend Developer
- **Võ Quốc Huy** – Frontend Developer
- **Nguyễn Văn Long** – Frontend Developer
- **Lê Đức Huy** – Frontend Developer

---

## 📌 Giới thiệu
Đây là phần **Frontend** của **Xây dựng hệ thống hỗ trợ tạo và đánh giá mức độ phù hợp CV–JD ứng dụng trí tuệ nhân tạo tích hợp thanh toán nâng cấp tài khoản**. Ứng dụng cung cấp giao diện trực quan, hiện đại và dễ sử dụng, hỗ trợ người dùng trong quá trình xây dựng CV, đánh giá mức độ phù hợp với mô tả công việc và quản lý tài khoản trên hệ thống.

Frontend tập trung vào các chức năng chính:
- Đăng ký / Đăng nhập tài khoản
- Tạo, chỉnh sửa và quản lý CV
- Xem trước CV theo các mẫu có sẵn
- Nhập **Job Description** để phân tích mức độ phù hợp
- Hiển thị **Matching Score** và gợi ý cải thiện CV
- Nâng cấp gói tài khoản và thanh toán trực tuyến
- Quản lý thông tin cá nhân và lịch sử sử dụng

---

## 🖼️ Giao diện chính

### 🔹 Trang chủ (Home)
- Hiển thị thanh điều hướng (Navbar), logo và các menu chính
- Giới thiệu tổng quan hệ thống và các tính năng nổi bật
- Điều hướng nhanh đến chức năng tạo CV và phân tích CV

### 🔹 Trang đăng ký / đăng nhập (Auth)
- Đăng ký tài khoản mới
- Đăng nhập hệ thống
- Xác thực người dùng và lưu phiên đăng nhập

### 🔹 Trang tạo CV (CV Builder)
- Nhập và chỉnh sửa các thông tin CV:
  - Thông tin cá nhân
  - Học vấn
  - Kỹ năng
  - Dự án
  - Kinh nghiệm làm việc
- Xem trước CV theo thời gian thực
- Hỗ trợ quản lý nội dung CV theo biểu mẫu

### 🔹 Trang phân tích CV (CV Analysis)
- Nhập nội dung **Job Description**
- Gửi dữ liệu đến hệ thống phân tích
- Hiển thị **Matching Score**
- Đưa ra gợi ý cải thiện CV và kỹ năng còn thiếu

### 🔹 Trang gói dịch vụ / thanh toán (Subscription / Payment)
- Hiển thị thông tin các gói **Free** và **Premium**
- Cho phép người dùng chọn gói nâng cấp
- Điều hướng đến chức năng thanh toán trực tuyến

### 🔹 Trang tài khoản cá nhân (Profile)
- Hiển thị và cập nhật thông tin người dùng
- Quản lý danh sách CV đã tạo
- Xem lịch sử phân tích CV

### 🔹 Trang quản trị (Admin)
- Quản lý người dùng
- Quản lý gói dịch vụ
- Theo dõi giao dịch thanh toán và hoạt động hệ thống

---

## 🛠️ Công nghệ sử dụng
- **ReactJS** – xây dựng giao diện người dùng
- **Vite** – khởi tạo và build dự án nhanh
- **React Router DOM** – quản lý điều hướng giữa các trang
- **Axios** – giao tiếp với Backend API
- **Sass Module (SCSS Module)** – tổ chức và quản lý style theo từng component
- **Context API** – quản lý state toàn cục

---
## 🚀 Cách chạy dự án
1. Clone project về máy 
    ```bash
    https://github.com/duchuyx321/CvProAi-fontend.git
2. Cài đặt package:  
   ```bash
   npm install

