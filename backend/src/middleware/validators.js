const { body, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        details: errors.array().map(e => ({ field: e.path, message: e.msg })),
      },
    });
  }
  next();
};

const submitSurveyRules = [
  body('answers').isArray({ min: 1 }).withMessage('Vui lòng trả lời ít nhất 1 câu hỏi'),
  body('answers.*.question_id').isInt({ min: 1 }).withMessage('question_id không hợp lệ'),
  body('answers.*.answer_value').isInt({ min: 1, max: 5 }).withMessage('answer_value phải từ 1 đến 5'),
  body('user_info.full_name').trim().notEmpty().withMessage('Họ và tên là bắt buộc'),
  body('user_info.email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('user_info.phone').trim().notEmpty().withMessage('Số điện thoại là bắt buộc')
    .matches(/^[0-9+\-\s]{7,15}$/).withMessage('Số điện thoại không hợp lệ'),
  body('user_info.user_type').isIn(['hoc_sinh', 'sinh_vien', 'phu_huynh', 'giao_vien', 'nguoi_di_lam', 'khac'])
    .withMessage('Loại người dùng không hợp lệ'),
  body('user_info.school').trim().notEmpty().withMessage('Trường đang học là bắt buộc'),
  body('user_info.desired_major').trim().notEmpty().withMessage('Ngành học mong muốn là bắt buộc'),
  body('user_info.desired_university').trim().notEmpty().withMessage('Trường đại học mong muốn là bắt buộc'),
  body('user_info.province').trim().notEmpty().withMessage('Tỉnh/Thành là bắt buộc'),
  body('user_info.consent_status').isBoolean().withMessage('Vui lòng đồng ý điều khoản'),
];

const sendEmailRules = [
  query('email').isEmail().withMessage('Email không hợp lệ'),
];

module.exports = { validate, submitSurveyRules, sendEmailRules };
