CREATE DATABASE IF NOT EXISTS holland_career_test
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE holland_career_test;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  interested_career VARCHAR(255) NULL,
  desired_major VARCHAR(255) NULL,
  desired_university VARCHAR(255) NULL,
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
  UNIQUE INDEX idx_order (order_number),
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
  INDEX idx_question_id (question_id),
  UNIQUE INDEX idx_user_question (user_id, question_id)
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
  result_token VARCHAR(64) NOT NULL,
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
