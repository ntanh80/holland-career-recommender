import { useState, useEffect, useCallback } from 'react';

let toastId = 0;
let listeners = [];

function notify(type, message) {
  const id = ++toastId;
  listeners.forEach(fn => fn({ id, type, message }));
  return id;
}

export const toast = {
  success: (msg) => notify('success', msg),
  error: (msg) => notify('error', msg),
  info: (msg) => notify('info', msg),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    listeners.push((t) => setToasts(prev => [...prev, t]));
    return () => { listeners = []; };
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(t => <ToastItem key={t.id} {...t} onRemove={remove} />)}
    </div>
  );
}

function ToastItem({ id, type, message, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const colors = { success: 'bg-green-50 border-green-400 text-green-800', error: 'bg-red-50 border-red-400 text-red-800', info: 'bg-blue-50 border-blue-400 text-blue-800' };

  return (
    <div className={`px-4 py-3 rounded-lg border shadow-lg ${colors[type]} flex items-center justify-between gap-3 animate-slide-in`}>
      <span className="text-sm">{message}</span>
      <button onClick={() => onRemove(id)} className="text-current opacity-50 hover:opacity-100">&times;</button>
    </div>
  );
}
