import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useQuestions from '../hooks/useQuestions';
import useLocalStorage from '../hooks/useLocalStorage';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const LIKERT_OPTIONS = [
  { value: 1, label: 'Rất không đồng ý' },
  { value: 2, label: 'Không đồng ý' },
  { value: 3, label: 'Phân vân' },
  { value: 4, label: 'Đồng ý' },
  { value: 5, label: 'Rất đồng ý' },
];

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function TestPage() {
  const { questions, loading, error } = useQuestions();
  const [answers, setAnswers] = useLocalStorage('holland_answers', {});
  const [flagged, setFlagged] = useLocalStorage('holland_flagged', {});
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleAnswer = useCallback((questionId, value) => {
    setAnswers(prev => {
      const next = { ...prev, [questionId]: value };
      return next;
    });
  }, [setAnswers]);

  const toggleFlag = useCallback((questionId) => {
    setFlagged(prev => {
      const next = { ...prev };
      if (next[questionId]) {
        delete next[questionId];
      } else {
        next[questionId] = true;
      }
      return next;
    });
  }, [setFlagged]);

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn làm lại? Tất cả câu trả lời sẽ bị xóa.')) {
      setAnswers({});
      setFlagged({});
    }
  };

  const answeredCount = Object.keys(answers).length;
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Holland Test</h1>
        <p className="text-sm text-gray-500">Phạm vi kiểm tra: holland test</p>
      </div>

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mb-4 text-sm">
        <span className="text-gray-600">
          Số câu đã làm: <b className="text-blue-600">{answeredCount}</b>/{questions.length}
        </span>
        <span className="text-gray-600">
          Thời gian đã làm: <b className="text-blue-600">{formatTime(timer)}</b>
        </span>
      </div>

      {/* Question status legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mb-6 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
          Câu đã làm
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span>
          Câu chưa làm
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span>
          Câu cần kiểm tra lại
        </span>
      </div>

      {/* Questions list */}
      <div className="space-y-1.5">
        {questions.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          const isFlagged = !!flagged[q.id];
          return (
            <div
              key={q.id}
              className={`flex items-start gap-3 px-4 py-2.5 rounded border ${
                isAnswered ? 'bg-green-50 border-green-200' : isFlagged ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
              }`}
            >
              <span className="text-sm font-bold text-blue-600 w-8 shrink-0 pt-0.5">{idx + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 mb-1.5">{q.content}</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {LIKERT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(q.id, opt.value)}
                      className={`px-2.5 py-1 rounded text-xs transition-all whitespace-nowrap leading-tight border
                        ${answers[q.id] === opt.value
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                          : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-300'}`}
                    >
                      {opt.value}. {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => toggleFlag(q.id)}
                className={`shrink-0 text-lg leading-none px-1.5 py-0.5 rounded transition-colors ${
                  isFlagged ? 'text-orange-500 bg-orange-100' : 'text-gray-300 hover:text-orange-400'
                }`}
                title="Đánh dấu cần kiểm tra lại"
              >
                ⚑
              </button>
            </div>
          );
        })}
      </div>

      {/* Submit / Reset buttons */}
      <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isAllComplete}
          className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Nộp bài
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-8 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          Làm lại
        </button>
      </div>
    </div>
  );
}
