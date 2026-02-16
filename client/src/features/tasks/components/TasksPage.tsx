import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, Circle, Clock, AlertTriangle, Filter, Search, Trash2, Edit, ClipboardList } from 'lucide-react';
import api from '@/lib/api';
import { cn, formatDate, getPriorityColor, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

const PRIORITY_DOTS: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-400',
  normal: 'bg-blue-400',
  high: 'bg-orange-400',
  urgent: 'bg-red-500',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'sc\u0103zut\u0103',
  medium: 'medie',
  normal: 'medie',
  high: 'ridicat\u0103',
  urgent: 'urgent\u0103',
};

const TYPE_LABELS: Record<string, string> = {
  task: 'sarcin\u0103',
  call: 'apel',
  email: 'email',
  meeting: '\u00eent\u00e2lnire',
  follow_up: 'urm\u0103rire',
};

export function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '100');
      const { data } = await api.get(`/tasks?${params}`);
      return data.data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/tasks/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Sarcin\u0103 finalizat\u0103!');
      setTimeout(() => setCompletingId(null), 600);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Sarcin\u0103 \u0219tears\u0103');
    },
  });

  const createMutation = useMutation({
    mutationFn: (task: any) => editingTask ? api.put(`/tasks/${editingTask.id}`, task) : api.post('/tasks', task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(editingTask ? 'Sarcin\u0103 actualizat\u0103' : 'Sarcin\u0103 creat\u0103');
      setShowForm(false); setEditingTask(null);
    },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight">Sarcini</h1>
          <p className="text-[15px] text-[var(--text-secondary)] mt-0.5">Se afi\u0219eaz\u0103 {data?.tasks?.length || 0} din {data?.total || 0} sarcini</p>
        </div>
        <button onClick={() => { setEditingTask(null); setShowForm(true); }}
          className="group flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 ease-spring">
          <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" /> Sarcin\u0103 Nou\u0103
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 group/search">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] transition-colors duration-200 group-focus-within/search:text-primary-500" />
          <input type="text" placeholder="Caut\u0103 sarcini..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-5 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300">
          <option value="">Toate Statusurile</option>
          <option value="pending">\u00CEn a\u0219teptare</option>
          <option value="in_progress">\u00CEn progres</option>
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
        ) : data?.tasks?.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-violet-500/10 flex items-center justify-center border border-primary-500/10">
              <ClipboardList className="w-8 h-8 text-primary-500/60" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-[var(--text-primary)]">Nicio sarcin\u0103 g\u0103sit\u0103</p>
              <p className="text-[14px] text-[var(--text-tertiary)] mt-0.5">Creeaz\u0103 prima sarcin\u0103 pentru a \u00eencepe</p>
            </div>
          </div>
        ) : (
          data?.tasks?.map((task: any, index: number) => (
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
                <button onClick={() => { if (confirm('\u0218tergi?')) deleteMutation.mutate(task.id); }}
                  className="p-2.5 rounded-xl hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-500 hover:scale-110 transition-all duration-200">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300" onClick={() => { setShowForm(false); setEditingTask(null); }}>
          <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-10 w-full max-w-xl mx-4 animate-fadeInScale shadow-2xl dark:shadow-black/40 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-400 via-primary-500 to-violet-500 rounded-t-2xl" />
            {/* Subtle background glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-7 tracking-tight">{editingTask ? 'Editeaz\u0103 Sarcin\u0103' : 'Sarcin\u0103 Nou\u0103'}</h2>
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
                    <option value="task">Sarcin\u0103</option><option value="call">Apel</option><option value="meeting">\u00CEnt\u00e2lnire</option>
                    <option value="email">Email</option><option value="follow_up">Urm\u0103rire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Prioritate</label>
                  <select name="priority" defaultValue={editingTask?.priority || 'medium'}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300">
                    <option value="low">Sc\u0103zut\u0103</option><option value="medium">Medie</option>
                    <option value="high">Ridicat\u0103</option><option value="urgent">Urgent\u0103</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Data Scaden\u021Bei</label>
                  <input name="dueDate" type="date" defaultValue={editingTask?.dueDate?.split('T')[0]}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-md">
                  {createMutation.isPending ? 'Se salveaz\u0103...' : editingTask ? 'Actualizeaz\u0103 Sarcin\u0103' : 'Creeaz\u0103 Sarcin\u0103'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingTask(null); }}
                  className="px-7 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-[15px] font-semibold hover:bg-[var(--bg-tertiary)]/60 transition-all duration-200">
                  Anuleaz\u0103
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
