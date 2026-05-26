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
