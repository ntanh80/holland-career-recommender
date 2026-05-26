# Holland/RIASEC Career Assessment

Trắc nghiệm hướng nghiệp chuyên nghiệp dựa trên lý thuyết Holland (RIASEC). Học sinh, sinh viên và người đi làm khám phá nhóm tính cách nghề nghiệp, nhận mã Holland 3 ký tự và gợi ý ngành nghề phù hợp.

---

## Tính năng

**Người dùng**
- 60 câu hỏi chuẩn Holland, thang Likert 1-5, tự động lưu tiến trình
- Kết quả tức thì: biểu đồ điểm số, mã Holland 3 ký tự, TOP 3 nhóm nổi bật
- Mô tả tính cách, điểm mạnh, môi trường phù hợp cho từng nhóm
- Gợi ý ngành nghề thông minh: khớp chính xác hoán vị 3 ký tự → khớp 2 ký tự → khớp 1 ký tự
- Gửi email kết quả HTML chuyên nghiệp qua Gmail SMTP
- Tải báo cáo PDF ngay trên trình duyệt
- Link xem lại kết quả bằng mã token bảo mật 64 ký tự

**Quản trị**
- Dashboard thống kê: tổng users, kết quả hôm nay/tháng, phân bố Holland, biểu đồ
- Quản lý câu hỏi: thêm/sửa/xóa, phân nhóm R/I/A/S/E/C, sắp xếp thứ tự
- Quản lý ngành nghề: CRUD, gán mã Holland, liên kết nhóm ngành
- Quản lý nhóm ngành nghề: danh sách nhóm ngành độc lập, dùng trong form ngành nghề
- Quản lý nhóm Holland: chỉnh sửa tên, mô tả, màu sắc 6 nhóm RIASEC
- Quản lý người dùng: tìm kiếm, lọc, sắp xếp, phân trang server-side
- Quản lý kết quả: xem chi tiết từng bài làm, lọc theo mã Holland, ngày
- Nhật ký email: trạng thái gửi, gửi lại email thất bại
- Xuất CSV: danh sách người dùng, kết quả
- Đăng nhập JWT + phân quyền super_admin/admin

---

## Kiến trúc

```
Browser (React 18 SPA)
  │  React Router, Tailwind CSS, Recharts, jsPDF + html2canvas
  │  Axios + localStorage JWT
  ▼
Express API Server (:3000)
  │  Helmet, CORS, Rate Limiter, express-validator
  │  JWT middleware (adminAuth, superAdminOnly)
  │  hollandService (tính điểm, xếp hạng, gợi ý nghề)
  │  emailService (template HTML, Nodemailer SMTP)
  ▼
MySQL 8.0 (:3306)
  │  9 bảng: users, questions, answers, test_results,
  │  careers, career_groups, email_logs, admins, holland_types
  ▼
External: Gmail SMTP (Nodemailer)
```

---

## Cài đặt

### Yêu cầu
- Node.js >= 18, npm >= 9
- MySQL 8.0 (Docker hoặc native)

### Khởi động

```bash
# 1. Clone
git clone https://github.com/ntanh80/holland-career-recommender.git
cd holland-career-recommender

# 2. MySQL (Docker)
docker run -d --name holland-mysql \
  -e MYSQL_ROOT_PASSWORD=holland123 \
  -e MYSQL_DATABASE=holland_career_test \
  -p 3306:3306 mysql:8.0

# 3. Tạo bảng & dữ liệu mẫu
cat database/migrations/001_create_tables.sql | docker exec -i holland-mysql mysql -uroot -pholland123
cat database/migrations/002_career_groups.sql | docker exec -i holland-mysql mysql -uroot -pholland123
cat database/seeds/001_questions_and_careers.sql | docker exec -i holland-mysql mysql -uroot -pholland123 holland_career_test

# 4. Backend
cd backend
cp .env.example .env
npm install
node src/seedAdmin.js   # tạo tài khoản admin/admin123
npm run dev             # http://localhost:3000

# 5. Frontend (terminal mới)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

**Truy cập:** `http://localhost:5173` | **Admin:** `http://localhost:5173/admin/login` (admin / admin123)

---

## Biến môi trường (`backend/.env`)

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | `holland123` |
| `DB_NAME` | Database name | `holland_career_test` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Gmail address | *(cần cấu hình để gửi email)* |
| `SMTP_PASS` | Gmail App Password | *(cần cấu hình)* |
| `JWT_SECRET` | JWT signing key | *(đổi thành chuỗi ngẫu nhiên)* |
| `JWT_EXPIRES_IN` | JWT expiry | `24h` |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:5173` |
| `CAPTCHA_ENABLED` | Bật/tắt CAPTCHA | `false` |

---

## API Reference

### Public Endpoints (không cần auth)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/questions` | Danh sách câu hỏi đang hoạt động |
| `POST` | `/api/surveys/submit` | Nộp bài khảo sát + thông tin cá nhân |
| `GET` | `/api/results/:token` | Xem kết quả theo token |
| `POST` | `/api/results/:token/send-email` | Gửi lại email kết quả |
| `GET` | `/api/careers/recommendations?code=RIA` | Gợi ý ngành nghề theo mã Holland |
| `GET` | `/api/holland-types` | Danh sách 6 nhóm Holland |

