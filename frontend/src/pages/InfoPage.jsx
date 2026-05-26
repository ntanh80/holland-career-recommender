import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../components/ui/Button';
import api from '../services/api';
import { toast } from '../components/ui/Toast';

const USER_TYPES = [
  { value: 'hoc_sinh', label: 'Học sinh' },
  { value: 'sinh_vien', label: 'Sinh viên' },
  { value: 'phu_huynh', label: 'Phụ huynh' },
  { value: 'giao_vien', label: 'Giáo viên' },
  { value: 'nguoi_di_lam', label: 'Người đi làm' },
  { value: 'khac', label: 'Khác' },
];

export default function InfoPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { user_type: 'hoc_sinh', consent_status: false } });

  const onSubmit = async (data) => {
    const raw = localStorage.getItem('holland_answers_formatted');
    if (!raw) { navigate('/test'); return; }

    setSubmitting(true);
    try {
      const answers = JSON.parse(raw);
      const res = await api.post('/surveys/submit', {
        answers,
        user_info: {
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          interested_career: data.interested_career || null,
          desired_major: data.desired_major,
          desired_university: data.desired_university,
          user_type: data.user_type,
          school: data.school,
          class_name: data.class_name || null,
          province: data.province,
          consent_status: data.consent_status,
        },
      });

      localStorage.removeItem('holland_answers');
      localStorage.removeItem('holland_answers_formatted');

      toast.success('Hoàn thành! Đang chuyển đến kết quả...');
      setTimeout(() => navigate(`/result/${res.data.result_token}`), 500);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold mb-1">Thông tin cá nhân</h1>
      <p className="text-xs text-gray-500 mb-3">
        Vui lòng nhập thông tin chi tiết của bạn dưới đây để xem kết quả trắc nghiệm.
        Các trường có dấu (*) là bắt buộc nhập.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="label-field">Họ và tên *</label>
          <input {...register('full_name', { required: 'Vui lòng nhập họ và tên' })} className={`input-field ${errors.full_name ? 'input-error' : ''}`} />
          {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label-field">Email *</label>
            <input type="email" {...register('email', { required: 'Vui lòng nhập email', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' } })} className={`input-field ${errors.email ? 'input-error' : ''}`} />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label-field">Số điện thoại *</label>
            <input {...register('phone', { required: 'Vui lòng nhập số điện thoại', pattern: { value: /^[0-9+\-\s]{7,15}$/, message: 'Số điện thoại không hợp lệ' } })} className={`input-field ${errors.phone ? 'input-error' : ''}`} />
            {errors.phone && <p className="error-text">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="label-field">Nghề nghiệp/Ngành nghề đang quan tâm</label>
          <input {...register('interested_career')} className="input-field" placeholder="VD: Công nghệ thông tin, Y khoa..." />
        </div>

        <div>
          <label className="label-field">Bạn là... *</label>
          <select {...register('user_type', { required: true })} className="input-field">
            {USER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="label-field">Trường đang học *</label>
          <input {...register('school', { required: 'Vui lòng nhập trường đang học' })} className={`input-field ${errors.school ? 'input-error' : ''}`} placeholder="Tên trường đang học..." />
          {errors.school && <p className="error-text">{errors.school.message}</p>}
        </div>

        <div>
          <label className="label-field">Tỉnh/Thành *</label>
          <input {...register('province', { required: 'Vui lòng nhập tỉnh/thành' })} className={`input-field ${errors.province ? 'input-error' : ''}`} placeholder="VD: TP.HCM, Hà Nội..." />
          {errors.province && <p className="error-text">{errors.province.message}</p>}
        </div>

        {/* Nhóm nguyện vọng */}
        <div className="pt-3 border-t">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Nguyện vọng</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-field">Ngành học mong muốn *</label>
              <input {...register('desired_major', { required: 'Vui lòng nhập ngành học mong muốn' })} className={`input-field ${errors.desired_major ? 'input-error' : ''}`} placeholder="VD: Công nghệ thông tin..." />
              {errors.desired_major && <p className="error-text">{errors.desired_major.message}</p>}
            </div>
            <div>
              <label className="label-field">Trường đại học mong muốn *</label>
              <input {...register('desired_university', { required: 'Vui lòng nhập trường đại học mong muốn' })} className={`input-field ${errors.desired_university ? 'input-error' : ''}`} placeholder="VD: Đại học Bách Khoa..." />
              {errors.desired_university && <p className="error-text">{errors.desired_university.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1">
          <input type="checkbox" {...register('consent_status', { required: 'Bạn cần đồng ý để tiếp tục' })} className="mt-0.5 w-3.5 h-3.5 text-primary-600 rounded" id="consent" />
          <label htmlFor="consent" className="text-xs text-gray-600">
            Tôi đồng ý cho hệ thống lưu thông tin để gửi kết quả và tư vấn hướng nghiệp *
          </label>
        </div>
        {errors.consent_status && <p className="error-text">{errors.consent_status.message}</p>}

        <Button type="submit" disabled={submitting} className="w-full !py-2.5 !text-base">
          {submitting ? 'Đang xử lý...' : 'Xem kết quả'}
        </Button>
      </form>
    </div>
  );
}
