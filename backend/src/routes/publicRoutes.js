const { Router } = require('express');
const userModel = require('../models/userModel');
const questionModel = require('../models/questionModel');
const answerModel = require('../models/answerModel');
const resultModel = require('../models/resultModel');
const hollandTypeModel = require('../models/hollandTypeModel');
const { validate, submitSurveyRules } = require('../middleware/validators');
const { submitLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { createError } = require('../middleware/errorHandler');
const hollandService = require('../services/hollandService');
const { sendResultEmail } = require('../services/emailService');

const router = Router();

router.get('/questions', apiLimiter, async (req, res, next) => {
  try {
    const questions = await questionModel.findAllActive();
    res.json({ success: true, data: { questions, total: questions.length } });
  } catch (err) { next(err); }
});

router.post('/surveys/submit', submitLimiter, submitSurveyRules, validate, async (req, res, next) => {
  try {
    const { answers, user_info } = req.body;

    const userId = await userModel.create({
      ...user_info,
      ip_address: req.ip,
    });

    await answerModel.batchInsert(userId, answers);

    const questions = await questionModel.findAllActive();
    const scores = hollandService.calculateScores(answers, questions);
    const ranked = hollandService.sortByScore(scores);
    const hollandCode = hollandService.generateHollandCode(ranked);
    const resultToken = hollandService.generateResultToken();

    const resultData = {
      user_id: userId,
      score_r: scores.R, score_i: scores.I, score_a: scores.A,
      score_s: scores.S, score_e: scores.E, score_c: scores.C,
      holland_code: hollandCode,
      top_1: ranked[0], top_2: ranked[1], top_3: ranked[2],
      result_token: resultToken,
    };

    const { insertId } = await resultModel.create(resultData);
    const careers = await hollandService.getCareerRecommendations(hollandCode);

    const user = await userModel.findById(userId);
    const result = { id: insertId, ...resultData };
    sendResultEmail(user, result, careers).catch(err =>
      console.error('Async email failed:', err.message)
    );

    res.status(201).json({
      success: true,
      data: {
        result_token: resultToken,
        holland_code: hollandCode,
        scores: scores,
        top_three: ranked.slice(0, 3),
        top_1: { type: ranked[0], ...hollandService.TYPE_DESCRIPTIONS[ranked[0]] },
        top_2: { type: ranked[1], ...hollandService.TYPE_DESCRIPTIONS[ranked[1]] },
        top_3: { type: ranked[2], ...hollandService.TYPE_DESCRIPTIONS[ranked[2]] },
        careers,
        result_url: `/result/${resultToken}`,
      },
    });
  } catch (err) { next(err); }
});

router.get('/results/:token', apiLimiter, async (req, res, next) => {
  try {
    const result = await resultModel.findByToken(req.params.token);
    if (!result) throw createError(404, 'Không tìm thấy kết quả', 'NOT_FOUND');

    const ranked = [result.top_1, result.top_2, result.top_3];
    const careers = await hollandService.getCareerRecommendations(result.holland_code);

    res.json({
      success: true,
      data: {
        full_name: result.full_name,
        holland_code: result.holland_code,
        scores: {
          R: result.score_r, I: result.score_i, A: result.score_a,
          S: result.score_s, E: result.score_e, C: result.score_c,
        },
        top_three: ranked,
        top_1: { type: ranked[0], ...hollandService.TYPE_DESCRIPTIONS[ranked[0]] },
        top_2: { type: ranked[1], ...hollandService.TYPE_DESCRIPTIONS[ranked[1]] },
        top_3: { type: ranked[2], ...hollandService.TYPE_DESCRIPTIONS[ranked[2]] },
        careers,
        result_token: result.result_token,
      },
    });
  } catch (err) { next(err); }
});

router.post('/results/:token/send-email', apiLimiter, async (req, res, next) => {
  try {
    const result = await resultModel.findByToken(req.params.token);
    if (!result) throw createError(404, 'Không tìm thấy kết quả', 'NOT_FOUND');

    const careers = await hollandService.getCareerRecommendations(result.holland_code);
    const user = { id: result.user_id, full_name: result.full_name, email: result.email };

    await sendResultEmail(user, result, careers);

    res.json({ success: true, message: 'Email đã được gửi thành công' });
  } catch (err) { next(err); }
});

router.get('/careers/recommendations', apiLimiter, async (req, res, next) => {
  try {
    const code = req.query.code;
    if (!code || code.length < 3) throw createError(400, 'Mã Holland không hợp lệ', 'INVALID_CODE');
    const careers = await hollandService.getCareerRecommendations(code);
    res.json({ success: true, data: { careers } });
  } catch (err) { next(err); }
});

router.get('/holland-types', async (req, res, next) => {
  try {
    const types = await hollandTypeModel.findAll();
    res.json({ success: true, data: { types } });
  } catch (err) { next(err); }
});

module.exports = router;