### Admin Endpoints (yêu cầu JWT)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/admin/login` | Đăng nhập admin |
| `GET` | `/api/admin/me` | Xác thực phiên |
| `GET` | `/api/admin/dashboard` | Thống kê dashboard |
| `GET/POST/PUT/DELETE` | `/api/admin/questions[/:id]` | CRUD câu hỏi |
| `GET/PUT` | `/api/admin/holland-types[/:code]` | Xem/sửa nhóm Holland |
| `GET/POST/PUT/DELETE` | `/api/admin/career-groups[/:id]` | CRUD nhóm ngành nghề |
| `GET/POST/PUT/DELETE` | `/api/admin/careers[/:id]` | CRUD ngành nghề |
| `GET` | `/api/admin/users[/:id]` | Danh sách/chi tiết người dùng |
| `GET` | `/api/admin/results[/:id]` | Danh sách/chi tiết kết quả |
| `DELETE` | `/api/admin/results/:id` | Xóa kết quả (super_admin) |
| `GET` | `/api/admin/email-logs` | Nhật ký email |
| `POST` | `/api/admin/email-logs/:id/resend` | Gửi lại email |
| `GET` | `/api/admin/export/users` | Xuất CSV người dùng |
| `GET` | `/api/admin/export/results` | Xuất CSV kết quả |

### Rate Limiting
- Public API chung: 30 requests/phút/IP
- Nộp bài khảo sát: 5 requests/phút/IP

---

## Trang Frontend

### Public
| Path | Trang | Mô tả |
|------|-------|-------|
| `/` | HomePage | Giới thiệu Holland/RIASEC, 6 nhóm tính cách, CTA |
| `/test` | TestPage | 60 câu hỏi, thanh tiến trình, lưu localStorage |
| `/info` | InfoPage | Form thông tin cá nhân trước khi xem kết quả |
| `/result/:token` | ResultPage | Biểu đồ, mã Holland, gợi ý nghề, tải PDF, gửi email |

### Admin (`/admin/...`)
| Path | Trang | Mô tả |
|------|-------|-------|
| `/login` | AdminLoginPage | Form đăng nhập |
| `/dashboard` | AdminDashboardPage | Thống kê, biểu đồ, người dùng mới nhất |
| `/questions` | QuestionsManagePage | CRUD câu hỏi, tìm kiếm, lọc nhóm, sắp xếp |
| `/careers` | CareersManagePage | CRUD ngành nghề, lọc nhóm ngành, tìm kiếm |
| `/career-groups` | CareerGroupsManagePage | CRUD nhóm ngành nghề |
| `/holland-types` | HollandTypesManagePage | Sửa tên, mô tả, màu 6 nhóm Holland |
| `/users` | UsersListPage | Danh sách người dùng, tìm kiếm, lọc |
| `/results` | ResultsListPage | Danh sách kết quả, xem chi tiết, xóa |
| `/email-logs` | EmailLogsPage | Nhật ký gửi email, gửi lại |

---

## Cơ sở dữ liệu

| Bảng | Mô tả |
|------|-------|
| `users` | Người làm khảo sát (họ tên, email, SĐT, trường, tỉnh, loại) |
| `questions` | 60 câu hỏi Holland (nội dung, nhóm R/I/A/S/E/C, thứ tự) |
| `answers` | Câu trả lời (user_id, question_id, giá trị 1-5) |
| `test_results` | Kết quả (điểm 6 nhóm, mã Holland, top_1/2/3, token) |
| `careers` | Ngành nghề gợi ý (mã Holland, tên, nhóm ngành, mô tả, kỹ năng) |
| `career_groups` | Nhóm ngành nghề (tên, thứ tự hiển thị) |
| `email_logs` | Lịch sử gửi email (trạng thái: pending/sent/failed) |
| `admins` | Tài khoản quản trị (username, password_hash bcrypt, role) |
| `holland_types` | Metadata 6 nhóm Holland (tên VN/EN, mô tả, màu sắc) |

---

## Công nghệ

**Frontend:** React 18, React Router 6, Tailwind CSS 3, Recharts, jsPDF + html2canvas, Axios, Vite

**Backend:** Express 4, mysql2, jsonwebtoken, bcrypt, Nodemailer, Helmet, express-rate-limit, express-validator

**Database:** MySQL 8.0, utf8mb4, connection pool

---

## Bảo mật

- Helmet HTTP security headers
- CORS giới hạn origin
- Rate limiting (30/phút public, 5/phút submit)
- JWT xác thực admin, bcrypt hash mật khẩu
- Result token 64 ký tự crypto.randomBytes
- Input validation (express-validator server-side)
- CAPTCHA (có thể bật/tắt qua biến môi trường)
- Phân quyền super_admin cho thao tác xóa

---

## Giấy phép

MIT License

---

Phát triển cho mục đích tư vấn hướng nghiệp và tuyển sinh.
