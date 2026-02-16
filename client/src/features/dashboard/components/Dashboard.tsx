import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Users,
  Handshake,
  TrendingUp,
  ClipboardList,
  DollarSign,
  Plus,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import api from '@/lib/api';
import { cn, formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import StatsCard from '@/components/common/StatsCard';
import ActivityFeed, { type Activity } from '@/components/common/ActivityFeed';

// --- Types ---

interface DashboardStats {
  contacts: { total: number; active: number };
  deals: {
    total: number;
    open: number;
    won: number;
    pipelineValue: number;
    wonValue: number;
    winRate: number;
  };
  tasks: { total: number; pending: number; overdue: number };
  tickets: { total: number; open: number };
  invoices: { total: number; paid: number; totalRevenue: number };
  recentActivities: Activity[];
}

interface PipelineStage {
  stage: string;
  count: number;
  totalValue: number;
}

interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  contactName?: string;
  dealName?: string;
}

// --- Pipeline chart colors with gradient pairs ---

const PIPELINE_COLORS = [
  { solid: '#6366f1', light: '#818cf8' }, // indigo
  { solid: '#f59e0b', light: '#fbbf24' }, // amber
  { solid: '#8b5cf6', light: '#a78bfa' }, // violet
  { solid: '#f97316', light: '#fb923c' }, // orange
  { solid: '#10b981', light: '#34d399' }, // emerald
];

const STAGE_NAMES_RO: Record<string, string> = {
  prospecting: 'Prospectare',
  qualification: 'Calificare',
  proposal: 'Propunere',
  negotiation: 'Negociere',
  closed_won: 'Câștigat',
};

function formatStageName(stage: string): string {
  if (STAGE_NAMES_RO[stage]) return STAGE_NAMES_RO[stage];
  return stage
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// --- Custom tooltip ---

function PipelineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: PipelineStage }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div
      className={cn(
        'rounded-2xl border px-5 py-4',
        'border-[var(--border-color)]',
        'bg-[var(--bg-card)]/95 backdrop-blur-xl',
        'shadow-2xl',
      )}
      style={{
        boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)',
      }}
    >
      <p className="text-[17px] font-bold text-[var(--text-primary)]">
        {formatStageName(label || '')}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-[28px] font-bold text-emerald-500 dark:text-emerald-400">
          {formatCurrency(data.totalValue)}
        </p>
      </div>
      <p className="mt-1 text-[16px] text-[var(--text-tertiary)]">
        {data.count} {data.count !== 1 ? 'tranzacții' : 'tranzacție'} în etapă
      </p>
    </div>
  );
}

// --- Priority badge ---

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { classes: string; label: string }> = {
    low: {
      classes: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400',
      label: 'Scăzută',
    },
    medium: {
      classes: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
      label: 'Medie',
    },
    high: {
      classes: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
      label: 'Ridicată',
    },
    urgent: {
      classes: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
      label: 'Urgentă',
    },
  };

  const { classes, label } = config[priority] || config.medium;

  return (
    <span className={cn('rounded-lg px-3 py-1.5 text-[15px] font-semibold', classes)}>
      {label}
    </span>
  );
}

// --- Loading skeleton (premium) ---

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Welcome skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-2xl skeleton-premium" />
        <div className="h-4 w-96 rounded-2xl skeleton-premium" style={{ animationDelay: '0.1s' }} />
      </div>
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[120px] rounded-2xl skeleton-premium"
            style={{ animationDelay: `${0.15 + i * 0.08}s` }}
          />
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 h-96 rounded-2xl skeleton-premium" style={{ animationDelay: '0.55s' }} />
        <div className="h-96 rounded-2xl skeleton-premium" style={{ animationDelay: '0.65s' }} />
      </div>
      {/* Tasks skeleton */}
      <div className="h-64 rounded-2xl skeleton-premium" style={{ animationDelay: '0.75s' }} />
    </div>
  );
}

// --- Card wrapper ---

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl',
        'bg-white/70 dark:bg-white/[0.025]',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-[var(--border-color)]',
        'shadow-sm dark:shadow-black/20',
        'transition-all duration-300 ease-spring',
        'hover:border-[rgba(99,102,241,0.12)] dark:hover:border-[rgba(99,102,241,0.15)]',
        'hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ========== MAIN DASHBOARD ==========

