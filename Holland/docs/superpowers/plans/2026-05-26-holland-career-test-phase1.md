# Holland/RIASEC Career Test - Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Holland/RIASEC career assessment website where users take a 60-question test, receive scored results with career suggestions, and get results via email.

**Architecture:** React Vite SPA frontend communicates with Express REST API backend. MySQL stores users, questions, answers, results, and email logs. Holland scoring runs server-side. Email sent async via Nodemailer + Gmail SMTP. PDF generated client-side with jsPDF.

**Tech Stack:** React 18, Vite, Tailwind CSS, Recharts, React Router v6, Axios, jsPDF | Node.js, Express, mysql2, Nodemailer, express-validator, helmet, cors, express-rate-limit | MySQL 8

---

### Task 1: Database Schema & Seed Data

**Files:**
- Create: `database/migrations/001_create_tables.sql`
- Create: `database/seeds/001_questions_and_careers.sql`

- [ ] **Step 1: Create database schema SQL**

```sql
-- database/migrations/001_create_tables.sql
CREATE DATABASE IF NOT EXISTS holland_career_test
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE holland_career_test;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  interested_career VARCHAR(255) NULL,
  user_type ENUM('hoc_sinh','sinh_vien','phu_huynh','giao_vien','nguoi_di_lam','khac') NOT NULL,
  school VARCHAR(255) NULL,
  class_name VARCHAR(100) NULL,
  province VARCHAR(100) NOT NULL,
  consent_status TINYINT(1) NOT NULL DEFAULT 0,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_province (province),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  holland_type ENUM('R','I','A','S','E','C') NOT NULL,
  order_number INT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_holland_type (holland_type),
  INDEX idx_order (order_number),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  answer_value TINYINT NOT NULL CHECK (answer_value BETWEEN 1 AND 5),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE test_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  score_r INT NOT NULL DEFAULT 0,
  score_i INT NOT NULL DEFAULT 0,
  score_a INT NOT NULL DEFAULT 0,
  score_s INT NOT NULL DEFAULT 0,
  score_e INT NOT NULL DEFAULT 0,
  score_c INT NOT NULL DEFAULT 0,
  holland_code VARCHAR(3) NOT NULL,
  top_1 ENUM('R','I','A','S','E','C') NOT NULL,
  top_2 ENUM('R','I','A','S','E','C') NOT NULL,
  top_3 ENUM('R','I','A','S','E','C') NOT NULL,
  result_token VARCHAR(64) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE INDEX idx_result_token (result_token),
  INDEX idx_holland_code (holland_code),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  result_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NULL,
  status ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  error_message TEXT NULL,
  sent_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (result_id) REFERENCES test_results(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE careers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  holland_code VARCHAR(3) NOT NULL,
  career_name VARCHAR(255) NOT NULL,
  major_group VARCHAR(255) NOT NULL,
  description TEXT NULL,
  required_skills TEXT NULL,
  learning_suggestion TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_holland_code (holland_code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin','admin') NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- [ ] **Step 2: Create seed data with 60 Holland questions (10 per type)**

```sql
-- database/seeds/001_questions_and_careers.sql
USE holland_career_test;

-- ==================== R: Realistic (10 câu) ====================
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích làm việc với máy móc, công cụ hoặc thiết bị kỹ thuật.', 'R', 1),
('Tôi thích các hoạt động ngoài trời và làm việc với cây cối, động vật.', 'R', 2),
('Tôi có khả năng sửa chữa đồ điện, máy móc hoặc thiết bị trong nhà.', 'R', 3),
('Tôi thích làm việc với các vật thể cụ thể hơn là ý tưởng trừu tượng.', 'R', 4),
('Tôi thích công việc đòi hỏi kỹ năng vận động và khéo léo tay chân.', 'R', 5),
('Tôi thích xây dựng hoặc lắp ráp mọi thứ theo bản vẽ hoặc hướng dẫn.', 'R', 6),
('Tôi thích làm việc trong môi trường rõ ràng, có quy trình cụ thể.', 'R', 7),
('Tôi thích vận hành máy móc, thiết bị hơn là làm việc với con người.', 'R', 8),
('Tôi thích các công việc thực tế, tạo ra sản phẩm hữu hình.', 'R', 9),
('Tôi có xu hướng giải quyết vấn đề bằng cách hành động thực tế.', 'R', 10);

-- ==================== I: Investigative (10 câu) ====================
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích tìm hiểu nguyên nhân và cách thức hoạt động của sự vật.', 'I', 11),
('Tôi thích giải các bài toán, câu đố hoặc vấn đề logic phức tạp.', 'I', 12),
('Tôi thích đọc sách khoa học và tìm hiểu các lý thuyết mới.', 'I', 13),
('Tôi thích làm thí nghiệm hoặc nghiên cứu để kiểm chứng giả thuyết.', 'I', 14),
('Tôi có khả năng phân tích dữ liệu và rút ra kết luận logic.', 'I', 15),
('Tôi thích làm việc độc lập để suy nghĩ và nghiên cứu chuyên sâu.', 'I', 16),
('Tôi tò mò về thế giới tự nhiên và các hiện tượng khoa học.', 'I', 17),
('Tôi thích sử dụng máy tính để phân tích và xử lý thông tin.', 'I', 18),
('Tôi thích khám phá những ý tưởng mới, ngay cả khi chúng trừu tượng.', 'I', 19),
('Tôi có xu hướng suy nghĩ logic và hệ thống khi giải quyết vấn đề.', 'I', 20);

-- ==================== A: Artistic (10 câu) ====================
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích sáng tạo nghệ thuật như vẽ, viết, âm nhạc hoặc thiết kế.', 'A', 21),
('Tôi thích thể hiện bản thân qua các hình thức nghệ thuật.', 'A', 22),
('Tôi có trí tưởng tượng phong phú và thường nghĩ ra ý tưởng mới.', 'A', 23),
('Tôi thích làm việc trong môi trường tự do, không gò bó.', 'A', 24),
('Tôi đánh giá cao cái đẹp và thẩm mỹ trong cuộc sống.', 'A', 25),
('Tôi thích tạo ra những thứ độc đáo, không theo khuôn mẫu.', 'A', 26),
('Tôi thích viết lách, sáng tác truyện hoặc làm thơ.', 'A', 27),
('Tôi thích thiết kế đồ họa, thời trang hoặc nội thất.', 'A', 28),
('Tôi cảm thấy thoải mái khi được tự do sáng tạo không giới hạn.', 'A', 29),
('Tôi thích khám phá các hình thức nghệ thuật và văn hóa mới.', 'A', 30);

-- ==================== S: Social (10 câu) ====================
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích giúp đỡ người khác giải quyết vấn đề cá nhân của họ.', 'S', 31),
('Tôi thích dạy học, hướng dẫn hoặc đào tạo người khác.', 'S', 32),
('Tôi thích làm việc nhóm và hợp tác với mọi người.', 'S', 33),
('Tôi có khả năng lắng nghe và thấu hiểu cảm xúc của người khác.', 'S', 34),
('Tôi thích tham gia các hoạt động tình nguyện và công tác xã hội.', 'S', 35),
('Tôi thích chăm sóc và hỗ trợ người khác khi họ gặp khó khăn.', 'S', 36),
('Tôi thích giao tiếp và kết nối với nhiều người khác nhau.', 'S', 37),
('Tôi thích làm việc trong môi trường đề cao sự hợp tác và chia sẻ.', 'S', 38),
('Tôi có khả năng hòa giải mâu thuẫn và tạo sự đồng thuận trong nhóm.', 'S', 39),
('Tôi cảm thấy hài lòng khi giúp đỡ người khác phát triển và thành công.', 'S', 40);

-- ==================== E: Enterprising (10 câu) ====================
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích lãnh đạo nhóm và đưa ra quyết định quan trọng.', 'E', 41),
('Tôi thích thuyết phục người khác và đàm phán để đạt được mục tiêu.', 'E', 42),
('Tôi thích kinh doanh và tạo ra các dự án mới.', 'E', 43),
('Tôi có tham vọng và đặt mục tiêu cao trong sự nghiệp.', 'E', 44),
('Tôi thích cạnh tranh và chinh phục thử thách.', 'E', 45),
('Tôi có khả năng nói trước đám đông và trình bày ý tưởng.', 'E', 46),
('Tôi thích quản lý dự án và điều phối nguồn lực.', 'E', 47),
('Tôi thích chấp nhận rủi ro có tính toán để đạt được thành công.', 'E', 48),
('Tôi thích xây dựng mạng lưới quan hệ và kết nối kinh doanh.', 'E', 49),
('Tôi có xu hướng chủ động nắm bắt cơ hội và tạo ra thay đổi.', 'E', 50);

