import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency }).format(num);
}

export function formatCompactCurrency(amount: number | string, currency = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Math.abs(num) >= 1_000_000) {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  }
  if (Math.abs(num) >= 10_000) {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  }
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency }).format(num);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ro-RO', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('ro-RO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const absDiffMs = Math.abs(diffMs);
  const diffSecs = Math.floor(absDiffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isFuture = diffMs < 0;

  if (diffSecs < 60) return 'chiar acum';
  if (diffMins < 60) return isFuture ? `în ${diffMins} min` : `acum ${diffMins} min`;
  if (diffHours < 24) return isFuture ? `în ${diffHours} ore` : `acum ${diffHours} ore`;
  if (diffDays < 7) return isFuture ? `în ${diffDays} zile` : `acum ${diffDays} zile`;
  return formatDate(date);
}

export function formatLongDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ro-RO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    prospecting: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    qualification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    proposal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    closed_won: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    closed_lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[stage] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[priority] || colors.medium;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    churned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    won: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
}
