import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  Plus,
  Search,
  Send,
  Trash2,
  Eye,
  MousePointerClick,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  X,
  BarChart3,
  FileText,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Inbox,
} from 'lucide-react';
import api from '@/lib/api';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Email {
  id: string;
  to: string;
  subject: string;
  body: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sentAt: string;
  openedAt?: string;
  clickedAt?: string;
  contactId?: string;
  templateId?: string;
  contactName?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMAIL_STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'opened', label: 'Opened' },
  { value: 'clicked', label: 'Clicked' },
  { value: 'bounced', label: 'Bounced' },
  { value: 'failed', label: 'Failed' },
] as const;

function getEmailStatusColor(status: string): string {
  const colors: Record<string, string> = {
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    delivered: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    opened: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    clicked: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    bounced: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
}

function getEmailStatusIcon(status: string) {
  switch (status) {
    case 'sent':
      return <Send className="w-3.5 h-3.5" />;
    case 'delivered':
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    case 'opened':
      return <Eye className="w-3.5 h-3.5" />;
    case 'clicked':
      return <MousePointerClick className="w-3.5 h-3.5" />;
    case 'bounced':
      return <AlertTriangle className="w-3.5 h-3.5" />;
    case 'failed':
      return <X className="w-3.5 h-3.5" />;
    default:
      return <Clock className="w-3.5 h-3.5" />;
  }
}

// ---------------------------------------------------------------------------
// Skeleton Components
// ---------------------------------------------------------------------------

function StatCardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton h-8 w-8 rounded-lg" />
      </div>
      <div className="skeleton h-8 w-16 rounded mb-1" />
      <div className="skeleton h-3 w-28 rounded" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-[var(--border-color)]">
      <td className="px-6 py-4">
        <div className="skeleton h-5 w-40 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-5 w-56 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-6 w-20 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-5 w-24 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-5 w-16 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-5 w-8 rounded" />
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  subtitle,
  icon,
  iconBg,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 transition-all hover:border-primary-500/30">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBg)}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      {subtitle && (
        <p className="text-xs text-[var(--text-tertiary)] mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compose Modal
// ---------------------------------------------------------------------------

function ComposeModal({
  onClose,
  onSend,
  isSending,
  templates,
}: {
  onClose: () => void;
  onSend: (data: { to: string; subject: string; body: string; contactId?: string; templateId?: string }) => void;
  isSending: boolean;
  templates: EmailTemplate[];
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setSubject(template.subject);
        setBody(template.body);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSend({
      to: formData.get('to') as string,
      subject,
      body,
      contactId: (formData.get('contactId') as string) || undefined,
      templateId: selectedTemplateId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl mx-4 animate-fadeIn shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-primary-600" />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Compose Email</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Template Selector */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Template
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-primary-500 appearance-none transition-colors"
                >
                  <option value="">No template (compose from scratch)</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
              </div>
            </div>
          )}

          {/* To & Contact ID */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                To *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  name="to"
                  type="email"
                  required
                  placeholder="recipient@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Contact ID
              </label>
              <input
                name="contactId"
                type="text"
                placeholder="Optional"
                className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Subject *
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Email subject line"
              className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Body *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={8}
              placeholder="Write your email content here..."
              className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 flex-1 justify-center py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Email Detail View
// ---------------------------------------------------------------------------

function EmailDetailView({
  email,
  onBack,
  onDelete,
  isDeleting,
}: {
  email: Email;
  onBack: () => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Detail Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-[var(--text-primary)] truncate">
            {email.subject}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            To: {email.to}
            {email.contactName && (
              <span className="text-[var(--text-tertiary)]"> ({email.contactName})</span>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this email?')) {
              onDelete(email.id);
            }
          }}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Status & Tracking Banner */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Status:</span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                getEmailStatusColor(email.status)
              )}
            >
              {getEmailStatusIcon(email.status)}
              {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Sent:</span>
            <span className="text-sm text-[var(--text-primary)]">
              {formatDateTime(email.sentAt)}
            </span>
          </div>
          {email.openedAt && (
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-sm text-[var(--text-secondary)]">
                Opened {formatDateTime(email.openedAt)}
              </span>
            </div>
          )}
          {email.clickedAt && (
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-[var(--text-secondary)]">
                Clicked {formatDateTime(email.clickedAt)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Email Body */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Email Content</h3>
        </div>
        <div className="px-6 py-5">
          <div className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap break-words">
            {email.body}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function EmailsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [page, setPage] = useState(1);
  const limit = 25;
  const queryClient = useQueryClient();

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // ---- Fetch emails -------------------------------------------------------

  const { data: emailsData, isLoading } = useQuery({
    queryKey: ['emails', search, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', String(limit));
      params.set('offset', String((page - 1) * limit));
      const { data } = await api.get(`/emails?${params}`);
      return data.data as { emails: Email[]; total: number };
    },
  });

  // ---- Fetch templates ----------------------------------------------------

  const { data: templatesData } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data } = await api.get('/emails/templates');
      return data.data as EmailTemplate[];
    },
  });

  const templates: EmailTemplate[] = templatesData ?? [];

  // ---- Computed stats -----------------------------------------------------

  const stats = useMemo(() => {
    const emails = emailsData?.emails ?? [];
    const total = emailsData?.total ?? 0;
    const opened = emails.filter((e) => e.status === 'opened' || e.status === 'clicked').length;
    const clicked = emails.filter((e) => e.status === 'clicked').length;
    const bounced = emails.filter((e) => e.status === 'bounced' || e.status === 'failed').length;
    const visibleCount = emails.length || 1; // avoid division by zero
    return {
      total,
      openedRate: Math.round((opened / visibleCount) * 100),
      clickRate: Math.round((clicked / visibleCount) * 100),
      bounceRate: Math.round((bounced / visibleCount) * 100),
    };
  }, [emailsData]);

  // ---- Send mutation ------------------------------------------------------

  const sendMutation = useMutation({
    mutationFn: (payload: {
      to: string;
      subject: string;
      body: string;
      contactId?: string;
      templateId?: string;
    }) => api.post('/emails/send', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success('Email sent successfully');
      setShowCompose(false);
    },
    onError: () => {
      toast.error('Failed to send email');
    },
  });

  // ---- Delete mutation ----------------------------------------------------

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/emails/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success('Email deleted');
      setSelectedEmail(null);
    },
    onError: () => {
      toast.error('Failed to delete email');
    },
  });

  // ---- Pagination ---------------------------------------------------------

  const totalPages = Math.ceil((emailsData?.total ?? 0) / limit);

  // ---- Detail view --------------------------------------------------------

  if (selectedEmail) {
    return (
      <EmailDetailView
        email={selectedEmail}
        onBack={() => setSelectedEmail(null)}
        onDelete={(id) => deleteMutation.mutate(id)}
        isDeleting={deleteMutation.isPending}
      />
    );
  }

  // ---- Main list view -----------------------------------------------------

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Emails</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {emailsData?.total ?? 0} total emails
          </p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Compose
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Sent"
              value={stats.total.toLocaleString()}
              subtitle="Emails in this view"
              icon={<Send className="w-4 h-4 text-blue-600" />}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
            />
            <StatCard
              label="Open Rate"
              value={`${stats.openedRate}%`}
              subtitle="Opened or clicked"
              icon={<Eye className="w-4 h-4 text-green-600" />}
              iconBg="bg-green-100 dark:bg-green-900/30"
            />
            <StatCard
              label="Click Rate"
              value={`${stats.clickRate}%`}
              subtitle="Links clicked"
              icon={<MousePointerClick className="w-4 h-4 text-purple-600" />}
              iconBg="bg-purple-100 dark:bg-purple-900/30"
            />
            <StatCard
              label="Bounce Rate"
              value={`${stats.bounceRate}%`}
              subtitle="Bounced or failed"
              icon={<AlertTriangle className="w-4 h-4 text-orange-600" />}
              iconBg="bg-orange-100 dark:bg-orange-900/30"
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search by subject or recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 pr-10 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-primary-500 appearance-none transition-colors"
          >
            {EMAIL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
        </div>
      </div>

      {/* Email Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]">
                Recipient
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]">
                Subject
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]">
                Sent
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]">
                Tracking
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)
            ) : !emailsData?.emails?.length ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                      <Inbox className="w-6 h-6 text-[var(--text-tertiary)]" />
                    </div>
                    <div>
                      <p className="text-[var(--text-secondary)] font-medium">No emails found</p>
                      <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        {search || statusFilter
                          ? 'Try adjusting your search or filters'
                          : 'Send your first email to get started'}
                      </p>
                    </div>
                    {!search && !statusFilter && (
                      <button
                        onClick={() => setShowCompose(true)}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Compose Email
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              emailsData.emails.map((email) => (
                <tr
                  key={email.id}
                  className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group"
                  onClick={() => setSelectedEmail(email)}
                >
                  {/* Recipient */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-600/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {email.to}
                        </p>
                        {email.contactName && (
                          <p className="text-xs text-[var(--text-tertiary)] truncate">
                            {email.contactName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-[var(--text-primary)] truncate max-w-xs">
                      {email.subject}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                        getEmailStatusColor(email.status)
                      )}
                    >
                      {getEmailStatusIcon(email.status)}
                      {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                    </span>
                  </td>

                  {/* Sent Date */}
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {formatDate(email.sentAt)}
                  </td>

                  {/* Tracking */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {email.openedAt ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Eye className="w-3.5 h-3.5" />
                          Opened
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--text-tertiary)]">Not opened</span>
                      )}
                      {email.clickedAt && (
                        <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                          <MousePointerClick className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setSelectedEmail(email)}
                        className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
                        title="View email"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this email?')) {
                            deleteMutation.mutate(email.id);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-600 transition-colors"
                        title="Delete email"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-color)]">
            <p className="text-sm text-[var(--text-tertiary)]">
              Showing {((page - 1) * limit) + 1}
              {' '}-{' '}
              {Math.min(page * limit, emailsData?.total ?? 0)} of{' '}
              {emailsData?.total ?? 0} emails
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      'w-8 h-8 text-sm font-medium rounded-lg transition-colors',
                      page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSend={(data) => sendMutation.mutate(data)}
          isSending={sendMutation.isPending}
          templates={templates}
        />
      )}
    </div>
  );
}
