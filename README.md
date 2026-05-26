<p align="center">
  <h1 align="center">🎯 Holland/RIASEC Career Assessment</h1>
  <p align="center">
    <strong>Trắc nghiệm Hướng nghiệp Chuyên nghiệp</strong><br/>
    <em>Professional Career Guidance Platform</em>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version 1.0.0"/>
  <img src="https://img.shields.io/badge/react-18-61DAFB?logo=react" alt="React 18"/>
  <img src="https://img.shields.io/badge/node-18+-339933?logo=node.js" alt="Node.js 18+"/>
  <img src="https://img.shields.io/badge/mysql-8.0-4479A1?logo=mysql" alt="MySQL 8.0"/>
  <img src="https://img.shields.io/badge/tailwind-3-06B6D4?logo=tailwindcss" alt="Tailwind CSS 3"/>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License MIT"/>
</p>

---

## 📖 Giới thiệu

**Holland/RIASEC Career Assessment** là nền tảng trắc nghiệm hướng nghiệp trực tuyến, xây dựng dựa trên lý thuyết Holland (RIASEC) — một trong những mô hình đánh giá tính cách nghề nghiệp được sử dụng rộng rãi nhất trên thế giới. Hệ thống giúp học sinh, sinh viên và người đi làm khám phá bản thân, xác định nhóm ngành nghề phù hợp và nhận định hướng phát triển nghề nghiệp cá nhân hóa.

### ✨ Điểm nổi bật

- **60 câu hỏi chuẩn Holland** — Đánh giá 6 nhóm tính cách (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) với thang đo Likert 5 mức
- **Kết quả tức thì** — Biểu đồ trực quan, mã Holland 3 ký tự, mô tả tính cách chi tiết
- **Gợi ý nghề nghiệp thông minh** — 31 ngành nghề phổ biến tại Việt Nam, ánh xạ theo mã Holland
- **Email kết quả chuyên nghiệp** — Template HTML responsive, gửi tự động sau khi hoàn thành
- **Xuất báo cáo PDF** — Tải kết quả dạng PDF ngay trên trình duyệt
- **Bảo mật dữ liệu** — Mã token 64 ký tự, JWT, Helmet, Rate Limiting
- **Responsive 100%** — Giao diện mobile-first, tối ưu cho học sinh trên điện thoại

---

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  React 18 SPA · Tailwind CSS · Recharts · jsPDF         │
│  React Router · React Hook Form · Axios                 │
└────────────────────┬────────────────────────────────────┘
                     │  HTTP/REST (JSON)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Express API Server (:3000)               │
│  Helmet · CORS · Rate Limiter · Input Validator         │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │Controllers│ Services │  Models  │  Utils   │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│  Survey · Holland Scoring · Email · PDF · Auth          │
└────────────────────┬────────────────────────────────────┘
                     │  mysql2 (Connection Pool)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   MySQL 8.0 (:3306)                      │
│  users · questions · answers · test_results             │
│  careers · email_logs · admins                          │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 External Services                        │
│  Gmail SMTP (Nodemailer) · CAPTCHA · JWT               │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu trúc Dự án

