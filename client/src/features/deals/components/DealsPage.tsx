import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar as CalIcon, LayoutGrid, List, Trash2, Edit, TrendingUp, FolderOpen, Download, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { cn, formatCurrency, formatDate, getStageColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const STAGES = [
  { id: 'prospecting', label: 'Prospectare', color: 'bg-indigo-500' },
  { id: 'qualification', label: 'Calificare', color: 'bg-amber-500' },
  { id: 'proposal', label: 'Propunere', color: 'bg-violet-500' },
  { id: 'negotiation', label: 'Negociere', color: 'bg-orange-500' },
  { id: 'closed_won', label: 'Câștigat', color: 'bg-emerald-500' },
  { id: 'closed_lost', label: 'Pierdut', color: 'bg-red-500' },
];

const STAGE_LABELS: Record<string, string> = {
  prospecting: 'Prospectare',
  qualification: 'Calificare',
  proposal: 'Propunere',
  negotiation: 'Negociere',
  closed_won: 'Câștigat',
  closed_lost: 'Pierdut',
};

export function DealsPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // ── Sorting & Pagination (list view)
  type SortField = 'name' | 'value' | 'stage' | 'probability' | 'expectedCloseDate';
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const queryClient = useQueryClient();

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showForm) {
        setShowForm(false);
        setEditingDeal(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);

  const { data: kanbanData, isLoading, isError } = useQuery({
    queryKey: ['deals-kanban'],
    queryFn: async () => {
      const { data } = await api.get('/deals/kanban');
      return data.data;
    },
    enabled: view === 'kanban',
    retry: 2,
  });

  const { data: listData, isError: isListError } = useQuery({
    queryKey: ['deals-list'],
    queryFn: async () => {
      const { data } = await api.get('/deals?limit=100');
      return data.data;
    },
    enabled: view === 'list',
    retry: 2,
  });

  const stageMutation = useMutation({
    mutationFn: ({ dealId, stage }: { dealId: string; stage: string }) =>
      api.patch(`/deals/${dealId}/stage`, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals-kanban'] });
      toast.success('Tranzacție mutată');
    },
    onError: () => toast.error('Eroare la mutarea tranzacției'),
  });

  const createMutation = useMutation({
    mutationFn: (deal: any) => editingDeal
      ? api.put(`/deals/${editingDeal.id}`, deal)
      : api.post('/deals', deal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['deals-list'] });
      toast.success(editingDeal ? 'Tranzacție actualizată' : 'Tranzacție creată');
      setShowForm(false);
      setEditingDeal(null);
    },
    onError: () => toast.error('Eroare la salvarea tranzacției'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/deals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['deals-list'] });
      toast.success('Tranzacție ștearsă');
    },
    onError: () => toast.error('Eroare la ștergerea tranzacției'),
  });

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setCurrentPage(1);
  }, [sortField]);

  const STAGE_ORDER: Record<string, number> = { prospecting: 0, qualification: 1, proposal: 2, negotiation: 3, closed_won: 4, closed_lost: 5 };

  const sortedDeals = useMemo(() => {
    const deals = [...(listData?.deals || [])];
    deals.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = (a.name || '').localeCompare(b.name || '', 'ro'); break;
        case 'value': cmp = (a.value || 0) - (b.value || 0); break;
        case 'stage': cmp = (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99); break;
        case 'probability': cmp = (a.probability || 0) - (b.probability || 0); break;
        case 'expectedCloseDate': {
          const da = a.expectedCloseDate ? new Date(a.expectedCloseDate).getTime() : Infinity;
          const db = b.expectedCloseDate ? new Date(b.expectedCloseDate).getTime() : Infinity;
          cmp = da - db;
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return deals;
  }, [listData?.deals, sortField, sortDir]);

  const paginatedDeals = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedDeals.slice(start, start + PAGE_SIZE);
  }, [sortedDeals, currentPage]);

  const dealTotalPages = Math.ceil(sortedDeals.length / PAGE_SIZE);

  const handleExportCSV = useCallback(() => {
    const deals = view === 'list' ? sortedDeals : (kanbanData || []).flatMap((s: any) => s.deals || []);
    const headers = ['Nume', 'Companie', 'Valoare', 'Etapă', 'Probabilitate', 'Data Închidere'];
    const rows = deals.map((d: any) => [
      d.name, d.company || '', formatCurrency(d.value),
      STAGE_LABELS[d.stage] || d.stage, `${d.probability || 0}%`,
      d.expectedCloseDate ? formatDate(d.expectedCloseDate) : '',
    ]);
    const csvContent = [headers, ...rows].map((r: string[]) => r.map((v: string) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tranzactii_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV descărcat');
  }, [sortedDeals, kanbanData, view]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[14px] text-[var(--text-secondary)]">
          Gestionează pipeline-ul de vânzări
        </p>
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
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[14px] md:text-[15px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button onClick={() => { setEditingDeal(null); setShowForm(true); }}
            className="group flex items-center gap-2.5 px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[14px] md:text-[15px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 ease-spring">
            <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" /> Tranzacție Nouă
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
                      <p className="text-[14px] text-[var(--text-tertiary)]">Nicio tranzacție</p>
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
                            <button onClick={() => setDeleteTarget(deal)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-500 hover:scale-110 transition-all duration-200">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {deal.company && (
                          <p className="text-[13px] text-[var(--text-tertiary)] mt-2">{deal.company}</p>
                        )}
                        <div className="flex items-center justify-between mt-3.5">
                          <span className="text-[15px] font-bold bg-gradient-to-r from-primary-500 to-violet-500 bg-clip-text text-transparent">{formatCurrency(deal.value)}</span>
                          <span className="text-[12px] font-semibold text-[var(--text-tertiary)]">{deal.probability}%</span>
                        </div>
                        {/* Probability progress bar */}
                        <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--bg-tertiary)]/80 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500 ease-out',
                              deal.probability >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                              deal.probability >= 50 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                              deal.probability >= 25 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                              'bg-gradient-to-r from-slate-400 to-slate-500'
                            )}
                            style={{ width: `${Math.min(deal.probability, 100)}%` }}
                          />
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
          <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                {([['name', 'Tranzacție'], ['value', 'Valoare'], ['stage', 'Etapă'], ['probability', 'Probabilitate'], ['expectedCloseDate', 'Data Închidere']] as [SortField, string][]).map(([field, label]) => (
                  <th key={field} className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    <button onClick={() => toggleSort(field)} className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors">
                      {label}
                      {sortField === field ? (sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />) : <ChevronsUpDown className="w-4 h-4 opacity-40" />}
                    </button>
                  </th>
                ))}
                <th className="text-right px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {sortedDeals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-violet-500/10 flex items-center justify-center border border-primary-500/10">
                        <TrendingUp className="w-8 h-8 text-primary-500/60" />
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[var(--text-primary)]">Nicio tranzacție</p>
                        <p className="text-[14px] text-[var(--text-tertiary)] mt-0.5">Creează prima tranzacție pentru a începe să urmărești pipeline-ul</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDeals.map((deal: any, index: number) => (
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
                        <button onClick={() => setDeleteTarget(deal)}
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
          {/* Pagination */}
          {dealTotalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
              <p className="text-[13px] text-[var(--text-tertiary)]">
                Se afișează {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, sortedDeals.length)} din {sortedDeals.length}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(dealTotalPages, 5) }).map((_, i) => {
                  let pageNum: number;
                  if (dealTotalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= dealTotalPages - 2) pageNum = dealTotalPages - 4 + i;
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
                <button onClick={() => setCurrentPage(p => Math.min(dealTotalPages, p + 1))} disabled={currentPage === dealTotalPages}
                  className="p-2 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Șterge tranzacție"
        description={`Ești sigur că vrei să ștergi tranzacția "${deleteTarget?.name}"? Această acțiune nu poate fi anulată.`}
        confirmLabel="Șterge"
        cancelLabel="Anulează"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300" onClick={() => { setShowForm(false); setEditingDeal(null); }}>
          <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-10 w-full max-w-xl mx-4 animate-fadeInScale shadow-2xl dark:shadow-black/40 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-400 via-primary-500 to-violet-500 rounded-t-2xl" />
            {/* Subtle background glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-7 tracking-tight">
              {editingDeal ? 'Editează Tranzacție' : 'Tranzacție Nouă'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Nume Tranzacție *</label>
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
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Etapă</label>
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
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Data Estimată Închidere</label>
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
                  {createMutation.isPending ? 'Se salvează...' : editingDeal ? 'Actualizează Tranzacție' : 'Creează Tranzacție'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingDeal(null); }}
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
