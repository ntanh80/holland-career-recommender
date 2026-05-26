# Holland/RIASEC Career Test - Phase 1 Design Spec

**Date:** 2026-05-26
**Phase:** 1 - Core Survey
**Status:** Approved

---

## Overview

Website trắc nghiệm hướng nghiệp Holland/RIASEC cho học sinh, sinh viên. Người dùng làm bài test 60 câu, hệ thống tính điểm 6 nhóm tính cách nghề nghiệp (R-I-A-S-E-C), hiển thị kết quả kèm gợi ý ngành nghề và gửi email kết quả.

**Phase 1 scope:** Toàn bộ flow người dùng công khai — làm test → nhập thông tin → xem kết quả → nhận email.

**Out of scope (Phase 2+):** Admin panel, thống kê, xuất Excel hàng loạt, Docker, SEO nâng cao.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MySQL 8 |
| Email | Nodemailer + Gmail SMTP |
| Charts | Recharts |
| Forms | React Hook Form |
| HTTP Client | Axios |
| PDF Export | jsPDF (client-side) |
| CAPTCHA | Math CAPTCHA (Phase 1) |

---

## Architecture

```
Browser (React SPA)
    │
    ├── GET /api/questions
    ├── POST /api/surveys/submit     (answers + user_info → result + email)
    ├── GET /api/results/:token
    ├── POST /api/results/:token/send-email
    └── GET /api/careers/recommendations?code=IAS
            │
            ▼
    Express Server (Node.js)
            │
            ├── Controllers (validate, orchestrate)
            ├── Services (holland scoring, email, pdf)
            └── Models (SQL queries)
                    │
                    ▼
              MySQL 8
```

---

## Database Tables (Phase 1)

- **users** — full_name, email, phone, interested_career, user_type, school, class_name, province, consent_status, ip_address
- **questions** — content, holland_type (R/I/A/S/E/C), order_number, is_active
- **answers** — user_id FK, question_id FK, answer_value (1-5)
- **test_results** — score_r/i/a/s/e/c, holland_code (3 chars), top_1/2/3, result_token (64 char random)
- **email_logs** — user_id FK, result_id FK, email, subject, status (pending/sent/failed), error_message, sent_at

**Tie-breaking rule:** When scores are equal, priority order is R > I > A > S > E > C.

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/questions | Public | Get active questions sorted |
| POST | /api/surveys/submit | Public | Submit answers + user info, calculate scores, send email |
| GET | /api/results/:token | Public | Get result by token |
| POST | /api/results/:token/send-email | Public | Resend result email |
| GET | /api/careers/recommendations | Public | Get careers for holland code |

All responses follow: `{ success: bool, data?: {}, error?: { code, message } }`

---

## Frontend Routes

| Path | Page | Description |
|------|------|-------------|
| / | HomePage | Hero, 6 nhóm Holland, nút bắt đầu |
| /test | TestPage | 60 câu hỏi, progress bar, lưu localStorage |
| /info | InfoPage | Form thông tin cá nhân (sau khi làm test) |
| /result/:token | ResultPage | Điểm, biểu đồ, mô tả, ngành nghề, tải PDF |

---

## Key Design Decisions

1. **localStorage cho answers tạm** — Tránh mất dữ liệu khi reload. Chỉ submit khi người dùng hoàn thành.
2. **Submit 1 lần** — Cả answers + user info gửi trong 1 request POST /api/surveys/submit. Không tách riêng.
3. **result_token** — Chuỗi random 64 byte hex. Là key bảo mật duy nhất để xem lại kết quả.
4. **Email async** — Gửi email không block response API. Nếu fail, vẫn return kết quả + ghi log lỗi.
5. **PDF client-side** — Dùng jsPDF tạo PDF ngay trên browser từ dữ liệu kết quả, không cần server generate.

---

## Seed Data

60 câu hỏi Holland chuẩn, 10 câu/nhóm, mỗi câu trả lời theo thang Likert 5 mức (1-5). Career recommendations với ~30 ngành nghề phổ biến tại Việt Nam, map theo 3-letter Holland code.

---

## Non-functional Requirements

- Responsive 100% (mobile-first)
- Rate limiting: 30 req/phút/IP cho public API
- Input validation: server-side với express-validator
- Helmet + CORS configured
- .env.example với đầy đủ biến môi trường
- Logging qua console (Winston trong Phase 3)
