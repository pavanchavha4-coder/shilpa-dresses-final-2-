import React from 'react';
import { 
  CalendarClock, 
  AlertCircle, 
  ShoppingBag, 
  Receipt, 
  TrendingUp, 
  Plus, 
  Check, 
  X, 
  ChevronRight, 
  Layers, 
  PhoneCall, 
  MessageCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { OwnerTab } from '../../components/BottomNav';

interface AdminDashboardViewProps {
  onNavigateTab: (tab: OwnerTab) => void;
  onOpenNewProductModal: () => void;
  onOpenNewSaleModal: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigateTab,
  onOpenNewProductModal,
  onOpenNewSaleModal
}) => {
  const { 
    bookings, 
    products, 
    sales, 
    updateBookingStatus, 
    adjustStock 
  } = useStore();

  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

  // Calculate sales metrics
  const totalSalesAmount = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const todayIso = new Date().toISOString().split('T')[0];
  const todaySales = sales
    .filter(s => s.timestamp.startsWith(todayIso))
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="space-y-4 px-3 pb-24 pt-2">
      {/* Top Welcome Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#4A0E17] to-[#380B12] text-[#FDFBF7] border border-[#D4AF37]/40 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
            Owner Control Center
          </span>
          <h2 className="text-lg font-bold font-brand tracking-wider text-[#FDFBF7]">
            SHILPA DRESSES SALON
          </h2>
          <p className="text-xs text-[#FDFBF7]/80 mt-0.5">
            {pendingBookings.length > 0
              ? `Attention: ${pendingBookings.length} VIP trial requests awaiting your confirmation.`
              : 'All pending trial requests are cleared.'}
          </p>
        </div>

        <button
          onClick={onOpenNewSaleModal}
          className="px-3 py-2 rounded-xl bg-[#D4AF37] text-[#4A0E17] text-xs font-bold uppercase tracking-wider shadow hover:bg-[#F3E5AB] transition-colors flex items-center gap-1 flex-shrink-0"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>New Bill</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Pending Bookings */}
        <div 
          onClick={() => onNavigateTab('bookings')}
          className="bg-white p-3.5 rounded-2xl border border-[#E8DEC8] shadow-sm cursor-pointer hover:border-[#4A0E17] transition-all"
        >
          <div className="flex items-center justify-between text-[#8F7E75]">
            <span className="text-xs font-semibold">Pending Trials</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {pendingBookings.length}
          </div>
          <div className="text-[10px] text-[#8F7E75] mt-0.5 flex items-center gap-1">
            <span>Total Bookings: {bookings.length}</span>
            <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => onNavigateTab('stock')}
          className="bg-white p-3.5 rounded-2xl border border-[#E8DEC8] shadow-sm cursor-pointer hover:border-[#4A0E17] transition-all"
        >
          <div className="flex items-center justify-between text-[#8F7E75]">
            <span className="text-xs font-semibold">Stock Alerts</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-700 mt-1">
            {lowStockProducts.length}
          </div>
          <div className="text-[10px] text-[#8F7E75] mt-0.5 flex items-center gap-1">
            <span>Catalog Items: {products.length}</span>
            <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
          </div>
        </div>

        {/* Today's Sales */}
        <div 
          onClick={() => onNavigateTab('sales')}
          className="bg-white p-3.5 rounded-2xl border border-[#E8DEC8] shadow-sm cursor-pointer hover:border-[#4A0E17] transition-all"
        >
          <div className="flex items-center justify-between text-[#8F7E75]">
            <span className="text-xs font-semibold">Today's Revenue</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#2E7D32] mt-1">
            ₹{todaySales.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-[#8F7E75] mt-0.5">
            Cash & UPI billing
          </div>
        </div>

        {/* Total Sales Volume */}
        <div 
          onClick={() => onNavigateTab('sales')}
          className="bg-white p-3.5 rounded-2xl border border-[#E8DEC8] shadow-sm cursor-pointer hover:border-[#4A0E17] transition-all"
        >
          <div className="flex items-center justify-between text-[#8F7E75]">
            <span className="text-xs font-semibold">Total Revenue</span>
            <div className="p-1.5 rounded-lg bg-[#FAF6EE] text-[#4A0E17]">
              <Receipt className="w-4 h-4 text-[#D4AF37]" />
            </div>
          </div>
          <div className="text-xl font-black text-[#4A0E17] mt-1">
            ₹{totalSalesAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-[#8F7E75] mt-0.5">
            {sales.length} Invoices recorded
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenNewProductModal}
          className="p-2.5 rounded-xl bg-white border border-[#E0D5C3] hover:border-[#4A0E17] shadow-sm flex flex-col items-center text-center transition-all"
        >
          <div className="p-1.5 rounded-lg bg-[#4A0E17]/10 text-[#4A0E17] mb-1">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#380B12]">Add Outfit</span>
        </button>

        <button
          onClick={() => onNavigateTab('bookings')}
          className="p-2.5 rounded-xl bg-white border border-[#E0D5C3] hover:border-[#4A0E17] shadow-sm flex flex-col items-center text-center transition-all"
        >
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 mb-1">
            <CalendarClock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#380B12]">Review Trials</span>
        </button>

        <button
          onClick={() => onNavigateTab('settings')}
          className="p-2.5 rounded-xl bg-white border border-[#E0D5C3] hover:border-[#4A0E17] shadow-sm flex flex-col items-center text-center transition-all"
        >
          <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#4A0E17] mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#380B12]">Store Slots</span>
        </button>
      </div>

      {/* Pending Bookings Needing Action */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DEC8] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="w-4 h-4 text-amber-600" />
            <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-[#380B12]">
              Action Needed: Pending Trials ({pendingBookings.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-[11px] text-[#4A0E17] font-bold hover:underline"
          >
            Manage All
          </button>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#8F7E75]">
            No pending trial requests at the moment.
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingBookings.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="p-3 rounded-xl bg-[#FAF6EE] border border-[#EADBCA] space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#4A0E17]">{booking.bookingCode}</span>
                  <span className="text-[#380B12] font-semibold">{booking.trialDate} @ {booking.trialTimeSlot}</span>
                </div>

                <div className="flex gap-2.5 items-center">
                  <img
                    src={booking.productImage}
                    alt=""
                    className="w-10 h-12 object-cover rounded-lg border border-[#D4AF37]/30"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-[#380B12] truncate">{booking.productName}</div>
                    <div className="text-[11px] text-[#7A6458]">
                      Guest: <strong>{booking.customerName}</strong> ({booking.customerPhone})
                    </div>
                  </div>
                </div>

                {/* 1-click Accept / Reject */}
                <div className="flex gap-2 pt-1 border-t border-[#EADBCA]">
                  <button
                    onClick={() => updateBookingStatus(booking.id, 'Accepted', 'Confirmed by owner')}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm hover:bg-emerald-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept VIP Slot</span>
                  </button>
                  <button
                    onClick={() => updateBookingStatus(booking.id, 'Rejected', 'Slot conflicting with salon VIP event')}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm hover:bg-rose-700"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Watchlist */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <h3 className="font-brand font-bold text-xs uppercase tracking-wider">
                Low Stock Warning ({lowStockProducts.length} Items)
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('stock')}
              className="text-[11px] text-[#4A0E17] font-bold hover:underline"
            >
              Restock
            </button>
          </div>

          <div className="space-y-2">
            {lowStockProducts.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded-xl bg-red-50/60 border border-red-100 text-xs"
              >
                <div className="flex items-center gap-2">
                  <img src={item.imageUrl} alt="" className="w-9 h-10 object-cover rounded-lg" />
                  <div>
                    <div className="font-bold text-[#380B12] line-clamp-1">{item.name}</div>
                    <div className="text-[10px] text-red-700 font-semibold">
                      Stock: {item.stock} left (Threshold: {item.lowStockThreshold})
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => adjustStock(item.id, 5)}
                  className="px-2.5 py-1 bg-white border border-[#4A0E17] text-[#4A0E17] text-[10px] font-bold rounded-lg shadow-sm hover:bg-[#4A0E17] hover:text-[#D4AF37]"
                >
                  +5 Stock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
