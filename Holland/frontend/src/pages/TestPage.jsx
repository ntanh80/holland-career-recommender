import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useQuestions from '../hooks/useQuestions';
import useLocalStorage from '../hooks/useLocalStorage';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const QUESTIONS_PER_PAGE = 10;
const LIKERT_OPTIONS = [
  { value: 1, label: 'Rất không đồng ý' },
  { value: 2, label: 'Không đồng ý' },
  { value: 3, label: 'Phân vân' },
  { value: 4, label: 'Đồng ý' },
  { value: 5, label: 'Rất đồng ý' },
];

const TYPE_NAMES = {
  R: 'Nhóm R: Realistic — Kỹ thuật, Thực tế',
  I: 'Nhóm I: Investigative — Nghiên cứu, Phân tích',
  A: 'Nhóm A: Artistic — Nghệ thuật, Sáng tạo',
  S: 'Nhóm S: Social — Xã hội, Hỗ trợ',
  E: 'Nhóm E: Enterprising — Quản lý, Kinh doanh',
  C: 'Nhóm C: Conventional — Quy củ, Dữ liệu',
};

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function TestPage() {
  const { questions, loading, error } = useQuestions();
  const [answers, setAnswers] = useLocalStorage('holland_answers', {});
  const [flagged, setFlagged] = useLocalStorage('holland_flagged', {});
  const [currentPage, setCurrentPage] = useState(0);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const pageQuestions = questions.slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE);
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = useCallback((questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, [setAnswers]);

  const toggleFlag = useCallback((questionId) => {
    setFlagged(prev => {
      const next = { ...prev };
      if (next[questionId]) { delete next[questionId]; }
      else { next[questionId] = true; }
      return next;
    });
  }, [setFlagged]);

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn làm lại? Tất cả câu trả lời sẽ bị xóa.')) {
      setAnswers({});
      setFlagged({});
      setCurrentPage(0);
    }
  };

  const isPageComplete = pageQuestions.every(q => answers[q.id]);
  const isAllComplete = questions.length > 0 && questions.every(q => answers[q.id]);

  const handleSubmit = () => {
    if (!isAllComplete) {
      alert('Vui lòng trả lời tất cả câu hỏi trước khi nộp bài.');
      return;
    }
    const formatted = Object.entries(answers).map(([qId, val]) => ({
      question_id: parseInt(qId), answer_value: val,
    }));
    localStorage.setItem('holland_answers_formatted', JSON.stringify(formatted));
    navigate('/info');
  };

  if (loading) return <LoadingSpinner message="Đang tải câu hỏi..." />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><p className="text-red-500">{error}</p></div>;

  const currentHollandType = pageQuestions.length > 0 ? pageQuestions[0].holland_type : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Holland Test</h1>
        <p className="text-sm text-gray-500">Phạm vi kiểm tra: holland test</p>
      </div>

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mb-3 text-sm">
        <span className="text-gray-600">
          Số câu đã làm: <b className="text-blue-600">{answeredCount}</b>/{questions.length}
        </span>
        <span className="text-gray-600">
          Thời gian đã làm: <b className="text-blue-600">{formatTime(timer)}</b>
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <ProgressBar current={answeredCount} total={questions.length} />
      </div>

      {/* Question status legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mb-1 text-xs">
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
          Câu đã làm
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block"></span>
          Câu chưa làm
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span>
          Câu cần kiểm tra lại
        </span>
      </div>

      {/* Page type heading */}
      <div className="mb-4 mt-2">
        <span className="text-xs text-gray-400">Trang {currentPage + 1}/{totalPages}</span>
        {currentHollandType && (
          <h2 className="text-lg font-bold text-blue-700">{TYPE_NAMES[currentHollandType]}</h2>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          Vui lòng trả lời tất cả 10 câu hỏi để tiếp tục sang nhóm tiếp theo
        </p>
      </div>

      {/* Questions list */}
      <div className="space-y-2">
        {pageQuestions.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          const isFlagged = !!flagged[q.id];
          return (
            <div
              key={q.id}
              className={`px-4 py-3 rounded border ${
                isAnswered ? 'bg-green-50 border-green-200' : isFlagged ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-sm font-bold text-blue-600 w-6 shrink-0">{currentPage * QUESTIONS_PER_PAGE + idx + 1}.</span>
                <p className="text-sm text-gray-800 flex-1">{q.content}</p>
                <button
                  onClick={() => toggleFlag(q.id)}
                  className={`shrink-0 text-base leading-none px-1.5 py-0.5 rounded transition-colors ${
                    isFlagged ? 'text-orange-500 bg-orange-100' : 'text-gray-300 hover:text-orange-400'
                  }`}
                  title="Đánh dấu cần kiểm tra lại"
                >
                  ⚑
                </button>
              </div>
              <div className="flex flex-col gap-1 ml-8">
                {LIKERT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(q.id, opt.value)}
                    className={`px-3 py-1.5 rounded text-sm text-left transition-all leading-tight border
                      ${answers[q.id] === opt.value
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'}`}
                  >
                    {opt.value}. {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <button
          type="button"
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(p => p - 1)}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Quay lại
        </button>

        {/* Always show Nộp bài and Làm lại */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Làm lại
          </button>

          {currentPage < totalPages - 1 ? (
            <button
              type="button"
              disabled={!isPageComplete}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Tiếp tục →
            </button>
          ) : (
            <button
              type="button"
              disabled={!isAllComplete}
              onClick={handleSubmit}
              className="px-6 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Nộp bài
            </button>
          )}
        </div>
      </div>

      {!isPageComplete && (
        <p className="text-amber-600 text-sm text-center mt-3">
          Vui lòng trả lời tất cả câu hỏi trên trang này trước khi tiếp tục.
        </p>
      )}
    </div>
  );
}
