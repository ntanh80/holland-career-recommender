const pool = require('../config/db');
const bcrypt = require('bcrypt');

const adminModel = {
  async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM admins WHERE username = ? AND is_active = 1', [username]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, email, role, is_active, created_at FROM admins WHERE id = ?', [id]
    );
    return rows[0] || null;
  },

  async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  },

  async create({ username, email, password, role }) {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hash, role || 'admin']
    );
    return result.insertId;
  },
};

module.exports = adminModel;
