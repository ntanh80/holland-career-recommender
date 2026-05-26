const pool = require('../config/db');

const userModel = {
  async create(data) {
    const sql = `INSERT INTO users (full_name, email, phone, interested_career, desired_major, desired_university, user_type, school, class_name, province, consent_status, ip_address)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [
      data.full_name, data.email, data.phone,
      data.interested_career || null,
      data.desired_major || null,
      data.desired_university || null,
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
