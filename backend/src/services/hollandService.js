const crypto = require('crypto');
const pool = require('../config/db');

const HOLLAND_TYPES = ['R', 'I', 'A', 'S', 'E', 'C'];
const PRIORITY_MAP = { R: 0, I: 1, A: 2, S: 3, E: 4, C: 5 };

const TYPE_DESCRIPTIONS = {
  R: { name: 'Realistic - Kỹ thuật', color: '#e74c3c', description: 'Bạn là người thực tế, thích làm việc với máy móc, công cụ và các hoạt động ngoài trời. Bạn giải quyết vấn đề bằng hành động cụ thể.' },
  I: { name: 'Investigative - Nghiên cứu', color: '#3498db', description: 'Bạn là người thích phân tích, nghiên cứu và tìm hiểu bản chất của sự vật. Bạn suy nghĩ logic và thích khám phá kiến thức mới.' },
  A: { name: 'Artistic - Nghệ thuật', color: '#9b59b6', description: 'Bạn là người sáng tạo, có óc thẩm mỹ và thích thể hiện bản thân qua nghệ thuật. Bạn đề cao sự độc đáo và tự do biểu đạt.' },
  S: { name: 'Social - Xã hội', color: '#2ecc71', description: 'Bạn là người thích giúp đỡ, chia sẻ và làm việc với con người. Bạn có khả năng đồng cảm và thích đóng góp cho cộng đồng.' },
  E: { name: 'Enterprising - Quản lý', color: '#f39c12', description: 'Bạn là người năng động, thích lãnh đạo và thuyết phục. Bạn có tham vọng và thích chinh phục thử thách trong kinh doanh.' },
  C: { name: 'Conventional - Quy củ', color: '#1abc9c', description: 'Bạn là người tỉ mỉ, cẩn thận và thích làm việc với dữ liệu. Bạn coi trọng quy trình, tổ chức và sự chính xác.' },
};

function calculateScores(answers, questions) {
  const typeQuestions = {};
  for (const q of questions) {
    if (!typeQuestions[q.holland_type]) typeQuestions[q.holland_type] = [];
    typeQuestions[q.holland_type].push(q.id);
  }

  const answerMap = {};
  for (const a of answers) {
    answerMap[a.question_id] = a.answer_value;
  }

  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  for (const [type, questionIds] of Object.entries(typeQuestions)) {
    let sum = 0;
    let count = 0;
    for (const qId of questionIds) {
      if (answerMap[qId] !== undefined) {
        sum += answerMap[qId];
        count++;
      }
    }
    scores[type] = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  }

  return scores;
}

function sortByScore(scores) {
  return Object.entries(scores)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return PRIORITY_MAP[a[0]] - PRIORITY_MAP[b[0]];
    })
    .map(([type]) => type);
}

function generateHollandCode(ranked) {
  return [ranked[0], ranked[1], ranked[2]].join('');
}

function generateResultToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function getCareerRecommendations(hollandCode) {
  const code = hollandCode.toUpperCase();
  let careers = [];

  const [exact] = await pool.execute(
    'SELECT * FROM careers WHERE holland_code = ? AND is_active = 1', [code]
  );
  careers = exact;

  if (careers.length < 5) {
    const codes = [code[0] + code[1], code[0] + code[2]];
    for (const c of codes) {
      const [rows] = await pool.execute(
        'SELECT * FROM careers WHERE holland_code LIKE ? AND is_active = 1 AND holland_code != ? LIMIT 5',
        [`${c}%`, code]
      );
      careers = careers.concat(rows);
    }
  }

  return careers.slice(0, 8);
}

module.exports = {
  HOLLAND_TYPES, PRIORITY_MAP, TYPE_DESCRIPTIONS,
  calculateScores, sortByScore, generateHollandCode,
  generateResultToken, getCareerRecommendations,
};
