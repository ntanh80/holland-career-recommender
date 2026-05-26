import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-700">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Holland Test
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#gioi-thieu" className="hover:text-primary-600">Giới thiệu</a>
          <a href="#nhom-holland" className="hover:text-primary-600">6 nhóm Holland</a>
          <Link to="/test" className="btn-primary !py-2 !px-4 !text-sm">Làm bài test</Link>
        </nav>
      </div>
    </header>
  );
}
