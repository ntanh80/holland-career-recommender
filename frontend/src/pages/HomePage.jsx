import { Link } from 'react-router-dom';

const HOLLAND_TYPES = [
  { type: 'R', name: 'Realistic', title: 'Kỹ thuật', icon: '🔧', desc: 'Thích làm việc với máy móc, công cụ, thiết bị. Thiên về hành động thực tế và giải quyết vấn đề cụ thể.', careers: 'Kỹ sư, Thợ cơ khí, Nông dân, Kiến trúc sư...' },
  { type: 'I', name: 'Investigative', title: 'Nghiên cứu', icon: '🔬', desc: 'Thích quan sát, phân tích, nghiên cứu. Đam mê khám phá tri thức và giải quyết vấn đề phức tạp.', careers: 'Bác sĩ, Nhà khoa học, Lập trình viên, Dược sĩ...' },
  { type: 'A', name: 'Artistic', title: 'Nghệ thuật', icon: '🎨', desc: 'Thích sáng tạo, thể hiện bản thân. Đề cao thẩm mỹ, sự độc đáo và tự do biểu đạt.', careers: 'Thiết kế, Viết lách, Âm nhạc, Diễn viên, Kiến trúc...' },
  { type: 'S', name: 'Social', title: 'Xã hội', icon: '🤝', desc: 'Thích giúp đỡ, giảng dạy, chia sẻ. Có khả năng đồng cảm và kết nối với mọi người.', careers: 'Giáo viên, Tư vấn viên, Bác sĩ, Nhân viên xã hội...' },
  { type: 'E', name: 'Enterprising', title: 'Quản lý', icon: '📈', desc: 'Thích lãnh đạo, thuyết phục, kinh doanh. Năng động, tham vọng và thích chinh phục thử thách.', careers: 'CEO, Marketing, Bán hàng, Luật sư, Chính trị gia...' },
  { type: 'C', name: 'Conventional', title: 'Quy củ', icon: '📊', desc: 'Thích tổ chức, sắp xếp, làm việc với dữ liệu. Tỉ mỉ, cẩn thận và tuân thủ quy trình.', careers: 'Kế toán, Kiểm toán, Thư ký, Quản lý dữ liệu, Ngân hàng...' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Khám Phá Bản Thân,<br />Định Hướng Tương Lai
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Bài trắc nghiệm hướng nghiệp Holland (RIASEC) giúp bạn hiểu rõ tính cách nghề nghiệp,
            từ đó chọn được ngành học và nghề nghiệp phù hợp nhất.
          </p>
          <Link to="/test" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold text-lg rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
            Bắt đầu làm bài
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <p className="mt-6 text-blue-200 text-sm">Miễn phí - 60 câu hỏi - Khoảng 15 phút</p>
        </div>
      </section>

      {/* Giới thiệu */}
      <section id="gioi-thieu" className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Holland/RIASEC là gì?</h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Trắc nghiệm Holland (RIASEC) được phát triển bởi nhà tâm lý học John L. Holland.
          Lý thuyết này chia tính cách nghề nghiệp thành 6 nhóm, giúp bạn xác định được
          môi trường làm việc và ngành nghề phù hợp với tính cách của mình.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOLLAND_TYPES.map(h => (
            <div key={h.type} className="card hover:shadow-md transition-shadow border-t-4" style={{ borderTopColor: `var(--color-${h.type})` }}>
              <div className="text-3xl mb-3">{h.icon}</div>
              <h3 className="font-bold text-lg mb-1">{h.name} <span className="text-gray-400 font-normal">({h.type})</span></h3>
              <p className="text-sm text-gray-500 font-medium mb-2">{h.title}</p>
              <p className="text-sm text-gray-600 mb-3">{h.desc}</p>
              <p className="text-xs text-gray-400"><strong>Nghề tiêu biểu:</strong> {h.careers}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lợi ích */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Lợi ích của bài trắc nghiệm</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Hiểu rõ bản thân', desc: 'Khám phá tính cách nghề nghiệp, điểm mạnh và điểm yếu của bạn một cách khoa học.' },
              { title: 'Định hướng nghề nghiệp', desc: 'Nhận gợi ý ngành nghề phù hợp dựa trên mã Holland cá nhân của bạn.' },
              { title: 'Lập kế hoạch học tập', desc: 'Xác định kỹ năng cần phát triển và lộ trình học tập phù hợp cho tương lai.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">{i + 1}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Sẵn sàng khám phá bản thân?</h2>
        <p className="text-gray-600 mb-8">Làm bài trắc nghiệm ngay để nhận kết quả chi tiết và gợi ý ngành nghề phù hợp.</p>
        <Link to="/test" className="btn-primary text-lg px-10 py-4">Bắt đầu làm bài ngay</Link>
      </section>
    </div>
  );
}
