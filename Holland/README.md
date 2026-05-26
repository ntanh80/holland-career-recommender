# Holland/RIASEC - Website Trắc Nghiệm Hướng Nghiệp

Website trắc nghiệm hướng nghiệp Holland/RIASEC dành cho học sinh, sinh viên và người đi làm. Hệ thống gồm 60 câu hỏi đánh giá 6 nhóm tính cách nghề nghiệp (R-I-A-S-E-C), tự động tính điểm, hiển thị kết quả kèm biểu đồ, gợi ý ngành nghề phù hợp và gửi email kết quả.

## Tính Năng Chính

- **Trang chủ** — Giới thiệu bài trắc nghiệm, 6 nhóm Holland, lợi ích
- **Làm bài trắc nghiệm** — 60 câu hỏi, thang Likert 5 mức, lưu tạm trên trình duyệt, phân trang
- **Nhập thông tin cá nhân** — Form thu thập họ tên, email, SĐT, trường, tỉnh/thành...
- **Kết quả chi tiết** — Điểm từng nhóm, mã Holland 3 ký tự, biểu đồ cột + radar, mô tả tính cách, điểm mạnh, môi trường phù hợp, gợi ý ngành nghề
- **Gửi email kết quả** — Email HTML chuyên nghiệp chứa điểm số, biểu đồ, gợi ý nghề nghiệp
- **Tải PDF** — Xuất báo cáo kết quả dạng PDF ngay trên trình duyệt
- **Xem lại online** — Link kết quả bảo mật qua mã token 64 ký tự, có thể gửi lại email

## Công Nghệ Sử Dụng

| Lớp | Công nghệ |
|-----|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Recharts, jsPDF |
| Backend | Node.js, Express, mysql2, Nodemailer, JWT, bcrypt |
| Database | MySQL 8.0 |
| Bảo mật | Helmet, CORS, Rate Limiting, CAPTCHA, Input Validation |

## Cấu Trúc Dự Án

```
Holland/
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── pages/            # Các trang: HomePage, TestPage, InfoPage, ResultPage
│   │   ├── components/       # UI components: Button, Card, ProgressBar, Toast...
│   │   ├── hooks/            # useQuestions, useLocalStorage
│   │   └── services/         # Axios API client
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/                   # Express REST API
│   ├── src/
│   │   ├── config/           # db.js, env.js, nodemailer.js
│   │   ├── models/           # userModel, questionModel, answerModel, resultModel...
│   │   ├── services/         # hollandService (tính điểm), emailService
│   │   ├── middleware/        # errorHandler, rateLimiter, validators
│   │   └── routes/           # publicRoutes.js
│   ├── server.js             # Entry point
│   └── .env                  # Biến môi trường
└── database/
    ├── migrations/           # SQL tạo bảng
    └── seeds/                # Dữ liệu mẫu (60 câu hỏi, 31 ngành nghề)
```

## Yêu Cầu Hệ Thống

- **Node.js** 18+
- **npm** 9+
- **Docker Desktop** (để chạy MySQL) hoặc **MySQL 8.0** cài đặt trực tiếp

## Hướng Dẫn Cài Đặt

### 1. Clone dự án

```bash
git clone https://github.com/ntanh80/holland-career-recommender.git
cd holland-career-recommender
```

### 2. Khởi động MySQL bằng Docker

```bash
docker run -d \
  --name holland-mysql \
  -e MYSQL_ROOT_PASSWORD=holland123 \
  -e MYSQL_DATABASE=holland_career_test \
  -p 3306:3306 \
  mysql:8.0
```

### 3. Tạo bảng và nhập dữ liệu mẫu

```bash
# Tạo bảng
docker exec -i holland-mysql mysql -uroot -pholland123 --default-character-set=utf8mb4 < database/migrations/001_create_tables.sql

# Nhập 60 câu hỏi và 31 ngành nghề
docker exec -i holland-mysql mysql -uroot -pholland123 --default-character-set=utf8mb4 holland_career_test < database/seeds/001_questions_and_careers.sql
```

### 4. Cài đặt Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Copy file cấu hình môi trường
cp .env.example .env

# Chỉnh sửa .env (xem phần Cấu Hình bên dưới)

# Khởi động server (port 3000)
npm run dev
```

### 5. Cài đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Khởi động dev server (port 5173)
npm run dev
```

### 6. Truy cập website

Mở trình duyệt: **http://localhost:5173**

## Cấu Hình Môi Trường (.env)

File `backend/.env` chứa các biến cấu hình:

| Biến | Mô tả | Giá trị mặc định |
|------|-------|------------------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | `holland123` |
| `DB_NAME` | Tên database | `holland_career_test` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email gửi | `your-email@gmail.com` |
| `SMTP_PASS` | App password Gmail | *(cần cấu hình)* |
| `JWT_SECRET` | Khóa bí mật JWT | *(đổi thành chuỗi ngẫu nhiên)* |
| `CAPTCHA_ENABLED` | Bật/tắt CAPTCHA | `false` |
| `APP_URL` | URL frontend | `http://localhost:5173` |

### Cấu hình Gmail SMTP

1. Bật **Xác minh 2 bước** cho tài khoản Google
2. Tạo **App Password**: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Điền App Password vào `SMTP_PASS` trong file `.env`

## API Endpoints

### Public API

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/questions` | Lấy danh sách 60 câu hỏi |
| `POST` | `/api/surveys/submit` | Nộp bài + thông tin cá nhân |
| `GET` | `/api/results/:token` | Xem kết quả theo token |
| `POST` | `/api/results/:token/send-email` | Gửi lại email kết quả |
| `GET` | `/api/careers/recommendations?code=XXX` | Gợi ý ngành nghề theo mã Holland |

### Định dạng Response

Tất cả API trả về JSON theo định dạng:

```json
{
  "success": true,
  "data": { ... }
}
```

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mô tả lỗi"
  }
}
```

## 6 Nhóm Holland (RIASEC)

| Ký hiệu | Nhóm | Tính cách |
|---------|------|-----------|
| **R** | Realistic | Kỹ thuật, thực tế, thích làm việc với máy móc |
| **I** | Investigative | Nghiên cứu, phân tích, tư duy logic |
| **A** | Artistic | Nghệ thuật, sáng tạo, thích đổi mới |
| **S** | Social | Xã hội, thích giúp đỡ, làm việc nhóm |
| **E** | Enterprising | Quản lý, kinh doanh, lãnh đạo |
| **C** | Conventional | Quy củ, tổ chức, làm việc với dữ liệu |

## Lệnh Hữu Ích

```bash
# Kiểm tra MySQL
docker exec holland-mysql mysql -uroot -pholland123 --default-character-set=utf8mb4 holland_career_test -e "SELECT COUNT(*) FROM questions;"

# Khởi động lại MySQL container
docker restart holland-mysql

# Build frontend production
cd frontend && npm run build

# Xóa và tạo lại database
docker exec holland-mysql mysql -uroot -pholland123 -e "DROP DATABASE holland_career_test; CREATE DATABASE holland_career_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

**Phiên bản:** 1.0.0 | **Phase:** 1 — Core Survey
