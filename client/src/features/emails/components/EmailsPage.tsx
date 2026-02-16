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

const STATUS_LABEL_MAP: Record<string, string> = {
  sent: 'trimis',
  delivered: 'livrat',
  opened: 'deschis',
  clicked: 'accesat',
  bounced: 'respins',
  failed: 'eșuat',
};

const EMAIL_STATUSES = [
  { value: '', label: 'Toate Statusurile' },
  { value: 'sent', label: 'Trimis' },
  { value: 'delivered', label: 'Livrat' },
  { value: 'opened', label: 'Deschis' },
  { value: 'clicked', label: 'Accesat' },
  { value: 'bounced', label: 'Respins' },
  { value: 'failed', label: 'Eșuat' },
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
      return <Send className="w-4 h-4" />;
    case 'delivered':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'opened':
      return <Eye className="w-4 h-4" />;
    case 'clicked':
      return <MousePointerClick className="w-4 h-4" />;
    case 'bounced':
      return <AlertTriangle className="w-4 h-4" />;
    case 'failed':
      return <X className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getStatusLabel(status: string): string {
  return STATUS_LABEL_MAP[status] || status;
}

// ---------------------------------------------------------------------------
// Skeleton Components
// ---------------------------------------------------------------------------

function StatCardSkeleton() {
  return (
    <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton h-5 w-24 rounded" />
        <div className="skeleton h-12 w-12 rounded-xl" />
      </div>
      <div className="skeleton h-9 w-20 rounded mb-1" />
      <div className="skeleton h-4 w-32 rounded" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-[var(--border-color)]">
      <td className="px-6 py-4">
        <div className="skeleton h-6 w-44 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-6 w-60 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-7 w-24 rounded-lg" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-6 w-28 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-6 w-20 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-6 w-10 rounded" />
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
  accentColor = 'indigo',
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  accentColor?: string;
}) {
  return (
    <div className="relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 overflow-hidden group">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-500/[0.02] group-hover:to-indigo-500/[0.05] transition-all duration-500 rounded-2xl" />
      {/* Top accent line */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        accentColor === 'blue' && 'bg-gradient-to-r from-transparent via-blue-500/50 to-transparent',
        accentColor === 'green' && 'bg-gradient-to-r from-transparent via-green-500/50 to-transparent',
        accentColor === 'purple' && 'bg-gradient-to-r from-transparent via-purple-500/50 to-transparent',
        accentColor === 'orange' && 'bg-gradient-to-r from-transparent via-orange-500/50 to-transparent',
        accentColor === 'indigo' && 'bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent',
      )} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-medium text-[var(--text-secondary)]">{label}</span>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBg)}>
            {icon}
          </div>
        </div>
        <p className="text-[28px] font-bold text-[var(--text-primary)] truncate">{value}</p>
        {subtitle && (
          <p className="text-[13px] text-[var(--text-tertiary)] mt-1 truncate">{subtitle}</p>
        )}
      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl w-full max-w-2xl mx-4 animate-fadeInScale shadow-2xl shadow-black/10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-t-2xl" />
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Compune Email</h2>
              <p className="text-[13px] text-[var(--text-tertiary)]">Creează și trimite un email nou</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Template Selector */}
          {templates.length > 0 && (
            <div>
              <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                Șablon
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 appearance-none transition-all"
                >
                  <option value="">Selectează un șablon...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" />
              </div>
            </div>
          )}

          {/* To & Contact ID */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                Către *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <input
                  name="to"
                  type="email"
                  required
                  placeholder="destinatar@exemplu.com"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                ID Contact
              </label>
              <input
                name="contactId"
                type="text"
                placeholder="Opțional"
                className="w-full px-3.5 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
              Subiect *
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Subiect email"
              className="w-full px-3.5 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
              Conținut *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={8}
              placeholder="Scrie conținutul email-ului aici..."
              className="w-full px-3.5 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 flex-1 justify-center py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Se trimite...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Trimite Email
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-[15px] font-semibold hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Anulează
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
          className="group p-2 rounded-xl hover:bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] transition-colors"
        >
          <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] truncate">
            {email.subject}
          </h2>
          <p className="text-[15px] text-[var(--text-secondary)] mt-0.5">
            Către: {email.to}
            {email.contactName && (
              <span className="text-[var(--text-tertiary)]"> ({email.contactName})</span>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Ești sigur că vrei să ștergi acest email?')) {
              onDelete(email.id);
            }
          }}
          disabled={isDeleting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-800/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 text-[15px] font-medium"
        >
          <Trash2 className="w-5 h-5" />
          Șterge
        </button>
      </div>

      {/* Status & Tracking Banner */}
      <div className="relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-t-2xl" />
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-medium text-[var(--text-secondary)]">Status:</span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold',
                getEmailStatusColor(email.status)
              )}
            >
              {getEmailStatusIcon(email.status)}
              {getStatusLabel(email.status).charAt(0).toUpperCase() + getStatusLabel(email.status).slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-medium text-[var(--text-secondary)]">Trimis:</span>
            <span className="text-[15px] text-[var(--text-primary)]">
              {formatDateTime(email.sentAt)}
            </span>
          </div>
          {email.openedAt && (
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-500" />
              <span className="text-[15px] text-[var(--text-secondary)]">
                Deschis {formatDateTime(email.openedAt)}
              </span>
            </div>
          )}
          {email.clickedAt && (
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-5 h-5 text-purple-500" />
              <span className="text-[15px] text-[var(--text-secondary)]">
                Accesat {formatDateTime(email.clickedAt)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Email Body */}
      <div className="relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-t-2xl" />
        <div className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Conținut Email</h3>
        </div>
        <div className="px-6 py-5">
          <div className="text-[15px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap break-words">
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

  const { data: emailsData, isLoading, isError } = useQuery({
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
    retry: 2,
  });

  // ---- Fetch templates ----------------------------------------------------

  const { data: templatesData, isError: isTemplatesError } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data } = await api.get('/emails/templates');
      return data.data as EmailTemplate[];
    },
    retry: 2,
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
      toast.success('Email trimis cu succes');
      setShowCompose(false);
    },
    onError: () => {
      toast.error('Nu s-a putut trimite email-ul');
    },
  });

  // ---- Delete mutation ----------------------------------------------------

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/emails/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success('Email șters');
      setSelectedEmail(null);
    },
    onError: () => {
      toast.error('Nu s-a putut șterge email-ul');
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
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">Email-uri</h1>
          <p className="text-[15px] text-[var(--text-secondary)] mt-0.5">
            {emailsData?.total ?? 0} email-uri în total
          </p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Compune
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Trimise"
              value={stats.total.toLocaleString()}
              subtitle="Email-uri în această vizualizare"
              icon={<Send className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              accentColor="blue"
            />
            <StatCard
              label="Rată Deschidere"
              value={`${stats.openedRate}%`}
              subtitle="Deschise sau click-uite"
              icon={<Eye className="w-5 h-5 text-green-600" />}
              iconBg="bg-green-100 dark:bg-green-900/30"
              accentColor="green"
            />
            <StatCard
              label="Rată Click"
              value={`${stats.clickRate}%`}
              subtitle="Link-uri accesate"
              icon={<MousePointerClick className="w-5 h-5 text-purple-600" />}
              iconBg="bg-purple-100 dark:bg-purple-900/30"
              accentColor="purple"
            />
            <StatCard
              label="Rată Respingere"
              value={`${stats.bounceRate}%`}
              subtitle="Respinse sau eșuate"
              icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
              iconBg="bg-orange-100 dark:bg-orange-900/30"
              accentColor="orange"
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Caută după subiect sau destinatar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-5 py-3 pr-10 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 appearance-none transition-all"
          >
            {EMAIL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" />
        </div>
      </div>

      {/* Email Table */}
      <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left px-6 py-4 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                Destinatar
              </th>
              <th className="text-left px-6 py-4 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                Subiect
              </th>
              <th className="text-left px-6 py-4 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                Trimis
              </th>
              <th className="text-left px-6 py-4 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                Urmărire
              </th>
              <th className="text-right px-6 py-4 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                Acțiuni
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
                    <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
                      <Inbox className="w-7 h-7 text-[var(--text-tertiary)] opacity-50" />
                    </div>
                    <div>
                      <p className="text-[15px] text-[var(--text-secondary)] font-medium">Niciun email găsit</p>
                      <p className="text-[14px] text-[var(--text-tertiary)] mt-0.5">
                        {search || statusFilter
                          ? 'Încearcă să ajustezi căutarea'
                          : 'Trimite primul email'}
                      </p>
                    </div>
                    {!search && !statusFilter && (
                      <button
                        onClick={() => setShowCompose(true)}
                        className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        Compune Email
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              emailsData.emails.map((email, index) => (
                <tr
                  key={email.id}
                  className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/60 transition-all duration-200 cursor-pointer group animate-fadeInUp"
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={() => setSelectedEmail(email)}
                >
                  {/* Recipient */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/15 transition-colors">
                        <Mail className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium text-[var(--text-primary)] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {email.to}
                        </p>
                        {email.contactName && (
                          <p className="text-[13px] text-[var(--text-tertiary)] truncate">
                            {email.contactName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="px-6 py-4">
                    <p className="text-[15px] text-[var(--text-primary)] truncate max-w-xs">
                      {email.subject}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold',
                        getEmailStatusColor(email.status)
                      )}
                    >
                      {getEmailStatusIcon(email.status)}
                      {getStatusLabel(email.status).charAt(0).toUpperCase() + getStatusLabel(email.status).slice(1)}
                    </span>
                  </td>

                  {/* Sent Date */}
                  <td className="px-6 py-4 text-[14px] text-[var(--text-secondary)]">
                    {formatDate(email.sentAt)}
                  </td>

                  {/* Tracking */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {email.openedAt ? (
                        <span className="flex items-center gap-1 text-[13px] font-medium text-green-600 dark:text-green-400">
                          <Eye className="w-4 h-4" />
                          Deschis
                        </span>
                      ) : (
                        <span className="text-[13px] text-[var(--text-tertiary)]">Nedeschis</span>
                      )}
                      {email.clickedAt && (
                        <span className="flex items-center gap-1 text-[13px] font-medium text-purple-600 dark:text-purple-400">
                          <MousePointerClick className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setSelectedEmail(email)}
                        className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-indigo-500 transition-colors"
                        title="Vizualizează email"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Ești sigur că vrei să ștergi acest email?')) {
                            deleteMutation.mutate(email.id);
                          }
                        }}
                        className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-600 transition-colors"
                        title="Șterge email"
                      >
                        <Trash2 className="w-5 h-5" />
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
            <p className="text-[14px] text-[var(--text-tertiary)]">
              Se afișează {((page - 1) * limit) + 1}
              {' '}-{' '}
              {Math.min(page * limit, emailsData?.total ?? 0)} din{' '}
              {emailsData?.total ?? 0} email-uri
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-[14px] font-medium rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
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
                      'w-9 h-9 text-[14px] font-medium rounded-xl transition-colors',
                      page === pageNum
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-[14px] font-medium rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Următor
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
