export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Trắc nghiệm Hướng nghiệp Holland. Tất cả quyền được bảo lưu.</p>
        <p className="mt-1">Bài trắc nghiệm dựa trên lý thuyết Holland/RIASEC - John L. Holland (1959).</p>
      </div>
    </footer>
  );
}
