import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function UsersListPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ province: '', school: '', user_type: '' });

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '20' });
    if (search) params.set('search', search);
    if (filters.province) params.set('province', filters.province);
    if (filters.school) params.set('school', filters.school);
    if (filters.user_type) params.set('user_type', filters.user_type);

    api.get(`/admin/users?${params}`)
      .then(res => {
        setUsers(res.data.users);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const UT_LABELS = { hoc_sinh: 'Học sinh', sinh_vien: 'Sinh viên', phu_huynh: 'Phụ huynh', giao_vien: 'Giáo viên', nguoi_di_lam: 'Người đi làm', khac: 'Khác' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
        <p className="text-sm text-gray-500">{total} người dùng</p>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, email, SĐT..."
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
          <input value={filters.school} onChange={e => { setFilters(f => ({ ...f, school: e.target.value })); setPage(1); }} placeholder="Lọc theo trường..."
            className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
          <input value={filters.province} onChange={e => { setFilters(f => ({ ...f, province: e.target.value })); setPage(1); }} placeholder="Lọc theo tỉnh..."
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
          <select value={filters.user_type} onChange={e => { setFilters(f => ({ ...f, user_type: e.target.value })); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm">
            <option value="">Tất cả loại</option>
            {Object.entries(UT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Tìm</button>
        </form>
      </Card>

      {/* Table */}
      <Card>
        {loading ? <LoadingSpinner message="Đang tải..." /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Họ tên</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Email</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">SĐT</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Loại</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Trường</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Tỉnh</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Mã Holland</th>
                    <th className="pb-3 font-semibold text-gray-500">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium">{u.full_name}</td>
                      <td className="py-2 pr-4 text-gray-500 text-xs">{u.email}</td>
                      <td className="py-2 pr-4 text-gray-500 text-xs">{u.phone}</td>
                      <td className="py-2 pr-4 text-xs">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">{UT_LABELS[u.user_type] || u.user_type}</span>
                      </td>
                      <td className="py-2 pr-4 text-gray-500 text-xs">{u.school || '—'}</td>
                      <td className="py-2 pr-4 text-gray-500 text-xs">{u.province}</td>
                      <td className="py-2 pr-4">
                        {u.result_token ? (
                          <Link to={`/result/${u.result_token}`} className="text-primary-600 font-mono font-bold text-xs hover:underline">{u.holland_code}</Link>
                        ) : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="py-2 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-gray-400">Không tìm thấy người dùng nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <span className="text-sm text-gray-500">Trang {page} / {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                    className="px-3 py-1 text-sm border rounded-lg disabled:opacity-30 hover:bg-gray-50">Trước</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="px-3 py-1 text-sm border rounded-lg disabled:opacity-30 hover:bg-gray-50">Sau</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
