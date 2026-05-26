import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SortIcon from '../../components/ui/SortIcon';
import Pagination from '../../components/ui/Pagination';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {total} người dùng
              {(filters.province || filters.school || filters.user_type || search) && <span className="text-gray-400"> — </span>}
              {filters.province && <span>tỉnh <span className="font-medium text-gray-600">{filters.province}</span></span>}
              {filters.school && <span>, trường <span className="font-medium text-gray-600">{filters.school}</span></span>}
              {filters.user_type && <span>, <span className="font-medium text-gray-600">{UT_LABELS[filters.user_type]}</span></span>}
              {search && <span>, từ khóa "<span className="font-medium text-gray-600">{search}</span>"</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setPage(1); setSearch(searchInput); } }}
              placeholder="Tìm theo tên, email, SĐT..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            />
          </div>
          <input value={filters.school} onChange={e => { setFilters(f => ({ ...f, school: e.target.value })); setPage(1); }} placeholder="Lọc theo trường..."
            className="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white" />
          <input value={filters.province} onChange={e => { setFilters(f => ({ ...f, province: e.target.value })); setPage(1); }} placeholder="Lọc theo tỉnh..."
            className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white" />
          <select value={filters.user_type} onChange={e => { setFilters(f => ({ ...f, user_type: e.target.value })); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
            <option value="">Tất cả loại</option>
            {Object.entries(UT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <Button onClick={() => { setSearch(searchInput); setPage(1); }} className="!text-sm !px-4 !py-2">Tìm</Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        {loading ? <LoadingSpinner message="Đang tải..." /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-1.5 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 rounded-l-lg transition-colors" onClick={() => handleSort('full_name')}>
                      <span className="inline-flex items-center text-xs">Họ tên <SortIcon active={sortKey === 'full_name'} dir={sortDir} /></span>
                    </th>
                    <th className="py-1.5 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('email')}>
                      <span className="inline-flex items-center text-xs">Email <SortIcon active={sortKey === 'email'} dir={sortDir} /></span>
                    </th>
                    <th className="py-1.5 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('phone')}>
                      <span className="inline-flex items-center text-xs">SĐT <SortIcon active={sortKey === 'phone'} dir={sortDir} /></span>
                    </th>
                    <th className="py-1.5 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('user_type')}>
                      <span className="inline-flex items-center text-xs">Loại <SortIcon active={sortKey === 'user_type'} dir={sortDir} /></span>
                    </th>
                    <th className="py-1.5 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('school')}>
                      <span className="inline-flex items-center text-xs">Trường <SortIcon active={sortKey === 'school'} dir={sortDir} /></span>
                    </th>
                    <th className="py-1.5 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('province')}>
                      <span className="inline-flex items-center text-xs">Tỉnh <SortIcon active={sortKey === 'province'} dir={sortDir} /></span>
                    </th>
                    <th className="py-1.5 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('holland_code')}>
                      <span className="inline-flex items-center text-xs">Mã Holland <SortIcon active={sortKey === 'holland_code'} dir={sortDir} /></span>
                    </th>
                    <th className="py-2 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 rounded-r-lg transition-colors" onClick={() => handleSort('created_at')}>
                      <span className="inline-flex items-center text-xs">Ngày <SortIcon active={sortKey === 'created_at'} dir={sortDir} /></span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-1.5 pr-4 font-medium">{u.full_name}</td>
                      <td className="py-1.5 pr-4 text-gray-500 text-xs">{u.email}</td>
                      <td className="py-1.5 pr-4 text-gray-500 text-xs">{u.phone}</td>
                      <td className="py-1.5 pr-4 text-xs">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">{UT_LABELS[u.user_type] || u.user_type}</span>
                      </td>
                      <td className="py-1.5 pr-4 text-gray-500 text-xs">{u.school || '—'}</td>
                      <td className="py-1.5 pr-4 text-gray-500 text-xs">{u.province}</td>
                      <td className="py-1.5 pr-4">
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

            <Pagination
              page={page} totalPages={totalPages} pageSize={pageSize} total={total}
              idxStart={idxStart}
              onPageChange={setPage}
              onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
            />
          </>
        )}
      </Card>
    </div>
  );
}
