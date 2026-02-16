import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, GripVertical, DollarSign, Calendar as CalIcon, User, MoreHorizontal, LayoutGrid, List, Trash2, Edit } from 'lucide-react';
import api from '@/lib/api';
import { cn, formatCurrency, formatDate, getStageColor } from '@/lib/utils';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'prospecting', label: 'Prospecting', color: 'bg-blue-500' },
  { id: 'qualification', label: 'Qualification', color: 'bg-yellow-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-purple-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-green-500' },
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Deals</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Sales pipeline overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-0.5">
            <button onClick={() => setView('kanban')}
              className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors', view === 'kanban' ? 'bg-primary-600 text-white' : 'text-[var(--text-secondary)]')}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')}
              className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors', view === 'list' ? 'bg-primary-600 text-white' : 'text-[var(--text-secondary)]')}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => { setEditingDeal(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Deal
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageData = kanbanData?.find((s: any) => s.stage === stage.id);
            return (
              <div key={stage.id} className="flex-shrink-0 w-72">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', stage.color)} />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{stage.label}</h3>
                    <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">
                      {stageData?.count || 0}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {formatCurrency(stageData?.totalValue || 0)}
                  </span>
                </div>
                <div className="space-y-2 min-h-[200px] bg-[var(--bg-secondary)] rounded-xl p-2 border border-[var(--border-color)]">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="skeleton h-24 rounded-lg" />
                    ))
                  ) : stageData?.deals?.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[var(--text-tertiary)]">No deals</div>
                  ) : (
                    stageData?.deals?.map((deal: any) => (
                      <div key={deal.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-3 cursor-pointer hover:border-primary-500/50 transition-all group">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-[var(--text-primary)] leading-tight">{deal.name}</h4>
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingDeal(deal); setShowForm(true); }} className="p-1 hover:text-primary-500">
                              <Edit className="w-3 h-3" />
                            </button>
                            <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(deal.id); }} className="p-1 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {deal.company && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1">{deal.company}</p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-semibold text-primary-500">{formatCurrency(deal.value)}</span>
                          <span className="text-xs text-[var(--text-tertiary)]">{deal.probability}%</span>
                        </div>
                        {deal.expectedCloseDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-[var(--text-tertiary)]">
                            <CalIcon className="w-3 h-3" />
                            {formatDate(deal.expectedCloseDate)}
                          </div>
                        )}
                        {/* Stage move buttons */}
                        <div className="flex gap-1 mt-2 pt-2 border-t border-[var(--border-color)]">
                          {STAGES.filter(s => s.id !== stage.id && s.id !== 'closed_lost').slice(0, 3).map(s => (
                            <button key={s.id} onClick={() => stageMutation.mutate({ dealId: deal.id, stage: s.id })}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-primary-600 hover:text-white transition-colors">
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
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]">Deal</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]">Value</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]">Stage</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]">Probability</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]">Close Date</th>
                <th className="text-right px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listData?.deals?.map((deal: any) => (
                <tr key={deal.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[var(--text-primary)]">{deal.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{deal.company}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">{formatCurrency(deal.value)}</td>
                  <td className="px-6 py-4">
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', getStageColor(deal.stage))}>
                      {deal.stage?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">{deal.probability}%</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setEditingDeal(deal); setShowForm(true); }}
                      className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                      <Edit className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 w-full max-w-lg mx-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              {editingDeal ? 'Edit Deal' : 'New Deal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Deal Name *</label>
                <input name="name" defaultValue={editingDeal?.name} required
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Value *</label>
                  <input name="value" type="number" step="0.01" defaultValue={editingDeal?.value} required
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Stage</label>
                  <select name="stage" defaultValue={editingDeal?.stage || 'prospecting'}
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-primary-500">
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Company</label>
                  <input name="company" defaultValue={editingDeal?.company}
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Expected Close</label>
                  <input name="expectedCloseDate" type="date" defaultValue={editingDeal?.expectedCloseDate?.split('T')[0]}
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                <textarea name="description" rows={3} defaultValue={editingDeal?.description}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-primary-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {createMutation.isPending ? 'Saving...' : editingDeal ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingDeal(null); }}
                  className="px-6 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--bg-tertiary)] transition-colors">
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