-- ==================== C: Conventional (10 câu) ====================
INSERT INTO questions (content, holland_type, order_number) VALUES
('Tôi thích làm việc với dữ liệu, con số và thông tin chi tiết.', 'C', 51),
('Tôi thích tổ chức, sắp xếp và phân loại thông tin một cách hệ thống.', 'C', 52),
('Tôi thích làm việc theo quy trình, quy định rõ ràng.', 'C', 53),
('Tôi có tính cẩn thận, tỉ mỉ và chú ý đến chi tiết.', 'C', 54),
('Tôi thích công việc ổn định, có cấu trúc và dự đoán được.', 'C', 55),
('Tôi thích lưu trữ hồ sơ, quản lý tài liệu và dữ liệu.', 'C', 56),
('Tôi thích làm việc với các biểu mẫu, bảng tính và cơ sở dữ liệu.', 'C', 57),
('Tôi có khả năng hoàn thành công việc đúng hạn và chính xác.', 'C', 58),
('Tôi thích tuân thủ các tiêu chuẩn và quy tắc đã được thiết lập.', 'C', 59),
('Tôi có xu hướng lập kế hoạch chi tiết trước khi hành động.', 'C', 60);

-- ==================== Career Seed Data (30 careers) ====================
INSERT INTO careers (holland_code, career_name, major_group, description, required_skills, learning_suggestion) VALUES
-- R codes
('RIA', 'Kỹ sư cơ khí', 'Kỹ thuật - Công nghệ', 'Thiết kế, chế tạo và bảo trì hệ thống cơ khí.', 'Tư duy kỹ thuật, giải quyết vấn đề, CAD/CAM', 'Đại học ngành Kỹ thuật Cơ khí, Cơ điện tử.'),
('RIS', 'Kỹ thuật viên phòng thí nghiệm', 'Khoa học - Kỹ thuật', 'Vận hành thiết bị thí nghiệm, phân tích mẫu, ghi chép kết quả.', 'Tỉ mỉ, chính xác, kỹ năng phân tích', 'Cao đẳng/Đại học ngành Kỹ thuật Hóa, Sinh, hoặc Xét nghiệm.'),
('RIE', 'Kỹ sư điện', 'Kỹ thuật - Công nghệ', 'Thiết kế và vận hành hệ thống điện, mạch điện tử.', 'Phân tích mạch, lập trình nhúng, an toàn điện', 'Đại học ngành Kỹ thuật Điện, Điện tử.'),
('RCA', 'Thợ thủ công mỹ nghệ', 'Nghệ thuật - Thủ công', 'Chế tác sản phẩm thủ công từ gỗ, gốm, kim loại.', 'Khéo tay, thẩm mỹ, kiên nhẫn', 'Học nghề, Cao đẳng Mỹ thuật Công nghiệp.'),
('REC', 'Quản lý sản xuất', 'Quản lý - Kỹ thuật', 'Điều phối quy trình sản xuất, đảm bảo chất lượng và tiến độ.', 'Lập kế hoạch, quản lý nhân sự, hiểu biết kỹ thuật', 'Đại học Quản lý Công nghiệp, Kỹ thuật Hệ thống Công nghiệp.'),

-- I codes
('IAR', 'Nhà nghiên cứu sinh học', 'Khoa học Tự nhiên', 'Nghiên cứu sinh vật sống, hệ sinh thái và quá trình sinh học.', 'Phương pháp nghiên cứu, phân tích dữ liệu, kiên trì', 'Đại học và sau đại học ngành Sinh học, Công nghệ Sinh học.'),
('IRS', 'Bác sĩ đa khoa', 'Y tế - Sức khỏe', 'Chẩn đoán và điều trị bệnh, chăm sóc sức khỏe cộng đồng.', 'Chẩn đoán, giao tiếp, ra quyết định', 'Đại học Y khoa (6 năm) + thực hành lâm sàng.'),
('IAC', 'Phân tích viên dữ liệu', 'CNTT - Dữ liệu', 'Thu thập, xử lý và phân tích dữ liệu để đưa ra insight kinh doanh.', 'SQL, Python/R, thống kê, trực quan hóa dữ liệu', 'Đại học ngành Khoa học Dữ liệu, Thống kê, CNTT.'),
('ISE', 'Nhà tư vấn chiến lược', 'Kinh doanh - Tư vấn', 'Phân tích vấn đề kinh doanh và đề xuất giải pháp chiến lược.', 'Phân tích, giải quyết vấn đề, thuyết trình, Excel, PowerPoint', 'Đại học Kinh tế, Quản trị Kinh doanh, MBA.'),
('ICR', 'Nhà phân tích tài chính', 'Tài chính - Ngân hàng', 'Phân tích báo cáo tài chính, đánh giá đầu tư, dự báo xu hướng.', 'Phân tích định lượng, mô hình tài chính, CFA', 'Đại học Tài chính, Kế toán, Kinh tế.'),

-- A codes
('AIS', 'Thiết kế đồ họa', 'Nghệ thuật - Truyền thông', 'Sáng tạo hình ảnh, bố cục và thiết kế cho truyền thông.', 'Adobe Creative Suite, typography, sáng tạo, giao tiếp', 'Đại học/Cao đẳng Thiết kế Đồ họa, Mỹ thuật.'),
('ASE', 'Nhà biên kịch / Viết nội dung', 'Truyền thông - Báo chí', 'Sáng tạo nội dung cho phim, quảng cáo, truyền thông số.', 'Viết lách, kể chuyện, sáng tạo, nghiên cứu', 'Đại học Báo chí, Truyền thông, Văn học.'),
('AEC', 'Kiến trúc sư', 'Xây dựng - Kiến trúc', 'Thiết kế công trình, không gian sống và cảnh quan.', 'Thiết kế 3D, vẽ kỹ thuật, sáng tạo, toán học', 'Đại học Kiến trúc (5 năm).'),
('ARI', 'Nhà thiết kế thời trang', 'Nghệ thuật - Thời trang', 'Sáng tạo và thiết kế trang phục, phụ kiện thời trang.', 'Sáng tạo, kỹ thuật may, xu hướng thị trường', 'Đại học/Cao đẳng Thiết kế Thời trang.'),
('AIS', 'Giáo viên nghệ thuật', 'Giáo dục - Nghệ thuật', 'Giảng dạy và truyền cảm hứng nghệ thuật cho học sinh.', 'Sư phạm, sáng tạo, giao tiếp, kiên nhẫn', 'Đại học Sư phạm Mỹ thuật, Giáo dục Nghệ thuật.'),

-- S codes
('SAI', 'Nhà tâm lý học', 'Khoa học Xã hội', 'Nghiên cứu hành vi con người, tư vấn và trị liệu tâm lý.', 'Lắng nghe, phân tích, thấu cảm, đạo đức nghề nghiệp', 'Đại học và sau đại học Tâm lý học, Công tác Xã hội.'),
('SIR', 'Nhân viên y tế công cộng', 'Y tế - Sức khỏe', 'Tổ chức chương trình sức khỏe cộng đồng, phòng chống dịch bệnh.', 'Tổ chức, giao tiếp, kiến thức y tế, nghiên cứu', 'Đại học Y tế Công cộng, Điều dưỡng Cộng đồng.'),
('SEA', 'Tư vấn viên du học', 'Giáo dục - Tư vấn', 'Tư vấn lộ trình du học, hồ sơ, chọn trường và ngành học.', 'Giao tiếp, tổ chức, kiến thức giáo dục quốc tế, ngoại ngữ', 'Đại học Quan hệ Quốc tế, Giáo dục, Ngoại ngữ.'),
('SCE', 'Nhân sự (HR)', 'Quản trị - Nhân sự', 'Tuyển dụng, đào tạo và phát triển nguồn nhân lực cho tổ chức.', 'Giao tiếp, tổ chức, am hiểu luật lao động, Excel', 'Đại học Quản trị Nhân lực, Kinh tế Lao động.'),
('SAC', 'Giáo viên tiểu học', 'Giáo dục - Sư phạm', 'Giảng dạy và phát triển toàn diện cho trẻ em bậc tiểu học.', 'Sư phạm, kiên nhẫn, sáng tạo, giao tiếp', 'Đại học Sư phạm Tiểu học, Giáo dục Tiểu học.'),

