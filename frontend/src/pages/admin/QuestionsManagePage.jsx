import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from '../../components/ui/Toast';

const emptyQuestion = { content: '', holland_type: 'R', order_number: '', is_active: 1 };

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

export default function QuestionsManagePage() {
  const [questions, setQuestions] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortKey, setSortKey] = useState('order_number');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyQuestion);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const fetchQuestions = useCallback(() => {
    api.get('/admin/questions')
      .then(res => setQuestions(res.data.questions))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const fetchTypes = useCallback(() => {
    api.get('/admin/holland-types')
      .then(res => setTypes(res.data.types))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchQuestions(); fetchTypes(); }, [fetchQuestions, fetchTypes]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    let filtered = filterType ? questions.filter(q => q.holland_type === filterType) : [...questions];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(q => q.content.toLowerCase().includes(s));
    }
    filtered.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (sortKey === 'is_active') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [questions, filterType, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyQuestion);
    setShowModal(true);
  };

  const openEdit = (q) => {
    setEditing(q.id);
    setForm({ content: q.content, holland_type: q.holland_type, order_number: q.order_number.toString(), is_active: q.is_active });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, order_number: parseInt(form.order_number) || 99, is_active: form.is_active ? 1 : 0 };
      if (editing) {
        await api.put(`/admin/questions/${editing}`, payload);
        toast.success('Đã cập nhật câu hỏi');
      } else {
        await api.post('/admin/questions', payload);
        toast.success('Đã thêm câu hỏi');
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/questions/${deleteId}`);
      toast.success('Đã vô hiệu hóa câu hỏi');
      setDeleteId(null);
      fetchQuestions();
    } catch (err) { toast.error(err.message); }
  };

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const getTypeName = (code) => { const t = types.find(t => t.code === code); return t ? t.name_vn : code; };
  const getTypeColor = (code) => { const t = types.find(t => t.code === code); return t?.color || '#94a3b8'; };

  const idxStart = (page - 1) * pageSize;

  if (loading) return <LoadingSpinner message="Đang tải..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý câu hỏi</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {questions.length} câu hỏi
              {(filterType || search) && <span className="text-gray-400"> — </span>}
              {filterType && <span>nhóm <span className="font-medium text-gray-600">{filterType}</span></span>}
              {filterType && search && <span className="text-gray-400">, </span>}
              {search && <span>từ khóa "<span className="font-medium text-gray-600">{search}</span>"</span>}
              {(filterType || search) && <span className="text-gray-400"> · </span>}
              {(filterType || search) && <span>{sorted.length} kết quả</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            />
            {search && (
              <button
                onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 bg-white">
            <option value="">Tất cả nhóm ({questions.length})</option>
            {types.map(t => {
              const count = questions.filter(q => q.holland_type === t.code).length;
              return (
                <option key={t.code} value={t.code}>{t.code} - {t.name_vn} ({count})</option>
              );
            })}
          </select>
          <Button onClick={openCreate} className="!px-4 !py-2 !text-sm !font-semibold whitespace-nowrap">+ Thêm câu hỏi</Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-3 pr-4 font-semibold text-gray-600 w-10 text-left cursor-pointer select-none hover:bg-gray-100 rounded-l-lg transition-colors" onClick={() => handleSort('id')}>
                  <span className="inline-flex items-center"># <SortIcon active={sortKey === 'id'} dir={sortDir} /></span>
                </th>
                <th className="py-3 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('content')}>
                  <span className="inline-flex items-center">Nội dung <SortIcon active={sortKey === 'content'} dir={sortDir} /></span>
                </th>
                <th className="py-3 pr-4 font-semibold text-gray-600 w-32 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('holland_type')}>
                  <span className="inline-flex items-center">Nhóm <SortIcon active={sortKey === 'holland_type'} dir={sortDir} /></span>
                </th>
                <th className="py-3 pr-4 font-semibold text-gray-600 w-20 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('order_number')}>
                  <span className="inline-flex items-center">Thứ tự <SortIcon active={sortKey === 'order_number'} dir={sortDir} /></span>
                </th>
                <th className="py-3 pr-4 font-semibold text-gray-600 w-24 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('is_active')}>
                  <span className="inline-flex items-center">Trạng thái <SortIcon active={sortKey === 'is_active'} dir={sortDir} /></span>
                </th>
                <th className="py-3 font-semibold text-gray-600 w-28 text-left rounded-r-lg">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((q, i) => (
                <tr key={q.id} className={`border-b last:border-0 hover:bg-gray-50 ${!q.is_active ? 'opacity-50' : ''}`}>
                  <td className="py-2 pr-4 text-gray-400">{idxStart + i + 1}</td>
                  <td className="py-2 pr-4 max-w-md">{q.content}</td>
                  <td className="py-2 pr-4">
                    <span className="px-2 py-0.5 text-xs font-bold rounded text-white whitespace-nowrap" style={{ backgroundColor: getTypeColor(q.holland_type) }}>
                      {q.holland_type} - {getTypeName(q.holland_type)}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-500">{q.order_number}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap ${q.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {q.is_active ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    <button onClick={() => openEdit(q)} className="text-primary-600 hover:underline mr-3 text-xs">Sửa</button>
                    {q.is_active ? (
                      <button onClick={() => setDeleteId(q.id)} className="text-red-500 hover:underline text-xs">Xóa</button>
                    ) : (
                      <button onClick={async () => { await api.put(`/admin/questions/${q.id}`, { is_active: 1 }); fetchQuestions(); toast.success('Đã kích hoạt'); }} className="text-green-500 hover:underline text-xs">Kích hoạt</button>
                    )}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Không có câu hỏi nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{idxStart + 1}-{Math.min(idxStart + pageSize, sorted.length)} / {sorted.length}</span>
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
      </Card>

      {/* Question create/edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu hỏi</label>
                <textarea value={form.content} onChange={e => setField('content', e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm Holland</label>
                  <select value={form.holland_type} onChange={e => setField('holland_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm">
                    {types.map(t => <option key={t.code} value={t.code}>{t.code} - {t.name_vn}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                  <input type="number" value={form.order_number} onChange={e => setField('order_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.is_active} onChange={e => setField('is_active', e.target.checked ? 1 : 0)}
                  id="is_active" className="w-4 h-4 text-primary-600 rounded" />
                <label htmlFor="is_active" className="text-sm text-gray-700">Kích hoạt câu hỏi</label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Hủy</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 mx-4 max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-600 mb-4">Bạn có chắc muốn vô hiệu hóa câu hỏi này?</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Hủy</Button>
              <Button onClick={handleDelete} className="!bg-red-500 hover:!bg-red-600">Xóa</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
