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
