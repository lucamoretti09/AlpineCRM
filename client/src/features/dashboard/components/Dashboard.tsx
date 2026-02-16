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

// --- Pipeline chart colors ---

const PIPELINE_COLORS = [
  '#6366f1', // indigo - prospecting
  '#f59e0b', // amber - qualification
  '#8b5cf6', // violet - proposal
  '#f97316', // orange - negotiation
  '#10b981', // emerald - closed won
];

function formatStageName(stage: string): string {
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
        'rounded-xl border border-white/10 px-4 py-3',
        'bg-[#0d1025]/95 backdrop-blur-xl',
        'shadow-xl shadow-black/30',
      )}
    >
      <p className="text-[13px] font-bold text-white">
        {formatStageName(label || '')}
      </p>
      <p className="mt-1 text-[12px] text-slate-400">
        {data.count} deal{data.count !== 1 ? 's' : ''}
      </p>
      <p className="text-[14px] font-semibold text-emerald-400">
        {formatCurrency(data.totalValue)}
      </p>
    </div>
  );
}

// --- Priority badge ---

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { classes: string; label: string }> = {
    low: {
      classes: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400',
      label: 'Low',
    },
    medium: {
      classes: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
      label: 'Medium',
    },
    high: {
      classes: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
      label: 'High',
    },
    urgent: {
      classes: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
      label: 'Urgent',
    },
  };

  const { classes, label } = config[priority] || config.medium;

  return (
    <span className={cn('rounded-lg px-2 py-0.5 text-[11px] font-semibold', classes)}>
      {label}
    </span>
  );
}

