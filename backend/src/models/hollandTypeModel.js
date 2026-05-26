const pool = require('../config/db');

const hollandTypeModel = {
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM holland_types ORDER BY display_order ASC'
    );
    return rows;
  },

  async findByCode(code) {
    const [rows] = await pool.execute(
      'SELECT * FROM holland_types WHERE code = ?', [code]
    );
    return rows[0] || null;
  },

  async update(code, data) {
    await pool.execute(
      `UPDATE holland_types SET name_en = ?, name_vn = ?, description = ?, color = ?, display_order = ?
       WHERE code = ?`,
      [data.name_en, data.name_vn, data.description || null, data.color || null, data.display_order || 0, code]
    );
  },
};

module.exports = hollandTypeModel;
