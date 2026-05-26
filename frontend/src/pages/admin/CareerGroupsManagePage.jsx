import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SortIcon from '../../components/ui/SortIcon';
import Pagination from '../../components/ui/Pagination';
import { toast } from '../../components/ui/Toast';

export default function CareerGroupsManagePage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortKey, setSortKey] = useState('display_order');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', display_order: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchGroups = useCallback(() => {
    api.get('/admin/career-groups')
      .then(res => setGroups(res.data.groups))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

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
    let data = [...groups];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(g => g.name.toLowerCase().includes(s));
    }
    data.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (sortKey === 'is_active') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [groups, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);
  const idxStart = (page - 1) * pageSize;

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', display_order: groups.length + 1 });
    setShowModal(true);
  };

  const openEdit = (g) => {
    setEditing(g.id);
    setForm({ name: g.name, display_order: g.display_order });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Tên nhóm ngành là bắt buộc'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/career-groups/${editing}`, form);
        toast.success('Đã cập nhật nhóm ngành');
      } else {
        await api.post('/admin/career-groups', form);
        toast.success('Đã thêm nhóm ngành');
      }
      setShowModal(false);
      fetchGroups();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/career-groups/${deleteId}`);
      toast.success('Đã vô hiệu hóa nhóm ngành');
      setDeleteId(null);
      fetchGroups();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <LoadingSpinner message="Đang tải..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý nhóm ngành nghề</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {groups.length} nhóm
              {search && <span className="text-gray-400"> — </span>}
              {search && <span>từ khóa "<span className="font-medium text-gray-600">{search}</span>"</span>}
              {search && <span className="text-gray-400"> · </span>}
              {search && <span>{sorted.length} kết quả</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
              placeholder="Tìm kiếm nhóm ngành..."
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
          <Button onClick={openCreate} className="!px-4 !py-2 !text-sm !font-semibold whitespace-nowrap">+ Thêm nhóm ngành</Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-2 pr-4 font-semibold text-gray-600 w-10 text-left cursor-pointer select-none hover:bg-gray-100 rounded-l-lg transition-colors" onClick={() => handleSort('id')}>
                  <span className="inline-flex items-center text-xs"># <SortIcon active={sortKey === 'id'} dir={sortDir} /></span>
                </th>
                <th className="py-2 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                  <span className="inline-flex items-center text-xs">Tên nhóm ngành <SortIcon active={sortKey === 'name'} dir={sortDir} /></span>
                </th>
                <th className="py-2 pr-4 font-semibold text-gray-600 w-20 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('display_order')}>
                  <span className="inline-flex items-center text-xs">Thứ tự <SortIcon active={sortKey === 'display_order'} dir={sortDir} /></span>
                </th>
                <th className="py-2 pr-4 font-semibold text-gray-600 w-24 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('is_active')}>
                  <span className="inline-flex items-center text-xs">Trạng thái <SortIcon active={sortKey === 'is_active'} dir={sortDir} /></span>
                </th>
                <th className="py-2 font-semibold text-gray-600 w-28 text-left rounded-r-lg text-xs">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((g, i) => (
                <tr key={g.id} className={`border-b last:border-0 hover:bg-gray-50 ${!g.is_active ? 'opacity-50' : ''}`}>
                  <td className="py-1.5 pr-4 text-gray-400 text-xs">{idxStart + i + 1}</td>
                  <td className="py-1.5 pr-4 font-medium text-xs">{g.name}</td>
                  <td className="py-1.5 pr-4 text-gray-500 text-xs">{g.display_order}</td>
                  <td className="py-1.5 pr-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${g.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {g.is_active ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="py-1.5 whitespace-nowrap">
                    <button onClick={() => openEdit(g)} className="text-primary-600 hover:underline mr-3 text-xs">Sửa</button>
                    {g.is_active ? (
                      <button onClick={() => setDeleteId(g.id)} className="text-red-500 hover:underline text-xs">Xóa</button>
                    ) : (
                      <button onClick={async () => { await api.put(`/admin/career-groups/${g.id}`, { is_active: 1 }); fetchGroups(); toast.success('Đã kích hoạt'); }} className="text-green-500 hover:underline text-xs">Kích hoạt</button>
                    )}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-xs">Không tìm thấy nhóm ngành nào</td></tr>
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

      {/* Create/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Sửa nhóm ngành' : 'Thêm nhóm ngành mới'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm ngành</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
                <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
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
            <p className="text-sm text-gray-600 mb-4">Bạn có chắc muốn vô hiệu hóa nhóm ngành này?</p>
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
