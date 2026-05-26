import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from '../../components/ui/Toast';

const TYPE_LABELS = { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' };

const emptyQuestion = { content: '', holland_type: 'R', order_number: '', is_active: 1 };

export default function QuestionsManagePage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

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
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/questions/${deleteId}`);
      toast.success('Đã vô hiệu hóa câu hỏi');
      setDeleteId(null);
      fetchQuestions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) return <LoadingSpinner message="Đang tải..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý câu hỏi</h1>
          <p className="text-sm text-gray-500">{questions.length} câu hỏi</p>
        </div>
        <Button onClick={openCreate}>+ Thêm câu hỏi</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold text-gray-500 w-10">#</th>
                <th className="pb-3 pr-4 font-semibold text-gray-500">Nội dung</th>
                <th className="pb-3 pr-4 font-semibold text-gray-500 w-28">Nhóm</th>
                <th className="pb-3 pr-4 font-semibold text-gray-500 w-20">Thứ tự</th>
                <th className="pb-3 pr-4 font-semibold text-gray-500 w-24">Trạng thái</th>
                <th className="pb-3 font-semibold text-gray-500 w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, i) => (
                <tr key={q.id} className={`border-b last:border-0 hover:bg-gray-50 ${!q.is_active ? 'opacity-50' : ''}`}>
                  <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                  <td className="py-2 pr-4 max-w-md">{q.content}</td>
                  <td className="py-2 pr-4">
                    <span className="px-2 py-0.5 text-xs font-bold rounded text-white" style={{ backgroundColor: ({R:'#e74c3c',I:'#3498db',A:'#9b59b6',S:'#2ecc71',E:'#f39c12',C:'#1abc9c'})[q.holland_type] }}>
                      {q.holland_type} - {TYPE_LABELS[q.holland_type]}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-500">{q.order_number}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${q.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
              {questions.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Chưa có câu hỏi nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
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
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{k} - {v}</option>)}
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
