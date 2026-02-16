import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, Building2, Star, Trash2, Edit, UserPlus, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { cn, formatDate, getStatusColor, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

const AVATAR_GRADIENTS: Record<string, string> = {
  A: 'from-rose-400 via-rose-500 to-pink-600',
  B: 'from-orange-400 via-orange-500 to-amber-600',
  C: 'from-amber-400 via-amber-500 to-yellow-600',
  D: 'from-emerald-400 via-emerald-500 to-green-600',
  E: 'from-teal-400 via-teal-500 to-cyan-600',
  F: 'from-cyan-400 via-cyan-500 to-blue-600',
  G: 'from-blue-400 via-blue-500 to-indigo-600',
  H: 'from-indigo-400 via-indigo-500 to-violet-600',
  I: 'from-violet-400 via-violet-500 to-purple-600',
  J: 'from-purple-400 via-purple-500 to-fuchsia-600',
  K: 'from-fuchsia-400 via-fuchsia-500 to-pink-600',
  L: 'from-pink-400 via-pink-500 to-rose-600',
  M: 'from-red-400 via-red-500 to-orange-600',
  N: 'from-sky-400 via-sky-500 to-blue-600',
  O: 'from-lime-400 via-lime-500 to-green-600',
  P: 'from-indigo-400 via-purple-500 to-violet-600',
  Q: 'from-teal-400 via-emerald-500 to-green-600',
  R: 'from-blue-400 via-indigo-500 to-purple-600',
  S: 'from-rose-400 via-pink-500 to-fuchsia-600',
  T: 'from-amber-400 via-orange-500 to-red-600',
  U: 'from-cyan-400 via-teal-500 to-emerald-600',
  V: 'from-violet-400 via-purple-500 to-indigo-600',
  W: 'from-emerald-400 via-teal-500 to-cyan-600',
  X: 'from-fuchsia-400 via-pink-500 to-rose-600',
  Y: 'from-orange-400 via-amber-500 to-yellow-600',
  Z: 'from-blue-400 via-sky-500 to-cyan-600',
};

function getAvatarGradient(firstName: string): string {
  const letter = firstName?.charAt(0)?.toUpperCase() || 'A';
  return AVATAR_GRADIENTS[letter] || 'from-indigo-400 via-indigo-500 to-violet-600';
}

const STATUS_CONFIG: Record<string, { icon: string; label: string }> = {
  active: { icon: '\u2022', label: 'Activ' },
  inactive: { icon: '\u25CB', label: 'Inactiv' },
  churned: { icon: '\u2716', label: 'Pierdut' },
};

const STATUS_LABELS: Record<string, string> = {
  active: 'activ',
  inactive: 'inactiv',
  churned: 'pierdut',
};

export function ContactsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contacts', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '50');
      const { data } = await api.get(`/contacts?${params}`);
      return data.data;
    },
    retry: 2,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact șters');
    },
    onError: () => toast.error('Nu s-a putut șterge contactul'),
  });

  const createMutation = useMutation({
    mutationFn: (contact: any) => editingContact
      ? api.put(`/contacts/${editingContact.id}`, contact)
      : api.post('/contacts', contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success(editingContact ? 'Contact actualizat' : 'Contact creat');
      setShowForm(false);
      setEditingContact(null);
    },
    onError: () => toast.error('Nu s-a putut salva contactul'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      jobTitle: formData.get('jobTitle'),
      status: formData.get('status') || 'active',
      source: formData.get('source') || 'other',
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight">Contacte</h1>
          <p className="text-[15px] text-[var(--text-secondary)] mt-0.5">Se afișează {data?.contacts?.length || 0} din {data?.total || 0} contacte</p>
        </div>
        <button onClick={() => { setEditingContact(null); setShowForm(true); }}
          className="group flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 ease-spring">
          <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" /> Adaugă Contact
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 group/search">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] transition-colors duration-200 group-focus-within/search:text-primary-500" />
          <input type="text" placeholder="Caută contacte..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-5 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300">
          <option value="">Toate Statusurile</option>
          <option value="active">Activ</option>
          <option value="inactive">Inactiv</option>
          <option value="churned">Pierdut</option>
        </select>
      </div>

      {/* Contact Table */}
      <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm dark:shadow-black/20">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Contact</th>
              <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Companie</th>
              <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Status</th>
              <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Scor Lead</th>
              <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Creat</th>
              <th className="text-right px-6 py-4.5 text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border-color)]">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3.5">
                      <div className="skeleton w-11 h-11 rounded-xl animate-skeletonPulse" />
                      <div className="space-y-1.5">
                        <div className="skeleton h-5 w-36 rounded-lg" />
                        <div className="skeleton h-4 w-48 rounded-lg" style={{ animationDelay: '0.1s' }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5"><div className="skeleton h-5 w-28 rounded-lg" style={{ animationDelay: '0.15s' }} /></td>
                  <td className="px-6 py-5"><div className="skeleton h-7 w-20 rounded-lg" style={{ animationDelay: '0.2s' }} /></td>
                  <td className="px-6 py-5"><div className="skeleton h-5 w-14 rounded-lg" style={{ animationDelay: '0.25s' }} /></td>
                  <td className="px-6 py-5"><div className="skeleton h-5 w-24 rounded-lg" style={{ animationDelay: '0.3s' }} /></td>
                  <td className="px-6 py-5"><div className="skeleton h-5 w-20 rounded-lg ml-auto" style={{ animationDelay: '0.35s' }} /></td>
                </tr>
              ))
            ) : data?.contacts?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-violet-500/10 flex items-center justify-center border border-primary-500/10">
                      <UserPlus className="w-8 h-8 text-primary-500/60" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[var(--text-primary)]">Niciun contact găsit</p>
                      <p className="text-[14px] text-[var(--text-tertiary)] mt-0.5">Încearcă să ajustezi filtrele sau adaugă un contact nou</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data?.contacts?.map((contact: any, index: number) => (
                <tr key={contact.id}
                  className="border-b border-[var(--border-color)] hover:bg-primary-500/[0.03] dark:hover:bg-primary-500/[0.04] transition-all duration-200 group/row animate-rowSlideIn relative"
                  style={{ animationDelay: `${index * 35}ms` }}>
                  <td className="px-6 py-4.5 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-gradient-to-b from-primary-400 to-primary-600 rounded-r-full transition-all duration-300 group-hover/row:h-8 opacity-0 group-hover/row:opacity-100" />
                    <div className="flex items-center gap-3.5">
                      <div className={cn(
                        'w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[13px] font-bold shadow-sm transition-transform duration-200 group-hover/row:scale-105',
                        getAvatarGradient(contact.firstName)
                      )}>
                        {getInitials(contact.firstName, contact.lastName)}
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[var(--text-primary)]">{contact.firstName} {contact.lastName}</p>
                        <p className="text-[13px] text-[var(--text-tertiary)]">{contact.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[15px]">
                      <Building2 className="w-4.5 h-4.5 text-[var(--text-tertiary)]" />
                      <span>{contact.company || '\u2014'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold', getStatusColor(contact.status))}>
                      <span className="text-[10px]">{STATUS_CONFIG[contact.status]?.icon || '\u2022'}</span>
                      {STATUS_LABELS[contact.status] || contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500 animate-starGlow" />
                      <span className="text-[15px] font-medium text-[var(--text-primary)]">{contact.leadScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-[14px] text-[var(--text-secondary)]">{formatDate(contact.createdAt)}</td>
                  <td className="px-6 py-4.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-all duration-200">
                      <button onClick={() => { setEditingContact(contact); setShowForm(true); }}
                        className="p-2.5 rounded-lg hover:bg-primary-500/10 text-[var(--text-tertiary)] hover:text-primary-500 hover:scale-110 transition-all duration-200">
                        <Edit className="w-4.5 h-4.5" />
                      </button>
                      <button onClick={() => { if (confirm('Ștergi acest contact?')) deleteMutation.mutate(contact.id); }}
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

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-md transition-all duration-300" onClick={() => { setShowForm(false); setEditingContact(null); }}>
          <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-10 w-full max-w-xl mx-4 animate-fadeInScale shadow-2xl dark:shadow-black/40 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-400 via-primary-500 to-violet-500 rounded-t-2xl" />
            {/* Subtle background glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-7 tracking-tight">
              {editingContact ? 'Editează Contact' : 'Contact Nou'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Prenume *</label>
                  <input name="firstName" defaultValue={editingContact?.firstName} required
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Nume *</label>
                  <input name="lastName" defaultValue={editingContact?.lastName} required
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Email</label>
                <input name="email" type="email" defaultValue={editingContact?.email}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Telefon</label>
                  <input name="phone" defaultValue={editingContact?.phone}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Companie</label>
                  <input name="company" defaultValue={editingContact?.company}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Funcție</label>
                <input name="jobTitle" defaultValue={editingContact?.jobTitle}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Status</label>
                  <select name="status" defaultValue={editingContact?.status || 'active'}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300">
                    <option value="active">Activ</option>
                    <option value="inactive">Inactiv</option>
                    <option value="churned">Pierdut</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Sursă</label>
                  <select name="source" defaultValue={editingContact?.source || 'other'}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-[3px] focus:ring-primary-500/[0.08] focus:bg-[var(--bg-card)] transition-all duration-300">
                    <option value="website">Website</option>
                    <option value="referral">Recomandare</option>
                    <option value="social">Social</option>
                    <option value="email">Email</option>
                    <option value="event">Eveniment</option>
                    <option value="other">Altele</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-md">
                  {createMutation.isPending ? 'Se salvează...' : editingContact ? 'Actualizează Contact' : 'Creează Contact'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingContact(null); }}
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
