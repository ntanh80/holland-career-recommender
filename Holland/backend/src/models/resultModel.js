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
