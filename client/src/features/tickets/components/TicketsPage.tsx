import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Ticket,
  MessageSquare,
  ChevronLeft,
  Download,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  ChevronsUpDown,
  ChevronRight,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Tag,
  User,
  Lock,
  Globe,
  Filter,
  Hash,
} from 'lucide-react';
import api from '@/lib/api';
import { cn, formatDate, formatDateTime, formatRelativeTime, getStatusColor, getPriorityColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface TicketData {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  contactId?: string;
  contact?: { id: string; firstName: string; lastName: string; email: string };
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Deschis' },
  { value: 'in_progress', label: 'În Progres' },
  { value: 'resolved', label: 'Rezolvat' },
  { value: 'closed', label: 'Închis' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Scăzută' },
  { value: 'medium', label: 'Medie' },
  { value: 'high', label: 'Ridicată' },
  { value: 'urgent', label: 'Urgentă' },
] as const;

const CATEGORY_OPTIONS = [
  { value: 'bug', label: 'Eroare' },
  { value: 'feature', label: 'Funcționalitate' },
  { value: 'support', label: 'Suport' },
  { value: 'question', label: 'Întrebare' },
  { value: 'other', label: 'Altul' },
] as const;

function getStatusIcon(status: string) {
  switch (status) {
    case 'open':
      return <AlertCircle className="w-5 h-5" />;
    case 'in_progress':
      return <Clock className="w-5 h-5" />;
    case 'resolved':
      return <CheckCircle2 className="w-5 h-5" />;
    case 'closed':
      return <XCircle className="w-5 h-5" />;
    default:
      return <AlertCircle className="w-5 h-5" />;
  }
}

function getStatusIconColor(status: string) {
  switch (status) {
    case 'open':
      return 'text-amber-500';
    case 'in_progress':
      return 'text-blue-500';
    case 'resolved':
      return 'text-emerald-500';
    case 'closed':
      return 'text-gray-400';
    default:
      return 'text-amber-500';
  }
}

function getStatusDetailColor(status: string) {
  switch (status) {
    case 'open':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40';
    case 'in_progress':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/40';
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40';
    case 'closed':
      return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700/40';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40';
  }
}

function getCategoryLabel(category: string): string {
  const found = CATEGORY_OPTIONS.find((c) => c.value === category);
  return found ? found.label : category;
}

function formatStatusLabel(status: string): string {
  const found = STATUS_OPTIONS.find((s) => s.value === status);
  return found ? found.label : status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatPriorityLabel(priority: string): string {
  const found = PRIORITY_OPTIONS.find((p) => p.value === priority);
  return found ? found.label : priority;
}

export function TicketsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showForm) { setShowForm(false); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);
  const [editingTicket, setEditingTicket] = useState<TicketData | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TicketData | null>(null);

  // ── Sorting & Pagination ──────────────────────────────────────────
  type SortField = 'subject' | 'status' | 'priority' | 'category' | 'createdAt';
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setCurrentPage(1);
  }, [sortField]);

  const queryClient = useQueryClient();

  // ── Fetch tickets list ──────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tickets', search, statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      params.set('limit', '100');
      const { data } = await api.get(`/tickets?${params}`);
      return data.data;
    },
    retry: 2,
  });

  const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  const STATUS_ORDER: Record<string, number> = { open: 0, in_progress: 1, resolved: 2, closed: 3 };

  const sortedTickets = useMemo(() => {
    const tickets = [...(data?.tickets || [])];
    tickets.sort((a: TicketData, b: TicketData) => {
      let cmp = 0;
      switch (sortField) {
        case 'subject': cmp = a.subject.localeCompare(b.subject, 'ro'); break;
        case 'status': cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99); break;
        case 'priority': cmp = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99); break;
        case 'category': cmp = a.category.localeCompare(b.category, 'ro'); break;
        case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return tickets;
  }, [data?.tickets, sortField, sortDir]);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedTickets.slice(start, start + PAGE_SIZE);
  }, [sortedTickets, currentPage]);

  const totalPages = Math.ceil(sortedTickets.length / PAGE_SIZE);

  const handleExportCSV = useCallback(() => {
    const headers = ['Nr. Tichet', 'Subiect', 'Status', 'Prioritate', 'Categorie', 'Data Creării'];
    const rows = sortedTickets.map((t: TicketData) => [
      t.ticketNumber, t.subject, formatStatusLabel(t.status),
      formatPriorityLabel(t.priority), getCategoryLabel(t.category), formatDate(t.createdAt),
    ]);
    const csvContent = [headers, ...rows].map((r: string[]) => r.map((v: string) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tichete_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV descărcat');
  }, [sortedTickets]);

  // ── Fetch single ticket detail (with comments) ─────────────────────
  const { data: ticketDetail, isLoading: isDetailLoading, isError: isDetailError } = useQuery({
    queryKey: ['tickets', selectedTicket?.id],
    queryFn: async () => {
      const { data } = await api.get(`/tickets/${selectedTicket!.id}`);
      return data.data as TicketData;
    },
    enabled: !!selectedTicket?.id,
    retry: 2,
  });

  // ── Create / Update ticket ─────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (ticket: any) =>
      editingTicket
        ? api.put(`/tickets/${editingTicket.id}`, ticket)
        : api.post('/tickets', ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success(editingTicket ? 'Tichet actualizat' : 'Tichet creat');
      setShowForm(false);
      setEditingTicket(null);
    },
    onError: () => toast.error('Nu s-a putut salva tichetul'),
  });

  // ── Update ticket status inline ────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/tickets/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Status actualizat');
    },
    onError: () => toast.error('Nu s-a putut actualiza statusul'),
  });

  // ── Delete ticket ──────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tickets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Tichet șters');
      if (selectedTicket) setSelectedTicket(null);
    },
    onError: () => toast.error('Nu s-a putut șterge tichetul'),
  });

  // ── Add comment ────────────────────────────────────────────────────
  const commentMutation = useMutation({
    mutationFn: ({ ticketId, content, isInternal }: { ticketId: string; content: string; isInternal: boolean }) =>
      api.post(`/tickets/${ticketId}/comments`, { content, isInternal }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', selectedTicket?.id] });
      toast.success('Comentariu adăugat');
      setCommentText('');
    },
    onError: () => toast.error('Nu s-a putut adăuga comentariul'),
  });

  // ── Form submit handler ────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const contactIdVal = fd.get('contactId') as string;
    saveMutation.mutate({
      subject: fd.get('subject'),
      description: fd.get('description'),
      category: fd.get('category') || 'support',
      priority: fd.get('priority') || 'medium',
      status: fd.get('status') || 'open',
      contactId: contactIdVal || undefined,
    });
  };

  // ── Comment submit handler ─────────────────────────────────────────
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTicket) return;
    commentMutation.mutate({
      ticketId: selectedTicket.id,
      content: commentText.trim(),
      isInternal: isInternalComment,
    });
  };

  // ── Detail View ────────────────────────────────────────────────────
  if (selectedTicket) {
    const ticket = ticketDetail || selectedTicket;
    const comments = ticket.comments || [];

    return (
      <div className="space-y-7 animate-fadeIn">
        {/* Back navigation */}
        <button
          onClick={() => setSelectedTicket(null)}
          className="group flex items-center gap-2.5 text-[15px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          Înapoi la tichete
        </button>

        {/* Ticket header card */}
        <div className="relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-7 animate-fadeInUp overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-t-2xl" />
          {isDetailLoading ? (
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4 rounded-xl" />
              <div className="skeleton h-4 w-1/3 rounded-lg" />
              <div className="skeleton h-20 w-full rounded-xl" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[14px] font-mono text-[var(--text-tertiary)]">
                      #{ticket.ticketNumber}
                    </span>
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold border', getStatusDetailColor(ticket.status))}>
                      <span className={getStatusIconColor(ticket.status)}>{getStatusIcon(ticket.status)}</span>
                      {formatStatusLabel(ticket.status)}
                    </span>
                    <span className={cn('px-3 py-1.5 rounded-lg text-[13px] font-semibold', getPriorityColor(ticket.priority))}>
                      {formatPriorityLabel(ticket.priority)}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">{ticket.subject}</h1>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingTicket(ticket);
                      setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:border-[var(--text-tertiary)] transition-all"
                  >
                    <Edit className="w-5 h-5" />
                    Editează
                  </button>
                  <button
                    onClick={() => setDeleteTarget(ticket)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-secondary)] hover:text-red-600 hover:border-red-300 dark:hover:border-red-800 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                    Șterge
                  </button>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-[15px] text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4.5 h-4.5" />
                  <span>{getCategoryLabel(ticket.category)}</span>
                </div>
                {ticket.contact && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-4.5 h-4.5" />
                    <span>{ticket.contact.firstName} {ticket.contact.lastName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4.5 h-4.5" />
                  <span>Creat {formatDateTime(ticket.createdAt)}</span>
                </div>
              </div>

              {/* Description */}
              {ticket.description && (
                <div className="mt-5 pt-5 border-t border-[var(--border-color)]">
                  <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Descriere</h3>
                  <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>
              )}

              {/* Inline status update */}
              <div className="mt-5 pt-5 border-t border-[var(--border-color)]">
                <label className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mr-3">Actualizează Status:</label>
                <div className="inline-flex gap-2 mt-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => {
                        if (s.value !== ticket.status) {
                          statusMutation.mutate({ id: ticket.id, status: s.value });
                          setSelectedTicket({ ...ticket, status: s.value });
                        }
                      }}
                      className={cn(
                        'px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all',
                        ticket.status === s.value
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                          : 'bg-[var(--bg-secondary)]/60 border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-500 hover:text-[var(--text-primary)]'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Comments section */}
        <div className="relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl animate-fadeInUp overflow-hidden" style={{ animationDelay: '60ms' }}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-t-2xl" />
          <div className="px-7 py-5 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[var(--text-secondary)]" />
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
                Comentarii
              </h2>
              <span className="text-[14px] text-[var(--text-tertiary)]">
                ({comments.length})
              </span>
            </div>
          </div>

          {/* Comment thread */}
          <div className="divide-y divide-[var(--border-color)]">
            {isDetailLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-7 py-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="skeleton w-10 h-10 rounded-full" />
                    <div className="skeleton h-4 w-32 rounded-lg" />
                  </div>
                  <div className="skeleton h-12 w-full rounded-xl ml-13" />
                </div>
              ))
            ) : comments.length === 0 ? (
              <div className="px-7 py-14 text-center text-[var(--text-tertiary)]">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 opacity-50" />
                </div>
                <p className="text-[15px] font-medium text-[var(--text-secondary)]">Niciun comentariu încă</p>
                <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">Începe conversația mai jos.</p>
              </div>
            ) : (
              comments.map((comment: Comment, index: number) => (
                <div
                  key={comment.id}
                  className={cn(
                    'px-7 py-5 hover:bg-[var(--bg-secondary)]/40 transition-all duration-300 animate-fadeInUp',
                    comment.isInternal && 'bg-amber-50/30 dark:bg-amber-900/[0.06] border-l-2 border-l-amber-400/40'
                  )}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0 mt-0.5 shadow-md shadow-indigo-500/20 ring-2 ring-white/20">
                      {comment.author
                        ? `${comment.author.firstName.charAt(0)}${comment.author.lastName.charAt(0)}`
                        : '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[15px] font-semibold text-[var(--text-primary)]">
                          {comment.author
                            ? `${comment.author.firstName} ${comment.author.lastName}`
                            : 'Necunoscut'}
                        </span>
                        <span className="text-[13px] text-[var(--text-tertiary)]">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                        {comment.isInternal && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[12px] font-semibold bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/30">
                            <Lock className="w-3.5 h-3.5" />
                            Intern
                          </span>
                        )}
                      </div>
                      <div className={cn(
                        'text-[15px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap rounded-xl px-4 py-3',
                        comment.isInternal
                          ? 'bg-amber-50/50 dark:bg-amber-900/[0.08] border border-amber-100/60 dark:border-amber-900/20'
                          : 'bg-[var(--bg-secondary)]/30'
                      )}>
                        {comment.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add comment form */}
          <div className="px-7 py-5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/20">
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Adaugă un comentariu..."
                rows={3}
                className="w-full px-5 py-3.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 resize-none transition-all"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsInternalComment(!isInternalComment)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all',
                    isInternalComment
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40 shadow-sm'
                      : 'bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] border-[var(--border-color)] hover:border-indigo-500'
                  )}
                >
                  {isInternalComment ? (
                    <>
                      <Lock className="w-4.5 h-4.5" />
                      Notă Internă
                    </>
                  ) : (
                    <>
                      <Globe className="w-4.5 h-4.5" />
                      Răspuns Public
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  disabled={!commentText.trim() || commentMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {commentMutation.isPending ? 'Se trimite...' : 'Trimite'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <ConfirmDialog
          open={!!deleteTarget}
          title="Șterge tichet"
          description={`Ești sigur că vrei să ștergi tichetul "${deleteTarget?.subject}"? Această acțiune nu poate fi anulată.`}
          confirmLabel="Șterge"
          cancelLabel="Anulează"
          variant="danger"
          onConfirm={() => {
            if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    );
  }

  // ── List View ──────────────────────────────────────────────────────
  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">{data?.total || 0}</span> tichete în total
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={!sortedTickets.length}
            className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all disabled:opacity-40"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setEditingTicket(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" /> Tichet Nou
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Caută tichete după subiect sau număr..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-5 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
        >
          <option value="">Toate Statusurile</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-5 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
        >
          <option value="">Toate Prioritățile</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tickets Table */}
      <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              {([['subject', 'Tichet'], ['status', 'Status'], ['priority', 'Prioritate'], ['category', 'Categorie'], ['createdAt', 'Creat']] as [SortField, string][]).map(([field, label]) => (
                <th key={field} className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  <button onClick={() => toggleSort(field)} className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors">
                    {label}
                    {sortField === field ? (sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />) : <ChevronsUpDown className="w-4 h-4 opacity-40" />}
                  </button>
                </th>
              ))}
              <th className="text-right px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border-color)]">
                  <td colSpan={6} className="px-6 py-5">
                    <div className="skeleton h-7 w-full rounded-lg" />
                  </td>
                </tr>
              ))
            ) : sortedTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
                      <Ticket className="w-7 h-7 text-[var(--text-tertiary)] opacity-50" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-[var(--text-secondary)]">Niciun tichet găsit</p>
                      <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
                        {search || statusFilter || priorityFilter
                          ? 'Încearcă să ajustezi căutarea sau filtrele'
                          : 'Creează primul tichet pentru a începe'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTickets.map((ticket: TicketData, index: number) => (
                <tr
                  key={ticket.id}
                  className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/60 transition-all duration-200 cursor-pointer group animate-fadeInUp"
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                        'bg-indigo-600/10 group-hover:bg-indigo-600/15'
                      )}>
                        <Ticket className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[15px] text-[var(--text-primary)] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{ticket.subject}</p>
                        <p className="text-[13px] text-[var(--text-tertiary)] font-mono mt-0.5">
                          <Hash className="w-3.5 h-3.5 inline-block mr-0.5" />
                          {ticket.ticketNumber}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold', getStatusColor(ticket.status))}>
                      <span className={getStatusIconColor(ticket.status)}>{getStatusIcon(ticket.status)}</span>
                      {formatStatusLabel(ticket.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className={cn('px-3 py-1.5 rounded-lg text-[13px] font-semibold capitalize', getPriorityColor(ticket.priority))}>
                      {formatPriorityLabel(ticket.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-1.5 text-[15px] text-[var(--text-secondary)]">
                      <Tag className="w-4.5 h-4.5" />
                      <span>{getCategoryLabel(ticket.category)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-[15px] text-[var(--text-secondary)]">
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTicket(ticket);
                          setShowForm(true);
                        }}
                        className="p-2.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-indigo-600 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(ticket);
                        }}
                        className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-600 transition-colors"
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
            <p className="text-[13px] text-[var(--text-tertiary)]">
              Se afișează {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, sortedTickets.length)} din {sortedTickets.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                    className={cn('w-9 h-9 text-[14px] font-medium rounded-xl transition-colors',
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    )}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Șterge tichet"
        description={`Ești sigur că vrei să ștergi tichetul "${deleteTarget?.subject}"? Această acțiune nu poate fi anulată.`}
        confirmLabel="Șterge"
        cancelLabel="Anulează"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-7 w-full max-w-lg mx-4 animate-fadeInScale shadow-2xl shadow-black/10 max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-t-2xl" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              {editingTicket ? 'Editează Tichet' : 'Tichet Nou'}
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] mb-5">
              {editingTicket ? `Editare tichet #${editingTicket.ticketNumber}` : 'Completează detaliile pentru a crea un tichet nou'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Subject */}
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                  Subiect *
                </label>
                <input
                  name="subject"
                  defaultValue={editingTicket?.subject}
                  required
                  placeholder="Rezumat scurt al problemei"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                  Descriere
                </label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={editingTicket?.description}
                  placeholder="Descriere detaliată a tichetului..."
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 resize-none transition-all"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                    Categorie
                  </label>
                  <select
                    name="category"
                    defaultValue={editingTicket?.category || 'support'}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                    Prioritate
                  </label>
                  <select
                    name="priority"
                    defaultValue={editingTicket?.priority || 'medium'}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status (only when editing) & Contact ID */}
              <div className="grid grid-cols-2 gap-4">
                {editingTicket && (
                  <div>
                    <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={editingTicket.status}
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={editingTicket ? '' : 'col-span-2'}>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                    ID Contact
                    <span className="text-[var(--text-tertiary)] font-normal ml-1 normal-case tracking-normal">(opțional)</span>
                  </label>
                  <input
                    name="contactId"
                    defaultValue={editingTicket?.contactId}
                    placeholder="Asociază cu un contact"
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                >
                  {saveMutation.isPending
                    ? 'Se salvează...'
                    : editingTicket
                    ? 'Actualizează Tichet'
                    : 'Creează Tichet'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTicket(null);
                  }}
                  className="px-7 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-[15px] font-semibold hover:bg-[var(--bg-secondary)] transition-all"
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
