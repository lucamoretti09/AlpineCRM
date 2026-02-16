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
  CalendarClock,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
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
  '#3b82f6', // blue - prospecting
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

// --- Custom tooltip for pipeline chart ---

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
        'bg-slate-900/90 backdrop-blur-xl',
        'shadow-xl shadow-black/20',
      )}
    >
      <p className="text-sm font-semibold text-white">
        {formatStageName(label || '')}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        {data.count} deal{data.count !== 1 ? 's' : ''}
      </p>
      <p className="text-sm font-medium text-emerald-400">
        {formatCurrency(data.totalValue)}
      </p>
    </div>
  );
}

// --- Priority badge ---

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { classes: string; label: string }> = {
    low: {
      classes: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      label: 'Low',
    },
    medium: {
      classes: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
      label: 'Medium',
    },
    high: {
      classes: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
      label: 'High',
    },
    urgent: {
      classes: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
      label: 'Urgent',
    },
  };

  const { classes, label } = config[priority] || config.medium;

  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', classes)}>
      {label}
    </span>
  );
}

// --- Loading skeleton ---

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8 p-6 lg:p-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-slate-200 dark:bg-white/[0.06]" />
        <div className="h-4 w-96 rounded-lg bg-slate-200 dark:bg-white/[0.04]" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-slate-200 dark:bg-white/[0.03]"
          />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 h-96 rounded-2xl bg-slate-200 dark:bg-white/[0.03]" />
        <div className="h-96 rounded-2xl bg-slate-200 dark:bg-white/[0.03]" />
      </div>
    </div>
  );
}

// --- Card wrapper for glassmorphism ---

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
        'bg-white/60 dark:bg-white/[0.03]',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-white/20 dark:border-white/[0.06]',
        'shadow-lg shadow-black/[0.03] dark:shadow-black/20',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ========== MAIN DASHBOARD COMPONENT ==========

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  // Fetch dashboard stats
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data.data;
    },
    refetchInterval: 60_000,
  });

  // Fetch pipeline data
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

  // Fetch upcoming tasks
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

  // Loading state
  if (statsLoading && pipelineLoading && tasksLoading) {
    return <DashboardSkeleton />;
  }

  const firstName = user?.firstName || 'there';
  const greeting = getGreeting();

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* ===== Welcome Header ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Here's what's happening with your CRM today.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2">
          <QuickActionButton
            icon={UserPlus}
            label="New Contact"
            href="/contacts/new"
            color="blue"
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
          <StatsCard
            title="Total Contacts"
            value={stats.contacts.total.toLocaleString()}
            subtitle={`${stats.contacts.active} active`}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Open Deals"
            value={stats.deals.open}
            subtitle={`${stats.deals.winRate}% win rate`}
            icon={Handshake}
            color="emerald"
          />
          <StatsCard
            title="Pipeline Value"
            value={formatCurrency(stats.deals.pipelineValue)}
            subtitle={`${stats.deals.total} total deals`}
            icon={TrendingUp}
            color="purple"
          />
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
          <StatsCard
            title="Revenue"
            value={formatCurrency(stats.invoices.totalRevenue)}
            subtitle={`${stats.invoices.paid} invoices paid`}
            icon={DollarSign}
            color="green"
          />
        </div>
      )}

      {/* ===== Charts + Activity Row ===== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Pipeline Chart */}
        <GlassCard className="col-span-1 lg:col-span-2">
          <div className="border-b border-slate-200/60 dark:border-white/[0.06] px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Sales Pipeline
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Deal distribution by stage
            </p>
          </div>

          <div className="p-6">
            {pipelineLoading ? (
              <div className="flex h-72 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : pipeline && pipeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={pipeline.map((s) => ({
                    ...s,
                    name: formatStageName(s.stage),
                  }))}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                  barSize={48}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(148,163,184,0.12)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                    }
                    dx={-4}
                  />
                  <Tooltip
                    content={<PipelineTooltip />}
                    cursor={{ fill: 'rgba(148,163,184,0.06)' }}
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
              <div className="flex h-72 flex-col items-center justify-center text-slate-400">
                <TrendingUp className="mb-2 h-8 w-8" />
                <p className="text-sm">No pipeline data available</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="col-span-1 flex flex-col">
          <div className="border-b border-slate-200/60 dark:border-white/[0.06] px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Latest updates across your CRM
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {stats?.recentActivities ? (
              <ActivityFeed activities={stats.recentActivities} maxItems={8} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* ===== Upcoming Tasks ===== */}
      <GlassCard>
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.06] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Upcoming Tasks
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your tasks due soon
            </p>
          </div>
          <a
            href="/tasks"
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              'text-blue-600 dark:text-blue-400',
              'transition-colors hover:text-blue-700 dark:hover:text-blue-300',
            )}
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="p-6">
          {tasksLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : upcomingTasks && upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 6).map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <CheckCircle2 className="mb-2 h-8 w-8" />
              <p className="text-sm">No upcoming tasks. You're all caught up!</p>
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
  color: 'blue' | 'emerald' | 'violet';
}) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25',
    violet: 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/25',
  };

  return (
    <a
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-4 py-2.5',
        'text-sm font-medium text-white',
        'shadow-lg transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-xl',
        'active:translate-y-0 active:shadow-md',
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
        'transition-colors duration-150',
        'hover:bg-slate-50 dark:hover:bg-white/[0.02]',
        isOverdue && 'border-l-2 border-red-500 pl-3.5',
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          isOverdue
            ? 'bg-red-500/10 dark:bg-red-500/15'
            : 'bg-slate-100 dark:bg-white/[0.06]',
        )}
      >
        {isOverdue ? (
          <AlertTriangle className="h-4.5 w-4.5 text-red-500 dark:text-red-400" />
        ) : (
          <Clock className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
        )}
      </div>

      {/* Task info */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium',
            isOverdue
              ? 'text-red-700 dark:text-red-400'
              : 'text-slate-900 dark:text-white',
          )}
        >
          {task.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {task.contactName && <span>{task.contactName}</span>}
          {task.contactName && task.dealName && (
            <span className="text-slate-300 dark:text-slate-600">/</span>
          )}
          {task.dealName && <span>{task.dealName}</span>}
        </div>
      </div>

      {/* Priority + Due date */}
      <div className="flex shrink-0 items-center gap-3">
        <PriorityBadge priority={task.priority} />
        <span
          className={cn(
            'text-xs font-medium',
            isOverdue
              ? 'text-red-500 dark:text-red-400'
              : 'text-slate-500 dark:text-slate-400',
          )}
        >
          {isOverdue ? 'Overdue' : formatRelativeTime(task.dueDate)}
        </span>
      </div>
    </div>
  );
}

// --- Helpers ---

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
