import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar as CalIcon, LayoutGrid, List, Trash2, Edit } from 'lucide-react';
import api from '@/lib/api';
import { cn, formatCurrency, formatDate, getStageColor } from '@/lib/utils';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'prospecting', label: 'Prospecting', color: 'bg-indigo-500' },
  { id: 'qualification', label: 'Qualification', color: 'bg-amber-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-violet-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-emerald-500' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'bg-red-500' },
];

export function DealsPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: kanbanData, isLoading } = useQuery({
    queryKey: ['deals-kanban'],
    queryFn: async () => {
      const { data } = await api.get('/deals/kanban');
      return data.data;
    },
    enabled: view === 'kanban',
  });

  const { data: listData } = useQuery({
    queryKey: ['deals-list'],
    queryFn: async () => {
      const { data } = await api.get('/deals?limit=100');
      return data.data;
    },
    enabled: view === 'list',
  });

  const stageMutation = useMutation({
    mutationFn: ({ dealId, stage }: { dealId: string; stage: string }) =>
      api.patch(`/deals/${dealId}/stage`, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals-kanban'] });
      toast.success('Deal moved');
    },
  });

  const createMutation = useMutation({
    mutationFn: (deal: any) => editingDeal
      ? api.put(`/deals/${editingDeal.id}`, deal)
      : api.post('/deals', deal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['deals-list'] });
      toast.success(editingDeal ? 'Deal updated' : 'Deal created');
      setShowForm(false);
      setEditingDeal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/deals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['deals-list'] });
      toast.success('Deal deleted');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      name: fd.get('name'),
      company: fd.get('company'),
      value: parseFloat(fd.get('value') as string) || 0,
      stage: fd.get('stage') || 'prospecting',
      expectedCloseDate: fd.get('expectedCloseDate') || undefined,
      description: fd.get('description'),
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight">Deals</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Sales pipeline overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl p-0.5">
            <button onClick={() => setView('kanban')}
              className={cn('px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200', view === 'kanban' ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')}
              className={cn('px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200', view === 'list' ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => { setEditingDeal(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[13px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-spring">
            <Plus className="w-4 h-4" /> New Deal
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
          {STAGES.map((stage) => {
            const stageData = kanbanData?.find((s: any) => s.stage === stage.id);
            return (
              <div key={stage.id} className="flex-shrink-0 w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2.5 h-2.5 rounded-full', stage.color)} />
                    <h3 className="text-[13px] font-bold text-[var(--text-primary)]">{stage.label}</h3>
                    <span className="text-[11px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-tertiary)]/60 px-2 py-0.5 rounded-lg">
                      {stageData?.count || 0}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                    {formatCurrency(stageData?.totalValue || 0)}
                  </span>
                </div>
                <div className="space-y-2 min-h-[200px] bg-[var(--bg-secondary)]/40 rounded-2xl p-2.5 border border-[var(--border-color)]">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="skeleton h-24 rounded-xl" />
                    ))
                  ) : stageData?.deals?.length === 0 ? (
                    <div className="py-8 text-center text-[12px] text-[var(--text-tertiary)]">No deals</div>
                  ) : (
                    stageData?.deals?.map((deal: any) => (
                      <div key={deal.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3.5 cursor-pointer hover:border-primary-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                        <div className="flex items-start justify-between">
                          <h4 className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight">{deal.name}</h4>
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button onClick={() => { setEditingDeal(deal); setShowForm(true); }} className="p-1 rounded hover:text-primary-500 text-[var(--text-tertiary)]">
                              <Edit className="w-3 h-3" />
                            </button>
                            <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(deal.id); }} className="p-1 rounded hover:text-red-500 text-[var(--text-tertiary)]">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {deal.company && (
                          <p className="text-[11px] text-[var(--text-tertiary)] mt-1">{deal.company}</p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[14px] font-bold text-primary-500">{formatCurrency(deal.value)}</span>
                          <span className="text-[11px] font-medium text-[var(--text-tertiary)]">{deal.probability}%</span>
                        </div>
                        {deal.expectedCloseDate && (
                          <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--text-tertiary)]">
                            <CalIcon className="w-3 h-3" />
                            {formatDate(deal.expectedCloseDate)}
                          </div>
                        )}
                        {/* Stage move buttons */}
                        <div className="flex gap-1 mt-2.5 pt-2.5 border-t border-[var(--border-color)]">
                          {STAGES.filter(s => s.id !== stage.id && s.id !== 'closed_lost').slice(0, 3).map(s => (
                            <button key={s.id} onClick={() => stageMutation.mutate({ dealId: deal.id, stage: s.id })}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-[var(--bg-tertiary)]/60 text-[var(--text-secondary)] hover:bg-gradient-to-r hover:from-indigo-600 hover:to-indigo-500 hover:text-white transition-all duration-200">
                              {s.label.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm dark:shadow-black/20">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Deal</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Value</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Stage</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Probability</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Close Date</th>
                <th className="text-right px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listData?.deals?.map((deal: any) => (
                <tr key={deal.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/40 transition-colors duration-150">
                  <td className="px-6 py-3.5">
                    <p className="text-[13px] font-semibold text-[var(--text-primary)]">{deal.name}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{deal.company}</p>
                  </td>
                  <td className="px-6 py-3.5 text-[14px] font-bold text-[var(--text-primary)]">{formatCurrency(deal.value)}</td>
                  <td className="px-6 py-3.5">
                    <span className={cn('px-2.5 py-1 rounded-lg text-[11px] font-semibold', getStageColor(deal.stage))}>
                      {deal.stage?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-[13px] text-[var(--text-secondary)]">{deal.probability}%</td>
                  <td className="px-6 py-3.5 text-[12px] text-[var(--text-secondary)]">
                    {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '—'}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button onClick={() => { setEditingDeal(deal); setShowForm(true); }}
                      className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]/60 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 w-full max-w-lg mx-4 animate-fadeInScale shadow-2xl dark:shadow-black/40">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-t-2xl" />
            <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-6">
              {editingDeal ? 'Edit Deal' : 'New Deal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Deal Name *</label>
                <input name="name" defaultValue={editingDeal?.name} required
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Value *</label>
                  <input name="value" type="number" step="0.01" defaultValue={editingDeal?.value} required
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Stage</label>
                  <select name="stage" defaultValue={editingDeal?.stage || 'prospecting'}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10">
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Company</label>
                  <input name="company" defaultValue={editingDeal?.company}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Expected Close</label>
                  <input name="expectedCloseDate" type="date" defaultValue={editingDeal?.expectedCloseDate?.split('T')[0]}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Description</label>
                <textarea name="description" rows={3} defaultValue={editingDeal?.description}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 resize-none" />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[13px] font-semibold shadow-md shadow-indigo-500/20 transition-all duration-300 disabled:opacity-50">
                  {createMutation.isPending ? 'Saving...' : editingDeal ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingDeal(null); }}
                  className="px-6 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-[13px] font-semibold hover:bg-[var(--bg-tertiary)]/60 transition-all duration-200">
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
