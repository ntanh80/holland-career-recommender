const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function Pagination({ page, totalPages, pageSize, total, idxStart, onPageChange, onPageSizeChange }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t mt-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          {idxStart + 1}-{Math.min(idxStart + pageSize, total)} / {total}
        </span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="text-xs border border-gray-300 rounded px-2 py-1 outline-none"
        >
          {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n} / trang</option>)}
        </select>
      </div>
      {totalPages > 1 && (
        <div className="flex gap-1">
          <button onClick={() => onPageChange(1)} disabled={page <= 1}
            className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-gray-50">&laquo;</button>
          <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}
            className="px-3 py-1 text-xs border rounded disabled:opacity-30 hover:bg-gray-50">Trước</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, i, arr) => (
              <span key={p}>
                {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-gray-300">...</span>}
                <button onClick={() => onPageChange(p)}
                  className={`px-3 py-1 text-xs border rounded ${p === page ? 'bg-primary-600 text-white border-primary-600' : 'hover:bg-gray-50'}`}>{p}</button>
              </span>
            ))}
          <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
            className="px-3 py-1 text-xs border rounded disabled:opacity-30 hover:bg-gray-50">Sau</button>
          <button onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}
            className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-gray-50">&raquo;</button>
        </div>
      )}
    </div>
  );
}
