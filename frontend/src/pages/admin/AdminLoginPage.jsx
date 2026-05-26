import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { toast } from '../../components/ui/Toast';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const token = localStorage.getItem('admin_token');
  if (token) return <Navigate to="/admin/dashboard" replace />;

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await api.post('/admin/login', data);
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
      toast.success('Đăng nhập thành công');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm !p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-800">Quản trị Holland</h1>
          <p className="text-sm text-gray-500 mt-1">Đăng nhập để quản lý hệ thống</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
            <input {...register('username', { required: 'Vui lòng nhập tên đăng nhập' })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm ${errors.username ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.username && <p className="text-red-500 text-xs mt-0.5">{errors.username.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input type="password" {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm ${errors.password ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.password && <p className="text-red-500 text-xs mt-0.5">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
