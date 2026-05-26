import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SortIcon from '../../components/ui/SortIcon';
import Pagination from '../../components/ui/Pagination';
import { toast } from '../../components/ui/Toast';

const emptyCareer = { holland_code: '', career_name: '', career_group_id: '', description: '', required_skills: '', learning_suggestion: '', is_active: 1 };

export default function CareersManagePage() {
  const [careers, setCareers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterGroupId, setFilterGroupId] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCareer);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCareers = useCallback(() => {
    api.get('/admin/careers')
      .then(res => setCareers(res.data.careers))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const fetchGroups = useCallback(() => {
    api.get('/admin/career-groups')
      .then(res => setGroups(res.data.groups))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchCareers(); fetchGroups(); }, [fetchCareers, fetchGroups]);

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
    let data = [...careers];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(c =>
        c.career_name.toLowerCase().includes(s) ||
        c.holland_code.toLowerCase().includes(s) ||
        (c.group_name && c.group_name.toLowerCase().includes(s))
      );
    }
    if (filterGroupId) {
      data = data.filter(c => c.career_group_id === Number(filterGroupId));
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
  }, [careers, search, filterGroupId, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);
  const idxStart = (page - 1) * pageSize;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCareer);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ holland_code: c.holland_code, career_name: c.career_name, career_group_id: c.career_group_id || '', description: c.description || '', required_skills: c.required_skills || '', learning_suggestion: c.learning_suggestion || '', is_active: c.is_active });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.holland_code.length !== 3) { toast.error('Mã Holland phải có đúng 3 ký tự'); return; }
    setSaving(true);
    try {
      const selectedGroup = groups.find(g => g.id === Number(form.career_group_id));
      const payload = { ...form, career_group_id: form.career_group_id ? Number(form.career_group_id) : null, major_group: selectedGroup?.name || '', is_active: form.is_active ? 1 : 0 };
      if (editing) {
        await api.put(`/admin/careers/${editing}`, payload);
        toast.success('Đã cập nhật ngành nghề');
      } else {
        await api.post('/admin/careers', payload);
        toast.success('Đã thêm ngành nghề');
      }
      setShowModal(false);
      fetchCareers();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/careers/${deleteId}`);
      toast.success('Đã vô hiệu hóa ngành nghề');
      setDeleteId(null);
      fetchCareers();
    } catch (err) { toast.error(err.message); }
  };

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) return <LoadingSpinner message="Đang tải..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý ngành nghề</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {careers.length} ngành nghề
              {search && <span className="text-gray-400"> — </span>}
              {filterGroupId && <span>nhóm <span className="font-medium text-gray-600">{groups.find(g => g.id === Number(filterGroupId))?.name}</span></span>}
              {filterGroupId && search && <span className="text-gray-400">, </span>}
              {search && <span>từ khóa "<span className="font-medium text-gray-600">{search}</span>"</span>}
              {(filterGroupId || search) && <span className="text-gray-400"> · </span>}
              {search && <span>{sorted.length} kết quả</span>}
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
              placeholder="Tìm kiếm ngành nghề..."
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
          <select value={filterGroupId} onChange={e => { setFilterGroupId(e.target.value); setPage(1); }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 bg-white">
            <option value="">Tất cả nhóm ngành</option>
            {groups.filter(g => g.is_active).map(g => {
              const count = careers.filter(c => c.career_group_id === g.id).length;
              return <option key={g.id} value={g.id}>{g.name} ({count})</option>;
            })}
          </select>
          <Button onClick={openCreate} className="!px-4 !py-2 !text-sm !font-semibold whitespace-nowrap">+ Thêm ngành nghề</Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-2 pr-4 font-semibold text-gray-600 w-10 text-left rounded-l-lg" onClick={() => handleSort('id')}>
                  <span className="inline-flex items-center text-xs cursor-pointer select-none"># <SortIcon active={sortKey === 'id'} dir={sortDir} /></span>
                </th>
                <th className="py-2 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('career_name')}>
                  <span className="inline-flex items-center text-xs">Tên nghề <SortIcon active={sortKey === 'career_name'} dir={sortDir} /></span>
                </th>
                <th className="py-2 pr-4 font-semibold text-gray-600 w-28 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('holland_code')}>
                  <span className="inline-flex items-center text-xs">Mã Holland <SortIcon active={sortKey === 'holland_code'} dir={sortDir} /></span>
                </th>
                <th className="py-2 pr-4 font-semibold text-gray-600 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('major_group')}>
                  <span className="inline-flex items-center text-xs">Nhóm ngành <SortIcon active={sortKey === 'major_group'} dir={sortDir} /></span>
                </th>
                <th className="py-2 pr-4 font-semibold text-gray-600 w-24 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSort('is_active')}>
                  <span className="inline-flex items-center text-xs">Trạng thái <SortIcon active={sortKey === 'is_active'} dir={sortDir} /></span>
                </th>
                <th className="py-2 font-semibold text-gray-600 w-28 text-left rounded-r-lg text-xs">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((c, i) => (
                <tr key={c.id} className={`border-b last:border-0 hover:bg-gray-50 ${!c.is_active ? 'opacity-50' : ''}`}>
                  <td className="py-1.5 pr-4 text-gray-400 text-xs">{idxStart + i + 1}</td>
                  <td className="py-1.5 pr-4 font-medium text-xs">{c.career_name}</td>
                  <td className="py-1.5 pr-4">
                    <span className="font-mono font-bold text-primary-600 text-xs">{c.holland_code}</span>
                  </td>
                  <td className="py-1.5 pr-4 text-gray-500 text-xs">{c.group_name || '—'}</td>
                  <td className="py-1.5 pr-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.is_active ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="py-1.5 whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="text-primary-600 hover:underline mr-3 text-xs">Sửa</button>
                    {c.is_active ? (
                      <button onClick={() => setDeleteId(c.id)} className="text-red-500 hover:underline text-xs">Xóa</button>
                    ) : (
                      <button onClick={async () => { await api.put(`/admin/careers/${c.id}`, { is_active: 1 }); fetchCareers(); toast.success('Đã kích hoạt'); }} className="text-green-500 hover:underline text-xs">Kích hoạt</button>
                    )}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-xs">Không tìm thấy ngành nghề nào</td></tr>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Sửa ngành nghề' : 'Thêm ngành nghề mới'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã Holland (3 ký tự)</label>
                  <input value={form.holland_code} onChange={e => setField('holland_code', e.target.value.toUpperCase())} required maxLength={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm ngành</label>
                  <select value={form.career_group_id} onChange={e => setField('career_group_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm">
                    <option value="">— Chọn nhóm ngành —</option>
                    {groups.filter(g => g.is_active).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nghề nghiệp</label>
                <input value={form.career_name} onChange={e => setField('career_name', e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng cần có</label>
                <input value={form.required_skills} onChange={e => setField('required_skills', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gợi ý học tập</label>
                <input value={form.learning_suggestion} onChange={e => setField('learning_suggestion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.is_active} onChange={e => setField('is_active', e.target.checked ? 1 : 0)}
                  id="is_active" className="w-4 h-4 text-primary-600 rounded" />
                <label htmlFor="is_active" className="text-sm text-gray-700">Kích hoạt</label>
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
            <p className="text-sm text-gray-600 mb-4">Bạn có chắc muốn vô hiệu hóa ngành nghề này?</p>
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