```
Holland/
├── frontend/                           # React SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── pages/                      # HomePage, TestPage, InfoPage, ResultPage
│   │   ├── components/
│   │   │   ├── ui/                     # Button, Card, ProgressBar, Toast, LoadingSpinner
│   │   │   └── layout/                # Header, Footer, Layout
│   │   ├── hooks/                      # useQuestions, useLocalStorage
│   │   └── services/                   # Axios API client
│   ├── index.html                      # Entry HTML với SEO meta tags
│   ├── vite.config.js                  # Vite + API proxy
│   └── tailwind.config.js              # Custom colors: primary, holland R/I/A/S/E/C
│
├── backend/                            # Express REST API
│   ├── src/
│   │   ├── config/                     # db.js, env.js, nodemailer.js
│   │   ├── models/                     # userModel, questionModel, answerModel, resultModel...
│   │   ├── services/
│   │   │   ├── hollandService.js       # Tính điểm, xếp hạng, mã Holland, tie-breaking
│   │   │   └── emailService.js         # Template HTML email, gửi SMTP, log trạng thái
│   │   ├── middleware/                 # errorHandler, rateLimiter, validators
│   │   └── routes/                     # publicRoutes.js (5 endpoints)
│   ├── server.js                       # Entry point
│   └── .env.example                    # Mẫu cấu hình môi trường
│
├── database/
│   ├── migrations/                     # 001_create_tables.sql (7 bảng, indexes, FKs)
│   └── seeds/                          # 60 câu hỏi Holland + 31 ngành nghề (Tiếng Việt)
│
├── docs/superpowers/
│   ├── specs/                          # Đặc tả thiết kế (Design Spec)
│   └── plans/                          # Kế hoạch triển khai (Implementation Plan)
│
└── README.md
```

---

## 🧠 Mô hình Holland (RIASEC)

Lý thuyết Holland phân loại tính cách nghề nghiệp thành 6 nhóm. Mỗi người có một tổ hợp 3 nhóm nổi trội, tạo thành **mã Holland 3 ký tự** (ví dụ: IAS, SEC, RIA).

| Ký hiệu | Nhóm | Mô tả | Ngành nghề tiêu biểu |
|:-------:|------|-------|---------------------|
| **R** | Realistic | Thực tế, thích làm việc với máy móc, công cụ | Kỹ thuật, Cơ khí, Nông nghiệp, Xây dựng |
| **I** | Investigative | Nghiên cứu, phân tích, tư duy logic | Khoa học, Y Dược, Công nghệ thông tin |
| **A** | Artistic | Sáng tạo, nghệ thuật, thích đổi mới | Kiến trúc, Thiết kế, Báo chí, Nghệ thuật |
| **S** | Social | Xã hội, thích giúp đỡ, làm việc nhóm | Giáo dục, Tâm lý, Công tác xã hội, Y tế |
| **E** | Enterprising | Quản lý, kinh doanh, lãnh đạo | Kinh doanh, Marketing, Luật, Quản trị |
| **C** | Conventional | Quy củ, tổ chức, làm việc với dữ liệu | Kế toán, Tài chính, Hành chính, Ngân hàng |

**Quy tắc xếp hạng:** Khi điểm bằng nhau, thứ tự ưu tiên: R → I → A → S → E → C.

---

## 🚀 Cài đặt

### Yêu cầu

| Công cụ | Phiên bản |
|---------|-----------|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| MySQL | 8.0 (Docker hoặc native) |

### Cài đặt nhanh

```bash
# 1. Clone repository
git clone https://github.com/ntanh80/holland-career-recommender.git
cd holland-career-recommender/Holland

# 2. Khởi động MySQL (Docker)
docker run -d --name holland-mysql \
  -e MYSQL_ROOT_PASSWORD=holland123 \
  -e MYSQL_DATABASE=holland_career_test \
  -p 3306:3306 mysql:8.0

# 3. Tạo bảng & nhập dữ liệu
docker exec -i holland-mysql mysql -uroot -pholland123 \
  --default-character-set=utf8mb4 < database/migrations/001_create_tables.sql

docker exec -i holland-mysql mysql -uroot -pholland123 \
  --default-character-set=utf8mb4 holland_career_test < database/seeds/001_questions_and_careers.sql

# 4. Cài đặt & chạy Backend
cd backend
npm install
cp .env.example .env   # Chỉnh sửa SMTP credentials nếu cần
npm run dev             # Chạy tại http://localhost:3000

# 5. Cài đặt & chạy Frontend (terminal mới)
cd frontend
npm install
npm run dev             # Chạy tại http://localhost:5173
```

**Truy cập:** mở trình duyệt → **http://localhost:5173**

---

## ⚙️ Cấu hình

