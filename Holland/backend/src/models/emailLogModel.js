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
