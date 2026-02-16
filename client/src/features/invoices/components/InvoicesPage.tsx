import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  FileText,
  Trash2,
  Edit,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  Eye,
  X,
  ChevronDown,
  Receipt,
  TrendingUp,
  Ban,
} from 'lucide-react';
import api from '@/lib/api';
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  contactId?: string;
  contactName?: string;
  amount: number;
  subtotal: number;
  tax: number;
  taxRate: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedDate: string;
  notes?: string;
  lineItems: LineItem[];
  createdAt: string;
}

type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

interface InvoiceFormData {
  contactId?: string;
  dueDate: string;
  notes: string;
  lineItems: LineItem[];
  taxRate: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUSES: { id: InvoiceStatus; label: string }[] = [
  { id: 'draft', label: 'Ciornă' },
  { id: 'sent', label: 'Trimisă' },
  { id: 'viewed', label: 'Vizualizată' },
  { id: 'paid', label: 'Plătită' },
  { id: 'overdue', label: 'Restantă' },
  { id: 'cancelled', label: 'Anulată' },
];

const STATUS_ICONS: Record<InvoiceStatus, React.ReactNode> = {
  draft: <FileText className="w-4 h-4" />,
  sent: <Send className="w-4 h-4" />,
  viewed: <Eye className="w-4 h-4" />,
  paid: <CheckCircle2 className="w-4 h-4" />,
  overdue: <AlertTriangle className="w-4 h-4" />,
  cancelled: <Ban className="w-4 h-4" />,
};

function formatStatusLabel(status: InvoiceStatus): string {
  const found = STATUSES.find((s) => s.id === status);
  return found ? found.label : status.charAt(0).toUpperCase() + status.slice(1);
}

function generateTempId(): string {
  return `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptyLineItem(): LineItem {
  return { id: generateTempId(), description: '', quantity: 1, unitPrice: 0 };
}

// ---------------------------------------------------------------------------
// Skeleton helpers
// ---------------------------------------------------------------------------

function StatCardSkeleton() {
  return (
    <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton h-5 w-28 rounded" />
        <div className="skeleton h-11 w-11 rounded-xl" />
      </div>
      <div className="skeleton h-8 w-24 rounded mb-1" />
      <div className="skeleton h-4 w-36 rounded" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-[var(--border-color)]">
      <td className="px-6 py-4.5"><div className="skeleton h-6 w-28 rounded" /></td>
      <td className="px-6 py-4.5"><div className="skeleton h-6 w-36 rounded" /></td>
      <td className="px-6 py-4.5"><div className="skeleton h-6 w-20 rounded" /></td>
      <td className="px-6 py-4.5"><div className="skeleton h-6 w-16 rounded-lg" /></td>
      <td className="px-6 py-4.5"><div className="skeleton h-6 w-24 rounded" /></td>
      <td className="px-6 py-4.5"><div className="skeleton h-6 w-24 rounded" /></td>
      <td className="px-6 py-4.5"><div className="skeleton h-6 w-16 rounded" /></td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  accentColor?: string;
}

function StatCard({ label, value, subtitle, icon, iconBg, accentColor = 'indigo' }: StatCardProps) {
  return (
    <div className="relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-6 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden group">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-500/[0.02] group-hover:to-indigo-500/[0.05] transition-all duration-500 rounded-2xl" />
      {/* Top accent line */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        accentColor === 'green' && 'bg-gradient-to-r from-transparent via-green-500/50 to-transparent',
        accentColor === 'emerald' && 'bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent',
        accentColor === 'red' && 'bg-gradient-to-r from-transparent via-red-500/50 to-transparent',
        accentColor === 'indigo' && 'bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent',
      )} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-medium text-[var(--text-secondary)]">{label}</span>
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', iconBg)}>
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Invoice Form Modal
// ---------------------------------------------------------------------------

interface InvoiceFormProps {
  editingInvoice: Invoice | null;
  isPending: boolean;
  onSubmit: (data: InvoiceFormData) => void;
  onClose: () => void;
}

function InvoiceFormModal({ editingInvoice, isPending, onSubmit, onClose }: InvoiceFormProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>(
    editingInvoice?.lineItems?.length
      ? editingInvoice.lineItems.map((li) => ({ ...li, id: li.id || generateTempId() }))
      : [createEmptyLineItem()],
  );
  const [taxRate, setTaxRate] = useState<number>(editingInvoice?.taxRate ?? 0);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0),
    [lineItems],
  );
  const taxAmount = useMemo(() => subtotal * (taxRate / 100), [subtotal, taxRate]);
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  const updateLineItem = useCallback(
    (id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
      setLineItems((prev) =>
        prev.map((li) => (li.id === id ? { ...li, [field]: value } : li)),
      );
    },
    [],
  );

  const addLineItem = useCallback(() => {
    setLineItems((prev) => [...prev, createEmptyLineItem()]);
  }, []);

  const removeLineItem = useCallback(
    (id: string) => {
      if (lineItems.length <= 1) return;
      setLineItems((prev) => prev.filter((li) => li.id !== id));
    },
    [lineItems.length],
  );

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const validLineItems = lineItems.filter((li) => li.description.trim() !== '');
    if (validLineItems.length === 0) {
      toast.error('Adaugă cel puțin un element cu descriere');
      return;
    }
    onSubmit({
      contactId: (fd.get('contactId') as string) || undefined,
      dueDate: fd.get('dueDate') as string,
      notes: (fd.get('notes') as string) || '',
      lineItems: validLineItems,
      taxRate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl w-full max-w-2xl mx-4 animate-fadeInScale max-h-[90vh] flex flex-col shadow-2xl shadow-black/10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-t-2xl" />
        {/* Modal Header */}
        <div className="flex items-center justify-between p-7 border-b border-[var(--border-color)]">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {editingInvoice ? 'Editează Factură' : 'Creează Factură'}
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] mt-0.5">
              {editingInvoice
                ? `Editare ${editingInvoice.invoiceNumber}`
                : 'Completează detaliile pentru a crea o factură nouă'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-[var(--bg-secondary)]/60 text-[var(--text-tertiary)] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-7 space-y-5">
            {/* Top fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                  ID Contact
                </label>
                <input
                  name="contactId"
                  defaultValue={editingInvoice?.contactId || ''}
                  placeholder="Opțional"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                  Scadență *
                </label>
                <input
                  name="dueDate"
                  type="date"
                  required
                  defaultValue={editingInvoice?.dueDate?.split('T')[0] || ''}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Elemente Factură *
                </label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="flex items-center gap-1.5 text-[14px] font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adaugă Element
                </button>
              </div>

              <div className="space-y-2">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_80px_100px_36px] gap-2 px-1">
                  <span className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Descriere
                  </span>
                  <span className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Cant.
                  </span>
                  <span className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Preț Unitar
                  </span>
                  <span />
                </div>

                {lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-center group"
                  >
                    <input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Descrierea elementului"
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                    />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-full px-3.5 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateLineItem(item.id, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full px-3.5 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length <= 1}
                      className={cn(
                        'p-2.5 rounded-xl transition-colors',
                        lineItems.length <= 1
                          ? 'text-[var(--text-tertiary)] opacity-30 cursor-not-allowed'
                          : 'text-[var(--text-secondary)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20',
                      )}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Tax */}
            <div className="bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[15px] text-[var(--text-secondary)]">Subtotal</span>
                <span className="text-[15px] font-medium text-[var(--text-primary)]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] text-[var(--text-secondary)]">TVA</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={taxRate}
                      onChange={(e) =>
                        setTaxRate(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))
                      }
                      className="w-18 px-2.5 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[13px] text-[var(--text-primary)] text-center focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-colors"
                    />
                    <span className="text-[13px] text-[var(--text-tertiary)]">%</span>
                  </div>
                </div>
                <span className="text-[15px] font-medium text-[var(--text-primary)]">
                  {formatCurrency(taxAmount)}
                </span>
              </div>
              <div className="border-t border-[var(--border-color)] pt-3 flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[var(--text-primary)]">Total</span>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                Note
              </label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={editingInvoice?.notes || ''}
                placeholder="Note suplimentare sau instrucțiuni de plată..."
                className="w-full px-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 resize-none transition-all"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 p-7 border-t border-[var(--border-color)]">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
            >
              {isPending ? 'Se salvează...' : editingInvoice ? 'Actualizează Factură' : 'Creează Factură'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-7 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-[15px] font-semibold hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Anulează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export function InvoicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  // ---- Data fetching ----

  const { data, isLoading, isError } = useQuery({
    queryKey: ['invoices', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '50');
      const { data } = await api.get(`/invoices?${params}`);
      return data.data;
    },
    retry: 2,
  });

  const invoices: Invoice[] = data?.invoices ?? [];
  const total: number = data?.total ?? 0;

  // ---- Derived stats ----

  const stats = useMemo(() => {
    const totalRevenue = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + (typeof inv.amount === 'string' ? parseFloat(inv.amount) : inv.amount), 0);
    const paidCount = invoices.filter((inv) => inv.status === 'paid').length;
    const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length;
    return { totalRevenue, paidCount, overdueCount };
  }, [invoices]);

  // ---- Mutations ----

  const createMutation = useMutation({
    mutationFn: (invoice: InvoiceFormData) =>
      editingInvoice
        ? api.put(`/invoices/${editingInvoice.id}`, invoice)
        : api.post('/invoices', invoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(editingInvoice ? 'Factură actualizată' : 'Factură creată');
      setShowForm(false);
      setEditingInvoice(null);
    },
    onError: () => toast.error('Nu s-a putut salva factura'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Factură ștearsă');
    },
    onError: () => toast.error('Nu s-a putut șterge factura'),
  });

  // ---- Handlers ----

  const handleCreate = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleDelete = (invoice: Invoice) => {
    if (confirm(`Ștergi factura ${invoice.invoiceNumber}? Această acțiune nu poate fi anulată.`)) {
      deleteMutation.mutate(invoice.id);
    }
  };

  const handleFormSubmit = (formData: InvoiceFormData) => {
    createMutation.mutate(formData);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  // ---- Render ----

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* ====== Header ====== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">Facturi</h1>
          <p className="text-[15px] text-[var(--text-secondary)] mt-0.5">
            Gestionează și urmărește facturile
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Factură Nouă
        </button>
      </div>

      {/* ====== Stats Summary ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Facturi"
              value={total.toLocaleString()}
              subtitle={`${invoices.length} afișate`}
              icon={<Receipt className="w-5.5 h-5.5 text-indigo-500" />}
              iconBg="bg-indigo-500/10"
              accentColor="indigo"
            />
            <StatCard
              label="Venituri Totale"
              value={formatCurrency(stats.totalRevenue)}
              subtitle="Din facturile plătite"
              icon={<TrendingUp className="w-5.5 h-5.5 text-green-600" />}
              iconBg="bg-green-600/10"
              accentColor="green"
            />
            <StatCard
              label="Plătite"
              value={stats.paidCount.toLocaleString()}
              subtitle={`${total > 0 ? Math.round((stats.paidCount / total) * 100) : 0}% din total`}
              icon={<CheckCircle2 className="w-5.5 h-5.5 text-emerald-600" />}
              iconBg="bg-emerald-600/10"
              accentColor="emerald"
            />
            <StatCard
              label="Restante"
              value={stats.overdueCount.toLocaleString()}
              subtitle={stats.overdueCount > 0 ? 'Necesită atenție' : 'Totul în regulă'}
              icon={<AlertTriangle className="w-5.5 h-5.5 text-red-600" />}
              iconBg="bg-red-600/10"
              accentColor="red"
            />
          </>
        )}
      </div>

      {/* ====== Filters ====== */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Caută după număr factură, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-5 pr-11 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all cursor-pointer"
          >
            <option value="">Toate Statusurile</option>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
        </div>
      </div>

      {/* ====== Invoice Table ====== */}
      <div className="bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                  Factură
                </th>
                <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                  Contact
                </th>
                <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                  Sumă
                </th>
                <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                  Emisă
                </th>
                <th className="text-left px-6 py-4.5 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                  Scadență
                </th>
                <th className="text-right px-6 py-4.5 text-[13px] font-semibold uppercase text-[var(--text-tertiary)] tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
                        <FileText className="w-7 h-7 text-[var(--text-tertiary)] opacity-50" />
                      </div>
                      <div>
                        <p className="text-[15px] font-medium text-[var(--text-secondary)]">
                          Nicio factură găsită
                        </p>
                        <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
                          {search || statusFilter
                            ? 'Încearcă să ajustezi filtrele'
                            : 'Creează prima factură pentru a începe'}
                        </p>
                      </div>
                      {!search && !statusFilter && (
                        <button
                          onClick={handleCreate}
                          className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[15px] font-semibold shadow-md shadow-indigo-500/20 transition-all"
                        >
                          <Plus className="w-5 h-5" />
                          Creează Factură
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice, index) => {
                  const isOverdue =
                    invoice.status !== 'paid' &&
                    invoice.status !== 'cancelled' &&
                    new Date(invoice.dueDate) < new Date();

                  return (
                    <tr
                      key={invoice.id}
                      className={cn(
                        'border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/60 transition-all duration-200 group animate-fadeInUp',
                        isOverdue && 'bg-red-50/30 dark:bg-red-900/[0.04]'
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {/* Invoice Number */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                            isOverdue ? 'bg-red-500/10' : 'bg-indigo-500/10 group-hover:bg-indigo-500/15'
                          )}>
                            <FileText className={cn('w-5 h-5', isOverdue ? 'text-red-500' : 'text-indigo-500')} />
                          </div>
                          <span className="text-[15px] font-semibold text-[var(--text-primary)]">
                            {invoice.invoiceNumber}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4.5">
                        <span className="text-[15px] text-[var(--text-secondary)]">
                          {invoice.contactName || '--'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4.5">
                        <span className="text-[15px] font-semibold text-[var(--text-primary)]">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold',
                            getStatusColor(invoice.status),
                          )}
                        >
                          {STATUS_ICONS[invoice.status]}
                          {formatStatusLabel(invoice.status)}
                        </span>
                      </td>

                      {/* Issued Date */}
                      <td className="px-6 py-4.5">
                        <span className="text-[14px] text-[var(--text-secondary)]">
                          {invoice.issuedDate ? formatDate(invoice.issuedDate) : '--'}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4.5">
                        <span
                          className={cn(
                            'text-[14px] inline-flex items-center gap-1.5',
                            isOverdue
                              ? 'text-red-500 font-medium'
                              : 'text-[var(--text-secondary)]',
                          )}
                        >
                          {isOverdue && (
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                            </span>
                          )}
                          {invoice.dueDate ? formatDate(invoice.dueDate) : '--'}
                          {isOverdue && (
                            <span className="text-[12px] font-semibold uppercase text-red-500">
                              restantă
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-indigo-500 transition-colors"
                            title="Editează factura"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice)}
                            className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-600 transition-colors"
                            title="Șterge factura"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {!isLoading && invoices.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
            <p className="text-[13px] text-[var(--text-tertiary)]">
              Se afișează {invoices.length} din {total} factur{total !== 1 ? 'i' : 'ă'}
            </p>
            <p className="text-[13px] text-[var(--text-tertiary)]">
              Valoare totală:{' '}
              <span className="font-semibold text-[var(--text-secondary)]">
                {formatCurrency(
                  invoices.reduce(
                    (sum, inv) =>
                      sum + (typeof inv.amount === 'string' ? parseFloat(inv.amount) : inv.amount),
                    0,
                  ),
                )}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* ====== Create / Edit Modal ====== */}
      {showForm && (
        <InvoiceFormModal
          editingInvoice={editingInvoice}
          isPending={createMutation.isPending}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
