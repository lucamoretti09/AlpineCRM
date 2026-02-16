import { useEffect, useRef, useState } from 'react';
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
    gradient: 'from-blue-500/[0.07] via-blue-400/[0.02] to-transparent',
    accent: 'from-blue-400 via-blue-500 to-blue-600',
    accentGlow: 'rgba(59, 130, 246, 0.5)',
    glow: 'group-hover:shadow-blue-500/12',
    shimmer: 'from-transparent via-blue-400/30 to-transparent',
  },
  green: {
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/[0.12]',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/[0.07] via-emerald-400/[0.02] to-transparent',
    accent: 'from-emerald-400 via-emerald-500 to-emerald-600',
    accentGlow: 'rgba(16, 185, 129, 0.5)',
    glow: 'group-hover:shadow-emerald-500/12',
    shimmer: 'from-transparent via-emerald-400/30 to-transparent',
  },
  purple: {
    iconBg: 'bg-violet-500/10 dark:bg-violet-500/[0.12]',
    iconText: 'text-violet-600 dark:text-violet-400',
    gradient: 'from-violet-500/[0.07] via-violet-400/[0.02] to-transparent',
    accent: 'from-violet-400 via-violet-500 to-violet-600',
    accentGlow: 'rgba(139, 92, 246, 0.5)',
    glow: 'group-hover:shadow-violet-500/12',
    shimmer: 'from-transparent via-violet-400/30 to-transparent',
  },
  orange: {
    iconBg: 'bg-orange-500/10 dark:bg-orange-500/[0.12]',
    iconText: 'text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500/[0.07] via-orange-400/[0.02] to-transparent',
    accent: 'from-orange-400 via-orange-500 to-orange-600',
    accentGlow: 'rgba(249, 115, 22, 0.5)',
    glow: 'group-hover:shadow-orange-500/12',
    shimmer: 'from-transparent via-orange-400/30 to-transparent',
  },
  rose: {
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/[0.12]',
    iconText: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500/[0.07] via-rose-400/[0.02] to-transparent',
    accent: 'from-rose-400 via-rose-500 to-rose-600',
    accentGlow: 'rgba(244, 63, 94, 0.5)',
    glow: 'group-hover:shadow-rose-500/12',
    shimmer: 'from-transparent via-rose-400/30 to-transparent',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/[0.12]',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    gradient: 'from-cyan-500/[0.07] via-cyan-400/[0.02] to-transparent',
    accent: 'from-cyan-400 via-cyan-500 to-cyan-600',
    accentGlow: 'rgba(6, 182, 212, 0.5)',
    glow: 'group-hover:shadow-cyan-500/12',
    shimmer: 'from-transparent via-cyan-400/30 to-transparent',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/[0.12]',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/[0.07] via-emerald-400/[0.02] to-transparent',
    accent: 'from-emerald-400 via-emerald-500 to-emerald-600',
    accentGlow: 'rgba(16, 185, 129, 0.5)',
    glow: 'group-hover:shadow-emerald-500/12',
    shimmer: 'from-transparent via-emerald-400/30 to-transparent',
  },
  amber: {
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/[0.12]',
    iconText: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500/[0.07] via-amber-400/[0.02] to-transparent',
    accent: 'from-amber-400 via-amber-500 to-amber-600',
    accentGlow: 'rgba(245, 158, 11, 0.5)',
    glow: 'group-hover:shadow-amber-500/12',
    shimmer: 'from-transparent via-amber-400/30 to-transparent',
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
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        'bg-white/70 dark:bg-white/[0.025]',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-[var(--border-color)]',
        'shadow-sm dark:shadow-black/20',
        colors.glow,
        'transition-all duration-300 ease-spring',
        'hover:-translate-y-1.5 hover:shadow-xl',
      )}
    >
      {/* Top accent line with gradient and glow */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r',
          colors.accent,
        )}
        style={{
          boxShadow: `0 2px 12px ${colors.accentGlow}, 0 0 20px ${colors.accentGlow}`,
        }}
      />

      {/* Animated shimmer line traveling across the accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden">
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r',
            colors.shimmer,
          )}
          style={{
            animation: 'statsShimmer 3s ease-in-out infinite',
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      {/* Gradient overlay - more visible */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br',
          colors.gradient,
        )}
      />

      {/* Subtle corner radial glow on hover */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle, ${colors.accentGlow} 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />

      <div className="relative flex items-start justify-between p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            {title}
          </p>
          <p
            className={cn(
              'mt-2 text-[28px] font-bold tracking-tight text-[var(--text-primary)] leading-none',
              isVisible && 'animate-statsValuePop',
            )}
          >
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
            'transition-all duration-400 ease-spring',
            'group-hover:scale-110 group-hover:-translate-y-0.5',
          )}
        >
          <Icon className={cn('h-5 w-5 transition-transform duration-400', colors.iconText)} />
        </div>
      </div>
    </div>
  );
}
