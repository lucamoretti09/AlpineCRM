import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar as CalIcon, LayoutGrid, List, Trash2, Edit, TrendingUp, FolderOpen } from 'lucide-react';
import api from '@/lib/api';
import { cn, formatCurrency, formatDate, getStageColor } from '@/lib/utils';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'prospecting', label: 'Prospectare', color: 'bg-indigo-500' },
  { id: 'qualification', label: 'Calificare', color: 'bg-amber-500' },
  { id: 'proposal', label: 'Propunere', color: 'bg-violet-500' },
  { id: 'negotiation', label: 'Negociere', color: 'bg-orange-500' },
  { id: 'closed_won', label: 'C\u00e2\u0219tigat', color: 'bg-emerald-500' },
  { id: 'closed_lost', label: 'Pierdut', color: 'bg-red-500' },
];

const STAGE_LABELS: Record<string, string> = {
  prospecting: 'Prospectare',
  qualification: 'Calificare',
  proposal: 'Propunere',
  negotiation: 'Negociere',
  closed_won: 'C\u00e2\u0219tigat',
  closed_lost: 'Pierdut',
};

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
      toast.success('Tranzac\u021Bie mutat\u0103');
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
      toast.success(editingDeal ? 'Tranzac\u021Bie actualizat\u0103' : 'Tranzac\u021Bie creat\u0103');
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
      toast.success('Tranzac\u021Bie \u0219tears\u0103');
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
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight">Tranzac\u021Bii</h1>
          <p className="text-[15px] text-[var(--text-secondary)] mt-0.5">Gestioneaz\u0103 pipeline-ul de v\u00e2nz\u0103ri</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="relative flex bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl p-0.5">
            {/* Sliding indicator */}
            <div className={cn(
              'absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-lg shadow-sm transition-all duration-300 ease-spring',
              view === 'kanban' ? 'left-0.5' : 'left-[calc(50%+1px)]'
            )} />
            <button onClick={() => setView('kanban')}
              className={cn('relative z-10 px-4 py-2 rounded-lg text-[15px] font-medium transition-colors duration-200', view === 'kanban' ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button onClick={() => setView('list')}
              className={cn('relative z-10 px-4 py-2 rounded-lg text-[15px] font-medium transition-colors duration-200', view === 'list' ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>
              <List className="w-5 h-5" />
            </button>
          </div>
          <button onClick={() => { setEditingDeal(null); setShowForm(true); }}
            className="group flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 ease-spring">
            <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" /> Tranzac\u021Bie Nou\u0103
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-5 overflow-x-auto pb-4 -mx-2 px-2">
          {STAGES.map((stage, stageIndex) => {
            const stageData = kanbanData?.find((s: any) => s.stage === stage.id);
            return (
              <div key={stage.id} className="flex-shrink-0 w-[320px] animate-fadeInUp" style={{ animationDelay: `${stageIndex * 60}ms` }}>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className={cn('w-3 h-3 rounded-full', stage.color)} />
                      {stage.id !== 'closed_won' && stage.id !== 'closed_lost' && (stageData?.count || 0) > 0 && (
                        <div className={cn('absolute inset-0 w-3 h-3 rounded-full animate-stagePulse', stage.color, 'opacity-40')} />
                      )}
                    </div>
                    <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{stage.label}</h3>
                    <span className="text-[13px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-tertiary)]/60 px-2.5 py-1 rounded-lg">
                      {stageData?.count || 0}
                    </span>
                  </div>
                  <span className="text-[13px] font-bold bg-gradient-to-r from-primary-500 to-violet-500 bg-clip-text text-transparent">
                    {formatCurrency(stageData?.totalValue || 0)}
                  </span>
                </div>
                <div className="space-y-3 min-h-[220px] bg-[var(--bg-secondary)]/40 rounded-2xl p-3 border border-[var(--border-color)]">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="rounded-xl overflow-hidden">
                        <div className="skeleton h-32 rounded-xl" style={{ animationDelay: `${i * 100}ms` }} />
                      </div>
                    ))
                  ) : stageData?.deals?.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2.5">
                      <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)]/60 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-[var(--text-tertiary)]" />
                      </div>
                      <p className="text-[14px] text-[var(--text-tertiary)]">Nicio tranzac\u021Bie</p>
                    </div>
                  ) : (
                    stageData?.deals?.map((deal: any, dealIndex: number) => (
                      <div key={deal.id}
                        className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 cursor-pointer hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-0.5 transition-all duration-200 group animate-cardLift"
                        style={{ animationDelay: `${stageIndex * 60 + dealIndex * 40}ms` }}>
                        {/* Subtle top gradient on hover */}
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/0 to-transparent group-hover:via-primary-500/30 rounded-t-xl transition-all duration-300" />
                        <div className="flex items-start justify-between">
                          <h4 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight pr-2">{deal.name}</h4>
                          <div className="flex opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button onClick={() => { setEditingDeal(deal); setShowForm(true); }}
                              className="p-2 rounded-lg hover:bg-primary-500/10 text-[var(--text-tertiary)] hover:text-primary-500 hover:scale-110 transition-all duration-200">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => { if (confirm('\u0218tergi?')) deleteMutation.mutate(deal.id); }}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-500 hover:scale-110 transition-all duration-200">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {deal.company && (
                          <p className="text-[13px] text-[var(--text-tertiary)] mt-2">{deal.company}</p>
                        )}
                        <div className="flex items-center justify-between mt-3.5">
                          <span className="text-[16px] font-bold bg-gradient-to-r from-primary-500 to-violet-500 bg-clip-text text-transparent">{formatCurrency(deal.value)}</span>
                          <span className="text-[13px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-tertiary)]/60 px-2 py-1 rounded-md">{deal.probability}%</span>
                        </div>
                        {deal.expectedCloseDate && (
                          <div className="flex items-center gap-1.5 mt-3 text-[13px] text-[var(--text-tertiary)]">
                            <CalIcon className="w-4 h-4" />
                            {formatDate(deal.expectedCloseDate)}
                          </div>
                        )}
                        {/* Stage move buttons */}
                        <div className="flex gap-2 mt-3.5 pt-3.5 border-t border-[var(--border-color)]">
                          {STAGES.filter(s => s.id !== stage.id && s.id !== 'closed_lost').slice(0, 3).map(s => (
                            <button key={s.id} onClick={() => stageMutation.mutate({ dealId: deal.id, stage: s.id })}
                              className={cn(
                                'text-[12px] font-medium px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)]',
                                'hover:border-primary-500/30 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-indigo-500 hover:text-white hover:border-transparent hover:shadow-sm hover:shadow-indigo-500/20',
                                'transition-all duration-200 hover:-translate-y-px'
                              )}>
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
                <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Tranzac\u021Bie</th>
                <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Valoare</th>
                <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Etap\u0103</th>
                <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Probabilitate</th>
                <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Data \u00CEnchidere</th>
                <th className="text-right px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Ac\u021Biuni</th>
              </tr>
            </thead>
            <tbody>
              {listData?.deals?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-violet-500/10 flex items-center justify-center border border-primary-500/10">
                        <TrendingUp className="w-8 h-8 text-primary-500/60" />
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[var(--text-primary)]">Nicio tranzac\u021Bie</p>
                        <p className="text-[14px] text-[var(--text-tertiary)] mt-0.5">Creeaz\u0103 prima tranzac\u021Bie pentru a \u00EEncepe s\u0103 urm\u0103re\u0219ti pipeline-ul</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                listData?.deals?.map((deal: any, index: number) => (
                  <tr key={deal.id}
                    className="border-b border-[var(--border-color)] hover:bg-primary-500/[0.03] dark:hover:bg-primary-500/[0.04] transition-all duration-200 group/row animate-rowSlideIn relative"
                    style={{ animationDelay: `${index * 35}ms` }}>
                    <td className="px-6 py-4.5 relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-gradient-to-b from-primary-400 to-primary-600 rounded-r-full transition-all duration-300 group-hover/row:h-8 opacity-0 group-hover/row:opacity-100" />
                      <p className="text-[15px] font-semibold text-[var(--text-primary)]">{deal.name}</p>
                      <p className="text-[13px] text-[var(--text-tertiary)]">{deal.company}</p>
                    </td>
                    <td className="px-6 py-4.5 text-[16px] font-bold bg-gradient-to-r from-primary-500 to-violet-500 bg-clip-text text-transparent">{formatCurrency(deal.value)}</td>
                    <td className="px-6 py-4.5">
                      <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold', getStageColor(deal.stage))}>
                        <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                        {STAGE_LABELS[deal.stage] || deal.stage?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-[15px] text-[var(--text-secondary)]">{deal.probability}%</td>
                    <td className="px-6 py-4.5 text-[14px] text-[var(--text-secondary)]">
                      {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '\u2014'}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-all duration-200">
                        <button onClick={() => { setEditingDeal(deal); setShowForm(true); }}
                          className="p-2.5 rounded-lg hover:bg-primary-500/10 text-[var(--text-tertiary)] hover:text-primary-500 hover:scale-110 transition-all duration-200">
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={() => { if (confirm('\u0218tergi?')) deleteMutation.mutate(deal.id); }}
                          className="p-2.5 rounded-lg hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-500 hover:scale-110 transition-all duration-200">
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300" onClick={() => { setShowForm(false); setEditingDeal(null); }}>
          <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-10 w-full max-w-xl mx-4 animate-fadeInScale shadow-2xl dark:shadow-black/40 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-400 via-primary-500 to-violet-500 rounded-t-2xl" />
            {/* Subtle background glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-7 tracking-tight">
              {editingDeal ? 'Editeaz\u0103 Tranzac\u021Bie' : 'Tranzac\u021Bie Nou\u0103'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Nume Tranzac\u021Bie *</label>
                <input name="name" defaultValue={editingDeal?.name} required
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Valoare *</label>
                  <input name="value" type="number" step="0.01" defaultValue={editingDeal?.value} required
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Etap\u0103</label>
                  <select name="stage" defaultValue={editingDeal?.stage || 'prospecting'}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300">
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Companie</label>
                  <input name="company" defaultValue={editingDeal?.company}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Data Estimat\u0103 \u00CEnchidere</label>
                  <input name="expectedCloseDate" type="date" defaultValue={editingDeal?.expectedCloseDate?.split('T')[0]}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Descriere</label>
                <textarea name="description" rows={3} defaultValue={editingDeal?.description}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300 resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-md">
                  {createMutation.isPending ? 'Se salveaz\u0103...' : editingDeal ? 'Actualizeaz\u0103 Tranzac\u021Bie' : 'Creeaz\u0103 Tranzac\u021Bie'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingDeal(null); }}
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
