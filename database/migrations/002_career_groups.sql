USE holland_career_test;

-- Create career_groups table
CREATE TABLE IF NOT EXISTS career_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add career_group_id column to careers (keep major_group for backward compat)
ALTER TABLE careers
  ADD COLUMN career_group_id INT NULL,
  ADD INDEX idx_career_group_id (career_group_id),
  ADD CONSTRAINT fk_career_group
    FOREIGN KEY (career_group_id) REFERENCES career_groups(id)
    ON DELETE SET NULL;

-- Seed career groups from existing major_group values
INSERT INTO career_groups (name, display_order)
  SELECT DISTINCT major_group, ROW_NUMBER() OVER (ORDER BY major_group)
  FROM careers WHERE major_group IS NOT NULL AND major_group != '';

-- Link existing careers to new groups
UPDATE careers c
  JOIN career_groups cg ON c.major_group = cg.name
  SET c.career_group_id = cg.id;
