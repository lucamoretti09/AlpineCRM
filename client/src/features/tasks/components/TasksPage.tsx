import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, Circle, Clock, AlertTriangle, Filter, Search, Trash2, Edit } from 'lucide-react';
import api from '@/lib/api';
import { cn, formatDate, getPriorityColor, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

export function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
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
      toast.success('Task completed!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: (task: any) => editingTask ? api.put(`/tasks/${editingTask.id}`, task) : api.post('/tasks', task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(editingTask ? 'Task updated' : 'Task created');
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

  const getTaskIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'in_progress') return <Clock className="w-5 h-5 text-blue-500" />;
    return <Circle className="w-5 h-5 text-[var(--text-tertiary)]" />;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tasks</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">{data?.total || 0} tasks</p>
        </div>
        <button onClick={() => { setEditingTask(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-medium shadow-md shadow-indigo-500/20 transition-all">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)
        ) : data?.tasks?.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-tertiary)] text-[13px]">No tasks found</div>
        ) : (
          data?.tasks?.map((task: any, index: number) => (
            <div key={task.id} className="flex items-center gap-4 p-4 bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group animate-fadeInUp" style={{ animationDelay: `${index * 30}ms` }}>
              <button onClick={() => task.status !== 'completed' && completeMutation.mutate(task.id)}
                className="flex-shrink-0 hover:scale-110 transition-transform">
                {getTaskIcon(task.status)}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn('font-semibold text-[13px] text-[var(--text-primary)]', task.status === 'completed' && 'line-through opacity-60')}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={cn('px-2 py-0.5 rounded-lg text-[11px] font-semibold', getPriorityColor(task.priority))}>{task.priority}</span>
                  <span className="text-[11px] text-[var(--text-tertiary)] capitalize">{task.type?.replace('_', ' ')}</span>
                  {task.dueDate && (
                    <span className={cn('text-[11px]', new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-red-500' : 'text-[var(--text-tertiary)]')}>
                      Due: {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingTask(task); setShowForm(true); }}
                  className="p-2 rounded-xl hover:bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(task.id); }}
                  className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-6 w-full max-w-lg mx-4 animate-fadeInScale shadow-2xl shadow-black/10">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{editingTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">Title *</label>
                <input name="title" defaultValue={editingTask?.title} required
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">Description</label>
                <textarea name="description" rows={3} defaultValue={editingTask?.description}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">Type</label>
                  <select name="type" defaultValue={editingTask?.type || 'task'}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all">
                    <option value="task">Task</option><option value="call">Call</option><option value="meeting">Meeting</option>
                    <option value="email">Email</option><option value="follow_up">Follow Up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">Priority</label>
                  <select name="priority" defaultValue={editingTask?.priority || 'medium'}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all">
                    <option value="low">Low</option><option value="medium">Medium</option>
                    <option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">Due Date</label>
                  <input name="dueDate" type="date" defaultValue={editingTask?.dueDate?.split('T')[0]}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-medium shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all">
                  {createMutation.isPending ? 'Saving...' : editingTask ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingTask(null); }}
                  className="px-6 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
