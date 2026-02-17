import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, Circle, Clock, AlertTriangle, Filter, Search, Trash2, Edit, ClipboardList, X, Download, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { cn, formatDate, getPriorityColor, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const PRIORITY_DOTS: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-400',
  normal: 'bg-blue-400',
  high: 'bg-orange-400',
  urgent: 'bg-red-500',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'scăzută',
  medium: 'medie',
  normal: 'medie',
  high: 'ridicată',
  urgent: 'urgentă',
};

const TYPE_LABELS: Record<string, string> = {
  task: 'sarcină',
  call: 'apel',
  email: 'email',
  meeting: 'întâlnire',
  follow_up: 'urmărire',
};

export function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const queryClient = useQueryClient();

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showForm) {
        setShowForm(false);
        setEditingTask(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '100');
      const { data } = await api.get(`/tasks?${params}`);
      return data.data;
    },
    retry: 2,
  });

  // ── Sorting & Pagination
  type SortField = 'title' | 'priority' | 'status' | 'type' | 'dueDate';
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
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

  const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, normal: 2, low: 3 };
  const STATUS_ORDER: Record<string, number> = { pending: 0, in_progress: 1, completed: 2, cancelled: 3 };

  const sortedTasks = useMemo(() => {
    const tasks = [...(data?.tasks || [])];
    tasks.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortField) {
        case 'title': cmp = (a.title || '').localeCompare(b.title || '', 'ro'); break;
        case 'priority': cmp = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99); break;
        case 'status': cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99); break;
        case 'type': cmp = (a.type || '').localeCompare(b.type || '', 'ro'); break;
        case 'dueDate': {
          const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          cmp = da - db;
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return tasks;
  }, [data?.tasks, sortField, sortDir]);

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedTasks.slice(start, start + PAGE_SIZE);
  }, [sortedTasks, currentPage]);

  const totalPages = Math.ceil(sortedTasks.length / PAGE_SIZE);

  const handleExportCSV = useCallback(() => {
    const headers = ['Titlu', 'Prioritate', 'Status', 'Tip', 'Data Scadenței'];
    const rows = sortedTasks.map((t: any) => [
      t.title,
      PRIORITY_LABELS[t.priority] || t.priority,
      t.status === 'pending' ? 'În așteptare' : t.status === 'in_progress' ? 'În progres' : t.status === 'completed' ? 'Finalizat' : 'Anulat',
      TYPE_LABELS[t.type] || t.type,
      t.dueDate ? formatDate(t.dueDate) : '',
    ]);
    const csvContent = [headers, ...rows].map((r: string[]) => r.map((v: string) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sarcini_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV descărcat');
  }, [sortedTasks]);

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/tasks/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Sarcină finalizată!');
      setTimeout(() => setCompletingId(null), 600);
    },
    onError: () => toast.error('Nu s-a putut finaliza sarcina'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Sarcină ștearsă');
    },
    onError: () => toast.error('Nu s-a putut șterge sarcina'),
  });

  const createMutation = useMutation({
    mutationFn: (task: any) => editingTask ? api.put(`/tasks/${editingTask.id}`, task) : api.post('/tasks', task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(editingTask ? 'Sarcină actualizată' : 'Sarcină creată');
      setShowForm(false); setEditingTask(null);
    },
    onError: () => toast.error('Nu s-a putut salva sarcina'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      title: fd.get('title'), description: fd.get('description'),
      type: fd.get('type') || 'task', priority: fd.get('priority') || 'medium',
      dueDate: fd.get('dueDate') || undefined,
    });
  };

  const handleComplete = (task: any) => {
    if (task.status === 'completed') return;
    setCompletingId(task.id);
    completeMutation.mutate(task.id);
  };

  const isOverdue = (task: any) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  const getTaskIcon = (task: any) => {
    const isCompleting = completingId === task.id;

    if (task.status === 'completed' || isCompleting) {
      return (
        <div className={cn('relative', isCompleting && 'animate-checkBounce')}>
          <CheckCircle2 className={cn(
            'w-6 h-6 text-green-500 transition-all duration-300',
            isCompleting && 'animate-checkRipple'
          )} />
          {isCompleting && (
            <div className="absolute inset-0 rounded-full animate-checkRipple" />
          )}
        </div>
      );
    }
    if (task.status === 'in_progress') return <Clock className="w-6 h-6 text-blue-500" />;
    return <Circle className="w-6 h-6 text-[var(--text-tertiary)] group-hover/check:text-primary-400 transition-colors duration-200" />;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[14px] text-[var(--text-secondary)]">
          Se afișează <span className="font-semibold text-[var(--text-primary)]">{paginatedTasks.length}</span> din {sortedTasks.length} sarcini
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={!sortedTasks.length}
            className="flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[14px] md:text-[15px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all disabled:opacity-40"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button onClick={() => { setEditingTask(null); setShowForm(true); }}
            className="group flex items-center gap-2.5 px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[14px] md:text-[15px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 ease-spring">
            <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" /> Sarcină Nouă
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group/search">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-tertiary)] transition-colors duration-200 group-focus-within/search:text-primary-500" />
          <input type="text" placeholder="Caută sarcini..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-5 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300">
          <option value="">Toate Statusurile</option>
          <option value="pending">În așteptare</option>
          <option value="in_progress">În progres</option>
          <option value="completed">Finalizat</option>
          <option value="cancelled">Anulat</option>
        </select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-5 p-5 bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl">
              <div className="skeleton w-6 h-6 rounded-full animate-skeletonPulse" />
              <div className="flex-1 space-y-2.5">
                <div className="skeleton h-5 w-3/5 rounded-lg" style={{ animationDelay: `${i * 60}ms` }} />
                <div className="flex gap-2.5">
                  <div className="skeleton h-6 w-20 rounded-lg" style={{ animationDelay: `${i * 60 + 30}ms` }} />
                  <div className="skeleton h-6 w-24 rounded-lg" style={{ animationDelay: `${i * 60 + 60}ms` }} />
                </div>
              </div>
            </div>
          ))
        ) : sortedTasks.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-violet-500/10 flex items-center justify-center border border-primary-500/10">
              <ClipboardList className="w-8 h-8 text-primary-500/60" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-[var(--text-primary)]">Nicio sarcină găsită</p>
              <p className="text-[14px] text-[var(--text-tertiary)] mt-0.5">Creează prima sarcină pentru a începe</p>
            </div>
          </div>
        ) : (
          paginatedTasks.map((task: any, index: number) => (
            <div key={task.id}
              className={cn(
                'flex items-center gap-5 p-5 bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border rounded-2xl hover:border-primary-500/20 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-200 group animate-fadeInUp relative',
                isOverdue(task)
                  ? 'border-red-500/20 border-l-[3px] border-l-red-500'
                  : 'border-[var(--border-color)]'
              )}
              style={{ animationDelay: `${index * 30}ms` }}>
              <button onClick={() => handleComplete(task)}
                className={cn(
                  'flex-shrink-0 transition-all duration-200 group/check',
                  task.status !== 'completed' && 'hover:scale-125 active:scale-95'
                )}>
                {getTaskIcon(task)}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn('font-semibold text-[15px] text-[var(--text-primary)] transition-all duration-300', task.status === 'completed' && 'line-through opacity-50')}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3.5 mt-2">
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-semibold', getPriorityColor(task.priority))}>
                    <span className={cn('w-2 h-2 rounded-full', PRIORITY_DOTS[task.priority] || 'bg-blue-400')} />
                    {PRIORITY_LABELS[task.priority] || task.priority}
                  </span>
                  <span className="text-[13px] text-[var(--text-tertiary)] capitalize">{TYPE_LABELS[task.type] || task.type?.replace('_', ' ')}</span>
                  {task.dueDate && (
                    <span className={cn(
                      'text-[13px] font-medium',
                      isOverdue(task) ? 'text-red-500' : 'text-[var(--text-tertiary)]'
                    )}>
                      {isOverdue(task) && (
                        <AlertTriangle className="w-4 h-4 inline mr-1 -mt-px" />
                      )}
                      Scadent: {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button onClick={() => { setEditingTask(task); setShowForm(true); }}
                  className="p-2.5 rounded-xl hover:bg-primary-500/10 text-[var(--text-tertiary)] hover:text-primary-500 hover:scale-110 transition-all duration-200">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => setDeleteTarget(task)}
                  className="p-2.5 rounded-xl hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-500 hover:scale-110 transition-all duration-200">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          <p className="text-[13px] text-[var(--text-tertiary)]">
            Pagina {currentPage} din {totalPages}
          </p>
          <div className="flex flex-wrap items-center gap-2">
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Șterge sarcină"
        description={`Ești sigur că vrei să ștergi sarcina "${deleteTarget?.title}"? Această acțiune nu poate fi anulată.`}
        confirmLabel="Șterge"
        cancelLabel="Anulează"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300" onClick={() => { setShowForm(false); setEditingTask(null); }}>
          <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-10 w-full max-w-xl mx-4 animate-fadeInScale shadow-2xl dark:shadow-black/40 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-400 via-primary-500 to-violet-500 rounded-t-2xl" />
            {/* Subtle background glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-7 tracking-tight">{editingTask ? 'Editează Sarcină' : 'Sarcină Nouă'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Titlu *</label>
                <input name="title" defaultValue={editingTask?.title} required
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Descriere</label>
                <textarea name="description" rows={3} defaultValue={editingTask?.description}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Tip</label>
                  <select name="type" defaultValue={editingTask?.type || 'task'}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300">
                    <option value="task">Sarcină</option><option value="call">Apel</option><option value="meeting">Întâlnire</option>
                    <option value="email">Email</option><option value="follow_up">Urmărire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Prioritate</label>
                  <select name="priority" defaultValue={editingTask?.priority || 'medium'}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300">
                    <option value="low">Scăzută</option><option value="medium">Medie</option>
                    <option value="high">Ridicată</option><option value="urgent">Urgentă</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Data Scadenței</label>
                  <input name="dueDate" type="date" defaultValue={editingTask?.dueDate?.split('T')[0]}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-md">
                  {createMutation.isPending ? 'Se salvează...' : editingTask ? 'Actualizează Sarcină' : 'Creează Sarcină'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingTask(null); }}
                  className="px-7 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-[15px] font-semibold hover:bg-[var(--bg-tertiary)]/60 transition-all duration-200">
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
