import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, Building2, Star, Trash2, Edit } from 'lucide-react';
import api from '@/lib/api';
import { cn, formatDate, getStatusColor, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export function ContactsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '50');
      const { data } = await api.get(`/contacts?${params}`);
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: (contact: any) => editingContact
      ? api.put(`/contacts/${editingContact.id}`, contact)
      : api.post('/contacts', contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success(editingContact ? 'Contact updated' : 'Contact created');
      setShowForm(false);
      setEditingContact(null);
    },
    onError: () => toast.error('Failed to save contact'),
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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight">Contacts</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{data?.total || 0} total contacts</p>
        </div>
        <button onClick={() => { setEditingContact(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[13px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-300 ease-spring">
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      {/* Contact Table */}
      <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm dark:shadow-black/20">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Contact</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Company</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Status</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Score</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Created</th>
              <th className="text-right px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border-color)]">
                  <td colSpan={6} className="px-6 py-4"><div className="skeleton h-6 w-full rounded-lg" /></td>
                </tr>
              ))
            ) : data?.contacts?.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-[var(--text-tertiary)] text-[13px]">No contacts found</td></tr>
            ) : (
              data?.contacts?.map((contact: any) => (
                <tr key={contact.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/40 transition-colors duration-150">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm shadow-indigo-500/20">
                        {getInitials(contact.firstName, contact.lastName)}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--text-primary)]">{contact.firstName} {contact.lastName}</p>
                        <p className="text-[11px] text-[var(--text-tertiary)]">{contact.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[13px]">
                      <Building2 className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <span>{contact.company || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={cn('px-2.5 py-1 rounded-lg text-[11px] font-semibold', getStatusColor(contact.status))}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[13px] font-medium text-[var(--text-primary)]">{contact.leadScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-[12px] text-[var(--text-secondary)]">{formatDate(contact.createdAt)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditingContact(contact); setShowForm(true); }}
                        className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]/60 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this contact?')) deleteMutation.mutate(contact.id); }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-500 transition-all duration-200">
                        <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 w-full max-w-lg mx-4 animate-fadeInScale shadow-2xl dark:shadow-black/40">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-t-2xl" />
            <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-6">
              {editingContact ? 'Edit Contact' : 'New Contact'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">First Name *</label>
                  <input name="firstName" defaultValue={editingContact?.firstName} required
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Last Name *</label>
                  <input name="lastName" defaultValue={editingContact?.lastName} required
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Email</label>
                <input name="email" type="email" defaultValue={editingContact?.email}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Phone</label>
                  <input name="phone" defaultValue={editingContact?.phone}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Company</label>
                  <input name="company" defaultValue={editingContact?.company}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Job Title</label>
                <input name="jobTitle" defaultValue={editingContact?.jobTitle}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Status</label>
                  <select name="status" defaultValue={editingContact?.status || 'active'}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="churned">Churned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">Source</label>
                  <select name="source" defaultValue={editingContact?.source || 'other'}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10">
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social">Social</option>
                    <option value="email">Email</option>
                    <option value="event">Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[13px] font-semibold shadow-md shadow-indigo-500/20 transition-all duration-300 disabled:opacity-50">
                  {createMutation.isPending ? 'Saving...' : editingContact ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingContact(null); }}
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
