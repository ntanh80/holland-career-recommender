export default function SortIcon({ active, dir }) {
  return (
    <span className="inline-flex flex-col ml-1.5 -space-y-0.5">
      <svg className={`w-2.5 h-2.5 ${active && dir === 'asc' ? 'text-primary-600' : 'text-gray-300'}`} viewBox="0 0 10 6" fill="currentColor">
        <path d="M5 0L10 6H0z" />
      </svg>
      <svg className={`w-2.5 h-2.5 ${active && dir === 'desc' ? 'text-primary-600' : 'text-gray-300'}`} viewBox="0 0 10 6" fill="currentColor">
        <path d="M5 6L0 0h10z" />
      </svg>
    </span>
  );
}
