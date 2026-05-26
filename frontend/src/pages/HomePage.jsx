import { Link } from 'react-router-dom';

const HOLLAND_TYPES = [
  { type: 'R', name: 'Realistic', title: 'Kỹ thuật', icon: '🔧', desc: 'Thích làm việc với những vật cụ thể, máy móc, dụng cụ, cây cối, con vật hoặc các hoạt động ngoài trời.', careers: 'Kỹ sư, Đầu bếp, Thợ điện, Thợ cơ khí, Y tá điều dưỡng...' },
  { type: 'I', name: 'Investigative', title: 'Nghiên cứu', icon: '🔬', desc: 'Thích quan sát, tìm tòi, điều tra, phân tích, đánh giá hoặc giải quyết vấn đề.', careers: 'Nhà khoa học, Dược sĩ, Kỹ sư phần mềm, Bác sĩ, Nhà sinh vật học...' },
  { type: 'A', name: 'Artistic', title: 'Nghệ thuật', icon: '🎨', desc: 'Có khả năng nghệ thuật, sáng tác, trực giác và thích làm việc trong các tình huống không có kế hoạch trước, dùng trí tưởng tượng và sáng tạo.', careers: 'Thiết kế đồ họa, Kiến trúc sư, Diễn viên, Phóng viên, Nhiếp ảnh gia...' },
  { type: 'S', name: 'Social', title: 'Xã hội', icon: '🤝', desc: 'Thích làm việc cung cấp hoặc làm sáng tỏ thông tin, thích giúp đỡ, huấn luyện, chữa trị hoặc chăm sóc sức khỏe cho người khác, có khả năng về ngôn ngữ.', careers: 'Giáo viên, Tư vấn học đường, Nhà trị liệu, Nhân viên xã hội, Thủ thư...' },
  { type: 'E', name: 'Enterprising', title: 'Quản lý', icon: '📈', desc: 'Thích làm việc với người khác, có khả năng tác động, thuyết phục, thể hiện, lãnh đạo hoặc quản lý mục tiêu tổ chức, lợi ích kinh tế.', careers: 'Chủ doanh nghiệp, Quản lý khách sạn, Marketing, Bán hàng, Luật sư...' },
  { type: 'C', name: 'Conventional', title: 'Nghiệp vụ', icon: '📊', desc: 'Thích làm việc với dữ liệu, con số, có khả năng làm việc văn phòng, thống kê, thực hiện công việc đòi hỏi chi tiết, tỉ mỉ, cẩn thận hoặc làm theo hướng dẫn.', careers: 'Kế toán, Kiểm toán, Thư ký pháp lý, Thu ngân ngân hàng, Thanh tra...' },
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
        <h2 className="text-3xl font-bold text-center mb-4">Trắc nghiệm Holland/RIASEC là gì?</h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-4">
          Trắc nghiệm Holland (RIASEC) được phát triển bởi nhà tâm lý học người Mỹ <strong>John L. Holland (1919–2008)</strong>,
          tác giả của <em>Lý thuyết lựa chọn nghề nghiệp</em>. Mô hình của ông đã được ứng dụng rộng rãi trên thế giới
          trong lĩnh vực hướng nghiệp.
        </p>
        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-4">
          Luận điểm cốt lõi của Holland: <strong>"Thiên hướng nghề nghiệp chính là sự biểu hiện cá tính của mỗi con người"</strong>.
          Ông chia tính cách nghề nghiệp thành 6 nhóm, được biểu diễn trên hai phương diện: cá tính và môi trường làm việc.
        </p>
        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
          6 nhóm được sắp xếp trên một hình lục giác (RIASEC) dựa trên sở thích làm việc với các nhóm kích thích khác nhau:
          con người, dữ liệu, đối tượng và ý tưởng. Khoảng cách giữa các nhóm trên lục giác cho biết mức độ khác biệt
          của các sở thích. Kết quả trắc nghiệm là một <strong>mã Holland gồm 3 chữ cái</strong>, đại diện cho ba nhóm tính cách
          nổi trội nhất của bạn.
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
