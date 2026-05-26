import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function SortIcon({ active, dir }) {
  return (
    <span className="inline-flex flex-col ml-1.5 -space-y-0.5">
      <svg className={`w-2.5 h-2.5 ${active && dir === 'asc' ? 'text-primary-600' : 'text-gray-300'}`} viewBox="0 0 10 6" fill="currentColor">
        <path d="M5 0L10 6H0z" />
      </svg>
      <svg className={`w-2.5 h-2.5 ${active && dir === 'desc' ? 'text-primary-600' : 'text-gray-300'}`} viewBox="0 0 10 6" fill="currentColor">
        <path d="M5 6L0 0h10z" />
      </svg>
    </span>
  );
}

export default function UsersListPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ province: '', school: '', user_type: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: String(pageSize) });
    if (search) params.set('search', search);
    if (filters.province) params.set('province', filters.province);
    if (filters.school) params.set('school', filters.school);
    if (filters.user_type) params.set('user_type', filters.user_type);
    if (sortKey) params.set('sortKey', sortKey);
    if (sortDir) params.set('sortDir', sortDir);

    api.get(`/admin/users?${params}`)
      .then(res => {
        setUsers(res.data.users);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, pageSize, search, filters, sortKey, sortDir]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const UT_LABELS = { hoc_sinh: 'Học sinh', sinh_vien: 'Sinh viên', phu_huynh: 'Phụ huynh', giao_vien: 'Giáo viên', nguoi_di_lam: 'Người đi làm', khac: 'Khác' };

  const idxStart = (page - 1) * pageSize;
  const thClass = (key) =>
    `py-3 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
        <p className="text-sm text-gray-500">{total} người dùng</p>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Tìm theo tên, email, SĐT..."
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
          <Button type="submit" className="!text-sm !px-4 !py-2">Tìm</Button>
        </form>
      </Card>

      {/* Table */}
      <Card>
        {loading ? <LoadingSpinner message="Đang tải..." /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-3 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 rounded-l-lg transition-colors" onClick={() => handleSort('full_name')}>
                      <span className="inline-flex items-center">Họ tên <SortIcon active={sortKey === 'full_name'} dir={sortDir} /></span>
                    </th>
                    <th className={thClass('email')} onClick={() => handleSort('email')}>
                      <span className="inline-flex items-center">Email <SortIcon active={sortKey === 'email'} dir={sortDir} /></span>
                    </th>
                    <th className={thClass('phone')} onClick={() => handleSort('phone')}>
                      <span className="inline-flex items-center">SĐT <SortIcon active={sortKey === 'phone'} dir={sortDir} /></span>
                    </th>
                    <th className={thClass('user_type')} onClick={() => handleSort('user_type')}>
                      <span className="inline-flex items-center">Loại <SortIcon active={sortKey === 'user_type'} dir={sortDir} /></span>
                    </th>
                    <th className={thClass('school')} onClick={() => handleSort('school')}>
                      <span className="inline-flex items-center">Trường <SortIcon active={sortKey === 'school'} dir={sortDir} /></span>
                    </th>
                    <th className={thClass('province')} onClick={() => handleSort('province')}>
                      <span className="inline-flex items-center">Tỉnh <SortIcon active={sortKey === 'province'} dir={sortDir} /></span>
                    </th>
                    <th className={thClass('holland_code')} onClick={() => handleSort('holland_code')}>
                      <span className="inline-flex items-center">Mã Holland <SortIcon active={sortKey === 'holland_code'} dir={sortDir} /></span>
                    </th>
                    <th className="py-3 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 rounded-r-lg transition-colors" onClick={() => handleSort('created_at')}>
                      <span className="inline-flex items-center">Ngày <SortIcon active={sortKey === 'created_at'} dir={sortDir} /></span>
                    </th>
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
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{idxStart + 1}-{Math.min(idxStart + pageSize, total)} / {total}</span>
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="text-xs border border-gray-300 rounded px-2 py-1 outline-none">
                  {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n} / trang</option>)}
                </select>
              </div>
              {totalPages > 1 && (
              <div className="flex gap-1">
                <button onClick={() => setPage(1)} disabled={page <= 1}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-gray-50">«</button>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-3 py-1 text-xs border rounded disabled:opacity-30 hover:bg-gray-50">Trước</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, i, arr) => (
                  <span key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-gray-300">...</span>}
                    <button onClick={() => setPage(p)}
                      className={`px-3 py-1 text-xs border rounded ${p === page ? 'bg-primary-600 text-white border-primary-600' : 'hover:bg-gray-50'}`}>{p}</button>
                  </span>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="px-3 py-1 text-xs border rounded disabled:opacity-30 hover:bg-gray-50">Sau</button>
                <button onClick={() => setPage(totalPages)} disabled={page >= totalPages}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-gray-50">»</button>
              </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
