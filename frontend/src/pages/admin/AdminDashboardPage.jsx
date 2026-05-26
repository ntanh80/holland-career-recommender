import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const HL_COLORS = { R: '#e74c3c', I: '#3498db', A: '#9b59b6', S: '#2ecc71', E: '#f39c12', C: '#1abc9c' };

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Đang tải..." />;
  if (!data) return <p className="text-red-500">Không thể tải dữ liệu</p>;

  const { stats, hollandDist, topProvinces, dailyResults, userTypes, recentUsers } = data;

  const statCards = [
    { label: 'Tổng người dùng', value: stats.totalUsers, color: 'bg-blue-500' },
    { label: 'Kết quả hôm nay', value: stats.todayResults, color: 'bg-green-500' },
    { label: 'Kết quả tháng này', value: stats.monthResults, color: 'bg-purple-500' },
    { label: 'Tổng kết quả', value: stats.totalResults, color: 'bg-orange-500' },
  ];

  const UT_LABELS = { hoc_sinh: 'HS', sinh_vien: 'SV', phu_huynh: 'PH', giao_vien: 'GV', nguoi_di_lam: 'ĐL', khac: 'Khác' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-sm text-gray-500">Thống kê hệ thống trắc nghiệm hướng nghiệp</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <Card key={i} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center text-white font-bold text-lg`}>
                {s.value}
              </div>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-gray-700 mb-4">Kết quả 7 ngày qua</h3>
          {dailyResults.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyResults}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Số bài" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-10">Chưa có dữ liệu</p>}
        </Card>

        <Card>
          <h3 className="font-bold text-gray-700 mb-4">Phân bố mã Holland</h3>
          {hollandDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={hollandDist} dataKey="count" nameKey="holland_code" cx="50%" cy="50%" outerRadius={90} label={({ holland_code, count }) => `${holland_code} (${count})`}>
                  {hollandDist.map((d, i) => (
                    <Cell key={i} fill={HL_COLORS[d.holland_code[0]] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-10">Chưa có dữ liệu</p>}
        </Card>
      </div>

      {/* User type + Top provinces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-gray-700 mb-4">Phân bố đối tượng</h3>
          {userTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={userTypes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="user_type" type="category" tick={{ fontSize: 12 }} tickFormatter={v => UT_LABELS[v] || v} width={40} />
                <Tooltip />
                <Bar dataKey="count" name="Số lượng" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-10">Chưa có dữ liệu</p>}
        </Card>

        <Card>
          <h3 className="font-bold text-gray-700 mb-4">Top 10 Tỉnh/Thành</h3>
          {topProvinces.length > 0 ? (
            <div className="space-y-2">
              {topProvinces.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-6 text-right">{i + 1}</span>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{p.province}</span>
                    <span className="text-sm font-semibold text-gray-900">{p.count}</span>
                  </div>
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(p.count / topProvinces[0].count) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-center py-10">Chưa có dữ liệu</p>}
        </Card>
      </div>

      {/* Recent users */}
      <Card>
        <h3 className="font-bold text-gray-700 mb-4">Người dùng mới nhất</h3>
        {recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 font-semibold text-gray-500">Họ tên</th>
                  <th className="pb-2 pr-4 font-semibold text-gray-500">Email</th>
                  <th className="pb-2 pr-4 font-semibold text-gray-500">Trường</th>
                  <th className="pb-2 pr-4 font-semibold text-gray-500">Tỉnh</th>
                  <th className="pb-2 font-semibold text-gray-500">Mã Holland</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium">{u.full_name}</td>
                    <td className="py-2 pr-4 text-gray-500">{u.email}</td>
                    <td className="py-2 pr-4 text-gray-500">{u.school || '—'}</td>
                    <td className="py-2 pr-4 text-gray-500">{u.province}</td>
                    <td className="py-2 font-mono font-bold text-primary-600">{u.holland_code || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-400 text-center py-4">Chưa có người dùng nào</p>}
      </Card>
    </div>
  );
}
