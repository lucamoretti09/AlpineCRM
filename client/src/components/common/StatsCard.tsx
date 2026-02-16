import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'rose' | 'cyan' | 'emerald' | 'amber';
}

const colorMap = {
  blue: {
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    iconText: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500/5 via-transparent to-transparent',
    ring: 'ring-blue-500/10 dark:ring-blue-400/10',
    glow: 'group-hover:shadow-blue-500/10',
  },
  green: {
    iconBg: 'bg-green-500/10 dark:bg-green-500/15',
    iconText: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-500/5 via-transparent to-transparent',
    ring: 'ring-green-500/10 dark:ring-green-400/10',
    glow: 'group-hover:shadow-green-500/10',
  },
  purple: {
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/15',
    iconText: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500/5 via-transparent to-transparent',
    ring: 'ring-purple-500/10 dark:ring-purple-400/10',
    glow: 'group-hover:shadow-purple-500/10',
  },
  orange: {
    iconBg: 'bg-orange-500/10 dark:bg-orange-500/15',
    iconText: 'text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500/5 via-transparent to-transparent',
    ring: 'ring-orange-500/10 dark:ring-orange-400/10',
    glow: 'group-hover:shadow-orange-500/10',
  },
  rose: {
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/15',
    iconText: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500/5 via-transparent to-transparent',
    ring: 'ring-rose-500/10 dark:ring-rose-400/10',
    glow: 'group-hover:shadow-rose-500/10',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    gradient: 'from-cyan-500/5 via-transparent to-transparent',
    ring: 'ring-cyan-500/10 dark:ring-cyan-400/10',
    glow: 'group-hover:shadow-cyan-500/10',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/5 via-transparent to-transparent',
    ring: 'ring-emerald-500/10 dark:ring-emerald-400/10',
    glow: 'group-hover:shadow-emerald-500/10',
  },
  amber: {
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    iconText: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500/5 via-transparent to-transparent',
    ring: 'ring-amber-500/10 dark:ring-amber-400/10',
    glow: 'group-hover:shadow-amber-500/10',
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        'bg-white/60 dark:bg-white/[0.03]',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-white/20 dark:border-white/[0.06]',
        'ring-1 ring-inset',
        colors.ring,
        'shadow-lg shadow-black/[0.03] dark:shadow-black/20',
        colors.glow,
        'transition-all duration-300 ease-out',
        'hover:-translate-y-0.5 hover:shadow-xl',
      )}
    >
      {/* Subtle gradient overlay */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br',
          colors.gradient,
        )}
      />

      <div className="relative flex items-start justify-between p-6">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            colors.iconBg,
            'transition-transform duration-300 group-hover:scale-110',
          )}
        >
          <Icon className={cn('h-6 w-6', colors.iconText)} />
        </div>
      </div>
    </div>
  );
}
