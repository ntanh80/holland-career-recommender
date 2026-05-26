import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from '../../components/ui/Toast';

const emptyCareer = { holland_code: '', career_name: '', major_group: '', description: '', required_skills: '', learning_suggestion: '', is_active: 1 };

export default function CareersManagePage() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => { fetchCareers(); }, [fetchCareers]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCareer);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ holland_code: c.holland_code, career_name: c.career_name, major_group: c.major_group, description: c.description || '', required_skills: c.required_skills || '', learning_suggestion: c.learning_suggestion || '', is_active: c.is_active });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.holland_code.length !== 3) { toast.error('Mã Holland phải có đúng 3 ký tự'); return; }
    setSaving(true);
    try {
      const payload = { ...form, is_active: form.is_active ? 1 : 0 };
      if (editing) {
        await api.put(`/admin/careers/${editing}`, payload);
        toast.success('Đã cập nhật ngành nghề');
      } else {
        await api.post('/admin/careers', payload);
        toast.success('Đã thêm ngành nghề');
      }
      setShowModal(false);
      fetchCareers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý ngành nghề</h1>
          <p className="text-sm text-gray-500">{careers.length} ngành nghề</p>
        </div>
        <Button onClick={openCreate}>+ Thêm ngành nghề</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold text-gray-500 w-10">#</th>
                <th className="pb-3 pr-4 font-semibold text-gray-500">Tên nghề</th>
                <th className="pb-3 pr-4 font-semibold text-gray-500 w-24">Mã Holland</th>
                <th className="pb-3 pr-4 font-semibold text-gray-500">Nhóm ngành</th>
                <th className="pb-3 pr-4 font-semibold text-gray-500 w-24">Trạng thái</th>
                <th className="pb-3 font-semibold text-gray-500 w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {careers.map((c, i) => (
                <tr key={c.id} className={`border-b last:border-0 hover:bg-gray-50 ${!c.is_active ? 'opacity-50' : ''}`}>
                  <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                  <td className="py-2 pr-4 font-medium">{c.career_name}</td>
                  <td className="py-2 pr-4 font-mono font-bold text-primary-600">{c.holland_code}</td>
                  <td className="py-2 pr-4 text-gray-500">{c.major_group}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.is_active ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="text-primary-600 hover:underline mr-3 text-xs">Sửa</button>
                    {c.is_active ? (
                      <button onClick={() => setDeleteId(c.id)} className="text-red-500 hover:underline text-xs">Xóa</button>
                    ) : (
                      <button onClick={async () => { await api.put(`/admin/careers/${c.id}`, { is_active: 1 }); fetchCareers(); toast.success('Đã kích hoạt'); }} className="text-green-500 hover:underline text-xs">Kích hoạt</button>
                    )}
                  </td>
                </tr>
              ))}
              {careers.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Chưa có ngành nghề nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                  <input value={form.major_group} onChange={e => setField('major_group', e.target.value)} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
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
