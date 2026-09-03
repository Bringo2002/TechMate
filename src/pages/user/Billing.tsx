import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Receipt,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  RefreshCw,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import * as invoicesService from '../../services/invoices.service';
import type { InvoiceRow } from '../../types/database.types';
import type { InvoiceStats } from '../../services/invoices.service';
import Pagination from '../../components/Pagination';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================================
// STATUS HELPERS
// ============================================================================

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
    paid: { label: 'Paid', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
    sent: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock },
    overdue: { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle },
    draft: { label: 'Draft', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: FileText },
    cancelled: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: FileText },
    refunded: { label: 'Refunded', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: RefreshCw },
  };
  return configs[status] || configs['draft'];
};

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Billing() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null);
  const pageSize = 10;

  useEffect(() => {
    if (user) loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [invoiceRes, statsRes] = await Promise.all([
        invoicesService.getUserInvoices(user.id),
        invoicesService.getInvoiceStats(user.id),
      ]);

      if (invoiceRes.error) {
        toast.error('Failed to load invoices');
      } else {
        setInvoices(invoiceRes.data || []);
      }
      setStats(statsRes);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  // PDF download handler — real PDF via jsPDF + autoTable, not a
  // plain-text file dressed up with box-drawing characters.
  const handleDownloadPdf = (invoice: InvoiceRow) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const statusConfig = getStatusConfig(invoice.status);

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TechMate', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Innovative Tech Solutions', 14, 26);

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 14, 20, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(invoice.invoice_number ?? '—', pageWidth - 14, 26, { align: 'right' });

    doc.setDrawColor(220);
    doc.line(14, 32, pageWidth - 14, 32);

    // Billed to / dates / status
    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO', 14, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.name ?? 'Client', 14, 48);
    doc.text(user?.email ?? '', 14, 53);

    doc.setFont('helvetica', 'bold');
    doc.text('DATE ISSUED', pageWidth - 70, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(invoice.created_at) ?? '—', pageWidth - 70, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('DUE DATE', pageWidth - 30, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(invoice.due_date) ?? '—', pageWidth - 30, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('STATUS', pageWidth - 70, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(statusConfig.label.toUpperCase(), pageWidth - 70, 64);

    // Line-item summary table. Invoices in this schema are aggregate
    // (amount + tax_amount = total_amount), not itemized line-by-line —
    // this table reflects that honestly rather than inventing fake
    // line items to look more detailed than the data actually is.
    autoTable(doc, {
      startY: 74,
      head: [['Description', 'Amount']],
      body: [
        ['Subtotal', formatCurrency(invoice.amount, invoice.currency)],
        ['Tax', formatCurrency(invoice.tax_amount, invoice.currency)],
      ],
      foot: [['Total', formatCurrency(invoice.total_amount, invoice.currency)]],
      theme: 'plain',
      headStyles: { fillColor: [15, 15, 25], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [240, 240, 245], textColor: 0, fontStyle: 'bold', fontSize: 11 },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 1: { halign: 'right' } },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let finalY = (doc as any).lastAutoTable?.finalY ?? 110;

    // Payment info, if paid
    if (invoice.paid_date || invoice.payment_method || invoice.payment_reference) {
      finalY += 12;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT DETAILS', 14, finalY);
      doc.setFont('helvetica', 'normal');
      let y = finalY + 6;
      if (invoice.paid_date) { doc.text(`Paid on: ${formatDate(invoice.paid_date)}`, 14, y); y += 5; }
      if (invoice.payment_method) { doc.text(`Method: ${invoice.payment_method}`, 14, y); y += 5; }
      if (invoice.payment_reference) { doc.text(`Reference: ${invoice.payment_reference}`, 14, y); y += 5; }
      finalY = y;
    }

    // Notes
    if (invoice.notes) {
      finalY += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('NOTES', 14, finalY);
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 28);
      doc.text(noteLines, 14, finalY + 6);
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 14, { align: 'center' });

    doc.save(`${invoice.invoice_number ?? 'invoice'}.pdf`);
    toast.success(`Downloaded ${invoice.invoice_number}`);
  };

  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const outstandingInvoices = invoices.filter(i => ['sent', 'overdue'].includes(i.status));

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 animate-pulse">
              <div className="h-3 w-20 bg-slate-800 rounded mb-3" />
              <div className="h-8 w-28 bg-slate-800 rounded mb-2" />
              <div className="h-3 w-16 bg-slate-800/50 rounded" />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 bg-slate-800 rounded-xl" />
                <div className="flex-1"><div className="h-4 w-32 bg-slate-800 rounded mb-2" /><div className="h-3 w-48 bg-slate-800/50 rounded" /></div>
                <div className="h-4 w-20 bg-slate-800 rounded" />
                <div className="h-6 w-16 bg-slate-800 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 font-orbitron flex items-center gap-3">
              <Receipt className="text-emerald-400" />
              Invoices & Payments
            </h1>
            <p className="text-slate-400">Track your project payments and download invoices.</p>
          </div>
          <button
            onClick={() => window.open('mailto:billing@techmate.dev', '_blank')}
            className="bg-slate-800/60 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium border border-white/10 transition-all flex items-center gap-2 hover:border-white/20"
          >
            <HelpCircle size={16} />
            Billing Support
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl group hover:border-emerald-500/20 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                <DollarSign size={18} />
              </div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Paid</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-orbitron">{formatCurrency(stats?.totalPaid || 0)}</p>
            <p className="text-xs text-slate-500 mt-1">{paidInvoices.length} invoices</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl group hover:border-amber-500/20 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                <Clock size={18} />
              </div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Outstanding</p>
            </div>
            <p className="text-2xl font-bold text-amber-400 font-orbitron">{formatCurrency(stats?.totalOutstanding || 0)}</p>
            <p className="text-xs text-slate-500 mt-1">{outstandingInvoices.length} pending</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl group hover:border-indigo-500/20 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                <TrendingUp size={18} />
              </div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Invoiced</p>
            </div>
            <p className="text-2xl font-bold text-white font-orbitron">{formatCurrency(stats?.totalInvoiced || 0)}</p>
            <p className="text-xs text-slate-500 mt-1">{stats?.invoiceCount || 0} total</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl group hover:border-red-500/20 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-400 group-hover:scale-110 transition-transform">
                <AlertTriangle size={18} />
              </div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Overdue</p>
            </div>
            <p className="text-2xl font-bold text-red-400 font-orbitron">{stats?.overdueCount || 0}</p>
            <p className="text-xs text-slate-500 mt-1">require attention</p>
          </motion.div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#0a0a16]/60 backdrop-blur-xl border border-white/5 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by invoice number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
            />
          </div>
          <div className="relative min-w-[150px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="sent">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-[#0a0a16]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-xs uppercase tracking-wider font-semibold text-slate-500">
            <div className="col-span-3">Invoice</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Invoice Rows */}
          <AnimatePresence mode="popLayout">
            {paginatedInvoices.length > 0 ? (
              paginatedInvoices.map((invoice, i) => {
                const status = getStatusConfig(invoice.status);
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center px-6 py-5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Invoice Number & Notes */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 border border-white/5 shrink-0 group-hover:text-cyan-400 transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{invoice.invoice_number}</p>
                        <p className="text-slate-500 text-xs truncate max-w-[180px]">{invoice.notes || 'Project invoice'}</p>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="col-span-2">
                      <p className="text-slate-300 text-sm">{formatDate(invoice.created_at)}</p>
                    </div>

                    {/* Due Date */}
                    <div className="col-span-2">
                      <p className={`text-sm ${invoice.status === 'overdue' ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
                        {formatDate(invoice.due_date)}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="col-span-2 text-right">
                      <p className="text-white font-bold text-sm font-mono">
                        {formatCurrency(invoice.total_amount || invoice.amount, invoice.currency)}
                      </p>
                      {invoice.tax_amount > 0 && (
                        <p className="text-slate-500 text-xs">incl. {formatCurrency(invoice.tax_amount)} tax</p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="col-span-1 flex justify-center">
                      <div className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-bold border ${status.bg} ${status.color} ${status.border}`}>
                        <StatusIcon size={12} />
                        <span className="hidden lg:inline">{status.label}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-2">
                      {invoice.payment_reference && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(invoice.payment_reference || '');
                            toast.success('Payment reference copied');
                          }}
                          className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                          title="Copy payment reference"
                        >
                          <CreditCard size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadPdf(invoice)}
                        className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                        title="Download Invoice"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        title="View details"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt size={32} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No invoices found</h3>
                <p className="text-slate-400">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters.'
                    : 'Your invoices will appear here once your projects begin.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInvoices.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />

        {/* Footer Note */}
        {invoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mt-4 px-2"
          >
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles size={12} className="text-slate-600" />
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </p>
            <button
              onClick={loadData}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </motion.div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedInvoice(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white font-orbitron">{selectedInvoice.invoice_number}</h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {(() => {
                const s = getStatusConfig(selectedInvoice.status);
                const SIcon = s.icon;
                return (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border mb-6 ${s.bg} ${s.color} ${s.border}`}>
                    <SIcon size={14} /> {s.label}
                  </div>
                );
              })()}

              <div className="space-y-4">
                {[
                  { label: 'Date', value: formatDate(selectedInvoice.created_at) },
                  { label: 'Due Date', value: formatDate(selectedInvoice.due_date) },
                  { label: 'Subtotal', value: formatCurrency(selectedInvoice.amount, selectedInvoice.currency) },
                  { label: 'Tax', value: formatCurrency(selectedInvoice.tax_amount, selectedInvoice.currency) },
                  { label: 'Total', value: formatCurrency(selectedInvoice.total_amount, selectedInvoice.currency), highlight: true },
                  ...(selectedInvoice.paid_date ? [{ label: 'Paid On', value: formatDate(selectedInvoice.paid_date) }] : []),
                  ...(selectedInvoice.payment_method ? [{ label: 'Payment Method', value: selectedInvoice.payment_method }] : []),
                  ...(selectedInvoice.payment_reference ? [{ label: 'Reference', value: selectedInvoice.payment_reference }] : []),
                ].map((row, i) => (
                  <div key={i} className={`flex items-center justify-between py-3 px-4 rounded-lg ${(row as Record<string, unknown>).highlight ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-800/30 border border-white/5'}`}>
                    <span className="text-slate-400 text-sm">{row.label}</span>
                    <span className={`text-sm font-medium ${(row as Record<string, unknown>).highlight ? 'text-cyan-400 font-bold' : 'text-white'}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              {selectedInvoice.notes && (
                <div className="mt-6 p-4 bg-slate-800/20 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">Notes</p>
                  <p className="text-slate-300 text-sm">{selectedInvoice.notes}</p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { handleDownloadPdf(selectedInvoice); setSelectedInvoice(null); }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Download
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
