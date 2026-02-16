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
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/[0.12]',
    iconText: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500/[0.04] via-transparent to-transparent',
    accent: 'bg-blue-500',
    glow: 'group-hover:shadow-blue-500/8',
  },
  green: {
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/[0.12]',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/[0.04] via-transparent to-transparent',
    accent: 'bg-emerald-500',
    glow: 'group-hover:shadow-emerald-500/8',
  },
  purple: {
    iconBg: 'bg-violet-500/10 dark:bg-violet-500/[0.12]',
    iconText: 'text-violet-600 dark:text-violet-400',
    gradient: 'from-violet-500/[0.04] via-transparent to-transparent',
    accent: 'bg-violet-500',
    glow: 'group-hover:shadow-violet-500/8',
  },
  orange: {
    iconBg: 'bg-orange-500/10 dark:bg-orange-500/[0.12]',
    iconText: 'text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500/[0.04] via-transparent to-transparent',
    accent: 'bg-orange-500',
    glow: 'group-hover:shadow-orange-500/8',
  },
  rose: {
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/[0.12]',
    iconText: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500/[0.04] via-transparent to-transparent',
    accent: 'bg-rose-500',
    glow: 'group-hover:shadow-rose-500/8',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/[0.12]',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    gradient: 'from-cyan-500/[0.04] via-transparent to-transparent',
    accent: 'bg-cyan-500',
    glow: 'group-hover:shadow-cyan-500/8',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/[0.12]',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/[0.04] via-transparent to-transparent',
    accent: 'bg-emerald-500',
    glow: 'group-hover:shadow-emerald-500/8',
  },
  amber: {
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/[0.12]',
    iconText: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500/[0.04] via-transparent to-transparent',
    accent: 'bg-amber-500',
    glow: 'group-hover:shadow-amber-500/8',
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
        'bg-white/70 dark:bg-white/[0.025]',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-[var(--border-color)]',
        'shadow-sm dark:shadow-black/20',
        colors.glow,
        'transition-all duration-300 ease-spring',
        'hover:-translate-y-1 hover:shadow-lg',
      )}
    >
      {/* Top accent line */}
      <div className={cn('absolute top-0 left-0 right-0 h-[2px]', colors.accent, 'opacity-40')} />

      {/* Gradient overlay */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br',
          colors.gradient,
        )}
      />

      <div className="relative flex items-start justify-between p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            {title}
          </p>
          <p className="mt-2 text-[28px] font-bold tracking-tight text-[var(--text-primary)] leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="mt-2 text-[12px] font-medium text-[var(--text-secondary)]">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            colors.iconBg,
            'transition-transform duration-300 group-hover:scale-110',
          )}
        >
          <Icon className={cn('h-5 w-5', colors.iconText)} />
        </div>
      </div>
    </div>
  );
}
