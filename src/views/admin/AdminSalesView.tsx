import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  X, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Printer, 
  CheckCircle2, 
  Calendar,
  FileText
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Sale, PaymentMethod, Product, GarmentSize, TrialBooking } from '../../types';

interface AdminSalesViewProps {
  initialBookingForSale?: TrialBooking | null;
  onClearInitialBooking?: () => void;
}

export const AdminSalesView: React.FC<AdminSalesViewProps> = ({
  initialBookingForSale,
  onClearInitialBooking
}) => {
  const { sales, products, recordSale, settings } = useStore();

  const [activeReportTab, setActiveReportTab] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(!!initialBookingForSale);
  const [viewingReceipt, setViewingReceipt] = useState<Sale | null>(null);

  // Billing form state
  const [customerName, setCustomerName] = useState(initialBookingForSale?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialBookingForSale?.customerPhone || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(initialBookingForSale?.productId || products[0]?.id || '');
  const [selectedSize, setSelectedSize] = useState<GarmentSize>(initialBookingForSale?.selectedSize || 'M');
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState(initialBookingForSale ? `VIP Trial converted: ${initialBookingForSale.bookingCode}` : '');

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const unitPrice = selectedProduct?.price || 0;
  const subtotal = unitPrice * quantity;
  const tax = Math.round(subtotal * 0.05); // 5% standard GST on garments
  const totalAmount = Math.max(0, subtotal + tax - discount);

  // Sales Analytics & Summaries
  const salesMetrics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todaySales = sales.filter(s => s.timestamp.startsWith(todayStr));
    const weeklySales = sales.filter(s => new Date(s.timestamp) >= oneWeekAgo);
    const monthlySales = sales.filter(s => new Date(s.timestamp) >= oneMonthAgo);

    const sumToday = todaySales.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const sumWeekly = weeklySales.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const sumMonthly = monthlySales.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const sumAll = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // Payment method breakdown
    const upiTotal = sales.filter(s => s.paymentMethod === 'UPI').reduce((a, c) => a + c.totalAmount, 0);
    const cashTotal = sales.filter(s => s.paymentMethod === 'Cash').reduce((a, c) => a + c.totalAmount, 0);
    const cardTotal = sales.filter(s => s.paymentMethod === 'Card').reduce((a, c) => a + c.totalAmount, 0);

    return {
      sumToday,
      countToday: todaySales.length,
      sumWeekly,
      countWeekly: weeklySales.length,
      sumMonthly,
      countMonthly: monthlySales.length,
      sumAll,
      countAll: sales.length,
      avgOrder: sales.length ? Math.round(sumAll / sales.length) : 0,
      upiTotal,
      cashTotal,
      cardTotal
    };
  }, [sales]);

  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter(s => {
      if (activeReportTab === 'daily') {
        const todayStr = now.toISOString().split('T')[0];
        if (!s.timestamp.startsWith(todayStr)) return false;
      } else if (activeReportTab === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (new Date(s.timestamp) < weekAgo) return false;
      } else if (activeReportTab === 'monthly') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (new Date(s.timestamp) < monthAgo) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.invoiceNumber.toLowerCase().includes(q) || 
               s.customerName.toLowerCase().includes(q) || 
               s.customerPhone.includes(q);
      }
      return true;
    });
  }, [sales, activeReportTab, searchQuery]);

  const handleRecordSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !selectedProduct) return;

    const result = await recordSale({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          size: selectedSize,
          price: selectedProduct.price,
          quantity
        }
      ],
      subtotal,
      discount,
      tax,
      totalAmount,
      paymentMethod,
      trialBookingId: initialBookingForSale?.id,
      soldBy: 'Shilpa (Owner)',
      notes: notes.trim() || undefined
    });

    if (result.success && result.sale) {
      setViewingReceipt(result.sale);
      setIsBillingModalOpen(false);
      if (onClearInitialBooking) onClearInitialBooking();
    }
  };

  return (
    <div className="space-y-4 px-3 pb-24 pt-2">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-brand font-bold text-base tracking-wider uppercase text-[#380B12]">
            Sales & Billing POS
          </h2>
          <p className="text-[11px] text-[#7A6458]">Record walk-in & VIP trial customer invoices</p>
        </div>

        <button
          onClick={() => setIsBillingModalOpen(true)}
          className="px-3 py-2 rounded-xl bg-[#4A0E17] text-[#D4AF37] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow hover:bg-[#380B12] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Bill</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-white border border-[#E8DEC8] shadow-sm text-center">
          <span className="text-[10px] text-[#8F7E75] uppercase font-bold block">Today</span>
          <div className="text-base font-black text-[#2E7D32] mt-0.5">
            ₹{salesMetrics.sumToday.toLocaleString('en-IN')}
          </div>
          <span className="text-[9px] text-[#8F7E75]">{salesMetrics.countToday} Bills</span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#E8DEC8] shadow-sm text-center">
          <span className="text-[10px] text-[#8F7E75] uppercase font-bold block">This Week</span>
          <div className="text-base font-black text-[#4A0E17] mt-0.5">
            ₹{salesMetrics.sumWeekly.toLocaleString('en-IN')}
          </div>
          <span className="text-[9px] text-[#8F7E75]">{salesMetrics.countWeekly} Bills</span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#E8DEC8] shadow-sm text-center">
          <span className="text-[10px] text-[#8F7E75] uppercase font-bold block">Avg Bill</span>
          <div className="text-base font-black text-[#380B12] mt-0.5">
            ₹{salesMetrics.avgOrder.toLocaleString('en-IN')}
          </div>
          <span className="text-[9px] text-[#8F7E75]">Per Customer</span>
        </div>
      </div>

      {/* Payment Split */}
      <div className="p-3 bg-[#FAF6EE] rounded-2xl border border-[#EADBCA] flex items-center justify-around text-xs text-[#543D32]">
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <div>
            <div className="text-[10px] text-[#8F7E75]">UPI Payments</div>
            <strong className="text-xs">₹{salesMetrics.upiTotal.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-amber-600" />
          <div>
            <div className="text-[10px] text-[#8F7E75]">Cash Payments</div>
            <strong className="text-xs">₹{salesMetrics.cashTotal.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-indigo-600" />
          <div>
            <div className="text-[10px] text-[#8F7E75]">Card Payments</div>
            <strong className="text-xs">₹{salesMetrics.cardTotal.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>

      {/* Report Periods Tabs */}
      <div className="flex gap-1.5">
        {(['all', 'daily', 'weekly', 'monthly'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveReportTab(tab)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
              activeReportTab === tab
                ? 'bg-[#4A0E17] text-[#D4AF37] shadow'
                : 'bg-white text-[#543D32] border border-[#E0D5C3]'
            }`}
          >
            {tab === 'all' ? 'All Invoices' : `${tab} View`}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8F7E75] absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search by invoice number, customer name, phone..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#E0D5C3] text-[#241315] focus:outline-none focus:border-[#4A0E17]"
        />
      </div>

      {/* Invoices List */}
      <div className="space-y-2.5">
        {filteredSales.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8DEC8] p-6 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-[#8F7E75]" />
            <h4 className="font-bold text-sm text-[#380B12]">No Sales Records</h4>
            <p className="text-xs text-[#8F7E75]">Click "New Bill" to generate your first boutique sales invoice.</p>
          </div>
        ) : (
          filteredSales.map(sale => (
            <div
              key={sale.id}
              onClick={() => setViewingReceipt(sale)}
              className="p-3.5 bg-white rounded-2xl border border-[#E8DEC8] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#4A0E17] transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#4A0E17]">
                    {sale.invoiceNumber}
                  </span>
                  <span className="text-[10px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded font-semibold">
                    {sale.paymentMethod}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#380B12]">{sale.customerName}</div>
                <div className="text-[10px] text-[#8F7E75]">
                  {new Date(sale.timestamp).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-extrabold text-[#4A0E17]">
                  ₹{sale.totalAmount.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-[#2E7D32] font-bold">Paid</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Sale POS Modal */}
      {isBillingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FDFBF7] text-[#241315] w-full max-w-md max-h-[92vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-[#D4AF37]/40">
            <div className="bg-[#4A0E17] text-[#FDFBF7] px-4 py-3 flex items-center justify-between">
              <h3 className="font-brand font-bold text-sm tracking-wider uppercase">
                Boutique Counter POS Billing
              </h3>
              <button
                onClick={() => {
                  setIsBillingModalOpen(false);
                  if (onClearInitialBooking) onClearInitialBooking();
                }}
                className="p-1 text-[#FDFBF7]/80 hover:text-[#FDFBF7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSaleSubmit} className="overflow-y-auto p-4 space-y-3.5 text-xs no-scrollbar">
              {/* Customer details */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Product selection */}
              <div>
                <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Select Garment *</label>
                <select
                  value={selectedProductId}
                  onChange={e => {
                    setSelectedProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p && p.sizes[0]) setSelectedSize(p.sizes[0]);
                  }}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price.toLocaleString('en-IN')} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Size & Quantity */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e: any) => setSelectedSize(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                  >
                    {selectedProduct?.sizes.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedProduct?.stock || 10}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1.5">Payment Method</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['UPI', 'Cash', 'Card', 'Bank Transfer'] as PaymentMethod[]).map(mode => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setPaymentMethod(mode)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                        paymentMethod === mode
                          ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37]'
                          : 'bg-white text-[#4A3C38] border-[#E0D5C3]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Input */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A0E17] uppercase tracking-wider mb-1">Sales Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Bridal special discount"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E0D5C3] text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#EADBCA] space-y-1.5 text-xs text-[#543D32]">
                <div className="flex justify-between">
                  <span>Subtotal ({quantity} item):</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%):</span>
                  <span>+₹{tax.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount applied:</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-[#4A0E17] pt-1 border-t border-[#E0D5C3]">
                  <span>Total Payable:</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#4A0E17] text-[#D4AF37] font-bold text-xs uppercase tracking-wider shadow hover:bg-[#380B12] transition-colors"
                >
                  Generate Invoice & Collect ₹{totalAmount.toLocaleString('en-IN')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal View */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-[#241315] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/50 p-5 space-y-4">
            {/* Receipt Header */}
            <div className="text-center space-y-1 pb-3 border-b border-[#EADBCA]">
              <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                Official Boutique Tax Invoice
              </div>
              <h3 className="font-brand font-extrabold text-base text-[#4A0E17]">
                {settings.storeName}
              </h3>
              <p className="text-[10px] text-[#7A6458]">{settings.address}, {settings.city}</p>
              <p className="text-[10px] text-[#7A6458]">Tel: {settings.phone}</p>
            </div>

            {/* Bill Details */}
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#8F7E75]">Invoice No:</span>
                <strong className="font-mono text-[#4A0E17]">{viewingReceipt.invoiceNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8F7E75]">Date:</span>
                <span>{new Date(viewingReceipt.timestamp).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8F7E75]">Customer:</span>
                <strong>{viewingReceipt.customerName} ({viewingReceipt.customerPhone})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8F7E75]">Payment Mode:</span>
                <span className="font-semibold text-emerald-800">{viewingReceipt.paymentMethod}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2 border-t border-b border-[#EADBCA] text-xs space-y-2">
              {viewingReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-[#380B12]">{item.productName}</div>
                    <div className="text-[10px] text-[#8F7E75]">Size: {item.size} • Qty: {item.quantity}</div>
                  </div>
                  <div className="font-semibold text-[#4A0E17]">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-[#8F7E75]">
                <span>Subtotal:</span>
                <span>₹{viewingReceipt.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#8F7E75]">
                <span>GST (5%):</span>
                <span>₹{viewingReceipt.tax.toLocaleString('en-IN')}</span>
              </div>
              {viewingReceipt.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-₹{viewingReceipt.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-[#4A0E17] pt-1 border-t border-neutral-200">
                <span>Grand Total:</span>
                <span>₹{viewingReceipt.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-[#8F7E75] italic pt-1">
              Thank you for visiting Shilpa Dresses. Handcrafted couture guaranteed.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-[#4A0E17] text-[#4A0E17] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#FAF6EE]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setViewingReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#4A0E17] text-[#D4AF37] text-xs font-bold uppercase tracking-wider shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
