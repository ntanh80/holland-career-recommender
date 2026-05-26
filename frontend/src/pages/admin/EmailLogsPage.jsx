import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from '../../components/ui/Toast';

const STATUS_MAP = { pending: { label: 'Chờ gửi', color: 'bg-yellow-100 text-yellow-700' }, sent: { label: 'Đã gửi', color: 'bg-green-100 text-green-700' }, failed: { label: 'Thất bại', color: 'bg-red-100 text-red-700' } };

export default function EmailLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [resending, setResending] = useState(null);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '20' });
    if (statusFilter) params.set('status', statusFilter);

    api.get(`/admin/email-logs?${params}`)
      .then(res => {
        setLogs(res.data.logs);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleResend = async (id) => {
    setResending(id);
    try {
      await api.post(`/admin/email-logs/${id}/resend`);
      toast.success('Đã gửi lại email');
      fetchLogs();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Lịch sử gửi email</h1>
        <p className="text-sm text-gray-500">{total} email</p>
      </div>

      {/* Filter */}
      <Card className="!p-4">
        <div className="flex gap-3 items-center">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm">
            <option value="">Tất cả trạng thái</option>
            <option value="sent">Đã gửi</option>
            <option value="pending">Chờ gửi</option>
            <option value="failed">Thất bại</option>
          </select>
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
                    <th className="pb-3 pr-4 font-semibold text-gray-500 w-10">#</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Người nhận</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Email</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Chủ đề</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Mã Holland</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Trạng thái</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500">Ngày gửi</th>
                    <th className="pb-3 font-semibold text-gray-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, i) => {
                    const s = STATUS_MAP[l.status];
                    return (
                      <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2 pr-4 text-gray-400">{(page - 1) * 20 + i + 1}</td>
                        <td className="py-2 pr-4 font-medium">{l.full_name}</td>
                        <td className="py-2 pr-4 text-xs text-gray-500">{l.user_email}</td>
                        <td className="py-2 pr-4 text-xs text-gray-500 max-w-xs truncate">{l.subject}</td>
                        <td className="py-2 pr-4 font-mono font-bold text-primary-600">{l.holland_code || '—'}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${s.color}`}>{s.label}</span>
                          {l.error_message && <p className="text-xs text-red-400 mt-1 truncate max-w-[150px]">{l.error_message}</p>}
                        </td>
                        <td className="py-2 pr-4 text-xs text-gray-500">{l.sent_at ? new Date(l.sent_at).toLocaleString('vi-VN') : '—'}</td>
                        <td className="py-2 whitespace-nowrap">
                          <button onClick={() => handleResend(l.id)} disabled={resending === l.id}
                            className="text-primary-600 hover:underline text-xs disabled:opacity-50">
                            {resending === l.id ? 'Đang gửi...' : 'Gửi lại'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-gray-400">Chưa có email nào</td></tr>
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
    </div>
  );
}
