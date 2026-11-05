import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  Check, 
  X, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MessageCircle, 
  Receipt, 
  AlertCircle,
  Filter
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BookingStatus, TrialBooking } from '../../types';

interface AdminBookingsViewProps {
  onStartSaleFromBooking: (booking: TrialBooking) => void;
}

export const AdminBookingsView: React.FC<AdminBookingsViewProps> = ({
  onStartSaleFromBooking
}) => {
  const { bookings, updateBookingStatus } = useStore();

  const [activeStatusFilter, setActiveStatusFilter] = useState<BookingStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectReasonModalId, setRejectReasonModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Slot unavailable due to prior VIP salon appointment');

  const statusTabs: Array<BookingStatus | 'All'> = [
    'All',
    'Pending',
    'Accepted',
    'Completed',
    'Rejected',
    'Cancelled'
  ];

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (activeStatusFilter !== 'All' && b.status !== activeStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.customerName.toLowerCase().includes(q);
        const matchPhone = b.customerPhone.includes(q);
        const matchCode = b.bookingCode.toLowerCase().includes(q);
        const matchProduct = b.productName.toLowerCase().includes(q);
        return matchName || matchPhone || matchCode || matchProduct;
      }
      return true;
    });
  }, [bookings, activeStatusFilter, searchQuery]);

  const handleConfirmReject = async () => {
    if (rejectReasonModalId) {
      await updateBookingStatus(rejectReasonModalId, 'Rejected', rejectReason);
      setRejectReasonModalId(null);
    }
  };

  return (
    <div className="space-y-4 px-3 pb-24 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#4A0E17]" />
          <h2 className="font-brand font-bold text-base tracking-wider uppercase text-[#380B12]">
            VIP Trial Bookings Management
          </h2>
        </div>
        <span className="text-xs bg-[#FAF6EE] text-[#4A0E17] font-bold px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
          {filteredBookings.length} Bookings
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8F7E75] absolute left-3.5 top-2.5" />
        <input
          type="text"
          placeholder="Search by customer, phone, product, or booking code..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E0D5C3] text-xs text-[#241315] placeholder:text-[#8F7E75] focus:outline-none focus:border-[#4A0E17] shadow-sm"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {statusTabs.map(tab => {
          const isSelected = activeStatusFilter === tab;
          const count = tab === 'All' ? bookings.length : bookings.filter(b => b.status === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37] shadow'
                  : 'bg-white text-[#543D32] border border-[#E0D5C3] hover:border-[#D4AF37]'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 rounded-full ${isSelected ? 'bg-[#380B12] text-[#D4AF37]' : 'bg-neutral-100 text-neutral-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-[#E8DEC8] text-center p-6 space-y-2">
            <ClipboardList className="w-10 h-10 mx-auto text-[#8F7E75]" />
            <h4 className="font-bold text-sm text-[#380B12]">No Bookings Found</h4>
            <p className="text-xs text-[#8F7E75]">No appointments match the selected filter or search keyword.</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-4 border border-[#E8DEC8] shadow-sm space-y-3"
            >
              {/* Header: ID, Date, Status */}
              <div className="flex items-center justify-between pb-2 border-b border-[#EADBCA] text-xs">
                <span className="font-mono font-bold text-[#4A0E17] text-sm">
                  {booking.bookingCode}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#380B12]">
                    {booking.trialDate} @ {booking.trialTimeSlot}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    booking.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                    booking.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                    booking.status === 'Completed' ? 'bg-indigo-100 text-indigo-800' :
                    booking.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-neutral-100 text-neutral-600'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Product and Customer */}
              <div className="flex gap-3">
                <img
                  src={booking.productImage}
                  alt=""
                  className="w-14 h-16 object-cover rounded-xl border border-[#E0D5C3]"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-xs text-[#380B12] line-clamp-1">
                    {booking.productName}
                  </h4>
                  <div className="text-[11px] text-[#6B5A51] flex items-center gap-2">
                    <span>Size: <strong className="text-[#4A0E17]">{booking.selectedSize}</strong></span>
                    <span>•</span>
                    <span className="font-semibold text-[#4A0E17]">₹{booking.productPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#241315]">
                    Client: {booking.customerName} ({booking.customerPhone})
                  </div>
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="p-2 bg-[#FAF6EE] rounded-lg border border-[#EADBCA] text-[11px] text-[#6B5A51]">
                  <strong>Client Request:</strong> {booking.notes}
                </div>
              )}

              {/* Quick Communication & Status Operations */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EADBCA]">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${booking.customerPhone}`}
                    className="p-1.5 rounded-lg bg-[#FAF6EE] text-[#4A0E17] hover:bg-[#4A0E17] hover:text-[#D4AF37] border border-[#D4AF37]/30 transition-colors"
                    title="Call Customer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`https://wa.me/91${booking.customerPhone.replace(/[^0-9]/g, '')}?text=Namaste%20${encodeURIComponent(booking.customerName)},%20this%20is%20Shilpa%20Dresses%20regarding%20your%20trial%20for%20${encodeURIComponent(booking.productName)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors"
                    title="WhatsApp Customer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-1.5">
                  {booking.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'Accepted', 'Approved by owner')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setRejectReasonModalId(booking.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {booking.status === 'Accepted' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'Completed', 'Trial successfully attended')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </button>

                      {/* Convert to Sale */}
                      <button
                        onClick={() => onStartSaleFromBooking(booking)}
                        className="px-2.5 py-1 rounded-lg bg-[#D4AF37] text-[#4A0E17] text-xs font-extrabold hover:bg-[#F3E5AB] shadow-sm flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Bill Customer</span>
                      </button>
                    </>
                  )}

                  {booking.status === 'Completed' && (
                    <button
                      onClick={() => onStartSaleFromBooking(booking)}
                      className="px-2.5 py-1 rounded-lg bg-[#4A0E17] text-[#D4AF37] text-xs font-bold hover:bg-[#380B12] shadow-sm flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Create Invoice</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectReasonModalId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-2xl border border-red-200">
            <h4 className="font-bold text-sm text-[#380B12]">Decline Booking Request</h4>
            <p className="text-xs text-[#8F7E75]">
              Provide a reason to notify the client regarding the slot:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectReasonModalId(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white shadow"
              >
                Decline Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
