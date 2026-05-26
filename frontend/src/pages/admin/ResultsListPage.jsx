import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SortIcon from '../../components/ui/SortIcon';
import Pagination from '../../components/ui/Pagination';
import { toast } from '../../components/ui/Toast';

const HOLLAND_LABELS = { R: 'Kỹ thuật', I: 'Nghiên cứu', A: 'Nghệ thuật', S: 'Xã hội', E: 'Quản lý', C: 'Nghiệp vụ' };
const HOLLAND_COLORS = { R: '#e74c3c', I: '#3498db', A: '#9b59b6', S: '#2ecc71', E: '#f39c12', C: '#1abc9c' };

export default function ResultsListPage() {
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [filters, setFilters] = useState({ holland_code: '', date_from: '', date_to: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchResults = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: String(pageSize) });
    if (search) params.set('search', search);
    if (filters.holland_code) params.set('holland_code', filters.holland_code);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    if (sortKey) params.set('sortKey', sortKey);
    if (sortDir) params.set('sortDir', sortDir);

    api.get(`/admin/results?${params}`)
      .then(res => {
        setResults(res.data.results);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, pageSize, search, filters, sortKey, sortDir]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const openDetail = async (id) => {
    setDetailId(id);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/results/${id}`);
      setDetail(res.data);
    } catch (err) { toast.error(err.message); }
    finally { setDetailLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/results/${deleteId}`);
      toast.success('Đã xóa kết quả');
      setDeleteId(null);
      fetchResults();
    } catch (err) { toast.error(err.message); }
  };

  const handleExport = () => {
    const token = localStorage.getItem('admin_token');
    window.open(`/api/admin/export/results?token=${token}`, '_blank');
  };

  const idxStart = (page - 1) * pageSize;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý kết quả</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {total} kết quả
              {(filters.holland_code || filters.date_from || filters.date_to || search) && <span className="text-gray-400"> — </span>}
              {filters.holland_code && <span>mã <span className="font-medium text-gray-600">{filters.holland_code}</span></span>}
              {(filters.date_from || filters.date_to) && <span>, ngày <span className="font-medium text-gray-600">{filters.date_from || '...'} → {filters.date_to || '...'}</span></span>}
              {search && <span>, từ khóa "<span className="font-medium text-gray-600">{search}</span>"</span>}
            </p>
          </div>
          <Button variant="outline" onClick={handleExport} className="!text-sm">Xuất CSV</Button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
              placeholder="Tìm theo tên, email..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            />
          </div>
          <input value={filters.holland_code} onChange={e => { setFilters(f => ({ ...f, holland_code: e.target.value.toUpperCase() })); setPage(1); }}
            placeholder="Mã Holland..." maxLength={3}
            className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white font-mono" />
          <input type="date" value={filters.date_from} onChange={e => { setFilters(f => ({ ...f, date_from: e.target.value })); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white" title="Từ ngày" />
          <input type="date" value={filters.date_to} onChange={e => { setFilters(f => ({ ...f, date_to: e.target.value })); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white" title="Đến ngày" />
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
                    <th className="py-2 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 rounded-l-lg transition-colors" onClick={() => handleSort('full_name')}>
                      <span className="inline-flex items-center text-xs">Họ tên <SortIcon active={sortKey === 'full_name'} dir={sortDir} /></span>
                    </th>
                    <th className="py-2 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('email')}>
                      <span className="inline-flex items-center text-xs">Email <SortIcon active={sortKey === 'email'} dir={sortDir} /></span>
                    </th>
                    <th className="py-2 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('holland_code')}>
                      <span className="inline-flex items-center text-xs">Mã Holland <SortIcon active={sortKey === 'holland_code'} dir={sortDir} /></span>
                    </th>
                    <th className="py-2 pr-2 font-semibold text-gray-600 text-center cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('score_r')}>
                      <span className="inline-flex items-center text-xs">R <SortIcon active={sortKey === 'score_r'} dir={sortDir} /></span>
                    </th>
                    <th className="py-2 pr-2 font-semibold text-gray-600 text-center cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('score_i')}>
                      <span className="inline-flex items-center text-xs">I <SortIcon active={sortKey === 'score_i'} dir={sortDir} /></span>
                    </th>
                    <th className="py-2 pr-2 font-semibold text-gray-600 text-center cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('score_a')}>
                      <span className="inline-flex items-center text-xs">A <SortIcon active={sortKey === 'score_a'} dir={sortDir} /></span>
                    </th>
                    <th className="py-2 pr-2 font-semibold text-gray-600 text-center cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('score_s')}>
                      <span className="inline-flex items-center text-xs">S <SortIcon active={sortKey === 'score_s'} dir={sortDir} /></span>
                    </th>
                    <th className="py-2 pr-2 font-semibold text-gray-600 text-center cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('score_e')}>
                      <span className="inline-flex items-center text-xs">E <SortIcon active={sortKey === 'score_e'} dir={sortDir} /></span>
                    </th>
                    <th className="py-2 pr-2 font-semibold text-gray-600 text-center cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('score_c')}>
                      <span className="inline-flex items-center text-xs">C <SortIcon active={sortKey === 'score_c'} dir={sortDir} /></span>
                    </th>
                    <th className="py-2 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('created_at')}>
                      <span className="inline-flex items-center text-xs">Ngày <SortIcon active={sortKey === 'created_at'} dir={sortDir} /></span>
                    </th>
                    <th className="py-2 font-semibold text-gray-600 text-left rounded-r-lg text-xs">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-1.5 pr-4 font-medium text-xs">{r.full_name}</td>
                      <td className="py-1.5 pr-4 text-gray-500 text-xs">{r.email || '—'}</td>
                      <td className="py-1.5 pr-4">
                        {r.result_token ? (
                          <Link to={`/result/${r.result_token}`} className="text-primary-600 font-mono font-bold text-xs hover:underline">{r.holland_code}</Link>
                        ) : <span className="font-mono font-bold text-xs">{r.holland_code}</span>}
                      </td>
                      <td className="py-1.5 pr-2 text-xs text-center">{r.score_r}</td>
                      <td className="py-1.5 pr-2 text-xs text-center">{r.score_i}</td>
                      <td className="py-1.5 pr-2 text-xs text-center">{r.score_a}</td>
                      <td className="py-1.5 pr-2 text-xs text-center">{r.score_s}</td>
                      <td className="py-1.5 pr-2 text-xs text-center">{r.score_e}</td>
                      <td className="py-1.5 pr-2 text-xs text-center">{r.score_c}</td>
                      <td className="py-1.5 pr-4 text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                      <td className="py-1.5 whitespace-nowrap">
                        <button onClick={() => openDetail(r.id)} className="text-primary-600 hover:underline mr-3 text-xs">Chi tiết</button>
                        <button onClick={() => setDeleteId(r.id)} className="text-red-500 hover:underline text-xs">Xóa</button>
                      </td>
                    </tr>
                  ))}
                  {results.length === 0 && (
                    <tr><td colSpan={11} className="py-8 text-center text-gray-400 text-xs">Không tìm thấy kết quả nào</td></tr>
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

      {/* Detail modal */}
      {detailId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setDetailId(null); setDetail(null); }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {detailLoading ? <LoadingSpinner /> : detail ? (
              <>
                <h3 className="font-bold text-lg mb-1">Chi tiết kết quả</h3>
                <p className="text-sm text-gray-500 mb-4">{detail.result.full_name} — {detail.result.holland_code}</p>
                <div className="grid grid-cols-6 gap-2 mb-4 text-center text-sm">
                  {['R','I','A','S','E','C'].map(t => (
                    <div key={t} className="bg-gray-50 rounded-lg p-2">
                      <div className="font-bold text-xs" style={{ color: HOLLAND_COLORS[t] }}>{t} - {HOLLAND_LABELS[t]}</div>
                      <div className="text-lg font-bold text-primary-600">{detail.result[`score_${t.toLowerCase()}`]}</div>
                    </div>
                  ))}
                </div>
                <h4 className="font-semibold text-sm mb-2">Câu trả lời ({detail.answers.length})</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {detail.answers.map(a => (
                    <div key={a.id} className="flex items-center gap-3 text-xs py-1 border-b last:border-0">
                      <span className="px-1.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: HOLLAND_COLORS[a.holland_type] }}>{a.holland_type}</span>
                      <span className="flex-1 truncate">{a.content}</span>
                      <span className="font-bold">{a.answer_value}/5</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={() => { setDetailId(null); setDetail(null); }}>Đóng</Button>
                </div>
              </>
            ) : <p className="text-red-500">Không thể tải chi tiết</p>}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 mx-4 max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2 text-red-600">Xóa vĩnh viễn</h3>
            <p className="text-sm text-gray-600 mb-4">Hành động này sẽ xóa toàn bộ dữ liệu người dùng, câu trả lời và kết quả. Không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Hủy</Button>
              <Button onClick={handleDelete} className="!bg-red-500 hover:!bg-red-600">Xóa vĩnh viễn</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