-- E codes
('ESR', 'Giám đốc kinh doanh', 'Kinh doanh - Quản lý', 'Xây dựng chiến lược và điều hành hoạt động kinh doanh của doanh nghiệp.', 'Lãnh đạo, chiến lược, tài chính, đàm phán', 'Đại học Quản trị Kinh doanh, MBA.'),
('EIA', 'Trưởng phòng Marketing', 'Marketing - Truyền thông', 'Xây dựng chiến lược marketing và quản lý đội ngũ thực thi.', 'Sáng tạo, phân tích thị trường, lãnh đạo, digital marketing', 'Đại học Marketing, Quản trị Kinh doanh, Truyền thông.'),
('ERC', 'Bất động sản viên (Real Estate Agent)', 'Kinh doanh - Bất động sản', 'Môi giới, tư vấn mua bán và cho thuê bất động sản.', 'Giao tiếp, đàm phán, kiến thức thị trường, mạng lưới', 'Chứng chỉ hành nghề, Đại học Kinh tế, Quản trị Kinh doanh.'),
('EAS', 'Tổ chức sự kiện', 'Dịch vụ - Sự kiện', 'Lên kế hoạch và điều phối tổ chức sự kiện, hội nghị, tiệc.', 'Tổ chức, sáng tạo, quản lý ngân sách, giao tiếp', 'Đại học Quản trị Sự kiện, Du lịch.'),
('ECI', 'Chuyên viên ngân hàng', 'Tài chính - Ngân hàng', 'Tư vấn và cung cấp dịch vụ tài chính, tín dụng cho khách hàng.', 'Phân tích tài chính, giao tiếp, chính xác, tin học văn phòng', 'Đại học Tài chính Ngân hàng, Kinh tế.'),

-- C codes
('CEI', 'Kế toán viên', 'Tài chính - Kế toán', 'Ghi chép, phân tích và báo cáo tài chính cho doanh nghiệp.', 'Tỉ mỉ, chính xác, Excel, phần mềm kế toán, luật thuế', 'Đại học Kế toán, Kiểm toán; chứng chỉ ACCA, CPA.'),
('CRS', 'Nhân viên hành chính văn phòng', 'Hành chính - Văn phòng', 'Quản lý hồ sơ, lịch làm việc và hỗ trợ hoạt động văn phòng.', 'Tổ chức, tin học văn phòng, giao tiếp, quản lý thời gian', 'Cao đẳng/Đại học Quản trị Văn phòng, Hành chính.'),
('CIR', 'Kiểm toán viên', 'Tài chính - Kiểm toán', 'Kiểm tra và xác nhận tính chính xác của báo cáo tài chính.', 'Phân tích, tỉ mỉ, kiến thức kế toán, đạo đức nghề nghiệp', 'Đại học Kiểm toán, Kế toán; chứng chỉ ACCA, CPA, CIA.'),
('CSE', 'Quản lý chất lượng', 'Sản xuất - Chất lượng', 'Thiết lập và giám sát hệ thống quản lý chất lượng sản phẩm.', 'ISO, quy trình, phân tích, báo cáo, giải quyết vấn đề', 'Đại học Quản lý Công nghiệp, Kỹ thuật Hệ thống, Chất lượng.'),
('CAE', 'Nhà lập kế hoạch tài chính', 'Tài chính - Kế hoạch', 'Tư vấn và lập kế hoạch tài chính cá nhân dài hạn cho khách hàng.', 'Phân tích, lập kế hoạch, kiến thức đầu tư, giao tiếp', 'Đại học Tài chính, Kinh tế; chứng chỉ CFP.'),

-- Mixed/common codes
('SIA', 'Nhà nghiên cứu giáo dục', 'Giáo dục - Nghiên cứu', 'Nghiên cứu phương pháp giáo dục và phát triển chương trình học.', 'Nghiên cứu, phân tích, viết báo cáo, sư phạm', 'Sau đại học Giáo dục học, Nghiên cứu Giáo dục.');
```

- [ ] **Step 3: Commit database files**

```bash
git add database/migrations/001_create_tables.sql database/seeds/001_questions_and_careers.sql
git commit -m "feat: add database schema and seed data for Holland career test"
```

---

### Task 2: Backend Foundation - Package & Config

**Files:**
- Create: `backend/package.json`
- Create: `backend/.env.example`
- Create: `backend/src/config/env.js`
- Create: `backend/src/config/db.js`
- Create: `backend/src/config/nodemailer.js`

- [ ] **Step 1: Create backend package.json**

```json
{
  "name": "holland-career-test-backend",
  "version": "1.0.0",
  "description": "Backend API for Holland/RIASEC Career Assessment",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "express-rate-limit": "^7.4.0",
    "express-validator": "^7.2.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.11.0",
    "nodemailer": "^6.9.15",
    "uuid": "^10.0.0"
  }
}
```

- [ ] **Step 2: Create .env.example**

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=holland_career_test

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

JWT_SECRET=change-me-to-random-string
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:5173
PORT=3000
NODE_ENV=development

CAPTCHA_ENABLED=false
```

- [ ] **Step 3: Create config/env.js**

```js
// backend/src/config/env.js
require('dotenv').config();

const env = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'holland_career_test',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  captchaEnabled: process.env.CAPTCHA_ENABLED === 'true',
};

module.exports = env;
```

- [ ] **Step 4: Create config/db.js**

```js
// backend/src/config/db.js
const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

pool.getConnection()
  .then(conn => {
    console.log('Database connected');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

module.exports = pool;
```

- [ ] **Step 5: Create config/nodemailer.js**

```js
// backend/src/config/nodemailer.js
const nodemailer = require('nodemailer');
const env = require('./env');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

transporter.verify()
  .then(() => console.log('Email transporter ready'))
  .catch(err => console.warn('Email transporter not configured:', err.message));

module.exports = transporter;
```

- [ ] **Step 6: Install and verify**

```bash
cd backend && npm install
node -e "require('./src/config/env'); console.log('Config OK');"
```

- [ ] **Step 7: Commit**

```bash
git add backend/package.json backend/.env.example backend/src/config/
git commit -m "feat: add backend foundation with config and database connection"
```

---

### Task 3: Backend Models

**Files:**
- Create: `backend/src/models/userModel.js`
- Create: `backend/src/models/questionModel.js`
- Create: `backend/src/models/answerModel.js`
- Create: `backend/src/models/resultModel.js`
- Create: `backend/src/models/emailLogModel.js`

- [ ] **Step 1: Create userModel.js**

```js
// backend/src/models/userModel.js
const pool = require('../config/db');

const userModel = {
  async create(data) {
    const sql = `INSERT INTO users (full_name, email, phone, interested_career, user_type, school, class_name, province, consent_status, ip_address)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [
      data.full_name, data.email, data.phone,
      data.interested_career || null,
      data.user_type, data.school || null,
      data.class_name || null, data.province,
      data.consent_status ? 1 : 0,
      data.ip_address || null,
    ]);
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },
};

module.exports = userModel;
```

- [ ] **Step 2: Create questionModel.js**

```js
// backend/src/models/questionModel.js
const pool = require('../config/db');

const questionModel = {
  async findAllActive() {
    const [rows] = await pool.execute(
      'SELECT id, content, holland_type, order_number FROM questions WHERE is_active = 1 ORDER BY order_number ASC'
    );
    return rows;
  },

  async countByType() {
    const [rows] = await pool.execute(
      'SELECT holland_type, COUNT(*) as count FROM questions WHERE is_active = 1 GROUP BY holland_type'
    );
    return rows;
  },
};

module.exports = questionModel;
```

- [ ] **Step 3: Create answerModel.js**

```js
// backend/src/models/answerModel.js
const pool = require('../config/db');

const answerModel = {
  async batchInsert(userId, answers) {
    if (!answers.length) return;
    const sql = `INSERT INTO answers (user_id, question_id, answer_value) VALUES ${answers.map(() => '(?, ?, ?)').join(', ')}`;
    const values = answers.flatMap(a => [userId, a.question_id, a.answer_value]);
    await pool.execute(sql, values);
  },
};

module.exports = answerModel;
```

- [ ] **Step 4: Create resultModel.js**

```js
// backend/src/models/resultModel.js
const pool = require('../config/db');

const resultModel = {
  async create(data) {
    const sql = `INSERT INTO test_results
      (user_id, score_r, score_i, score_a, score_s, score_e, score_c, holland_code, top_1, top_2, top_3, result_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [
      data.user_id, data.score_r, data.score_i, data.score_a,
      data.score_s, data.score_e, data.score_c,
      data.holland_code, data.top_1, data.top_2, data.top_3, data.result_token,
    ]);
    return { insertId: result.insertId, result_token: data.result_token };
  },

  async findByToken(token) {
    const sql = `SELECT t.*, u.full_name, u.email
                 FROM test_results t JOIN users u ON t.user_id = u.id
                 WHERE t.result_token = ?`;
    const [rows] = await pool.execute(sql, [token]);
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM test_results WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },
};

module.exports = resultModel;
```

- [ ] **Step 5: Create emailLogModel.js**

```js
// backend/src/models/emailLogModel.js
const pool = require('../config/db');

const emailLogModel = {
  async create(data) {
    const sql = `INSERT INTO email_logs (user_id, result_id, email, subject, status, error_message, sent_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [
      data.user_id, data.result_id, data.email, data.subject,
      data.status || 'pending', data.error_message || null,
      data.sent_at || null,
    ]);
    return result.insertId;
  },

  async updateStatus(id, status, errorMessage) {
    const sql = errorMessage
      ? 'UPDATE email_logs SET status = ?, error_message = ?, sent_at = NOW() WHERE id = ?'
      : 'UPDATE email_logs SET status = ?, sent_at = NOW() WHERE id = ?';
    const params = errorMessage ? [status, errorMessage, id] : [status, id];
    await pool.execute(sql, params);
  },

  async findByUser(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM email_logs WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },
};

