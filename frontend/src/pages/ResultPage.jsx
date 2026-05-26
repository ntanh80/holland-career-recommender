import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { toast } from '../components/ui/Toast';

const TYPE_COLORS = { R: '#e74c3c', I: '#3498db', A: '#9b59b6', S: '#2ecc71', E: '#f39c12', C: '#1abc9c' };
const TYPE_LABELS = { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' };
const TYPE_VN = { R: 'Kỹ thuật', I: 'Nghiên cứu', A: 'Nghệ thuật', S: 'Xã hội', E: 'Quản lý', C: 'Nghiệp vụ' };

const STRENGTHS = {
  R: ['Thực tế', 'Kiên trì', 'Khéo léo', 'Thích vận động'],
  I: ['Phân tích', 'Logic', 'Tò mò', 'Độc lập'],
  A: ['Sáng tạo', 'Trực giác', 'Thẩm mỹ', 'Độc đáo'],
  S: ['Đồng cảm', 'Giao tiếp', 'Kiên nhẫn', 'Hợp tác'],
  E: ['Lãnh đạo', 'Thuyết phục', 'Tự tin', 'Năng động'],
  C: ['Tỉ mỉ', 'Cẩn thận', 'Tổ chức', 'Chính xác'],
};

const ENVIRONMENTS = {
  R: 'Môi trường làm việc thực tế, có cấu trúc, liên quan đến máy móc và công cụ.',
  I: 'Môi trường học thuật, nghiên cứu, nơi bạn có thể khám phá và phân tích.',
  A: 'Môi trường sáng tạo, linh hoạt, nơi bạn có thể tự do biểu đạt ý tưởng.',
  S: 'Môi trường hợp tác, hỗ trợ, nơi bạn có thể làm việc trực tiếp với con người.',
  E: 'Môi trường cạnh tranh, năng động, nơi bạn có thể lãnh đạo và tạo ảnh hưởng.',
  C: 'Môi trường có tổ chức, chuyên nghiệp, nơi bạn có thể làm việc với dữ liệu và quy trình.',
};

export default function ResultPage() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/results/${token}`)
      .then(res => setResult(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleResendEmail = async () => {
    try {
      await api.post(`/results/${token}/send-email`);
      toast.success('Email đã được gửi lại thành công!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDownloadPDF = async () => {
    const d = result;
    const today = new Date().toLocaleDateString('vi-VN');

    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;background:#fff;font-family:"Segoe UI",Arial,Tahoma,sans-serif;color:#1a1a2e;';
    el.innerHTML = `
    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;font-size:26px;margin:0 0 4px;letter-spacing:1px;">KẾT QUẢ TRẮC NGHIỆM HƯỚNG NGHIỆP</h1>
      <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;">Holland Code / RIASEC Assessment</p>
    </div>

    <!-- PERSON + CODE -->
    <div style="background:#f8fafc;padding:24px 40px;border-bottom:1px solid #e2e8f0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="vertical-align:top;padding-right:32px;">
            <p style="font-size:11px;color:#64748b;margin:0 0 2px;text-transform:uppercase;letter-spacing:1px;">Người thực hiện</p>
            <p style="font-size:18px;font-weight:700;margin:0;color:#0f172a;">${d.full_name}</p>
            <p style="font-size:13px;color:#475569;margin:8px 0 0;">Ngày thực hiện: ${today}</p>
          </td>
          <td style="vertical-align:top;text-align:center;border-left:2px solid #e2e8f0;padding-left:32px;">
            <p style="font-size:11px;color:#64748b;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Mã Holland</p>
            <p style="font-size:48px;font-weight:900;margin:0;color:#2563eb;letter-spacing:8px;">${d.holland_code}</p>
            <p style="font-size:12px;color:#475569;margin:4px 0 0;">${d.top_three.map(t => `${t} - ${TYPE_VN[t]}`).join(' • ')}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- SCORES -->
    <div style="padding:28px 40px;">
      <h2 style="font-size:16px;color:#0f172a;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #2563eb;">ĐIỂM SỐ 6 NHÓM TÍNH CÁCH</h2>
      ${Object.entries(d.scores).sort(([,a],[,b]) => b - a).map(([k, v], i) => `
        <div style="margin-bottom:10px;display:flex;align-items:center;gap:12px;">
          <span style="font-weight:700;font-size:12px;width:22px;color:#94a3b8;text-align:right;">#${i + 1}</span>
          <span style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;border-radius:8px;background:${TYPE_COLORS[k]};color:#fff;font-weight:700;font-size:14px;">${k}</span>
          <span style="font-size:13px;font-weight:600;width:100px;color:#334155;">${TYPE_VN[k]}</span>
          <div style="flex:1;background:#f1f5f9;height:22px;border-radius:11px;overflow:hidden;">
            <div style="background:${TYPE_COLORS[k]};height:22px;border-radius:11px;width:${Math.max((v/5)*100, 8)}%;display:flex;align-items:center;justify-content:flex-end;padding-right:${v > 5 ? '10' : '20'}px;box-sizing:border-box;">
              <span style="color:${v > 25 ? '#fff' : '#334155'};font-size:12px;font-weight:700;">${v.toFixed(1)}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- TOP 3 DETAIL -->
    <div style="background:#f8fafc;padding:28px 40px;border-top:1px solid #e2e8f0;">
      <h2 style="font-size:16px;color:#0f172a;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #2563eb;">CHÂN DUNG TÍNH CÁCH NGHỀ NGHIỆP</h2>
      ${d.top_three.map((type, i) => `
        <div style="margin-bottom:16px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <div style="background:${TYPE_COLORS[type]};padding:12px 16px;">
            <table style="width:100%;"><tr>
              <td><span style="color:rgba(255,255,255,0.8);font-size:11px;font-weight:600;">TOP ${i + 1}</span></td>
              <td style="text-align:right;"><span style="color:#fff;font-size:14px;font-weight:700;">${TYPE_VN[type]}</span><span style="color:rgba(255,255,255,0.7);font-size:12px;margin-left:8px;">${TYPE_LABELS[type]} (${type})</span></td>
            </tr></table>
          </div>
          <div style="padding:14px 16px;">
            <p style="font-size:13px;line-height:1.7;color:#475569;margin:0 0 10px;">${d[`top_${i + 1}`].description}</p>
            <table style="width:100%;font-size:12px;color:#64748b;">
              <tr>
                <td style="padding:4px 0;width:90px;font-weight:600;">Điểm mạnh:</td>
                <td>${STRENGTHS[type].join(', ')}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-weight:600;">Môi trường:</td>
                <td>${ENVIRONMENTS[type]}</td>
              </tr>
            </table>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- CAREERS -->
    <div style="padding:28px 40px;">
      <h2 style="font-size:16px;color:#0f172a;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #2563eb;">NGÀNH NGHỀ GỢI Ý PHÙ HỢP</h2>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <tr style="background:#2563eb;color:#fff;">
          <td style="padding:8px 12px;font-weight:700;border-radius:6px 0 0 0;">Ngành nghề</td>
          <td style="padding:8px 12px;font-weight:700;">Nhóm ngành</td>
          <td style="padding:8px 12px;font-weight:700;border-radius:0 6px 0 0;">Kỹ năng cần phát triển</td>
        </tr>
        ${d.careers?.slice(0, 10).map((c, i) => `
          <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'};">
            <td style="padding:6px 12px;font-weight:600;color:#1e3a5f;">${c.career_name}</td>
            <td style="padding:6px 12px;color:#64748b;">${c.major_group}</td>
            <td style="padding:6px 12px;color:#475569;">${c.required_skills || '—'}</td>
          </tr>
        `).join('') || '<tr><td colspan="3" style="padding:12px;text-align:center;color:#94a3b8;">Không có dữ liệu</td></tr>'}
      </table>
    </div>

    <!-- FOOTER -->
    <div style="background:#1e3a5f;padding:20px 40px;text-align:center;color:rgba(255,255,255,0.6);font-size:11px;line-height:1.6;">
      <p style="margin:0;">Báo cáo được tạo từ hệ thống Trắc nghiệm Hướng nghiệp Holland/RIASEC</p>
      <p style="margin:4px 0 0;">Kết quả chỉ mang tính tham khảo. Hãy liên hệ chuyên gia tư vấn hướng nghiệp để được hỗ trợ chi tiết.</p>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.35);">© ${new Date().getFullYear()} Holland Career Test. All rights reserved.</p>
    </div>
    `;
    document.body.appendChild(el);

    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      document.body.removeChild(el);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const doc = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = position - pageHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save(`Holland-${d.full_name}-${d.holland_code}.pdf`);
    } catch (err) {
      document.body.removeChild(el);
      toast.error('Không thể tạo PDF. Vui lòng thử lại.');
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải kết quả..." />;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-red-500">{error}</div>;
  if (!result) return null;

  const chartData = Object.entries(result.scores).map(([k, v]) => ({
    type: k,
    label: TYPE_VN[k],
    score: v,
    fill: TYPE_COLORS[k],
  }));

  const radarData = Object.entries(result.scores).map(([k, v]) => ({ type: k, score: v }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
          <span className="font-bold" style={{ color: d.fill }}>{d.type} - {d.label}</span>
          <span className="text-gray-600 ml-2">{d.score.toFixed(1)} / 5</span>
        </div>
      );
    }
    return null;
  };

  const sortedScores = Object.entries(result.scores).sort(([, a], [, b]) => b - a);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Kết quả trắc nghiệm của</p>
        <h1 className="text-3xl font-bold text-gray-800">{result.full_name}</h1>
      </div>

      {/* Holland Code Banner */}
      <Card className="!bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white text-center !p-10 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="text-[20rem] font-black leading-none select-none">H</div>
        </div>
        <div className="relative">
          <p className="text-blue-100 text-sm uppercase tracking-widest mb-3">Mã Holland của bạn</p>
          <div className="flex items-center justify-center gap-4 mb-4">
            {result.holland_code.split('').map((letter, i) => (
              <span key={i} className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl font-extrabold shadow-lg border-2 border-white/30"
                style={{ backgroundColor: TYPE_COLORS[letter] + 'dd' }}>{letter}</span>
            ))}
          </div>
          <p className="text-blue-100 text-base">
            {result.top_three.map((t, i) => (
              <span key={t}>{i > 0 && <span className="mx-2 opacity-50">•</span>}<span className="font-semibold">{TYPE_VN[t]}</span></span>
            ))}
          </p>
        </div>
      </Card>

      {/* Score bars */}
      <Card className="!p-6">
        <h2 className="font-bold text-lg mb-5 text-center text-gray-700">Điểm số 6 nhóm tính cách</h2>
        <div className="space-y-3 max-w-2xl mx-auto">
          {sortedScores.map(([k, v], i) => (
            <div key={k} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-300 w-5 text-right">{i + 1}</span>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[k] }}>{k}</span>
              <span className="text-sm font-semibold text-gray-600 w-24 flex-shrink-0">{TYPE_VN[k]}</span>
              <div className="flex-1 bg-gray-100 h-7 rounded-full overflow-hidden">
                <div className="h-full rounded-full flex items-center justify-end px-3 transition-all duration-700" style={{ width: `${Math.max((v / 5) * 100, 6)}%`, backgroundColor: TYPE_COLORS[k] }}>
                  <span className="text-white text-xs font-bold">{v.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="!p-5">
          <h2 className="font-bold text-lg mb-2 text-center text-gray-700">Biểu đồ điểm số</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barSize={34}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="type" tick={{ fontSize: 13, fontWeight: 700 }} interval={0} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tickCount={6} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.type} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="!p-5">
          <h2 className="font-bold text-lg mb-2 text-center text-gray-700">Hồ sơ Holland</h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="type" tick={{ fontSize: 12, fontWeight: 600 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} />
              <Radar dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* TOP 3 Personality Detail */}
      <div>
        <h2 className="text-xl font-bold text-center text-gray-800 mb-5">Chân dung tính cách nghề nghiệp</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {result.top_three.map((type, i) => (
            <Card key={type} className="!p-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="px-5 py-3 text-white" style={{ backgroundColor: TYPE_COLORS[type] }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold opacity-80">TOP {i + 1}</span>
                  <span className="text-2xl font-black opacity-30">{type}</span>
                </div>
                <h3 className="font-bold text-lg">{TYPE_VN[type]}</h3>
                <p className="text-xs opacity-75">{TYPE_LABELS[type]}</p>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{result[`top_${i + 1}`].description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {STRENGTHS[type].map(s => (
                    <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-medium border" style={{ borderColor: TYPE_COLORS[type] + '40', color: TYPE_COLORS[type], backgroundColor: TYPE_COLORS[type] + '08' }}>{s}</span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Strengths + Environment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold text-lg mb-4 text-gray-700">Điểm mạnh nổi bật</h2>
          <div className="space-y-4">
            {result.top_three.map(type => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded text-xs font-bold text-white flex items-center justify-center" style={{ backgroundColor: TYPE_COLORS[type] }}>{type}</span>
                  <span className="text-sm font-semibold text-gray-700">{TYPE_VN[type]}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 ml-8">
                  {STRENGTHS[type].map(s => (
                    <span key={s} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium border border-gray-100">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-lg mb-4 text-gray-700">Môi trường phù hợp</h2>
          <div className="space-y-4">
            {result.top_three.map(type => (
              <div key={type} className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: TYPE_COLORS[type] }}>{type}</span>
                <div>
                  <span className="text-sm font-semibold text-gray-700">{TYPE_VN[type]}</span>
                  <p className="text-sm text-gray-500 mt-0.5">{ENVIRONMENTS[type]}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Career Recommendations */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-700">Ngành nghề gợi ý phù hợp</h2>
          <span className="text-xs text-gray-400">Dựa trên mã Holland <strong className="text-gray-600">{result.holland_code}</strong> của bạn</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.careers?.map((c, i) => (
            <div key={i} className="border border-gray-150 rounded-xl p-4 hover:border-primary-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-800 text-sm">{c.career_name}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[c.holland_code?.[0]] || '#94a3b8' }}>{c.holland_code || '—'}</span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{c.major_group}</p>
              {c.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{c.description}</p>}
              {c.required_skills && (
                <div className="flex items-start gap-1 text-xs text-gray-400">
                  <span className="font-medium flex-shrink-0">KN:</span>
                  <span>{c.required_skills}</span>
                </div>
              )}
            </div>
          ))}
          {(!result.careers || result.careers.length === 0) && (
            <p className="col-span-2 text-center text-gray-400 py-4">Không có dữ liệu ngành nghề</p>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 pb-4">
        <Button onClick={handleDownloadPDF}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Tải PDF kết quả
        </Button>
        <Button variant="outline" onClick={handleResendEmail}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Gửi lại kết quả qua email
        </Button>
      </div>
    </div>
  );
}
