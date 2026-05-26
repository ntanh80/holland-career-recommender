const { Router } = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const env = require('../config/env');
const adminModel = require('../models/adminModel');
const { adminAuth, superAdminOnly } = require('../middleware/auth');
const { createError } = require('../middleware/errorHandler');
const { sendResultEmail } = require('../services/emailService');
const emailLogModel = require('../models/emailLogModel');
const hollandTypeModel = require('../models/hollandTypeModel');

const router = Router();

// ── LOGIN ────────────────────────────────────────
router.post('/admin/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw createError(400, 'Vui lòng nhập tên đăng nhập và mật khẩu', 'MISSING_FIELDS');

    const admin = await adminModel.findByUsername(username);
    if (!admin || !(await adminModel.verifyPassword(password, admin.password_hash))) {
      throw createError(401, 'Tên đăng nhập hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign({ id: admin.id, role: admin.role }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
    res.json({
      success: true,
      data: { token, admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role } },
    });
  } catch (err) { next(err); }
});

// ── AUTH CHECK ───────────────────────────────────
router.get('/admin/me', adminAuth, async (req, res) => {
  res.json({ success: true, data: { admin: req.admin } });
});

// ── DASHBOARD ────────────────────────────────────
router.get('/admin/dashboard', adminAuth, async (req, res, next) => {
  try {
    const [[{ totalUsers }]] = await pool.execute('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalResults }]] = await pool.execute('SELECT COUNT(*) AS totalResults FROM test_results');
    const [[{ todayResults }]] = await pool.execute(
      'SELECT COUNT(*) AS todayResults FROM test_results WHERE DATE(created_at) = CURDATE()'
    );
    const [[{ monthResults }]] = await pool.execute(
      'SELECT COUNT(*) AS monthResults FROM test_results WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())'
    );

    const [hollandDist] = await pool.execute(
      'SELECT holland_code, COUNT(*) AS count FROM test_results GROUP BY holland_code ORDER BY count DESC'
    );

    const [topProvinces] = await pool.execute(
      'SELECT province, COUNT(*) AS count FROM users GROUP BY province ORDER BY count DESC LIMIT 10'
    );

    const [dailyResults] = await pool.execute(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count FROM test_results
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`
    );

    const [userTypes] = await pool.execute(
      'SELECT user_type, COUNT(*) AS count FROM users GROUP BY user_type ORDER BY count DESC'
    );

    const [recentUsers] = await pool.execute(
      `SELECT u.id, u.full_name, u.email, u.school, u.province, u.created_at,
              t.holland_code
       FROM users u LEFT JOIN test_results t ON u.id = t.user_id
       ORDER BY u.created_at DESC LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalResults, todayResults, monthResults },
        hollandDist, topProvinces, dailyResults, userTypes, recentUsers,
      },
    });
  } catch (err) { next(err); }
});

// ── QUESTIONS CRUD ───────────────────────────────
router.get('/admin/questions', adminAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM questions ORDER BY order_number ASC'
    );
    res.json({ success: true, data: { questions: rows } });
  } catch (err) { next(err); }
});