module.exports = emailLogModel;
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/models/
git commit -m "feat: add database models for users, questions, answers, results, email logs"
```

---

### Task 4: Backend Services - Holland Scoring & Career Matching

**Files:**
- Create: `backend/src/services/hollandService.js`

- [ ] **Step 1: Create hollandService.js**

```js
// backend/src/services/hollandService.js
const crypto = require('crypto');
const pool = require('../config/db');

const HOLLAND_TYPES = ['R', 'I', 'A', 'S', 'E', 'C'];
const PRIORITY_MAP = { R: 0, I: 1, A: 2, S: 3, E: 4, C: 5 };

const TYPE_DESCRIPTIONS = {
  R: { name: 'Realistic - Kỹ thuật', color: '#e74c3c', description: 'Bạn là người thực tế, thích làm việc với máy móc, công cụ và các hoạt động ngoài trời. Bạn giải quyết vấn đề bằng hành động cụ thể.' },
  I: { name: 'Investigative - Nghiên cứu', color: '#3498db', description: 'Bạn là người thích phân tích, nghiên cứu và tìm hiểu bản chất của sự vật. Bạn suy nghĩ logic và thích khám phá kiến thức mới.' },
  A: { name: 'Artistic - Nghệ thuật', color: '#9b59b6', description: 'Bạn là người sáng tạo, có óc thẩm mỹ và thích thể hiện bản thân qua nghệ thuật. Bạn đề cao sự độc đáo và tự do biểu đạt.' },
  S: { name: 'Social - Xã hội', color: '#2ecc71', description: 'Bạn là người thích giúp đỡ, chia sẻ và làm việc với con người. Bạn có khả năng đồng cảm và thích đóng góp cho cộng đồng.' },
  E: { name: 'Enterprising - Quản lý', color: '#f39c12', description: 'Bạn là người năng động, thích lãnh đạo và thuyết phục. Bạn có tham vọng và thích chinh phục thử thách trong kinh doanh.' },
  C: { name: 'Conventional - Quy củ', color: '#1abc9c', description: 'Bạn là người tỉ mỉ, cẩn thận và thích làm việc với dữ liệu. Bạn coi trọng quy trình, tổ chức và sự chính xác.' },
};

function calculateScores(answers, questions) {
  const typeQuestions = {};
  for (const q of questions) {
    if (!typeQuestions[q.holland_type]) typeQuestions[q.holland_type] = [];
    typeQuestions[q.holland_type].push(q.id);
  }

  const answerMap = {};
  for (const a of answers) {
    answerMap[a.question_id] = a.answer_value;
  }

  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  for (const [type, questionIds] of Object.entries(typeQuestions)) {
    let sum = 0;
    let count = 0;
    for (const qId of questionIds) {
      if (answerMap[qId] !== undefined) {
        sum += answerMap[qId];
        count++;
      }
    }
    scores[type] = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  }

  return scores;
}

function sortByScore(scores) {
  return Object.entries(scores)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return PRIORITY_MAP[a[0]] - PRIORITY_MAP[b[0]];
    })
    .map(([type]) => type);
}

function generateHollandCode(ranked) {
  return [ranked[0], ranked[1], ranked[2]].join('');
}

function generateResultToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function getCareerRecommendations(hollandCode) {
  const code = hollandCode.toUpperCase();
  let careers = [];

  const [exact] = await pool.execute(
    'SELECT * FROM careers WHERE holland_code = ? AND is_active = 1', [code]
  );
  careers = exact;

  if (careers.length < 5) {
    const codes = [code[0] + code[1], code[0] + code[2]];
    for (const c of codes) {
      const [rows] = await pool.execute(
        'SELECT * FROM careers WHERE holland_code LIKE ? AND is_active = 1 AND holland_code != ? LIMIT 5',
        [`${c}%`, code]
      );
      careers = careers.concat(rows);
    }
  }

  return careers.slice(0, 8);
}

module.exports = {
  HOLLAND_TYPES, PRIORITY_MAP, TYPE_DESCRIPTIONS,
  calculateScores, sortByScore, generateHollandCode,
  generateResultToken, getCareerRecommendations,
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/hollandService.js
git commit -m "feat: add Holland scoring, code generation, and career matching service"
```

---

### Task 5: Backend Services - Email Service

**Files:**
- Create: `backend/src/services/emailService.js`

- [ ] **Step 1: Create emailService.js**

```js
// backend/src/services/emailService.js
const transporter = require('../config/nodemailer');
const emailLogModel = require('../models/emailLogModel');
const { TYPE_DESCRIPTIONS } = require('./hollandService');

function buildEmailHtml(data) {
  const { full_name, holland_code, scores, top_three, careers, result_url } = data;
  const topNames = top_three.map(t => TYPE_DESCRIPTIONS[t].name).join(', ');

  const scoreRows = Object.entries(scores)
    .map(([k, v]) => {
      const info = TYPE_DESCRIPTIONS[k];
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee"><strong>${info.name.split(' - ')[0]}</strong></td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee">${info.name.split(' - ')[1]}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-weight:bold;font-size:16px">${v.toFixed(1)}</td></tr>`;
    }).join('');

  const careerItems = careers.map(c =>
    `<li style="margin-bottom:12px;padding:10px;background:#f8fafc;border-radius:6px">
      <strong style="color:#2563eb">${c.career_name}</strong><br>
      <span style="color:#64748b">${c.major_group}</span><br>
      <span style="font-size:14px">${c.description || ''}</span>
    </li>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
  <tr><td style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:40px 30px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">Kết Quả Trắc Nghiệm Hướng Nghiệp Holland</h1>
  </td></tr>
  <tr><td style="padding:30px">
    <p>Xin chào <strong>${full_name}</strong>,</p>
    <p>Cảm ơn bạn đã hoàn thành bài trắc nghiệm hướng nghiệp Holland/RIASEC. Dưới đây là kết quả của bạn:</p>

    <div style="background:#f0f9ff;border:2px solid #2563eb;border-radius:10px;padding:20px;text-align:center;margin:20px 0">
      <div style="font-size:14px;color:#64748b">Mã Holland của bạn</div>
      <div style="font-size:42px;font-weight:bold;color:#2563eb;letter-spacing:8px">${holland_code}</div>
      <div style="font-size:14px;color:#64748b;margin-top:4px">${topNames}</div>
    </div>

    <h2 style="color:#1e293b;font-size:18px">Điểm từng nhóm</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">
      ${scoreRows}
    </table>

    ${careers.length ? `<h2 style="color:#1e293b;font-size:18px">Ngành nghề gợi ý</h2><ul style="padding-left:0;list-style:none">${careerItems}</ul>` : ''}

    <div style="text-align:center;margin:30px 0">
      <a href="${result_url}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">Xem kết quả chi tiết</a>
    </div>

    <p style="color:#64748b;font-size:14px;margin-top:20px">Nếu bạn cần tư vấn thêm về hướng nghiệp, vui lòng liên hệ với chúng tôi.</p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px;text-align:center;color:#94a3b8;font-size:12px">
    Email này được gửi tự động từ hệ thống trắc nghiệm hướng nghiệp Holland.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

async function sendResultEmail(user, result, careers) {
  const resultUrl = `${process.env.APP_URL || 'http://localhost:5173'}/result/${result.result_token}`;
  const topThree = [result.top_1, result.top_2, result.top_3];

  const html = buildEmailHtml({
    full_name: user.full_name,
    holland_code: result.holland_code,
    scores: {
      R: result.score_r, I: result.score_i, A: result.score_a,
      S: result.score_s, E: result.score_e, C: result.score_c,
    },
    top_three: topThree,
    careers: careers,
    result_url: resultUrl,
  });

  const subject = `Kết quả Trắc nghiệm Hướng nghiệp Holland - ${user.full_name} (${result.holland_code})`;

  const logData = {
    user_id: user.id,
    result_id: result.id,
    email: user.email,
    subject,
    status: 'pending',
  };
  const logId = await emailLogModel.create(logData);

  try {
    await transporter.sendMail({
      from: `"Trắc nghiệm Hướng nghiệp" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      html,
    });
    await emailLogModel.updateStatus(logId, 'sent');
  } catch (err) {
    await emailLogModel.updateStatus(logId, 'failed', err.message);
    console.error('Email send failed:', err.message);
  }
}

