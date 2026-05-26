import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SortIcon from '../../components/ui/SortIcon';
import Pagination from '../../components/ui/Pagination';
import { toast } from '../../components/ui/Toast';

export default function HollandTypesManagePage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortKey, setSortKey] = useState('display_order');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTypes = useCallback(() => {
    api.get('/admin/holland-types')
      .then(res => setTypes(res.data.types))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTypes(); }, [fetchTypes]);

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
    let data = [...types];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(t =>
        t.code.toLowerCase().includes(s) ||
        t.name_vn.toLowerCase().includes(s) ||
        t.name_en.toLowerCase().includes(s)
      );
    }
    data.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [types, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);
  const idxStart = (page - 1) * pageSize;

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const openEdit = (type) => {
    setEditing(type.code);
    setForm({ ...type });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      await api.put(`/admin/holland-types/${form.code}`, form);
      toast.success(`Đã cập nhật nhóm ${form.code}`);
      setEditing(null);
      setForm(null);
      fetchTypes();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner message="Đang tải..." />;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý nhóm Holland</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {types.length} nhóm
              {search && <span className="text-gray-400"> — </span>}
              {search && <span>từ khóa "<span className="font-medium text-gray-600">{search}</span>"</span>}
              {search && <span className="text-gray-400"> · </span>}
              {search && <span>{sorted.length} kết quả</span>}
            </p>
          </div>
        </div>
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
            placeholder="Tìm kiếm nhóm Holland..."
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          />
          {search && (
            <button onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-2 pr-4 font-semibold text-gray-600 w-12 text-left cursor-pointer select-none hover:bg-gray-100 rounded-l-lg transition-colors" onClick={() => handleSort('code')}>
                  <span className="inline-flex items-center text-xs">Mã <SortIcon active={sortKey === 'code'} dir={sortDir} /></span>
                </th>
                <th className="py-2 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('name_en')}>
                  <span className="inline-flex items-center text-xs">Tiếng Anh <SortIcon active={sortKey === 'name_en'} dir={sortDir} /></span>
                </th>
                <th className="py-2 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('name_vn')}>
                  <span className="inline-flex items-center text-xs">Tiếng Việt <SortIcon active={sortKey === 'name_vn'} dir={sortDir} /></span>
                </th>
                <th className="py-2 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('description')}>
                  <span className="inline-flex items-center text-xs">Mô tả <SortIcon active={sortKey === 'description'} dir={sortDir} /></span>
                </th>
                <th className="py-2 pr-4 font-semibold text-gray-600 w-20 text-left text-xs">Màu</th>
                <th className="py-2 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('display_order')}>
                  <span className="inline-flex items-center text-xs">Thứ tự <SortIcon active={sortKey === 'display_order'} dir={sortDir} /></span>
                </th>
                <th className="py-2 font-semibold text-gray-600 w-24 text-left rounded-r-lg text-xs">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(t => (
                <tr key={t.code} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-1.5 pr-4">
                    <span className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: t.color }}>{t.code}</span>
                  </td>
                  <td className="py-1.5 pr-4 font-medium">{t.name_en}</td>
                  <td className="py-1.5 pr-4">{t.name_vn}</td>
                  <td className="py-1.5 pr-4 text-gray-500 max-w-xs truncate">{t.description || '—'}</td>
                  <td className="py-1.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: t.color }} />
                      <span className="text-xs text-gray-400 font-mono">{t.color}</span>
                    </div>
                  </td>
                  <td className="py-1.5 pr-4 text-gray-500">{t.display_order}</td>
                  <td className="py-2.5 whitespace-nowrap">
                    <button onClick={() => openEdit(t)} className="text-primary-600 hover:underline text-xs font-medium">Sửa</button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page} totalPages={totalPages} pageSize={pageSize} total={sorted.length}
          idxStart={idxStart}
          onPageChange={setPage}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
        />
      </Card>

      {/* Edit modal */}
      {editing && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={cancelEdit}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1">Chỉnh sửa nhóm {editing}</h2>
            <p className="text-sm text-gray-500 mb-4">Cập nhật thông tin cho nhóm tính cách nghề nghiệp.</p>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tiếng Anh</label>
                  <input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tiếng Việt</label>
                  <input value={form.name_vn} onChange={e => setForm({...form, name_vn: e.target.value})} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.color || '#000000'} onChange={e => setForm({...form, color: e.target.value})}
                      className="w-9 h-9 border rounded cursor-pointer" />
                    <input value={form.color || ''} onChange={e => setForm({...form, color: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
                  <input type="number" value={form.display_order || 0} onChange={e => setForm({...form, display_order: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" type="button" onClick={cancelEdit}>Hủy</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
