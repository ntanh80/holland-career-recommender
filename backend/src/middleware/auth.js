const jwt = require('jsonwebtoken');
const env = require('../config/env');
const adminModel = require('../models/adminModel');
const { createError } = require('./errorHandler');

async function adminAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw createError(401, 'Vui lòng đăng nhập', 'UNAUTHORIZED');
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, env.jwt.secret);
    const admin = await adminModel.findById(decoded.id);
    if (!admin) throw createError(401, 'Tài khoản không tồn tại', 'UNAUTHORIZED');
    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(createError(401, 'Phiên đăng nhập hết hạn', 'TOKEN_INVALID'));
    }
    next(err);
  }
}

function superAdminOnly(req, res, next) {
  if (req.admin.role !== 'super_admin') {
    return next(createError(403, 'Yêu cầu quyền super_admin', 'FORBIDDEN'));
  }
  next();
}

module.exports = { adminAuth, superAdminOnly };