router.post('/admin/questions', adminAuth, async (req, res, next) => {
  try {
    const { content, holland_type, order_number, is_active } = req.body;
    if (!content || !holland_type) throw createError(400, 'Nội dung và nhóm Holland là bắt buộc', 'MISSING_FIELDS');
    if (!['R','I','A','S','E','C'].includes(holland_type)) throw createError(400, 'Nhóm Holland không hợp lệ', 'INVALID_TYPE');

    const [result] = await pool.execute(
      'INSERT INTO questions (content, holland_type, order_number, is_active) VALUES (?, ?, ?, ?)',
      [content, holland_type, order_number || 99, is_active !== undefined ? (is_active ? 1 : 0) : 1]
    );
    const [[question]] = await pool.execute('SELECT * FROM questions WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: { question } });
  } catch (err) { next(err); }
});

router.put('/admin/questions/:id', adminAuth, async (req, res, next) => {
  try {
    const { content, holland_type, order_number, is_active } = req.body;
    const [[existing]] = await pool.execute('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    if (!existing) throw createError(404, 'Không tìm thấy câu hỏi', 'NOT_FOUND');

    await pool.execute(
      `UPDATE questions SET content = ?, holland_type = ?, order_number = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        content || existing.content,
        holland_type || existing.holland_type,
        order_number !== undefined ? order_number : existing.order_number,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        req.params.id,
      ]
    );
    const [[question]] = await pool.execute('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: { question } });
  } catch (err) { next(err); }
});

router.delete('/admin/questions/:id', adminAuth, async (req, res, next) => {
  try {
    const [[existing]] = await pool.execute('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    if (!existing) throw createError(404, 'Không tìm thấy câu hỏi', 'NOT_FOUND');

    await pool.execute('UPDATE questions SET is_active = 0, updated_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã vô hiệu hóa câu hỏi' });
  } catch (err) { next(err); }
});

// ── HOLLAND TYPES ────────────────────────────────
router.get('/admin/holland-types', adminAuth, async (req, res, next) => {
  try {
    const types = await hollandTypeModel.findAll();
    res.json({ success: true, data: { types } });
  } catch (err) { next(err); }
});

router.put('/admin/holland-types/:code', adminAuth, async (req, res, next) => {
  try {
    const { name_en, name_vn, description, color, display_order } = req.body;
    const existing = await hollandTypeModel.findByCode(req.params.code);
    if (!existing) throw createError(404, 'Không tìm thấy nhóm Holland', 'NOT_FOUND');

    await hollandTypeModel.update(req.params.code, {
      name_en: name_en || existing.name_en,
      name_vn: name_vn || existing.name_vn,
      description: description !== undefined ? description : existing.description,
      color: color || existing.color,
      display_order: display_order !== undefined ? display_order : existing.display_order,
    });
    const updated = await hollandTypeModel.findByCode(req.params.code);
    res.json({ success: true, data: { type: updated } });
  } catch (err) { next(err); }
});

// ── CAREER GROUPS CRUD ────────────────────────────
router.get('/admin/career-groups', adminAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM career_groups ORDER BY display_order ASC, id ASC');
    res.json({ success: true, data: { groups: rows } });
  } catch (err) { next(err); }
});

router.post('/admin/career-groups', adminAuth, async (req, res, next) => {
  try {
    const { name, display_order } = req.body;
    if (!name) throw createError(400, 'Tên nhóm ngành là bắt buộc', 'MISSING_FIELDS');
    const [result] = await pool.execute(
      'INSERT INTO career_groups (name, display_order, is_active) VALUES (?, ?, 1)',
      [name, display_order || 0]
    );
    const [[group]] = await pool.execute('SELECT * FROM career_groups WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: { group } });
  } catch (err) { next(err); }
});

router.put('/admin/career-groups/:id', adminAuth, async (req, res, next) => {
  try {
    const { name, display_order, is_active } = req.body;
    const [[existing]] = await pool.execute('SELECT * FROM career_groups WHERE id = ?', [req.params.id]);
    if (!existing) throw createError(404, 'Không tìm thấy nhóm ngành', 'NOT_FOUND');
    await pool.execute(
      'UPDATE career_groups SET name = ?, display_order = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
      [name || existing.name, display_order !== undefined ? display_order : existing.display_order,
       is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active, req.params.id]
    );
    const [[group]] = await pool.execute('SELECT * FROM career_groups WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: { group } });
  } catch (err) { next(err); }
});

router.delete('/admin/career-groups/:id', adminAuth, async (req, res, next) => {
  try {
    const [[existing]] = await pool.execute('SELECT * FROM career_groups WHERE id = ?', [req.params.id]);
    if (!existing) throw createError(404, 'Không tìm thấy nhóm ngành', 'NOT_FOUND');
    await pool.execute('UPDATE career_groups SET is_active = 0, updated_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã vô hiệu hóa nhóm ngành' });
  } catch (err) { next(err); }
});

// ── CAREERS CRUD ─────────────────────────────────
router.get('/admin/careers', adminAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, cg.name AS group_name FROM careers c
       LEFT JOIN career_groups cg ON c.career_group_id = cg.id
       ORDER BY c.id ASC`
    );
    res.json({ success: true, data: { careers: rows } });
  } catch (err) { next(err); }
});

router.post('/admin/careers', adminAuth, async (req, res, next) => {
  try {
    const { holland_code, career_name, career_group_id, major_group, description, required_skills, learning_suggestion, is_active } = req.body;
    const groupName = major_group || '';
    if (!holland_code || !career_name) {
      throw createError(400, 'Mã Holland và tên nghề là bắt buộc', 'MISSING_FIELDS');
    }

    const [result] = await pool.execute(
      `INSERT INTO careers (holland_code, career_name, career_group_id, major_group, description, required_skills, learning_suggestion, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [holland_code, career_name, career_group_id || null, groupName,
       description || null, required_skills || null, learning_suggestion || null,
       is_active !== undefined ? (is_active ? 1 : 0) : 1]
    );
    const [[career]] = await pool.execute(
      `SELECT c.*, cg.name AS group_name FROM careers c
       LEFT JOIN career_groups cg ON c.career_group_id = cg.id WHERE c.id = ?`, [result.insertId]
    );
    res.status(201).json({ success: true, data: { career } });
  } catch (err) { next(err); }
});

router.put('/admin/careers/:id', adminAuth, async (req, res, next) => {
  try {
    const { holland_code, career_name, career_group_id, major_group, description, required_skills, learning_suggestion, is_active } = req.body;
    const [[existing]] = await pool.execute('SELECT * FROM careers WHERE id = ?', [req.params.id]);
    if (!existing) throw createError(404, 'Không tìm thấy ngành nghề', 'NOT_FOUND');

    await pool.execute(
      `UPDATE careers SET holland_code = ?, career_name = ?, career_group_id = ?, major_group = ?, description = ?,
       required_skills = ?, learning_suggestion = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        holland_code || existing.holland_code,
        career_name || existing.career_name,
        career_group_id !== undefined ? career_group_id : existing.career_group_id,
        major_group !== undefined ? major_group : existing.major_group,
        description !== undefined ? description : existing.description,
        required_skills !== undefined ? required_skills : existing.required_skills,
        learning_suggestion !== undefined ? learning_suggestion : existing.learning_suggestion,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        req.params.id,
      ]
    );
    const [[career]] = await pool.execute(
      `SELECT c.*, cg.name AS group_name FROM careers c
       LEFT JOIN career_groups cg ON c.career_group_id = cg.id WHERE c.id = ?`, [req.params.id]
    );
    res.json({ success: true, data: { career } });
  } catch (err) { next(err); }
});

router.delete('/admin/careers/:id', adminAuth, async (req, res, next) => {
  try {
    const [[existing]] = await pool.execute('SELECT * FROM careers WHERE id = ?', [req.params.id]);
    if (!existing) throw createError(404, 'Không tìm thấy ngành nghề', 'NOT_FOUND');

    await pool.execute('UPDATE careers SET is_active = 0, updated_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã vô hiệu hóa ngành nghề' });
  } catch (err) { next(err); }
});

