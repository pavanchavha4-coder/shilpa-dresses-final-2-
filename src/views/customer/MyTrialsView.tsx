import React, { useState, useMemo } from 'react';
import { 
  CalendarClock, 
  Search, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Copy, 
  Check, 
  HelpCircle,
  MessageCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BookingStatus, TrialBooking } from '../../types';

export const MyTrialsView: React.FC = () => {
  const { 
    bookings, 
    customerPhone, 
    setCustomerPhone, 
    cancelCustomerBooking, 
    settings 
  } = useStore();

  const [phoneInput, setPhoneInput] = useState(customerPhone || '');
  const [searchBookingCode, setSearchBookingCode] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active or filtered trials
  const userBookings = useMemo(() => {
    return bookings.filter(b => {
      if (searchBookingCode.trim()) {
        return b.bookingCode.toLowerCase().includes(searchBookingCode.trim().toLowerCase());
      }
      if (customerPhone) {
        return b.customerPhone === customerPhone;
      }
      return true; // if no phone set, show recent bookings made on this device
    });
  }, [bookings, customerPhone, searchBookingCode]);

  const handleApplyPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneInput.replace(/[^0-9]/g, '');
    setCustomerPhone(clean);
  };

  const copyBookingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>Pending Boutique Review</span>
          </span>
        );
      case 'Accepted':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>Confirmed VIP Fitting</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-700" />
            <span>Slot Unavailable</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3 text-indigo-700" />
            <span>Fitting Completed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="bg-neutral-100 text-neutral-700 border border-neutral-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3 text-neutral-500" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 px-3 pb-24 pt-2">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#4A0E17] text-[#FDFBF7] border border-[#D4AF37]/30 shadow-md">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-brand font-bold text-base tracking-wider uppercase">
            My VIP Trial Bookings
          </h2>
        </div>
        <p className="text-xs text-[#FDFBF7]/80 mt-1 leading-relaxed">
          Track your private salon fitting appointments, view booking status, or make changes.
        </p>

        {/* Customer Phone Filter Form */}
        <form onSubmit={handleApplyPhone} className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Phone className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-2.5" />
            <input
              type="tel"
              placeholder="Filter by Mobile Number..."
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#380B12] text-xs text-[#FDFBF7] placeholder:text-[#FDFBF7]/50 border border-[#D4AF37]/40 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-[#4A0E17] text-xs font-bold uppercase tracking-wider shadow"
          >
            Find
          </button>
        </form>
      </div>

      {/* Quick Search by Booking Code */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#8F7E75] absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search by Booking ID (e.g. SHL-2026-9281)..."
          value={searchBookingCode}
          onChange={e => setSearchBookingCode(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#E0D5C3] text-xs text-[#241315] placeholder:text-[#8F7E75] focus:outline-none focus:border-[#4A0E17]"
        />
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {userBookings.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-[#EADBCA] p-6 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF6EE] border border-[#E0D5C3] flex items-center justify-center text-[#8F7E75]">
              <CalendarClock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#380B12]">No Trial Bookings Found</h3>
            <p className="text-xs text-[#8F7E75] max-w-xs mx-auto">
              {customerPhone
                ? `No trial reservations associated with mobile ${customerPhone}.`
                : 'Browse our collection and book your first exclusive in-store trial session!'}
            </p>
          </div>
        ) : (
          userBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-4 border border-[#E8DEC8] shadow-sm space-y-3"
            >
              {/* Top row: ID & Status */}
              <div className="flex items-center justify-between pb-2 border-b border-[#EADBCA]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-[#4A0E17]">
                    {booking.bookingCode}
                  </span>
                  <button
                    onClick={() => copyBookingCode(booking.bookingCode)}
                    className="p-1 text-[#8F7E75] hover:text-[#4A0E17]"
                    title="Copy Booking ID"
                  >
                    {copiedId === booking.bookingCode ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              {/* Product and details */}
              <div className="flex gap-3">
                <img
                  src={booking.productImage}
                  alt={booking.productName}
                  className="w-14 h-16 object-cover rounded-xl border border-[#E0D5C3] flex-shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-[#380B12] line-clamp-1">
                    {booking.productName}
                  </h4>
                  <div className="text-[11px] text-[#6B5A51] flex items-center gap-2">
                    <span>Size: <strong className="text-[#4A0E17]">{booking.selectedSize}</strong></span>
                    <span>•</span>
                    <span className="font-semibold text-[#4A0E17]">₹{booking.productPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#380B12] flex items-center gap-1.5 pt-0.5">
                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                    <span>{booking.trialDate} at {booking.trialTimeSlot}</span>
                  </div>
                </div>
              </div>

              {/* Notes & customer info */}
              <div className="text-[11px] bg-[#FAF6EE] p-2.5 rounded-xl border border-[#EADBCA] space-y-1 text-[#543D32]">
                <div className="flex justify-between">
                  <span>Guest: <strong>{booking.customerName}</strong></span>
                  <span>Contact: <strong>{booking.customerPhone}</strong></span>
                </div>
                {booking.notes && (
                  <p className="text-[10px] text-[#7A6458] italic pt-0.5">
                    "{booking.notes}"
                  </p>
                )}
                {booking.adminNotes && (
                  <p className="text-[10px] text-[#4A0E17] font-semibold pt-0.5 border-t border-[#E0D5C3]">
                    Boutique Update: {booking.adminNotes}
                  </p>
                )}
              </div>

              {/* Cancel Action if Pending */}
              {booking.status === 'Pending' && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setCancellingBookingId(booking.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
                  >
                    Cancel Booking
                  </button>

                  <a
                    href={`https://wa.me/${settings.phone.replace(/[^0-9]/g, '')}?text=Hi%20Shilpa%20Dresses,%20inquiring%20about%20my%20trial%20booking%20${booking.bookingCode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#2E7D32] flex items-center gap-1 bg-[#E8F5E9] px-2.5 py-1 rounded-lg"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Boutique</span>
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl border border-red-200 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[#380B12]">Cancel Trial Booking?</h4>
            <p className="text-xs text-[#8F7E75]">
              Are you sure you want to cancel this reserved fitting slot? This slot will be made available to other clients.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancellingBookingId(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-neutral-300"
              >
                Keep Booking
              </button>
              <button
                onClick={async () => {
                  await cancelCustomerBooking(cancellingBookingId);
                  setCancellingBookingId(null);
                }}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-600 text-white shadow"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
