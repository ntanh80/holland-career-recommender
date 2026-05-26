import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from '../../components/ui/Toast';

export default function ResultsListPage() {
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ holland_code: '', date_from: '', date_to: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchResults = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '20' });
    if (search) params.set('search', search);
    if (filters.holland_code) params.set('holland_code', filters.holland_code);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);

    api.get(`/admin/results?${params}`)
      .then(res => {
        setResults(res.data.results);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, filters]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const openDetail = async (id) => {
    setDetailId(id);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/results/${id}`);
      setDetail(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/results/${deleteId}`);
      toast.success('Đã xóa kết quả');
      setDeleteId(null);
      fetchResults();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleExport = () => {
    const token = localStorage.getItem('admin_token');
    window.open(`/api/admin/export/results?token=${token}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý kết quả</h1>
          <p className="text-sm text-gray-500">{total} kết quả</p>
        </div>
        <Button variant="outline" onClick={handleExport}>Xuất CSV</Button>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-wrap gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, email..."
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
          <input value={filters.holland_code} onChange={e => { setFilters(f => ({ ...f, holland_code: e.target.value.toUpperCase() })); setPage(1); }} placeholder="Mã Holland..."
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-mono" maxLength={3} />
          <input type="date" value={filters.date_from} onChange={e => { setFilters(f => ({ ...f, date_from: e.target.value })); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" title="Từ ngày" />
          <input type="date" value={filters.date_to} onChange={e => { setFilters(f => ({ ...f, date_to: e.target.value })); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" title="Đến ngày" />
        </div>
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
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Mã Holland</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">R</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">I</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">A</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">S</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">E</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">C</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Ngày</th>
                    <th className="pb-3 font-semibold text-gray-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium">{r.full_name}</td>
                      <td className="py-2 pr-4 text-gray-500 text-xs">{r.email}</td>
                      <td className="py-2 pr-4">
                        <Link to={`/result/${r.result_token}`} className="text-primary-600 font-mono font-bold hover:underline">{r.holland_code}</Link>
                      </td>
                      <td className="py-2 pr-2 text-xs text-gray-500">{r.score_r}</td>
                      <td className="py-2 pr-2 text-xs text-gray-500">{r.score_i}</td>
                      <td className="py-2 pr-2 text-xs text-gray-500">{r.score_a}</td>
                      <td className="py-2 pr-2 text-xs text-gray-500">{r.score_s}</td>
                      <td className="py-2 pr-2 text-xs text-gray-500">{r.score_e}</td>
                      <td className="py-2 pr-2 text-xs text-gray-500">{r.score_c}</td>
                      <td className="py-2 pr-4 text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                      <td className="py-2 whitespace-nowrap">
                        <button onClick={() => openDetail(r.id)} className="text-primary-600 hover:underline mr-3 text-xs">Chi tiết</button>
                        <button onClick={() => setDeleteId(r.id)} className="text-red-500 hover:underline text-xs">Xóa</button>
                      </td>
                    </tr>
                  ))}
                  {results.length === 0 && (
                    <tr><td colSpan={11} className="py-8 text-center text-gray-400">Không tìm thấy kết quả nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>

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
                      <div className="font-bold">{t}</div>
                      <div className="text-lg font-bold text-primary-600">{detail.result[`score_${t.toLowerCase()}`]}</div>
                    </div>
                  ))}
                </div>
                <h4 className="font-semibold text-sm mb-2">Câu trả lời ({detail.answers.length})</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {detail.answers.map(a => (
                    <div key={a.id} className="flex items-center gap-3 text-xs py-1 border-b last:border-0">
                      <span className="px-1.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: ({R:'#e74c3c',I:'#3498db',A:'#9b59b6',S:'#2ecc71',E:'#f39c12',C:'#1abc9c'})[a.holland_type] }}>{a.holland_type}</span>
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
