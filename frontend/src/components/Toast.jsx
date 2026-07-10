import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const icons = {
  success: <FiCheckCircle />,
  error: <FiAlertCircle />,
  info: <FiInfo />,
};

const colors = {
  success: 'border-green-500 bg-green-50 text-green-600',
  error: 'border-red-500 bg-red-50 text-red-500',
  info: 'border-indigo-400 bg-indigo-50 text-indigo-600',
};

export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!message) return null;

  return (
    <div className={`toast glass flex items-center gap-3 px-5 py-3 rounded-xl border ${colors[type]}`}>
      <span className="text-lg">{icons[type]}</span>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
        <FiX />
      </button>
    </div>
  );
}