module.exports = { sendResultEmail, buildEmailHtml };
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/emailService.js
git commit -m "feat: add email service with HTML template for result delivery"
```

---

### Task 6: Backend Middleware

**Files:**
- Create: `backend/src/middleware/errorHandler.js`
- Create: `backend/src/middleware/rateLimiter.js`
- Create: `backend/src/middleware/validators.js`

- [ ] **Step 1: Create errorHandler.js**

```js
// backend/src/middleware/errorHandler.js
function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}] ${err.message}`, err.stack);

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: status === 500 ? 'Internal server error' : err.message,
    },
  });
}

function createError(status, message, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code || 'ERROR';
  return err;
}

module.exports = { errorHandler, createError };
```

- [ ] **Step 2: Create rateLimiter.js**

```js
// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.' },
  },
});

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Quá nhiều lần gửi. Vui lòng thử lại sau 1 phút.' },
  },
});

module.exports = { apiLimiter, submitLimiter };
```

- [ ] **Step 3: Create validators.js**

```js
// backend/src/middleware/validators.js
const { body, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        details: errors.array().map(e => ({ field: e.path, message: e.msg })),
      },
    });
  }
  next();
};

const submitSurveyRules = [
  body('answers').isArray({ min: 1 }).withMessage('Vui lòng trả lời ít nhất 1 câu hỏi'),
  body('answers.*.question_id').isInt({ min: 1 }).withMessage('question_id không hợp lệ'),
  body('answers.*.answer_value').isInt({ min: 1, max: 5 }).withMessage('answer_value phải từ 1 đến 5'),
  body('user_info.full_name').trim().notEmpty().withMessage('Họ và tên là bắt buộc'),
  body('user_info.email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('user_info.phone').trim().notEmpty().withMessage('Số điện thoại là bắt buộc')
    .matches(/^[0-9+\-\s]{7,15}$/).withMessage('Số điện thoại không hợp lệ'),
  body('user_info.user_type').isIn(['hoc_sinh', 'sinh_vien', 'phu_huynh', 'giao_vien', 'nguoi_di_lam', 'khac'])
    .withMessage('Loại người dùng không hợp lệ'),
  body('user_info.province').trim().notEmpty().withMessage('Tỉnh/Thành là bắt buộc'),
  body('user_info.consent_status').isBoolean().withMessage('Vui lòng đồng ý điều khoản'),
];

const sendEmailRules = [
  query('email').isEmail().withMessage('Email không hợp lệ'),
];

module.exports = { validate, submitSurveyRules, sendEmailRules };
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/middleware/
git commit -m "feat: add middleware for error handling, rate limiting, and validation"
```

---

### Task 7: Backend Routes & Express App

**Files:**
- Create: `backend/src/routes/publicRoutes.js`
- Create: `backend/src/app.js`
- Create: `backend/server.js`

- [ ] **Step 1: Create publicRoutes.js**

```js
// backend/src/routes/publicRoutes.js
const { Router } = require('express');
const pool = require('../config/db');
const userModel = require('../models/userModel');
const questionModel = require('../models/questionModel');
const answerModel = require('../models/answerModel');
const resultModel = require('../models/resultModel');
const { validate, submitSurveyRules } = require('../middleware/validators');
const { submitLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { createError } = require('../middleware/errorHandler');
const hollandService = require('../services/hollandService');
const { sendResultEmail } = require('../services/emailService');

const router = Router();

router.get('/questions', apiLimiter, async (req, res, next) => {
  try {
    const questions = await questionModel.findAllActive();
    res.json({ success: true, data: { questions, total: questions.length } });
  } catch (err) { next(err); }
});

router.post('/surveys/submit', submitLimiter, submitSurveyRules, validate, async (req, res, next) => {
  try {
    const { answers, user_info } = req.body;

    const userId = await userModel.create({
      ...user_info,
      ip_address: req.ip,
    });

    await answerModel.batchInsert(userId, answers);

    const questions = await questionModel.findAllActive();
    const scores = hollandService.calculateScores(answers, questions);
    const ranked = hollandService.sortByScore(scores);
    const hollandCode = hollandService.generateHollandCode(ranked);
    const resultToken = hollandService.generateResultToken();

    const resultData = {
      user_id: userId,
      score_r: scores.R, score_i: scores.I, score_a: scores.A,
      score_s: scores.S, score_e: scores.E, score_c: scores.C,
      holland_code: hollandCode,
      top_1: ranked[0], top_2: ranked[1], top_3: ranked[2],
      result_token: resultToken,
    };

    const { insertId } = await resultModel.create(resultData);
    const careers = await hollandService.getCareerRecommendations(hollandCode);

    const user = await userModel.findById(userId);
    const result = { id: insertId, ...resultData };
    sendResultEmail(user, result, careers).catch(err =>
      console.error('Async email failed:', err.message)
    );

    res.status(201).json({
      success: true,
      data: {
        result_token: resultToken,
        holland_code: hollandCode,
        scores: scores,
        top_three: ranked.slice(0, 3),
        top_1: { type: ranked[0], ...hollandService.TYPE_DESCRIPTIONS[ranked[0]] },
        top_2: { type: ranked[1], ...hollandService.TYPE_DESCRIPTIONS[ranked[1]] },
        top_3: { type: ranked[2], ...hollandService.TYPE_DESCRIPTIONS[ranked[2]] },
        careers,
        result_url: `/result/${resultToken}`,
      },
    });
  } catch (err) { next(err); }
});

router.get('/results/:token', apiLimiter, async (req, res, next) => {
  try {
    const result = await resultModel.findByToken(req.params.token);
    if (!result) throw createError(404, 'Không tìm thấy kết quả', 'NOT_FOUND');

    const ranked = [result.top_1, result.top_2, result.top_3];
    const careers = await hollandService.getCareerRecommendations(result.holland_code);

    res.json({
      success: true,
      data: {
        full_name: result.full_name,
        holland_code: result.holland_code,
        scores: {
          R: result.score_r, I: result.score_i, A: result.score_a,
          S: result.score_s, E: result.score_e, C: result.score_c,
        },
        top_three: ranked,
        top_1: { type: ranked[0], ...hollandService.TYPE_DESCRIPTIONS[ranked[0]] },
        top_2: { type: ranked[1], ...hollandService.TYPE_DESCRIPTIONS[ranked[1]] },
        top_3: { type: ranked[2], ...hollandService.TYPE_DESCRIPTIONS[ranked[2]] },
        careers,
        result_token: result.result_token,
      },
    });
  } catch (err) { next(err); }
});

router.post('/results/:token/send-email', apiLimiter, async (req, res, next) => {
  try {
    const result = await resultModel.findByToken(req.params.token);
    if (!result) throw createError(404, 'Không tìm thấy kết quả', 'NOT_FOUND');

    const careers = await hollandService.getCareerRecommendations(result.holland_code);
    const user = { id: result.user_id, full_name: result.full_name, email: result.email };

    await sendResultEmail(user, result, careers);

    res.json({ success: true, message: 'Email đã được gửi thành công' });
  } catch (err) { next(err); }
});

router.get('/careers/recommendations', apiLimiter, async (req, res, next) => {
  try {
    const code = req.query.code;
    if (!code || code.length < 3) throw createError(400, 'Mã Holland không hợp lệ', 'INVALID_CODE');
    const careers = await hollandService.getCareerRecommendations(code);
    res.json({ success: true, data: { careers } });
  } catch (err) { next(err); }
});

module.exports = router;
```

- [ ] **Step 2: Create app.js**

```js
// backend/src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const publicRoutes = require('./routes/publicRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.set('trust proxy', 1);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api', publicRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.use(errorHandler);

module.exports = app;
```

- [ ] **Step 3: Create server.js**

```js
// backend/server.js
const app = require('./src/app');
const env = require('./src/config/env');

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
});
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/ backend/src/app.js backend/server.js
git commit -m "feat: add public API routes and Express app setup"
```

---

### Task 8: Frontend Foundation - Vite + Tailwind + Router

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/index.html`
- Create: `frontend/vite.config.js`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/index.css`
- Create: `frontend/src/services/api.js`

- [ ] **Step 1: Create frontend/package.json**

```json
{
  "name": "holland-career-test-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.7",
    "jspdf": "^2.5.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "react-router-dom": "^6.26.2",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.8",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.12",
    "vite": "^5.4.7"
  }
}
```

- [ ] **Step 2: Create index.html**

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Trắc nghiệm hướng nghiệp Holland/RIASEC miễn phí - Khám phá tính cách nghề nghiệp và tìm ngành nghề phù hợp với bạn." />
  <meta property="og:title" content="Trắc nghiệm Hướng nghiệp Holland" />
  <meta property="og:description" content="Khám phá tính cách nghề nghiệp và tìm ngành nghề phù hợp với bài trắc nghiệm Holland/RIASEC." />
  <title>Trắc nghiệm Hướng nghiệp Holland</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
