import {
  UserPlus,
  Handshake,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  MessageSquare,
  DollarSign,
  Edit3,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';

export interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  userName?: string;
  userAvatar?: string;
  createdAt: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

const activityIconMap: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  contact_created: {
    icon: UserPlus,
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
  },
  deal_created: {
    icon: Handshake,
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
  },
  deal_won: {
    icon: DollarSign,
    color: 'text-green-500 dark:text-green-400',
    bg: 'bg-green-500/10 dark:bg-green-500/15',
  },
  deal_lost: {
    icon: Trash2,
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-500/10 dark:bg-red-500/15',
  },
  email_sent: {
    icon: Mail,
    color: 'text-violet-500 dark:text-violet-400',
    bg: 'bg-violet-500/10 dark:bg-violet-500/15',
  },
  call_logged: {
    icon: Phone,
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
  },
  note_added: {
    icon: Edit3,
    color: 'text-cyan-500 dark:text-cyan-400',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
  },
  task_completed: {
    icon: CheckCircle2,
    color: 'text-green-500 dark:text-green-400',
    bg: 'bg-green-500/10 dark:bg-green-500/15',
  },
  invoice_created: {
    icon: FileText,
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-500/10 dark:bg-orange-500/15',
  },
  comment_added: {
    icon: MessageSquare,
    color: 'text-pink-500 dark:text-pink-400',
    bg: 'bg-pink-500/10 dark:bg-pink-500/15',
  },
};

const defaultActivityIcon = {
  icon: FileText,
  color: 'text-[var(--text-secondary)]',
  bg: 'bg-[var(--bg-tertiary)]',
};

function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function ActivityFeed({ activities, maxItems }: ActivityFeedProps) {
  const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

  if (displayActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-tertiary)]">
          <FileText className="h-6 w-6 text-[var(--text-tertiary)]" />
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          No recent activity
        </p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-4">
        {displayActivities.map((activity, index) => {
          const isLast = index === displayActivities.length - 1;
          const { icon: ActivityIcon, color, bg } =
            activityIconMap[activity.type] || defaultActivityIcon;

          return (
            <li key={activity.id} className="relative pb-4">
              {/* Timeline connector line with gradient fade */}
              {!isLast && (
                <span
                  className="absolute left-5 top-11 -ml-px h-[calc(100%-1.5rem)] w-0.5"
                  aria-hidden="true"
                  style={{
                    background: 'linear-gradient(to bottom, var(--border-color) 0%, var(--border-color) 70%, transparent 100%)',
                  }}
                />
              )}

              <div
                className={cn(
                  'relative flex items-start gap-4 rounded-xl px-2 py-1.5 -mx-2',
                  'transition-all duration-200 ease-spring',
                  'hover:bg-[var(--bg-secondary)]/50',
                )}
              >
                {/* Activity icon */}
                <div
                  className={cn(
                    'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    bg,
                    'ring-4 ring-[var(--bg-primary)]',
                    'transition-transform duration-200',
                  )}
                >
                  <ActivityIcon className={cn('h-4.5 w-4.5', color)} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {activity.title}
                    </p>
                    <time className="shrink-0 text-xs text-[var(--text-tertiary)]">
                      {formatRelativeTime(activity.createdAt)}
                    </time>
                  </div>

                  {activity.description && (
                    <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                      {activity.description}
                    </p>
                  )}

                  {/* User attribution */}
                  {activity.userName && (
                    <div className="mt-2 flex items-center gap-2">
                      {activity.userAvatar ? (
                        <img
                          src={activity.userAvatar}
                          alt={activity.userName}
                          className="h-5 w-5 rounded-full object-cover ring-1 ring-[var(--border-color)]"
                        />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[var(--text-tertiary)] to-[var(--text-secondary)]">
                          <span className="text-[9px] font-semibold text-white">
                            {getInitialsFromName(activity.userName)}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {activity.userName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
