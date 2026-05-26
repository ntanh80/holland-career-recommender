import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { jsPDF } from 'jspdf';
import api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { toast } from '../components/ui/Toast';

const TYPE_COLORS = { R: '#e74c3c', I: '#3498db', A: '#9b59b6', S: '#2ecc71', E: '#f39c12', C: '#1abc9c' };
const TYPE_LABELS = { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' };
const TYPE_VN = { R: 'Kỹ thuật', I: 'Nghiên cứu', A: 'Nghệ thuật', S: 'Xã hội', E: 'Quản lý', C: 'Quy củ' };

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
  C: 'Môi trường có tổ chức, quy củ, nơi bạn có thể làm việc với dữ liệu và quy trình.',
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const d = result;
    doc.setFontSize(20);
    doc.text('Ket qua Trac nghiem Huong nghiep', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Ho ten: ${d.full_name}`, 20, 35);
    doc.text(`Ma Holland: ${d.holland_code}`, 20, 45);
    doc.setFontSize(11);
    let y = 60;
    doc.text(`Diem tung nhom:`, 20, y);
    y += 8;
    Object.entries(d.scores).forEach(([k, v]) => {
      doc.text(`  ${k} (${TYPE_VN[k]}): ${v.toFixed(1)}`, 20, y);
      y += 7;
    });
    y += 5;
    doc.text(`Top 3 nhom noi bat: ${d.top_three.join(', ')}`, 20, y);
    y += 8;
    if (d.careers?.length) {
      doc.text('Nghe nghiep goi y:', 20, y);
      y += 8;
      d.careers.slice(0, 8).forEach(c => {
        doc.text(`  - ${c.career_name} (${c.major_group})`, 20, y);
        y += 7;
      });
    }
    doc.save(`Holland-${d.full_name}-${d.holland_code}.pdf`);
  };

  if (loading) return <LoadingSpinner message="Đang tải kết quả..." />;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-red-500">{error}</div>;
  if (!result) return null;

  const chartData = Object.entries(result.scores).map(([k, v]) => ({
    type: `${k} - ${TYPE_VN[k]}`,
    score: v,
    fill: TYPE_COLORS[k],
  }));

  const radarData = Object.entries(result.scores).map(([k, v]) => ({ type: k, score: v }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-gray-500 mb-2">Kết quả trắc nghiệm của</p>
        <h1 className="text-3xl font-bold">{result.full_name}</h1>
      </div>

      {/* Holland Code */}
      <Card className="!bg-gradient-to-br from-primary-600 to-purple-700 text-white text-center !p-8">
        <p className="text-blue-100 mb-2">Mã Holland của bạn</p>
        <div className="text-6xl font-extrabold tracking-[0.3em] mb-3">{result.holland_code}</div>
        <p className="text-blue-200">{result.top_three.map(t => `${t} - ${TYPE_VN[t]}`).join(' | ')}</p>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold text-lg mb-4 text-center">Biểu đồ điểm số</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 50]} />
              <Tooltip />
              <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="font-bold text-lg mb-4 text-center">Hồ sơ Holland</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="type" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 50]} />
              <Radar dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {result.top_three.map((type, i) => (
          <Card key={type} className="border-t-4" style={{ borderTopColor: TYPE_COLORS[type] }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-gray-400">TOP {i + 1}</span>
              <span className="px-2 py-0.5 text-xs font-bold text-white rounded" style={{ backgroundColor: TYPE_COLORS[type] }}>{type}</span>
              <h3 className="font-bold">{TYPE_LABELS[type]}</h3>
            </div>
            <p className="text-sm text-gray-600">{result[`top_${i + 1}`].description}</p>
          </Card>
        ))}
      </div>

      {/* Điểm mạnh */}
      <Card>
        <h2 className="font-bold text-lg mb-4">Điểm mạnh</h2>
        <div className="flex flex-wrap gap-2">
          {result.top_three.flatMap(t => STRENGTHS[t].map(s => `${s}`)).map((s, i) => (
            <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">{s}</span>
          ))}
        </div>
      </Card>

      {/* Môi trường phù hợp */}
      <Card>
        <h2 className="font-bold text-lg mb-3">Môi trường học tập/làm việc phù hợp</h2>
        <div className="space-y-3">
          {result.top_three.map(type => (
            <div key={type} className="flex items-start gap-3">
              <span className="px-2 py-0.5 text-xs font-bold text-white rounded" style={{ backgroundColor: TYPE_COLORS[type] }}>{type}</span>
              <p className="text-gray-600">{ENVIRONMENTS[type]}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Ngành nghề gợi ý */}
      <Card>
        <h2 className="font-bold text-lg mb-4">Ngành nghề gợi ý</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.careers?.map((c, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
              <h3 className="font-semibold text-primary-700">{c.career_name}</h3>
              <p className="text-xs text-gray-400 mb-1">{c.major_group}</p>
              <p className="text-sm text-gray-600 mb-2">{c.description}</p>
              {c.required_skills && <p className="text-xs text-gray-500"><strong>Kỹ năng:</strong> {c.required_skills}</p>}
              {c.learning_suggestion && <p className="text-xs text-gray-500 mt-1"><strong>Học tập:</strong> {c.learning_suggestion}</p>}
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button onClick={handleDownloadPDF}>Tải PDF kết quả</Button>
        <Button variant="outline" onClick={handleResendEmail}>Gửi lại kết quả qua email</Button>
      </div>
    </div>
  );
}