export default function Dashboard() {
  const user = useAuthStore((s: any) => s.user);

  const {
    data: stats,
    isLoading: statsLoading,
    isError: _statsError,
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data.data;
    },
    refetchInterval: 60_000,
  });

  const {
    data: pipeline,
    isLoading: pipelineLoading,
  } = useQuery<PipelineStage[]>({
    queryKey: ['dashboard', 'pipeline'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/pipeline');
      return data.data;
    },
    refetchInterval: 60_000,
  });

  const {
    data: upcomingTasks,
    isLoading: tasksLoading,
  } = useQuery<UpcomingTask[]>({
    queryKey: ['dashboard', 'upcoming-tasks'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/upcoming-tasks');
      return data.data;
    },
    refetchInterval: 60_000,
  });

  if (statsLoading && pipelineLoading && tasksLoading) {
    return <DashboardSkeleton />;
  }

  const firstName = user?.firstName || 'there';
  const greeting = getGreeting();

  return (
    <div className="space-y-10 p-4 lg:p-8">
      {/* ===== Welcome Header with mesh gradient ===== */}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fadeInUp">
        {/* Mesh gradient background behind greeting */}
        <div
          className="pointer-events-none absolute -top-8 -left-8 h-40 w-80 rounded-full opacity-30 dark:opacity-20"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="pointer-events-none absolute -top-4 left-32 h-32 w-48 rounded-full opacity-20 dark:opacity-15"
          style={{
            background: 'radial-gradient(ellipse at 70% 50%, rgba(6,182,212,0.25) 0%, transparent 70%)',
            filter: 'blur(35px)',
          }}
        />

        <div className="relative">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            {greeting}, <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="mt-2 text-[18px] text-[var(--text-secondary)]">
            Iată ce se întâmplă astăzi.
          </p>
        </div>

        <div className="relative flex flex-wrap gap-2">
          <QuickActionButton
            icon={UserPlus}
            label="Contact Nou"
            href="/contacts/new"
            color="indigo"
          />
          <QuickActionButton
            icon={Handshake}
            label="Tranzacție Nouă"
            href="/deals/new"
            color="emerald"
          />
          <QuickActionButton
            icon={Plus}
            label="Sarcină Nouă"
            href="/tasks/new"
            color="violet"
          />
        </div>
      </div>

      {/* ===== Stats Cards ===== */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="animate-fadeInUp stagger-1">
            <StatsCard
              title="Total Contacte"
              value={stats.contacts.total.toLocaleString()}
              subtitle={`${stats.contacts.active} active/activi`}
              icon={Users}
              color="blue"
            />
          </div>
          <div className="animate-fadeInUp stagger-2">
            <StatsCard
              title="Total Tranzacții"
              value={stats.deals.open}
              subtitle={`${stats.deals.winRate}% rată de câștig`}
              icon={Handshake}
              color="emerald"
            />
          </div>
          <div className="animate-fadeInUp stagger-3">
            <StatsCard
              title="Valoare Pipeline"
              value={formatCurrency(stats.deals.pipelineValue)}
              subtitle={`${stats.deals.total} tranzacții deschise`}
              icon={TrendingUp}
              color="purple"
            />
          </div>
          <div className="animate-fadeInUp stagger-4">
            <StatsCard
              title="Sarcini Scadente"
              value={stats.tasks.pending}
              subtitle={
                stats.tasks.overdue > 0
                  ? `${stats.tasks.overdue} întârziate`
                  : 'Totul la zi'
              }
              icon={ClipboardList}
              color={stats.tasks.overdue > 0 ? 'orange' : 'cyan'}
            />
          </div>
          <div className="animate-fadeInUp stagger-5">
            <StatsCard
              title="Venituri"
              value={formatCurrency(stats.invoices.totalRevenue)}
              subtitle={`${stats.invoices.paid} facturi plătite`}
              icon={DollarSign}
              color="green"
            />
          </div>
        </div>
      )}

      {/* ===== Charts + Activity Row ===== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Pipeline Chart */}
        <GlassCard className="col-span-1 lg:col-span-2 animate-fadeInUp stagger-6">
          <div className="border-b border-[var(--border-color)] px-8 py-6">
            <h2 className="text-[22px] font-bold text-[var(--text-primary)]">
              Pipeline Vânzări
            </h2>
            <p className="text-[16px] text-[var(--text-secondary)] mt-0.5">
              Distribuția tranzacțiilor pe etape
            </p>
          </div>

          <div className="p-7">
            {pipelineLoading ? (
              <div className="flex h-80 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" />
              </div>
            ) : pipeline && pipeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={360}>
                <BarChart
                  data={pipeline.map((s) => ({
                    ...s,
                    name: formatStageName(s.stage),
                  }))}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                  barSize={48}
                >
                  <defs>
                    {PIPELINE_COLORS.map((c, i) => (
                      <linearGradient key={i} id={`pipelineGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c.light} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={c.solid} stopOpacity={0.85} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(148,163,184,0.08)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 13, fontWeight: 500 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 13 }}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                    }
                    dx={-4}
                  />
                  <Tooltip
                    content={<PipelineTooltip />}
                    cursor={{ fill: 'rgba(148,163,184,0.04)', radius: 8 }}
                  />
                  <Bar
                    dataKey="totalValue"
                    radius={[10, 10, 4, 4]}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {pipeline.map((_, index) => (
                      <Cell
                        key={index}
                        fill={`url(#pipelineGrad-${index % PIPELINE_COLORS.length})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-80 flex-col items-center justify-center text-[var(--text-tertiary)]">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] mb-3">
                  <TrendingUp className="h-9 w-9 opacity-50" />
                </div>
                <p className="text-[16px] font-medium">Nu există date pipeline</p>
                <p className="text-[14px] mt-1 opacity-60">Creează prima tranzacție pentru a vedea pipeline-ul</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="col-span-1 flex flex-col animate-fadeInUp stagger-7">
          <div className="border-b border-[var(--border-color)] px-8 py-6">
            <h2 className="text-[22px] font-bold text-[var(--text-primary)]">
              Activitate Recentă
            </h2>
            <p className="text-[16px] text-[var(--text-secondary)] mt-0.5">
              Ultimele actualizări din CRM
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            {stats?.recentActivities ? (
              <ActivityFeed activities={stats.recentActivities} maxItems={8} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" />
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* ===== Upcoming Tasks ===== */}
      <GlassCard className="animate-fadeInUp stagger-8">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-8 py-6">
          <div>
            <h2 className="text-[22px] font-bold text-[var(--text-primary)]">
              Sarcini Viitoare
            </h2>
            <p className="text-[16px] text-[var(--text-secondary)] mt-0.5">
              Sarcinile tale scadente în curând
            </p>
          </div>
          <a
            href="/tasks"
            className={cn(
              'flex items-center gap-1.5 text-[16px] font-semibold',
              'text-primary-500 hover:text-primary-400',
              'transition-colors duration-200',
            )}
          >
            Vezi toate
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>

        <div className="p-6">
          {tasksLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--text-tertiary)]" />
            </div>
          ) : upcomingTasks && upcomingTasks.length > 0 ? (
            <div className="space-y-1">
              {upcomingTasks.slice(0, 6).map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-[var(--text-tertiary)]">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] mb-3">
                <Sparkles className="h-9 w-9 opacity-50" />
              </div>
              <p className="text-[16px] font-medium text-[var(--text-secondary)]">Totul la zi!</p>
              <p className="text-[14px] mt-1 opacity-60">Nicio sarcină viitoare. Bucură-te de ziua ta.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// --- Sub-components ---

function QuickActionButton({
  icon: Icon,
  label,
  href,
  color,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  color: 'indigo' | 'emerald' | 'violet';
}) {
  const colorClasses = {
    indigo: 'from-indigo-600 to-indigo-500 shadow-indigo-600/20 hover:shadow-indigo-500/40',
    emerald: 'from-emerald-600 to-emerald-500 shadow-emerald-600/20 hover:shadow-emerald-500/40',
    violet: 'from-violet-600 to-violet-500 shadow-violet-600/20 hover:shadow-violet-500/40',
  };

  return (
    <a
      href={href}
      className={cn(
        'group/btn inline-flex items-center gap-2.5 rounded-xl px-5 py-3',
        'text-[16px] font-semibold text-white',
        'bg-gradient-to-r shadow-md',
        'transition-all duration-300 ease-spring',
        'hover:-translate-y-0.5 hover:shadow-lg',
        'active:translate-y-0',
        colorClasses[color],
      )}
    >
      <Icon className="h-6 w-6 transition-transform duration-300 group-hover/btn:rotate-12" />
      {label}
    </a>
  );
}

function TaskRow({ task }: { task: UpcomingTask }) {
  const isOverdue =
    task.status !== 'completed' && new Date(task.dueDate) < new Date();

  return (
    <div
      className={cn(
        'group flex items-center gap-5 rounded-xl px-5 py-4',
        'transition-all duration-200 ease-spring',
        'hover:bg-[var(--bg-secondary)]/60',
        'hover:-translate-y-px hover:shadow-sm',
        isOverdue && 'border-l-2 border-red-500 pl-3.5',
      )}
    >
      <div
        className={cn(
          'flex h-13 w-13 shrink-0 items-center justify-center rounded-xl',
          'transition-all duration-200',
          isOverdue
            ? 'bg-red-500/10 dark:bg-red-500/[0.12]'
            : 'bg-[var(--bg-secondary)]',
        )}
      >
        {isOverdue ? (
          <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />
        ) : (
          <Clock className="h-6 w-6 text-[var(--text-tertiary)]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-[17px] font-medium',
            isOverdue
              ? 'text-red-700 dark:text-red-400'
              : 'text-[var(--text-primary)]',
          )}
        >
          {task.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-[15px] text-[var(--text-tertiary)]">
          {task.contactName && <span>{task.contactName}</span>}
          {task.contactName && task.dealName && (
            <span className="text-[var(--border-color)]">/</span>
          )}
          {task.dealName && <span>{task.dealName}</span>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <PriorityBadge priority={task.priority} />
        <span
          className={cn(
            'text-[15px] font-semibold',
            isOverdue
              ? 'text-red-500 dark:text-red-400'
              : 'text-[var(--text-tertiary)]',
          )}
        >
          {isOverdue ? 'Întârziat' : formatRelativeTime(task.dueDate)}
        </span>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bună dimineața';
  if (hour < 17) return 'Bună ziua';
  return 'Bună seara';
}
