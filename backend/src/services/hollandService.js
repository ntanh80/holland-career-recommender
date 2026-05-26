const crypto = require('crypto');
const pool = require('../config/db');

const HOLLAND_TYPES = ['R', 'I', 'A', 'S', 'E', 'C'];
const PRIORITY_MAP = { R: 0, I: 1, A: 2, S: 3, E: 4, C: 5 };

const TYPE_DESCRIPTIONS = {
  R: { name: 'Realistic - Kỹ thuật', color: '#e74c3c', description: 'Bạn thích làm việc với những vật cụ thể, máy móc, dụng cụ, cây cối, con vật hoặc các hoạt động ngoài trời. Bạn giải quyết vấn đề bằng hành động thực tế.' },
  I: { name: 'Investigative - Nghiên cứu', color: '#3498db', description: 'Bạn thích quan sát, tìm tòi, điều tra, phân tích, đánh giá hoặc giải quyết vấn đề. Bạn suy nghĩ logic và ham học hỏi.' },
  A: { name: 'Artistic - Nghệ thuật', color: '#9b59b6', description: 'Bạn có khả năng nghệ thuật, sáng tác, trực giác và thích làm việc trong các tình huống không có kế hoạch trước, dùng trí tưởng tượng và sáng tạo.' },
  S: { name: 'Social - Xã hội', color: '#2ecc71', description: 'Bạn thích làm việc cung cấp hoặc làm sáng tỏ thông tin, thích giúp đỡ, huấn luyện, chữa trị hoặc chăm sóc người khác, có khả năng về ngôn ngữ.' },
  E: { name: 'Enterprising - Quản lý', color: '#f39c12', description: 'Bạn thích làm việc với người khác, có khả năng tác động, thuyết phục, thể hiện, lãnh đạo hoặc quản lý mục tiêu tổ chức và lợi ích kinh tế.' },
  C: { name: 'Conventional - Nghiệp vụ', color: '#1abc9c', description: 'Bạn thích làm việc với dữ liệu, con số, có khả năng làm việc văn phòng, thống kê. Bạn tỉ mỉ, cẩn thận và thích làm theo hướng dẫn.' },
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

function permute3(code) {
  const [a, b, c] = code.split('');
  return [
    a + b + c, a + c + b,
    b + a + c, b + c + a,
    c + a + b, c + b + a,
  ];
}

async function getCareerRecommendations(hollandCode) {
  const code = hollandCode.toUpperCase();
  const top3 = code.split('');
  const seen = new Set();
  const careers = [];

  // Priority 1: exact match on any permutation of the 3-letter code
  const perms = permute3(code);
  for (const p of perms) {
    const [rows] = await pool.execute(
      'SELECT * FROM careers WHERE holland_code = ? AND is_active = 1', [p]
    );
    for (const r of rows) {
      if (!seen.has(r.id)) { seen.add(r.id); careers.push({ ...r, _match: 'exact' }); }
    }
  }

  // Priority 2: 2-letter prefix matches from top 3 letters
  const pairs = [
    top3[0] + top3[1], top3[0] + top3[2],
    top3[1] + top3[0], top3[1] + top3[2],
    top3[2] + top3[0], top3[2] + top3[1],
  ];
  for (const pair of [...new Set(pairs)]) {
    const [rows] = await pool.execute(
      'SELECT * FROM careers WHERE holland_code LIKE ? AND is_active = 1 LIMIT 10', [`${pair}%`]
    );
    for (const r of rows) {
      if (!seen.has(r.id)) { seen.add(r.id); careers.push({ ...r, _match: 'two_letter' }); }
    }
  }

  // Priority 3: single letter matches from top types
  for (const t of top3) {
    const [rows] = await pool.execute(
      'SELECT * FROM careers WHERE holland_code LIKE ? AND is_active = 1 LIMIT 5', [`${t}%`]
    );
    for (const r of rows) {
      if (!seen.has(r.id)) { seen.add(r.id); careers.push({ ...r, _match: 'single' }); }
    }
  }

  return careers.slice(0, 8);
}

module.exports = {
  HOLLAND_TYPES, PRIORITY_MAP, TYPE_DESCRIPTIONS,
  calculateScores, sortByScore, generateHollandCode,
  generateResultToken, getCareerRecommendations,
};
