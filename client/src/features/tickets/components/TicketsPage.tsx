import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Ticket,
  MessageSquare,
  ChevronLeft,
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
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const;

const CATEGORY_OPTIONS = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'support', label: 'Support' },
  { value: 'question', label: 'Question' },
  { value: 'other', label: 'Other' },
] as const;

function getStatusIcon(status: string) {
  switch (status) {
    case 'open':
      return <AlertCircle className="w-4 h-4" />;
    case 'in_progress':
      return <Clock className="w-4 h-4" />;
    case 'resolved':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'closed':
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
}

function getCategoryLabel(category: string): string {
  const found = CATEGORY_OPTIONS.find((c) => c.value === category);
  return found ? found.label : category;
}

function formatStatusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function TicketsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketData | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const queryClient = useQueryClient();

  // ── Fetch tickets list ──────────────────────────────────────────────
  const { data, isLoading } = useQuery({
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
  });

  // ── Fetch single ticket detail (with comments) ─────────────────────
  const { data: ticketDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['tickets', selectedTicket?.id],
    queryFn: async () => {
      const { data } = await api.get(`/tickets/${selectedTicket!.id}`);
      return data.data as TicketData;
    },
    enabled: !!selectedTicket?.id,
  });

  // ── Create / Update ticket ─────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (ticket: any) =>
      editingTicket
        ? api.put(`/tickets/${editingTicket.id}`, ticket)
        : api.post('/tickets', ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success(editingTicket ? 'Ticket updated' : 'Ticket created');
      setShowForm(false);
      setEditingTicket(null);
    },
    onError: () => toast.error('Failed to save ticket'),
  });

  // ── Update ticket status inline ────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/tickets/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  // ── Delete ticket ──────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tickets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket deleted');
      if (selectedTicket) setSelectedTicket(null);
    },
    onError: () => toast.error('Failed to delete ticket'),
  });

  // ── Add comment ────────────────────────────────────────────────────
  const commentMutation = useMutation({
    mutationFn: ({ ticketId, content, isInternal }: { ticketId: string; content: string; isInternal: boolean }) =>
      api.post(`/tickets/${ticketId}/comments`, { content, isInternal }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', selectedTicket?.id] });
      toast.success('Comment added');
      setCommentText('');
    },
    onError: () => toast.error('Failed to add comment'),
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
      <div className="space-y-6 animate-fadeIn">
        {/* Back navigation */}
        <button
          onClick={() => setSelectedTicket(null)}
          className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to tickets
        </button>

        {/* Ticket header card */}
        <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-6 animate-fadeInUp">
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
                    <span className="text-[12px] font-mono text-[var(--text-tertiary)]">
                      #{ticket.ticketNumber}
                    </span>
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold', getStatusColor(ticket.status))}>
                      {getStatusIcon(ticket.status)}
                      {formatStatusLabel(ticket.status)}
                    </span>
                    <span className={cn('px-2.5 py-1 rounded-lg text-[11px] font-semibold', getPriorityColor(ticket.priority))}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">{ticket.subject}</h1>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingTicket(ticket);
                      setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
                        deleteMutation.mutate(ticket.id);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-secondary)] hover:text-red-600 hover:border-red-300 dark:hover:border-red-800 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-[13px] text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{getCategoryLabel(ticket.category)}</span>
                </div>
                {ticket.contact && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{ticket.contact.firstName} {ticket.contact.lastName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Created {formatDateTime(ticket.createdAt)}</span>
                </div>
              </div>

              {/* Description */}
              {ticket.description && (
                <div className="mt-5 pt-5 border-t border-[var(--border-color)]">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Description</h3>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>
              )}

              {/* Inline status update */}
              <div className="mt-5 pt-5 border-t border-[var(--border-color)]">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mr-3">Update Status:</label>
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
                        'px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all',
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
        <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl animate-fadeInUp" style={{ animationDelay: '60ms' }}>
          <div className="px-6 py-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[var(--text-secondary)]" />
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                Comments
              </h2>
              <span className="text-[12px] text-[var(--text-tertiary)]">
                ({comments.length})
              </span>
            </div>
          </div>

          {/* Comment thread */}
          <div className="divide-y divide-[var(--border-color)]">
            {isDetailLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="skeleton w-8 h-8 rounded-full" />
                    <div className="skeleton h-4 w-32 rounded-lg" />
                  </div>
                  <div className="skeleton h-12 w-full rounded-xl ml-11" />
                </div>
              ))
            ) : comments.length === 0 ? (
              <div className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-[13px]">No comments yet. Start the conversation below.</p>
              </div>
            ) : (
              comments.map((comment: Comment) => (
                <div
                  key={comment.id}
                  className={cn(
                    'px-6 py-4 hover:bg-[var(--bg-secondary)]/60 transition-colors',
                    comment.isInternal && 'bg-yellow-50/50 dark:bg-yellow-900/10'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0 mt-0.5 shadow-md shadow-indigo-500/20">
                      {comment.author
                        ? `${comment.author.firstName.charAt(0)}${comment.author.lastName.charAt(0)}`
                        : '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                          {comment.author
                            ? `${comment.author.firstName} ${comment.author.lastName}`
                            : 'Unknown'}
                        </span>
                        <span className="text-[11px] text-[var(--text-tertiary)]">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                        {comment.isInternal && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <Lock className="w-3 h-3" />
                            Internal
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add comment form */}
          <div className="px-6 py-4 border-t border-[var(--border-color)]">
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none transition-all"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsInternalComment(!isInternalComment)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all',
                    isInternalComment
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700'
                      : 'bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] border-[var(--border-color)] hover:border-indigo-500'
                  )}
                >
                  {isInternalComment ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Internal Note
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5" />
                      Public Reply
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  disabled={!commentText.trim() || commentMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[13px] font-medium shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {commentMutation.isPending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── List View ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tickets</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            {data?.total || 0} total tickets
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTicket(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-medium shadow-md shadow-indigo-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search tickets by subject or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        >
          <option value="">All Priority</option>
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
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Ticket</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Status</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Priority</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Category</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Created</th>
              <th className="text-right px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border-color)]">
                  <td colSpan={6} className="px-6 py-4">
                    <div className="skeleton h-6 w-full rounded-lg" />
                  </td>
                </tr>
              ))
            ) : data?.tickets?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <Ticket className="w-10 h-10 mx-auto mb-3 text-[var(--text-tertiary)] opacity-40" />
                  <p className="text-[var(--text-tertiary)] text-[13px]">No tickets found</p>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                    {search || statusFilter || priorityFilter
                      ? 'Try adjusting your search or filters'
                      : 'Create your first ticket to get started'}
                  </p>
                </td>
              </tr>
            ) : (
              data?.tickets?.map((ticket: TicketData) => (
                <tr
                  key={ticket.id}
                  className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/60 transition-colors cursor-pointer group"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/10 flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[13px] text-[var(--text-primary)] truncate">{ticket.subject}</p>
                        <p className="text-[11px] text-[var(--text-tertiary)] font-mono mt-0.5">
                          <Hash className="w-3 h-3 inline-block mr-0.5" />
                          {ticket.ticketNumber}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold', getStatusColor(ticket.status))}>
                      {getStatusIcon(ticket.status)}
                      {formatStatusLabel(ticket.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize', getPriorityColor(ticket.priority))}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)]">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{getCategoryLabel(ticket.category)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[var(--text-secondary)]">
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTicket(ticket);
                          setShowForm(true);
                        }}
                        className="p-2 rounded-xl hover:bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this ticket?')) {
                            deleteMutation.mutate(ticket.id);
                          }
                        }}
                        className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-600 transition-colors"
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
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-6 w-full max-w-lg mx-4 animate-fadeInScale shadow-2xl shadow-black/10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              {editingTicket ? 'Edit Ticket' : 'New Ticket'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                  Subject *
                </label>
                <input
                  name="subject"
                  defaultValue={editingTicket?.subject}
                  required
                  placeholder="Brief summary of the issue"
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={editingTicket?.description}
                  placeholder="Detailed description of the ticket..."
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none transition-all"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                    Category
                  </label>
                  <select
                    name="category"
                    defaultValue={editingTicket?.category || 'support'}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                    Priority
                  </label>
                  <select
                    name="priority"
                    defaultValue={editingTicket?.priority || 'medium'}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
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
                    <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={editingTicket.status}
                      className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
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
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
                    Contact ID
                    <span className="text-[var(--text-tertiary)] font-normal ml-1">(optional)</span>
                  </label>
                  <input
                    name="contactId"
                    defaultValue={editingTicket?.contactId}
                    placeholder="Link to a contact"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-medium shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {saveMutation.isPending
                    ? 'Saving...'
                    : editingTicket
                    ? 'Update Ticket'
                    : 'Create Ticket'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTicket(null);
                  }}
                  className="px-6 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
