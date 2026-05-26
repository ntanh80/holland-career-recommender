const transporter = require('../config/nodemailer');
const emailLogModel = require('../models/emailLogModel');
const { TYPE_DESCRIPTIONS } = require('./hollandService');

function buildEmailHtml(data) {
  const { full_name, holland_code, scores, top_three, careers, result_url } = data;
  const topNames = top_three.map(t => TYPE_DESCRIPTIONS[t].name).join(', ');

  const scoreRows = Object.entries(scores)
    .map(([k, v]) => {
      const info = TYPE_DESCRIPTIONS[k];
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee"><strong>${info.name.split(' - ')[0]}</strong></td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee">${info.name.split(' - ')[1]}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-weight:bold;font-size:16px">${v.toFixed(1)}</td></tr>`;
    }).join('');

  const careerItems = careers.map(c =>
    `<li style="margin-bottom:12px;padding:10px;background:#f8fafc;border-radius:6px">
      <strong style="color:#2563eb">${c.career_name}</strong><br>
      <span style="color:#64748b">${c.major_group}</span><br>
      <span style="font-size:14px">${c.description || ''}</span>
    </li>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
  <tr><td style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:40px 30px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">Kết Quả Trắc Nghiệm Hướng Nghiệp Holland</h1>
  </td></tr>
  <tr><td style="padding:30px">
    <p>Xin chào <strong>${full_name}</strong>,</p>
    <p>Cảm ơn bạn đã hoàn thành bài trắc nghiệm hướng nghiệp Holland/RIASEC. Dưới đây là kết quả của bạn:</p>

    <div style="background:#f0f9ff;border:2px solid #2563eb;border-radius:10px;padding:20px;text-align:center;margin:20px 0">
      <div style="font-size:14px;color:#64748b">Mã Holland của bạn</div>
      <div style="font-size:42px;font-weight:bold;color:#2563eb;letter-spacing:8px">${holland_code}</div>
      <div style="font-size:14px;color:#64748b;margin-top:4px">${topNames}</div>
    </div>

    <h2 style="color:#1e293b;font-size:18px">Điểm từng nhóm</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">
      ${scoreRows}
    </table>

    ${careers.length ? `<h2 style="color:#1e293b;font-size:18px">Ngành nghề gợi ý</h2><ul style="padding-left:0;list-style:none">${careerItems}</ul>` : ''}

    <div style="text-align:center;margin:30px 0">
      <a href="${result_url}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">Xem kết quả chi tiết</a>
    </div>

    <p style="color:#64748b;font-size:14px;margin-top:20px">Nếu bạn cần tư vấn thêm về hướng nghiệp, vui lòng liên hệ với chúng tôi.</p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px;text-align:center;color:#94a3b8;font-size:12px">
    Email này được gửi tự động từ hệ thống trắc nghiệm hướng nghiệp Holland.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

async function sendResultEmail(user, result, careers) {
  const resultUrl = `${process.env.APP_URL || 'http://localhost:5173'}/result/${result.result_token}`;
  const topThree = [result.top_1, result.top_2, result.top_3];

  const html = buildEmailHtml({
    full_name: user.full_name,
    holland_code: result.holland_code,
    scores: {
      R: result.score_r, I: result.score_i, A: result.score_a,
      S: result.score_s, E: result.score_e, C: result.score_c,
    },
    top_three: topThree,
    careers: careers,
    result_url: resultUrl,
  });

  const subject = `Kết quả Trắc nghiệm Hướng nghiệp Holland - ${user.full_name} (${result.holland_code})`;

  const logData = {
    user_id: user.id,
    result_id: result.id,
    email: user.email,
    subject,
    status: 'pending',
  };
  const logId = await emailLogModel.create(logData);

  try {
    await transporter.sendMail({
      from: `"Trắc nghiệm Hướng nghiệp" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      html,
    });
    await emailLogModel.updateStatus(logId, 'sent');
  } catch (err) {
    await emailLogModel.updateStatus(logId, 'failed', err.message);
    console.error('Email send failed:', err.message);
  }
}

module.exports = { sendResultEmail, buildEmailHtml };