### Biến môi trường (`backend/.env`)

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | `holland123` |
| `DB_NAME` | Database name | `holland_career_test` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Gmail address | *(cần cấu hình)* |
| `SMTP_PASS` | Gmail App Password | *(cần cấu hình)* |
| `JWT_SECRET` | JWT signing key | *(đổi thành chuỗi ngẫu nhiên)* |
| `CAPTCHA_ENABLED` | Bật/tắt CAPTCHA | `false` |
| `APP_URL` | Frontend URL | `http://localhost:5173` |

### Cấu hình Gmail SMTP

> **Quan trọng:** Google yêu cầu **App Password** thay vì mật khẩu thông thường để gửi email qua SMTP.

1. Bật **Xác minh 2 bước** cho tài khoản Google: [myaccount.google.com/security](https://myaccount.google.com/security)
2. Tạo **App Password** cho ứng dụng "Mail": [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Điền App Password vào `SMTP_PASS` trong `backend/.env`

---

## 📡 API Reference

### Public Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/questions` | Danh sách 60 câu hỏi (active, sắp xếp) |
| `POST` | `/api/surveys/submit` | Nộp bài + thông tin → tính điểm, gửi email |
| `GET` | `/api/results/:token` | Xem kết quả theo token tra cứu |
| `POST` | `/api/results/:token/send-email` | Gửi lại email kết quả |
| `GET` | `/api/careers/recommendations?code=RIA` | Gợi ý ngành nghề theo mã Holland |

### Rate Limiting

- Public API chung: **30 requests/phút/IP**
- Nộp bài khảo sát: **5 requests/phút/IP**

---

## 🖥️ Frontend Routes

| Path | Page | Mô tả |
|------|------|-------|
| `/` | HomePage | Hero, giới thiệu 6 nhóm Holland, CTA bắt đầu |
| `/test` | TestPage | 60 câu hỏi phân trang, thang Likert 1-5, lưu localStorage |
| `/info` | InfoPage | Form thông tin cá nhân (họ tên, email, trường, tỉnh...) |
| `/result/:token` | ResultPage | Biểu đồ cột + radar, mã Holland, gợi ý nghề nghiệp, tải PDF, gửi email |

---

## 🛡️ Bảo mật

- **Helmet** — HTTP security headers (CSP, X-Frame-Options, XSS protection...)
- **CORS** — Chỉ cho phép origin được cấu hình trong `.env`
- **Rate Limiting** — Giới hạn 30 req/phút/public API, 5 req/phút/submit
- **Input Validation** — express-validator server-side, React Hook Form client-side
- **JWT** — Xác thực admin (Phase 2), JWT_SECRET cấu hình qua .env
- **Bcrypt** — Mã hóa mật khẩu admin (Phase 2)
- **Result Token** — Chuỗi ngẫu nhiên 64 ký tự hex, bảo vệ quyền truy cập kết quả
- **CAPTCHA** — Chống spam, có thể bật/tắt trong .env
- **Không lưu plain-text password** — Tất cả mật khẩu được hash bằng bcrypt

---

## 📊 Database Schema

```sql
-- 7 bảng chính
users          -- Người làm khảo sát (full_name, email, phone, province...)
questions      -- 60 câu hỏi Holland (content, holland_type, order_number)
answers        -- Câu trả lời (user_id FK, question_id FK, answer_value 1-5)
test_results   -- Kết quả (score R/I/A/S/E/C, holland_code, result_token)
careers        -- Ngành nghề gợi ý (holland_code, career_name, major_group...)
email_logs     -- Lịch sử gửi email (status: pending/sent/failed)
admins         -- Tài khoản quản trị (username, password_hash, role)
```

---

---

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh. Vui lòng tạo Issue hoặc Pull Request trên GitHub.

---

## 📄 License

MIT License — Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

<p align="center">
  <strong>Developed with ❤️ for Career Guidance & Education</strong><br/>
  <sub>Holland/RIASEC Career Assessment Platform</sub>
</p>