// ── USERS ────────────────────────────────────────
router.get('/admin/users', adminAuth, async (req, res, next) => {
  try {
    const { search, province, school, user_type, page, limit, sortKey, sortDir } = req.query;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    const ALLOWED_SORTS = ['full_name', 'email', 'phone', 'user_type', 'school', 'province', 'holland_code', 'created_at'];
    const sort = ALLOWED_SORTS.includes(sortKey) ? sortKey : 'created_at';
    const dir = sortDir === 'asc' ? 'ASC' : 'DESC';
    const orderClause = sort === 'holland_code'
      ? `ORDER BY t.holland_code ${dir}`
      : `ORDER BY u.${sort} ${dir}`;

    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (province) { where += ' AND u.province = ?'; params.push(province); }
    if (school) { where += ' AND u.school LIKE ?'; params.push(`%${school}%`); }
    if (user_type) { where += ' AND u.user_type = ?'; params.push(user_type); }

    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM users u ${where}`, params);

    const [rows] = await pool.execute(
      `SELECT u.*, t.holland_code, t.result_token
       FROM users u LEFT JOIN test_results t ON u.id = t.user_id
       ${where} ${orderClause} LIMIT ${limitNum} OFFSET ${offset}`,
      params
    );

    res.json({ success: true, data: { users: rows, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
});

router.get('/admin/users/:id', adminAuth, async (req, res, next) => {
  try {
    const [[user]] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) throw createError(404, 'Không tìm thấy người dùng', 'NOT_FOUND');

    const [results] = await pool.execute('SELECT * FROM test_results WHERE user_id = ?', [req.params.id]);
    const [emailLogs] = await pool.execute('SELECT * FROM email_logs WHERE user_id = ? ORDER BY created_at DESC', [req.params.id]);

    res.json({ success: true, data: { user, results, emailLogs } });
  } catch (err) { next(err); }
});

// ── RESULTS ──────────────────────────────────────
router.get('/admin/results', adminAuth, async (req, res, next) => {
  try {
    const { search, holland_code, date_from, date_to, page, limit } = req.query;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (holland_code) { where += ' AND t.holland_code = ?'; params.push(holland_code); }
    if (date_from) { where += ' AND DATE(t.created_at) >= ?'; params.push(date_from); }
    if (date_to) { where += ' AND DATE(t.created_at) <= ?'; params.push(date_to); }

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM test_results t JOIN users u ON t.user_id = u.id ${where}`, params
    );

    const [rows] = await pool.execute(
      `SELECT t.*, u.full_name, u.email, u.phone, u.school, u.province
       FROM test_results t JOIN users u ON t.user_id = u.id
       ${where} ORDER BY t.created_at DESC LIMIT ${limitNum} OFFSET ${offset}`,
      params
    );

    res.json({ success: true, data: { results: rows, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
});

router.get('/admin/results/:id', adminAuth, async (req, res, next) => {
  try {
    const [[result]] = await pool.execute(
      `SELECT t.*, u.full_name, u.email, u.school, u.province
       FROM test_results t JOIN users u ON t.user_id = u.id WHERE t.id = ?`, [req.params.id]
    );
    if (!result) throw createError(404, 'Không tìm thấy kết quả', 'NOT_FOUND');

    const [answers] = await pool.execute(
      `SELECT a.*, q.content, q.holland_type FROM answers a
       JOIN questions q ON a.question_id = q.id WHERE a.user_id = ?`,
      [result.user_id]
    );

    res.json({ success: true, data: { result, answers } });
  } catch (err) { next(err); }
});

router.delete('/admin/results/:id', adminAuth, superAdminOnly, async (req, res, next) => {
  try {
    const [[result]] = await pool.execute('SELECT * FROM test_results WHERE id = ?', [req.params.id]);
    if (!result) throw createError(404, 'Không tìm thấy kết quả', 'NOT_FOUND');

    await pool.execute('DELETE FROM answers WHERE user_id = ?', [result.user_id]);
    await pool.execute('DELETE FROM email_logs WHERE result_id = ?', [req.params.id]);
    await pool.execute('DELETE FROM test_results WHERE id = ?', [req.params.id]);
    await pool.execute('DELETE FROM users WHERE id = ?', [result.user_id]);

    res.json({ success: true, message: 'Đã xóa kết quả và dữ liệu liên quan' });
  } catch (err) { next(err); }
});

// ── EMAIL LOGS ───────────────────────────────────
router.get('/admin/email-logs', adminAuth, async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    let where = 'WHERE 1=1';
    const params = [];
    if (status && ['pending','sent','failed'].includes(status)) {
      where += ' AND e.status = ?';
      params.push(status);
    }

    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM email_logs e ${where}`, params);

    const [rows] = await pool.execute(
      `SELECT e.*, u.full_name, u.email AS user_email, t.holland_code
       FROM email_logs e JOIN users u ON e.user_id = u.id
       LEFT JOIN test_results t ON e.result_id = t.id
       ${where} ORDER BY e.created_at DESC LIMIT ${limitNum} OFFSET ${offset}`,
      params
    );

    res.json({ success: true, data: { logs: rows, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) { next(err); }
});

router.post('/admin/email-logs/:id/resend', adminAuth, async (req, res, next) => {
  try {
    const [[log]] = await pool.execute('SELECT * FROM email_logs WHERE id = ?', [req.params.id]);
    if (!log) throw createError(404, 'Không tìm thấy email log', 'NOT_FOUND');

    const [[result]] = await pool.execute(
      `SELECT t.*, u.full_name, u.email FROM test_results t
       JOIN users u ON t.user_id = u.id WHERE t.id = ?`, [log.result_id]
    );
    if (!result) throw createError(404, 'Không tìm thấy kết quả', 'NOT_FOUND');

    const user = { id: result.user_id, full_name: result.full_name, email: result.email };

    const hollandService = require('../services/hollandService');
    const careers = await hollandService.getCareerRecommendations(result.holland_code);
    await sendResultEmail(user, result, careers);

    res.json({ success: true, message: 'Đã gửi lại email' });
  } catch (err) { next(err); }
});

// ── EXPORT CSV ───────────────────────────────────
router.get('/admin/export/users', adminAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.full_name, u.email, u.phone, u.school, u.province, u.user_type, u.consent_status,
              t.holland_code, t.score_r, t.score_i, t.score_a, t.score_s, t.score_e, t.score_c, t.created_at
       FROM users u LEFT JOIN test_results t ON u.id = t.user_id ORDER BY u.created_at DESC`
    );

    const headers = 'Họ tên,Email,SĐT,Trường,Tỉnh/Thành,Loại,Đồng ý,Mã Holland,R,I,A,S,E,C,Ngày làm\n';
    const csv = rows.map(r =>
      `"${r.full_name}","${r.email}","${r.phone}","${r.school || ''}","${r.province}","${r.user_type}",${r.consent_status},${r.holland_code || ''},${r.score_r ?? ''},${r.score_i ?? ''},${r.score_a ?? ''},${r.score_s ?? ''},${r.score_e ?? ''},${r.score_c ?? ''},"${r.created_at ? new Date(r.created_at).toISOString() : ''}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="users-export-${new Date().toISOString().slice(0,10)}.csv"`);
    res.send('﻿' + headers + csv);
  } catch (err) { next(err); }
});

router.get('/admin/export/results', adminAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.full_name, u.email, t.holland_code, t.score_r, t.score_i, t.score_a,
              t.score_s, t.score_e, t.score_c, t.result_token, t.created_at
       FROM test_results t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC`
    );

    const headers = 'Họ tên,Email,Mã Holland,R,I,A,S,E,C,Token,Ngày làm\n';
    const csv = rows.map(r =>
      `"${r.full_name}","${r.email}",${r.holland_code},${r.score_r},${r.score_i},${r.score_a},${r.score_s},${r.score_e},${r.score_c},"${r.result_token}","${new Date(r.created_at).toISOString()}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="results-export-${new Date().toISOString().slice(0,10)}.csv"`);
    res.send('﻿' + headers + csv);
  } catch (err) { next(err); }
});

module.exports = router;