// --- Loading skeleton ---

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8 p-6 lg:p-8">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-xl skeleton" />
        <div className="h-4 w-96 rounded-xl skeleton" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[120px] rounded-2xl skeleton" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 h-96 rounded-2xl skeleton" />
        <div className="h-96 rounded-2xl skeleton" />
      </div>
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
    <div className="space-y-8 p-2 lg:p-4">
      {/* ===== Welcome Header ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fadeInUp">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">
            {greeting}, <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
            Here's what's happening with your CRM today.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <QuickActionButton
            icon={UserPlus}
            label="New Contact"
            href="/contacts/new"
            color="indigo"
          />
          <QuickActionButton
            icon={Handshake}
            label="New Deal"
            href="/deals/new"
            color="emerald"
          />
          <QuickActionButton
            icon={Plus}
            label="New Task"
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
              title="Total Contacts"
              value={stats.contacts.total.toLocaleString()}
              subtitle={`${stats.contacts.active} active`}
              icon={Users}
              color="blue"
            />
          </div>
          <div className="animate-fadeInUp stagger-2">
            <StatsCard
              title="Open Deals"
              value={stats.deals.open}
              subtitle={`${stats.deals.winRate}% win rate`}
              icon={Handshake}
              color="emerald"
            />
          </div>
          <div className="animate-fadeInUp stagger-3">
            <StatsCard
              title="Pipeline Value"
              value={formatCurrency(stats.deals.pipelineValue)}
              subtitle={`${stats.deals.total} total deals`}
              icon={TrendingUp}
              color="purple"
            />
          </div>
          <div className="animate-fadeInUp stagger-4">
            <StatsCard
              title="Tasks Due"
              value={stats.tasks.pending}
              subtitle={
                stats.tasks.overdue > 0
                  ? `${stats.tasks.overdue} overdue`
                  : 'All on track'
              }
              icon={ClipboardList}
              color={stats.tasks.overdue > 0 ? 'orange' : 'cyan'}
            />
          </div>
          <div className="animate-fadeInUp stagger-5">
            <StatsCard
              title="Revenue"
              value={formatCurrency(stats.invoices.totalRevenue)}
              subtitle={`${stats.invoices.paid} invoices paid`}
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
          <div className="border-b border-[var(--border-color)] px-6 py-4">
            <h2 className="text-[15px] font-bold text-[var(--text-primary)]">
              Sales Pipeline
            </h2>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
              Deal distribution by stage
            </p>
          </div>

          <div className="p-6">
            {pipelineLoading ? (
              <div className="flex h-72 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--text-tertiary)]" />
              </div>
            ) : pipeline && pipeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={pipeline.map((s) => ({
                    ...s,
                    name: formatStageName(s.stage),
                  }))}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                  barSize={44}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(148,163,184,0.08)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontWeight: 500 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                    }
                    dx={-4}
                  />
                  <Tooltip
                    content={<PipelineTooltip />}
                    cursor={{ fill: 'rgba(148,163,184,0.04)' }}
                  />
                  <Bar
                    dataKey="totalValue"
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {pipeline.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PIPELINE_COLORS[index % PIPELINE_COLORS.length]}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-72 flex-col items-center justify-center text-[var(--text-tertiary)]">
                <TrendingUp className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-[13px]">No pipeline data available</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="col-span-1 flex flex-col animate-fadeInUp stagger-7">
          <div className="border-b border-[var(--border-color)] px-6 py-4">
            <h2 className="text-[15px] font-bold text-[var(--text-primary)]">
              Recent Activity
            </h2>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
              Latest updates across your CRM
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {stats?.recentActivities ? (
              <ActivityFeed activities={stats.recentActivities} maxItems={8} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--text-tertiary)]" />
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* ===== Upcoming Tasks ===== */}
      <GlassCard className="animate-fadeInUp stagger-8">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-[var(--text-primary)]">
              Upcoming Tasks
            </h2>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
              Your tasks due soon
            </p>
          </div>
          <a
            href="/tasks"
            className={cn(
              'flex items-center gap-1 text-[12px] font-semibold',
              'text-primary-500 hover:text-primary-400',
              'transition-colors duration-200',
            )}
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="p-4">
          {tasksLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--text-tertiary)]" />
            </div>
          ) : upcomingTasks && upcomingTasks.length > 0 ? (
            <div className="space-y-1">
              {upcomingTasks.slice(0, 6).map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-[var(--text-tertiary)]">
              <CheckCircle2 className="mb-2 h-8 w-8 opacity-40" />
              <p className="text-[13px] font-medium">No upcoming tasks. You're all caught up!</p>
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
    indigo: 'from-indigo-600 to-indigo-500 shadow-indigo-600/20 hover:shadow-indigo-600/30',
    emerald: 'from-emerald-600 to-emerald-500 shadow-emerald-600/20 hover:shadow-emerald-600/30',
    violet: 'from-violet-600 to-violet-500 shadow-violet-600/20 hover:shadow-violet-600/30',
  };

  return (
    <a
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-4 py-2.5',
        'text-[13px] font-semibold text-white',
        'bg-gradient-to-r shadow-md',
        'transition-all duration-300 ease-spring',
        'hover:-translate-y-0.5 hover:shadow-lg',
        'active:translate-y-0',
        colorClasses[color],
      )}
    >
      <Icon className="h-4 w-4" />
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
        'group flex items-center gap-4 rounded-xl px-4 py-3',
        'transition-all duration-200',
        'hover:bg-[var(--bg-secondary)]/60',
        isOverdue && 'border-l-2 border-red-500 pl-3.5',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          isOverdue
            ? 'bg-red-500/10 dark:bg-red-500/[0.12]'
            : 'bg-[var(--bg-secondary)]',
        )}
      >
        {isOverdue ? (
          <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
        ) : (
          <Clock className="h-4 w-4 text-[var(--text-tertiary)]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-[13px] font-medium',
            isOverdue
              ? 'text-red-700 dark:text-red-400'
              : 'text-[var(--text-primary)]',
          )}
        >
          {task.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
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
            'text-[11px] font-semibold',
            isOverdue
              ? 'text-red-500 dark:text-red-400'
              : 'text-[var(--text-tertiary)]',
          )}
        >
          {isOverdue ? 'Overdue' : formatRelativeTime(task.dueDate)}
        </span>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
