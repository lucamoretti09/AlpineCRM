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
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'viewed', label: 'Viewed' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'cancelled', label: 'Cancelled' },
];

const STATUS_ICONS: Record<InvoiceStatus, React.ReactNode> = {
  draft: <FileText className="w-3.5 h-3.5" />,
  sent: <Send className="w-3.5 h-3.5" />,
  viewed: <Eye className="w-3.5 h-3.5" />,
  paid: <CheckCircle2 className="w-3.5 h-3.5" />,
  overdue: <AlertTriangle className="w-3.5 h-3.5" />,
  cancelled: <Ban className="w-3.5 h-3.5" />,
};

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
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-9 w-9 rounded-lg" />
      </div>
      <div className="skeleton h-7 w-20 rounded mb-1" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-[var(--border-color)]">
      <td className="px-6 py-4"><div className="skeleton h-5 w-28 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-5 w-36 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-5 w-20 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-5 w-16 rounded-full" /></td>
      <td className="px-6 py-4"><div className="skeleton h-5 w-24 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-5 w-24 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-5 w-16 rounded" /></td>
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
}

function StatCard({ label, value, subtitle, icon, iconBg }: StatCardProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 hover:border-primary-500/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconBg)}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="text-xs text-[var(--text-tertiary)] mt-1">{subtitle}</p>
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
      toast.error('Add at least one line item with a description');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl mx-4 animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {editingInvoice
                ? `Editing ${editingInvoice.invoiceNumber}`
                : 'Fill in the details to create a new invoice'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-tertiary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Top fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Contact ID
                </label>
                <input
                  name="contactId"
                  defaultValue={editingInvoice?.contactId || ''}
                  placeholder="Optional"
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Due Date *
                </label>
                <input
                  name="dueDate"
                  type="date"
                  required
                  defaultValue={editingInvoice?.dueDate?.split('T')[0] || ''}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  Line Items *
                </label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>
              </div>

              <div className="space-y-2">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_80px_100px_36px] gap-2 px-1">
                  <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                    Description
                  </span>
                  <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                    Qty
                  </span>
                  <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                    Unit Price
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
                      placeholder="Item description"
                      className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 transition-colors"
                    />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateLineItem(item.id, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length <= 1}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        lineItems.length <= 1
                          ? 'text-[var(--text-tertiary)] opacity-30 cursor-not-allowed'
                          : 'text-[var(--text-secondary)] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20',
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Tax */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Subtotal</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--text-secondary)]">Tax</span>
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
                      className="w-16 px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-xs text-[var(--text-primary)] text-center focus:outline-none focus:border-primary-500 transition-colors"
                    />
                    <span className="text-xs text-[var(--text-tertiary)]">%</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {formatCurrency(taxAmount)}
                </span>
              </div>
              <div className="border-t border-[var(--border-color)] pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Total</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={editingInvoice?.notes || ''}
                placeholder="Additional notes or payment instructions..."
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 resize-none transition-colors"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 p-6 border-t border-[var(--border-color)]">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isPending ? 'Saving...' : editingInvoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Cancel
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

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '50');
      const { data } = await api.get(`/invoices?${params}`);
      return data.data;
    },
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
      toast.success(editingInvoice ? 'Invoice updated' : 'Invoice created');
      setShowForm(false);
      setEditingInvoice(null);
    },
    onError: () => toast.error('Failed to save invoice'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted');
    },
    onError: () => toast.error('Failed to delete invoice'),
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
    if (confirm(`Delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) {
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
    <div className="space-y-6 animate-fadeIn">
      {/* ====== Header ====== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Invoices</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage and track your invoices
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* ====== Stats Summary ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Invoices"
              value={total.toLocaleString()}
              subtitle={`${invoices.length} shown`}
              icon={<Receipt className="w-4.5 h-4.5 text-primary-600" />}
              iconBg="bg-primary-600/10"
            />
            <StatCard
              label="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              subtitle="From paid invoices"
              icon={<TrendingUp className="w-4.5 h-4.5 text-green-600" />}
              iconBg="bg-green-600/10"
            />
            <StatCard
              label="Paid"
              value={stats.paidCount.toLocaleString()}
              subtitle={`${total > 0 ? Math.round((stats.paidCount / total) * 100) : 0}% of total`}
              icon={<CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />}
              iconBg="bg-emerald-600/10"
            />
            <StatCard
              label="Overdue"
              value={stats.overdueCount.toLocaleString()}
              subtitle={stats.overdueCount > 0 ? 'Needs attention' : 'All clear'}
              icon={<AlertTriangle className="w-4.5 h-4.5 text-red-600" />}
              iconBg="bg-red-600/10"
            />
          </>
        )}
      </div>

      {/* ====== Filters ====== */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search by invoice number, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
        </div>
      </div>

      {/* ====== Invoice Table ====== */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)] tracking-wide">
                  Invoice
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)] tracking-wide">
                  Contact
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)] tracking-wide">
                  Amount
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)] tracking-wide">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)] tracking-wide">
                  Issued
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)] tracking-wide">
                  Due Date
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold uppercase text-[var(--text-tertiary)] tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[var(--text-tertiary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-secondary)]">
                          No invoices found
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                          {search || statusFilter
                            ? 'Try adjusting your filters'
                            : 'Create your first invoice to get started'}
                        </p>
                      </div>
                      {!search && !statusFilter && (
                        <button
                          onClick={handleCreate}
                          className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Create Invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const isOverdue =
                    invoice.status !== 'paid' &&
                    invoice.status !== 'cancelled' &&
                    new Date(invoice.dueDate) < new Date();

                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors group"
                    >
                      {/* Invoice Number */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="font-medium text-[var(--text-primary)]">
                            {invoice.invoiceNumber}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-[var(--text-secondary)]">
                          {invoice.contactName || '--'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                            getStatusColor(invoice.status),
                          )}
                        >
                          {STATUS_ICONS[invoice.status]}
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>

                      {/* Issued Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-[var(--text-secondary)]">
                          {invoice.issuedDate ? formatDate(invoice.issuedDate) : '--'}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'text-sm',
                            isOverdue
                              ? 'text-red-500 font-medium'
                              : 'text-[var(--text-secondary)]',
                          )}
                        >
                          {invoice.dueDate ? formatDate(invoice.dueDate) : '--'}
                          {isOverdue && (
                            <span className="ml-1.5 text-[10px] font-semibold uppercase text-red-500">
                              overdue
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-primary-600 transition-colors"
                            title="Edit invoice"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-600 transition-colors"
                            title="Delete invoice"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
            <p className="text-xs text-[var(--text-tertiary)]">
              Showing {invoices.length} of {total} invoice{total !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Total value:{' '}
              <span className="font-medium text-[var(--text-secondary)]">
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