</head>
<body class="bg-gray-50 text-gray-900 antialiased">
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 3: Create vite.config.js**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 4: Create tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af' },
        holland: {
          R: '#e74c3c', I: '#3498db', A: '#9b59b6',
          S: '#2ecc71', E: '#f39c12', C: '#1abc9c',
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 5: Create postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  body { @apply min-h-screen; }
}

@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg
           hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
           transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-outline {
    @apply inline-flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-primary-600
           font-semibold rounded-lg hover:bg-primary-50 focus:outline-none focus:ring-2
           focus:ring-primary-500 focus:ring-offset-2 transition-colors;
  }
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6;
  }
  .input-field {
    @apply w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500
           focus:border-primary-500 outline-none transition-all text-base;
  }
  .input-error {
    @apply border-red-400 focus:ring-red-400 focus:border-red-400;
  }
  .label-field {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
  .error-text {
    @apply text-red-500 text-sm mt-1;
  }
}
```

- [ ] **Step 7: Create src/services/api.js**

```js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error?.message || 'Có lỗi xảy ra, vui lòng thử lại';
    return Promise.reject(new Error(message));
  }
);

export default api;
```

- [ ] **Step 8: Create src/main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 9: Create src/App.jsx**

```jsx
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import InfoPage from './pages/InfoPage';
import ResultPage from './pages/ResultPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/result/:token" element={<ResultPage />} />
      </Routes>
    </Layout>
  );
}
```

- [ ] **Step 10: Install and verify**

```bash
cd frontend && npm install && npx tailwindcss --help
```

- [ ] **Step 11: Commit**

```bash
git add frontend/
git commit -m "feat: add frontend foundation with Vite, Tailwind, and React Router"
```

---

### Task 9: Frontend Shared Components - UI Kit

**Files:**
- Create: `frontend/src/components/ui/Button.jsx`
- Create: `frontend/src/components/ui/Card.jsx`
- Create: `frontend/src/components/ui/ProgressBar.jsx`
- Create: `frontend/src/components/ui/LoadingSpinner.jsx`
- Create: `frontend/src/components/ui/Toast.jsx`
- Create: `frontend/src/components/layout/Header.jsx`
- Create: `frontend/src/components/layout/Footer.jsx`
- Create: `frontend/src/components/layout/Layout.jsx`

- [ ] **Step 1: Create Button.jsx**

```jsx
// frontend/src/components/ui/Button.jsx
export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-outline';
  return <button className={`${base} ${className}`} {...props}>{children}</button>;
}
```

- [ ] **Step 2: Create Card.jsx**

```jsx
// frontend/src/components/ui/Card.jsx
export default function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}
```

- [ ] **Step 3: Create ProgressBar.jsx**

```jsx
// frontend/src/components/ui/ProgressBar.jsx
export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Câu {current}/{total}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create LoadingSpinner.jsx**

```jsx
// frontend/src/components/ui/LoadingSpinner.jsx
export default function LoadingSpinner({ message = 'Đang tải...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="mt-4 text-gray-500">{message}</p>
    </div>
  );
}
```

- [ ] **Step 5: Create Toast.jsx**

```jsx
// frontend/src/components/ui/Toast.jsx
import { useState, useEffect, useCallback } from 'react';

let toastId = 0;
let listeners = [];

function notify(type, message) {
  const id = ++toastId;
  listeners.forEach(fn => fn({ id, type, message }));
  return id;
}

export const toast = {
  success: (msg) => notify('success', msg),
  error: (msg) => notify('error', msg),
  info: (msg) => notify('info', msg),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    listeners.push((t) => setToasts(prev => [...prev, t]));
    return () => { listeners = []; };
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(t => <ToastItem key={t.id} {...t} onRemove={remove} />)}
    </div>
  );
}

function ToastItem({ id, type, message, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const colors = { success: 'bg-green-50 border-green-400 text-green-800', error: 'bg-red-50 border-red-400 text-red-800', info: 'bg-blue-50 border-blue-400 text-blue-800' };

  return (
    <div className={`px-4 py-3 rounded-lg border shadow-lg ${colors[type]} flex items-center justify-between gap-3 animate-slide-in`}>
      <span className="text-sm">{message}</span>
      <button onClick={() => onRemove(id)} className="text-current opacity-50 hover:opacity-100">&times;</button>
    </div>
  );
}
```

- [ ] **Step 6: Create Header.jsx**

```jsx
// frontend/src/components/layout/Header.jsx
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-700">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Holland Test
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#gioi-thieu" className="hover:text-primary-600">Giới thiệu</a>
          <a href="#nhom-holland" className="hover:text-primary-600">6 nhóm Holland</a>
          <Link to="/test" className="btn-primary !py-2 !px-4 !text-sm">Làm bài test</Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 7: Create Footer.jsx**

```jsx
// frontend/src/components/layout/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Trắc nghiệm Hướng nghiệp Holland. Tất cả quyền được bảo lưu.</p>
        <p className="mt-1">Bài trắc nghiệm dựa trên lý thuyết Holland/RIASEC - John L. Holland (1959).</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 8: Create Layout.jsx**

```jsx
// frontend/src/components/layout/Layout.jsx
import Header from './Header';
import Footer from './Footer';
import { ToastContainer } from '../ui/Toast';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: add shared UI components and layout"
```

---

### Task 10: Frontend Hooks

**Files:**
- Create: `frontend/src/hooks/useLocalStorage.js`
- Create: `frontend/src/hooks/useQuestions.js`

- [ ] **Step 1: Create useLocalStorage.js**

```js
// frontend/src/hooks/useLocalStorage.js
import { useState, useCallback } from 'react';

export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    try {
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch { /* quota exceeded, ignore */ }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
```

- [ ] **Step 2: Create useQuestions.js**

```js
// frontend/src/hooks/useQuestions.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function useQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/questions').then(res => {
      if (!cancelled) setQuestions(res.data.questions);
    }).catch(err => {
      if (!cancelled) setError(err.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { questions, loading, error };
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/
git commit -m "feat: add localStorage and question fetching hooks"
```

---

### Task 11: Frontend Page - HomePage

**Files:**
- Create: `frontend/src/pages/HomePage.jsx`

- [ ] **Step 1: Create HomePage.jsx**

```jsx
// frontend/src/pages/HomePage.jsx
import { Link } from 'react-router-dom';

const HOLLAND_TYPES = [
  { type: 'R', name: 'Realistic', title: 'Kỹ thuật', icon: '🔧', desc: 'Thích làm việc với máy móc, công cụ, thiết bị. Thiên về hành động thực tế và giải quyết vấn đề cụ thể.', careers: 'Kỹ sư, Thợ cơ khí, Nông dân, Kiến trúc sư...' },
  { type: 'I', name: 'Investigative', title: 'Nghiên cứu', icon: '🔬', desc: 'Thích quan sát, phân tích, nghiên cứu. Đam mê khám phá tri thức và giải quyết vấn đề phức tạp.', careers: 'Bác sĩ, Nhà khoa học, Lập trình viên, Dược sĩ...' },
  { type: 'A', name: 'Artistic', title: 'Nghệ thuật', icon: '🎨', desc: 'Thích sáng tạo, thể hiện bản thân. Đề cao thẩm mỹ, sự độc đáo và tự do biểu đạt.', careers: 'Thiết kế, Viết lách, Âm nhạc, Diễn viên, Kiến trúc...' },
  { type: 'S', name: 'Social', title: 'Xã hội', icon: '🤝', desc: 'Thích giúp đỡ, giảng dạy, chia sẻ. Có khả năng đồng cảm và kết nối với mọi người.', careers: 'Giáo viên, Tư vấn viên, Bác sĩ, Nhân viên xã hội...' },
  { type: 'E', name: 'Enterprising', title: 'Quản lý', icon: '📈', desc: 'Thích lãnh đạo, thuyết phục, kinh doanh. Năng động, tham vọng và thích chinh phục thử thách.', careers: 'CEO, Marketing, Bán hàng, Luật sư, Chính trị gia...' },
  { type: 'C', name: 'Conventional', title: 'Quy củ', icon: '📊', desc: 'Thích tổ chức, sắp xếp, làm việc với dữ liệu. Tỉ mỉ, cẩn thận và tuân thủ quy trình.', careers: 'Kế toán, Kiểm toán, Thư ký, Quản lý dữ liệu, Ngân hàng...' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Khám Phá Bản Thân,<br />Định Hướng Tương Lai
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Bài trắc nghiệm hướng nghiệp Holland (RIASEC) giúp bạn hiểu rõ tính cách nghề nghiệp,
            từ đó chọn được ngành học và nghề nghiệp phù hợp nhất.
          </p>
          <Link to="/test" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold text-lg rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
            Bắt đầu làm bài
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <p className="mt-6 text-blue-200 text-sm">Miễn phí - 60 câu hỏi - Khoảng 15 phút</p>
        </div>
      </section>

      {/* Giới thiệu */}
      <section id="gioi-thieu" className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Holland/RIASEC là gì?</h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Trắc nghiệm Holland (RIASEC) được phát triển bởi nhà tâm lý học John L. Holland.
          Lý thuyết này chia tính cách nghề nghiệp thành 6 nhóm, giúp bạn xác định được
          môi trường làm việc và ngành nghề phù hợp với tính cách của mình.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOLLAND_TYPES.map(h => (
            <div key={h.type} className="card hover:shadow-md transition-shadow border-t-4" style={{ borderTopColor: `var(--color-${h.type})` }}>
              <div className="text-3xl mb-3">{h.icon}</div>
              <h3 className="font-bold text-lg mb-1">{h.name} <span className="text-gray-400 font-normal">({h.type})</span></h3>
              <p className="text-sm text-gray-500 font-medium mb-2">{h.title}</p>
              <p className="text-sm text-gray-600 mb-3">{h.desc}</p>
              <p className="text-xs text-gray-400"><strong>Nghề tiêu biểu:</strong> {h.careers}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lợi ích */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Lợi ích của bài trắc nghiệm</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Hiểu rõ bản thân', desc: 'Khám phá tính cách nghề nghiệp, điểm mạnh và điểm yếu của bạn một cách khoa học.' },
              { title: 'Định hướng nghề nghiệp', desc: 'Nhận gợi ý ngành nghề phù hợp dựa trên mã Holland cá nhân của bạn.' },
              { title: 'Lập kế hoạch học tập', desc: 'Xác định kỹ năng cần phát triển và lộ trình học tập phù hợp cho tương lai.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">{i + 1}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Sẵn sàng khám phá bản thân?</h2>
        <p className="text-gray-600 mb-8">Làm bài trắc nghiệm ngay để nhận kết quả chi tiết và gợi ý ngành nghề phù hợp.</p>
        <Link to="/test" className="btn-primary text-lg px-10 py-4">Bắt đầu làm bài ngay</Link>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat: add homepage with hero, Holland types intro, and CTA"
```

