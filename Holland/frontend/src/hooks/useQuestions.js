import { useState, useEffect } from 'react';
import api from '../services/api';

export default function useQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/questions').then(res => {
      if (!cancelled) setQuestions(res.data.questions);
    }).catch(err => {
      if (!cancelled) setError(err.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { questions, loading, error };
}
