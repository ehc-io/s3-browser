import { useEffect } from 'react';
import { X, CheckCircle, Warning, XCircle, Info } from '@phosphor-icons/react';
import type { ToastType } from '../../store/toastStore';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: Warning,
  info: Info,
};

const colorMap = {
  success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
};

export function Toast({ id, message, type, onClose, duration = 3000 }: ToastProps) {
  const Icon = iconMap[type];

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${colorMap[type]}`}>
      <Icon size={20} weight="fill" />
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button onClick={() => onClose(id)} className="hover:opacity-70">
        <X size={16} />
      </button>
    </div>
  );
}