---

### Task 12: Frontend Page - TestPage

**Files:**
- Create: `frontend/src/pages/TestPage.jsx`

- [ ] **Step 1: Create TestPage.jsx**

```jsx
// frontend/src/pages/TestPage.jsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useQuestions from '../hooks/useQuestions';
import useLocalStorage from '../hooks/useLocalStorage';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const QUESTIONS_PER_PAGE = 10;
const LIKERT_OPTIONS = [
  { value: 1, label: 'Rất không đồng ý' },
  { value: 2, label: 'Không đồng ý' },
  { value: 3, label: 'Phân vân' },
  { value: 4, label: 'Đồng ý' },
  { value: 5, label: 'Rất đồng ý' },
];

export default function TestPage() {
  const { questions, loading, error } = useQuestions();
  const [answers, setAnswers] = useLocalStorage('holland_answers', {});
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const pageQuestions = questions.slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE);
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = useCallback((questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, [setAnswers]);

  const isPageComplete = pageQuestions.every(q => answers[q.id]);
  const isAllComplete = questions.length > 0 && questions.every(q => answers[q.id]);

  const handleFinish = () => {
    if (!isAllComplete) return;
    const formatted = Object.entries(answers).map(([qId, val]) => ({
      question_id: parseInt(qId), answer_value: val,
    }));
    localStorage.setItem('holland_answers_formatted', JSON.stringify(formatted));
    navigate('/info');
  };

  if (loading) return <LoadingSpinner message="Đang tải câu hỏi..." />;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Bài trắc nghiệm Holland</h1>
        <ProgressBar current={answeredCount} total={questions.length} />
      </div>

      <div className="space-y-8">
        {pageQuestions.map((q, idx) => (
          <div key={q.id} className="card">
            <p className="font-medium text-gray-800 mb-4">
              <span className="text-primary-600 font-bold mr-2">{currentPage * QUESTIONS_PER_PAGE + idx + 1}.</span>
              {q.content}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {LIKERT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(q.id, opt.value)}
                  className={`px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all
                    ${answers[q.id] === opt.value
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                >
                  <div className="text-xs text-gray-400 mb-0.5">{opt.value}</div>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button variant="outline" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
          ← Quay lại
        </Button>

        <span className="text-sm text-gray-500">Trang {currentPage + 1}/{totalPages}</span>

        {currentPage < totalPages - 1 ? (
          <Button disabled={!isPageComplete} onClick={() => setCurrentPage(p => p + 1)}>
            Tiếp tục →
          </Button>
        ) : (
          <Button disabled={!isAllComplete} onClick={handleFinish}>
            Hoàn thành
          </Button>
        )}
      </div>

      {!isPageComplete && (
        <p className="text-amber-600 text-sm text-center mt-4">Vui lòng trả lời tất cả câu hỏi trên trang này trước khi tiếp tục.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/TestPage.jsx
git commit -m "feat: add test page with pagination, localStorage, and 5-point Likert scale"
```

---

### Task 13: Frontend Page - InfoPage

**Files:**
- Create: `frontend/src/pages/InfoPage.jsx`

- [ ] **Step 1: Create InfoPage.jsx**

```jsx
// frontend/src/pages/InfoPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../components/ui/Button';
import api from '../services/api';
import { toast } from '../components/ui/Toast';

const USER_TYPES = [
  { value: 'hoc_sinh', label: 'Học sinh' },
  { value: 'sinh_vien', label: 'Sinh viên' },
  { value: 'phu_huynh', label: 'Phụ huynh' },
  { value: 'giao_vien', label: 'Giáo viên' },
  { value: 'nguoi_di_lam', label: 'Người đi làm' },
  { value: 'khac', label: 'Khác' },
];

export default function InfoPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { user_type: 'hoc_sinh', consent_status: false } });

  const onSubmit = async (data) => {
    const raw = localStorage.getItem('holland_answers_formatted');
    if (!raw) { navigate('/test'); return; }

    setSubmitting(true);
    try {
      const answers = JSON.parse(raw);
      const res = await api.post('/surveys/submit', {
        answers,
        user_info: {
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          interested_career: data.interested_career || null,
          user_type: data.user_type,
          school: data.school || null,
          class_name: data.class_name || null,
          province: data.province,
          consent_status: data.consent_status,
        },
      });

      localStorage.removeItem('holland_answers');
      localStorage.removeItem('holland_answers_formatted');

      toast.success('Hoàn thành! Đang chuyển đến kết quả...');
      setTimeout(() => navigate(`/result/${res.data.result_token}`), 500);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Thông tin cá nhân</h1>
      <p className="text-gray-600 mb-8">
        Vui lòng nhập thông tin chi tiết của bạn dưới đây để xem kết quả trắc nghiệm.
        Các trường có dấu (*) là bắt buộc nhập.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label-field">Họ và tên *</label>
          <input {...register('full_name', { required: 'Vui lòng nhập họ và tên' })} className={`input-field ${errors.full_name ? 'input-error' : ''}`} />
          {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Email *</label>
            <input type="email" {...register('email', { required: 'Vui lòng nhập email', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' } })} className={`input-field ${errors.email ? 'input-error' : ''}`} />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label-field">Số điện thoại *</label>
            <input {...register('phone', { required: 'Vui lòng nhập số điện thoại', pattern: { value: /^[0-9+\-\s]{7,15}$/, message: 'Số điện thoại không hợp lệ' } })} className={`input-field ${errors.phone ? 'input-error' : ''}`} />
            {errors.phone && <p className="error-text">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="label-field">Nghề nghiệp/Ngành nghề đang quan tâm</label>
          <input {...register('interested_career')} className="input-field" placeholder="VD: Công nghệ thông tin, Y khoa..." />
        </div>

        <div>
          <label className="label-field">Bạn là... *</label>
          <select {...register('user_type', { required: true })} className="input-field">
            {USER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Trường</label>
            <input {...register('school')} className="input-field" placeholder="Tên trường đang học..." />
          </div>
          <div>
            <label className="label-field">Lớp</label>
            <input {...register('class_name')} className="input-field" placeholder="VD: 12A1" />
          </div>
        </div>

        <div>
          <label className="label-field">Tỉnh/Thành *</label>
          <input {...register('province', { required: 'Vui lòng nhập tỉnh/thành' })} className={`input-field ${errors.province ? 'input-error' : ''}`} placeholder="VD: TP.HCM, Hà Nội..." />
          {errors.province && <p className="error-text">{errors.province.message}</p>}
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input type="checkbox" {...register('consent_status', { required: 'Bạn cần đồng ý để tiếp tục' })} className="mt-1 w-4 h-4 text-primary-600 rounded" id="consent" />
          <label htmlFor="consent" className="text-sm text-gray-600">
            Tôi đồng ý cho hệ thống lưu thông tin để gửi kết quả và tư vấn hướng nghiệp *
          </label>
        </div>
        {errors.consent_status && <p className="error-text">{errors.consent_status.message}</p>}

        <Button type="submit" disabled={submitting} className="w-full !py-3.5 !text-lg">
          {submitting ? 'Đang xử lý...' : 'Xem kết quả'}
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/InfoPage.jsx
git commit -m "feat: add user info form with validation and submission"
```

---

### Task 14: Frontend Page - ResultPage

**Files:**
- Create: `frontend/src/pages/ResultPage.jsx`

- [ ] **Step 1: Create ResultPage.jsx**

```jsx
// frontend/src/pages/ResultPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { jsPDF } from 'jspdf';
import api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { toast } from '../components/ui/Toast';

const TYPE_COLORS = { R: '#e74c3c', I: '#3498db', A: '#9b59b6', S: '#2ecc71', E: '#f39c12', C: '#1abc9c' };
const TYPE_LABELS = { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' };
const TYPE_VN = { R: 'Kỹ thuật', I: 'Nghiên cứu', A: 'Nghệ thuật', S: 'Xã hội', E: 'Quản lý', C: 'Quy củ' };

const STRENGTHS = {
  R: ['Thực tế', 'Kiên trì', 'Khéo léo', 'Thích vận động'],
  I: ['Phân tích', 'Logic', 'Tò mò', 'Độc lập'],
  A: ['Sáng tạo', 'Trực giác', 'Thẩm mỹ', 'Độc đáo'],
  S: ['Đồng cảm', 'Giao tiếp', 'Kiên nhẫn', 'Hợp tác'],
  E: ['Lãnh đạo', 'Thuyết phục', 'Tự tin', 'Năng động'],
  C: ['Tỉ mỉ', 'Cẩn thận', 'Tổ chức', 'Chính xác'],
};

const ENVIRONMENTS = {
  R: 'Môi trường làm việc thực tế, có cấu trúc, liên quan đến máy móc và công cụ.',
  I: 'Môi trường học thuật, nghiên cứu, nơi bạn có thể khám phá và phân tích.',
  A: 'Môi trường sáng tạo, linh hoạt, nơi bạn có thể tự do biểu đạt ý tưởng.',
  S: 'Môi trường hợp tác, hỗ trợ, nơi bạn có thể làm việc trực tiếp với con người.',
  E: 'Môi trường cạnh tranh, năng động, nơi bạn có thể lãnh đạo và tạo ảnh hưởng.',
  C: 'Môi trường có tổ chức, quy củ, nơi bạn có thể làm việc với dữ liệu và quy trình.',
};

export default function ResultPage() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/results/${token}`)
      .then(res => setResult(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleResendEmail = async () => {
    try {
      await api.post(`/results/${token}/send-email`);
      toast.success('Email đã được gửi lại thành công!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const d = result;
    doc.setFontSize(20);
    doc.text('Ket qua Trac nghiem Huong nghiep', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Ho ten: ${d.full_name}`, 20, 35);
    doc.text(`Ma Holland: ${d.holland_code}`, 20, 45);
    doc.setFontSize(11);
    let y = 60;
    doc.text(`Diem tung nhom:`, 20, y);
    y += 8;
    Object.entries(d.scores).forEach(([k, v]) => {
      doc.text(`  ${k} (${TYPE_VN[k]}): ${v.toFixed(1)}`, 20, y);
      y += 7;
    });
    y += 5;
    doc.text(`Top 3 nhom noi bat: ${d.top_three.join(', ')}`, 20, y);
    y += 8;
    if (d.careers?.length) {
      doc.text('Nghe nghiep goi y:', 20, y);
      y += 8;
      d.careers.slice(0, 8).forEach(c => {
        doc.text(`  - ${c.career_name} (${c.major_group})`, 20, y);
        y += 7;
      });
    }
    doc.save(`Holland-${d.full_name}-${d.holland_code}.pdf`);
  };

  if (loading) return <LoadingSpinner message="Đang tải kết quả..." />;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-red-500">{error}</div>;
  if (!result) return null;

  const chartData = Object.entries(result.scores).map(([k, v]) => ({
    type: `${k} - ${TYPE_VN[k]}`,
    score: v,
    fill: TYPE_COLORS[k],
  }));

  const radarData = Object.entries(result.scores).map(([k, v]) => ({ type: k, score: v }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-gray-500 mb-2">Kết quả trắc nghiệm của</p>
        <h1 className="text-3xl font-bold">{result.full_name}</h1>
      </div>

      {/* Holland Code */}
      <Card className="!bg-gradient-to-br from-primary-600 to-purple-700 text-white text-center !p-8">
        <p className="text-blue-100 mb-2">Mã Holland của bạn</p>
        <div className="text-6xl font-extrabold tracking-[0.3em] mb-3">{result.holland_code}</div>
        <p className="text-blue-200">{result.top_three.map(t => `${t} - ${TYPE_VN[t]}`).join(' | ')}</p>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold text-lg mb-4 text-center">Biểu đồ điểm số</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 50]} />
              <Tooltip />
              <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="font-bold text-lg mb-4 text-center">Hồ sơ Holland</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="type" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 50]} />
              <Radar dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {result.top_three.map((type, i) => (
          <Card key={type} className="border-t-4" style={{ borderTopColor: TYPE_COLORS[type] }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-gray-400">TOP {i + 1}</span>
              <span className="px-2 py-0.5 text-xs font-bold text-white rounded" style={{ backgroundColor: TYPE_COLORS[type] }}>{type}</span>
              <h3 className="font-bold">{TYPE_LABELS[type]}</h3>
            </div>
            <p className="text-sm text-gray-600">{result[`top_${i + 1}`].description}</p>
          </Card>
        ))}
      </div>

      {/* Điểm mạnh */}
      <Card>
        <h2 className="font-bold text-lg mb-4">Điểm mạnh</h2>
        <div className="flex flex-wrap gap-2">
          {result.top_three.flatMap(t => STRENGTHS[t].map(s => `${s}`)).map((s, i) => (
            <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">{s}</span>
          ))}
        </div>
      </Card>

      {/* Môi trường phù hợp */}
      <Card>
        <h2 className="font-bold text-lg mb-3">Môi trường học tập/làm việc phù hợp</h2>
        <div className="space-y-3">
          {result.top_three.map(type => (
            <div key={type} className="flex items-start gap-3">
              <span className="px-2 py-0.5 text-xs font-bold text-white rounded" style={{ backgroundColor: TYPE_COLORS[type] }}>{type}</span>
              <p className="text-gray-600">{ENVIRONMENTS[type]}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Ngành nghề gợi ý */}
      <Card>
        <h2 className="font-bold text-lg mb-4">Ngành nghề gợi ý</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.careers?.map((c, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
              <h3 className="font-semibold text-primary-700">{c.career_name}</h3>
              <p className="text-xs text-gray-400 mb-1">{c.major_group}</p>
              <p className="text-sm text-gray-600 mb-2">{c.description}</p>
              {c.required_skills && <p className="text-xs text-gray-500"><strong>Kỹ năng:</strong> {c.required_skills}</p>}
              {c.learning_suggestion && <p className="text-xs text-gray-500 mt-1"><strong>Học tập:</strong> {c.learning_suggestion}</p>}
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button onClick={handleDownloadPDF}>Tải PDF kết quả</Button>
        <Button variant="outline" onClick={handleResendEmail}>Gửi lại kết quả qua email</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/ResultPage.jsx
git commit -m "feat: add result page with charts, career suggestions, PDF export, and email resend"
```

---

### Task 15: Verification & Integration Testing

- [ ] **Step 1: Start MySQL, create database and seed data**

```bash
mysql -u root -p < database/migrations/001_create_tables.sql
mysql -u root -p < database/seeds/001_questions_and_careers.sql
```

Expected: 60 questions and 30+ careers inserted.

- [ ] **Step 2: Start backend and verify health endpoint**

```bash
cd backend && cp .env.example .env && npm install && npm run dev
```

In another terminal:
```bash
curl http://localhost:3000/api/health
```

Expected: `{"success":true,"message":"OK","timestamp":"..."}`

- [ ] **Step 3: Verify questions endpoint**

```bash
curl http://localhost:3000/api/questions | head -c 500
```

Expected: JSON with 60 questions.

- [ ] **Step 4: Verify submit endpoint**

```bash
curl -X POST http://localhost:3000/api/surveys/submit \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"question_id":1,"answer_value":4},{"question_id":11,"answer_value":5},{"question_id":21,"answer_value":3}],"user_info":{"full_name":"Test User","email":"test@example.com","phone":"0912345678","user_type":"hoc_sinh","province":"TP.HCM","consent_status":true}}'
```

Expected: 201 with result_token and holland_code.

- [ ] **Step 5: Start frontend dev server**

```bash
cd frontend && cp ../backend/.env .env 2>/dev/null; npm install && npm run dev
```

Open http://localhost:5173 in browser. Navigate through: Home → Test (answer questions) → Info (fill form) → Result.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: final integration verification and adjustments"
```
