import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useQuestions from '../hooks/useQuestions';
import useLocalStorage from '../hooks/useLocalStorage';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const QUESTIONS_PER_PAGE = 10;
const LIKERT_OPTIONS = [
  { value: 1, label: 'Rất không đồng ý' },
  { value: 2, label: 'Không đồng ý' },
  { value: 3, label: 'Phân vân' },
  { value: 4, label: 'Đồng ý' },
  { value: 5, label: 'Rất đồng ý' },
];

export default function TestPage() {
  const { questions, loading, error } = useQuestions();
  const [answers, setAnswers] = useLocalStorage('holland_answers', {});
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const pageQuestions = questions.slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE);
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = useCallback((questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, [setAnswers]);

  const isPageComplete = pageQuestions.every(q => answers[q.id]);
  const isAllComplete = questions.length > 0 && questions.every(q => answers[q.id]);

  const handleFinish = () => {
    if (!isAllComplete) return;
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
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-3">Bài trắc nghiệm Holland</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span>Số câu đã làm: <b className="text-primary-600">{answeredCount}</b>/{questions.length}</span>
        </div>
        <ProgressBar current={answeredCount} total={questions.length} />
      </div>

      <div className="space-y-2">
        {pageQuestions.map((q, idx) => (
          <div key={q.id} className={`border rounded px-4 py-3 transition-colors ${answers[q.id] ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-200'}`}>
            <p className="text-sm font-medium text-gray-800 mb-2">
              <span className="text-primary-600 font-bold mr-1.5">{currentPage * QUESTIONS_PER_PAGE + idx + 1}.</span>
              {q.content}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {LIKERT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(q.id, opt.value)}
                  className={`px-2.5 py-1.5 rounded text-xs transition-all whitespace-nowrap leading-tight
                    ${answers[q.id] === opt.value
                      ? 'bg-primary-600 text-white font-semibold shadow'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                >
                  {opt.value}. {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <Button variant="outline" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
          ← Quay lại
        </Button>

        <span className="text-sm text-gray-500">Trang {currentPage + 1}/{totalPages}</span>

        {currentPage < totalPages - 1 ? (
          <Button disabled={!isPageComplete} onClick={() => setCurrentPage(p => p + 1)}>
            Tiếp tục →
          </Button>
        ) : (
          <Button disabled={!isAllComplete} onClick={handleFinish}>
            Hoàn thành
          </Button>
        )}
      </div>

      {!isPageComplete && (
        <p className="text-amber-600 text-sm text-center mt-3">Vui lòng trả lời tất cả câu hỏi trên trang này trước khi tiếp tục.</p>
      )}
    </div>
  );
}
