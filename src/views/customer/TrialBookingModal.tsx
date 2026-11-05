import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Copy, 
  Sparkles, 
  Check, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Product, GarmentSize, TrialBooking } from '../../types';
import { STANDARD_TIME_SLOTS } from '../../data/initialData';
import { useStore } from '../../context/StoreContext';

interface TrialBookingModalProps {
  product: Product;
  preselectedSize?: GarmentSize;
  onClose: () => void;
  onBookingSuccess: (booking: TrialBooking) => void;
}

export const TrialBookingModal: React.FC<TrialBookingModalProps> = ({
  product,
  preselectedSize,
  onClose,
  onBookingSuccess
}) => {
  const { 
    createBooking, 
    checkSlotAvailability, 
    customerPhone: defaultPhone, 
    settings 
  } = useStore();

  // Generate date choices for the next 14 days
  const availableDates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start from tomorrow
    const isoDate = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNumber = d.getDate();
    return {
      isoDate,
      label: `${dayName}, ${dayNumber} ${monthName}`,
      shortLabel: `${dayNumber} ${monthName}`,
      dayName
    };
  });

  const [size, setSize] = useState<GarmentSize>(preselectedSize || product.sizes[0] || 'M');
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0].isoDate);
  const [selectedSlot, setSelectedSlot] = useState<string>('11:30 AM');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhoneInput] = useState(defaultPhone || '');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<TrialBooking | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Handle slot booking submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for appointment SMS & reminders');
      return;
    }

    // Double-booking check
    const availabilityCheck = checkSlotAvailability(selectedDate, selectedSlot);
    if (!availabilityCheck.isAvailable) {
      setErrorMsg(availabilityCheck.reason || 'This slot is no longer available. Please choose another time.');
      return;
    }

    setIsSubmitting(true);
    const result = await createBooking({
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      customerEmail: customerEmail.trim() || undefined,
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      productPrice: product.price,
      selectedSize: size,
      trialDate: selectedDate,
      trialTimeSlot: selectedSlot,
      notes: notes.trim() || undefined
    });

    setIsSubmitting(false);

    if (result.success && result.booking) {
      setConfirmedBooking(result.booking);
      // Trigger luxury confetti celebration
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#4A0E17', '#F3E5AB', '#FFFFFF']
        });
      } catch (e) {
        console.error(e);
      }
      onBookingSuccess(result.booking);
    } else {
      setErrorMsg(result.error || 'Failed to reserve appointment. Please try again.');
    }
  };

  const copyBookingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] text-[#241315] w-full max-w-md max-h-[94vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-[#D4AF37]/40">
        
        {/* Header */}
        <div className="bg-[#4A0E17] text-[#FDFBF7] px-4 py-3 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-brand font-bold text-sm tracking-wider uppercase">
              {confirmedBooking ? 'VIP Trial Confirmed' : 'Book VIP In-Store Trial'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#FDFBF7]/80 hover:text-[#FDFBF7] hover:bg-[#380B12] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 space-y-4 no-scrollbar">
          {confirmedBooking ? (
            /* Confirmation View */
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F5E9] border-2 border-[#2E7D32] flex items-center justify-center text-[#2E7D32] shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold font-brand text-[#4A0E17]">
                  Your VIP Trial is Reserved!
                </h4>
                <p className="text-xs text-[#6B5A51]">
                  Our master tailor and styling consultant are preparing your private suite.
                </p>
              </div>

              {/* Unique Booking Code Badge */}
              <div className="p-3 bg-[#F7F2EA] border border-[#D4AF37] rounded-xl flex items-center justify-between shadow-inner">
                <div className="text-left">
                  <span className="text-[10px] text-[#7A6458] uppercase font-bold tracking-wider block">
                    Unique Booking ID
                  </span>
                  <span className="text-lg font-extrabold text-[#4A0E17] tracking-wider font-mono">
                    {confirmedBooking.bookingCode}
                  </span>
                </div>
                <button
                  onClick={() => copyBookingCode(confirmedBooking.bookingCode)}
                  className="px-3 py-1.5 rounded-lg bg-[#4A0E17] text-[#D4AF37] text-xs font-semibold flex items-center gap-1 hover:bg-[#380B12] transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Appointment Summary Card */}
              <div className="p-3.5 bg-white rounded-xl border border-[#EADBCA] text-xs text-left space-y-2.5 shadow-sm">
                <div className="flex gap-3 items-center pb-2 border-b border-[#EADBCA]">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-12 h-14 object-cover rounded-lg border border-[#D4AF37]/30"
                  />
                  <div>
                    <div className="font-bold text-[#380B12] line-clamp-1">{product.name}</div>
                    <div className="text-[11px] text-[#7A6458]">Selected Size: <strong className="text-[#4A0E17]">{confirmedBooking.selectedSize}</strong></div>
                    <div className="text-xs font-semibold text-[#4A0E17]">₹{product.price.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#8F7E75] block">Trial Date:</span>
                    <strong className="text-[#380B12]">{confirmedBooking.trialDate}</strong>
                  </div>
                  <div>
                    <span className="text-[#8F7E75] block">Reserved Slot:</span>
                    <strong className="text-[#380B12]">{confirmedBooking.trialTimeSlot}</strong>
                  </div>
                  <div>
                    <span className="text-[#8F7E75] block">Customer:</span>
                    <strong className="text-[#380B12]">{confirmedBooking.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-[#8F7E75] block">Mobile:</span>
                    <strong className="text-[#380B12]">{confirmedBooking.customerPhone}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EADBCA] text-[11px] text-[#6B5A51] flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <span>{settings.address}, {settings.city} (Tel: {settings.phone})</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-[#4A0E17] text-[#D4AF37] font-bold text-xs uppercase tracking-wider rounded-xl shadow hover:bg-[#380B12] transition-colors"
                >
                  Done • View in My Trials
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              {/* Product preview snippet */}
              <div className="flex items-center gap-3 p-2.5 bg-[#FAF6EE] rounded-xl border border-[#EADBCA]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-12 h-14 object-cover rounded-lg border border-[#D4AF37]/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#380B12] truncate">{product.name}</div>
                  <div className="text-[11px] text-[#6B5A51]">Trial Size: <strong className="text-[#4A0E17]">{size}</strong></div>
                  <div className="text-xs font-semibold text-[#4A0E17]">₹{product.price.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Size Confirmation / Change */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A0E17] uppercase tracking-wider mb-1.5">
                  1. Confirm Garment Size
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSize(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        size === s
                          ? 'bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37]'
                          : 'bg-[#F7F2EA] text-[#4A0E17] border border-[#E0D5C3]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose Date */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A0E17] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>2. Select Trial Date</span>
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {availableDates.map(d => {
                    const isSelected = selectedDate === d.isoDate;
                    return (
                      <button
                        type="button"
                        key={d.isoDate}
                        onClick={() => setSelectedDate(d.isoDate)}
                        className={`min-w-[70px] p-2 rounded-xl text-center border transition-all flex flex-col items-center ${
                          isSelected
                            ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37] shadow'
                            : 'bg-[#F7F2EA] text-[#380B12] border-[#E0D5C3] hover:border-[#D4AF37]'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-semibold opacity-75">{d.dayName}</span>
                        <span className="text-sm font-extrabold">{d.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Choose Time Slot (Strict Double-Booking Check) */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A0E17] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    3. Select Exclusive Slot (1 Client / Slot)
                  </span>
                  <span className="text-[10px] text-[#8F7E75]">Max 1 VIP Fitting</span>
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  {STANDARD_TIME_SLOTS.map(slot => {
                    const check = checkSlotAvailability(selectedDate, slot.time);
                    const isAvailable = check.isAvailable;
                    const isSelected = selectedSlot === slot.time;

                    return (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all relative ${
                          !isAvailable
                            ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37] shadow'
                            : 'bg-[#F7F2EA] text-[#380B12] border-[#E0D5C3] hover:border-[#D4AF37]'
                        }`}
                      >
                        <div className="font-bold">{slot.time}</div>
                        <div className="text-[10px] opacity-80">{isAvailable ? 'Available' : 'Reserved / Blocked'}</div>
                        {!isAvailable && (
                          <span className="absolute top-1.5 right-2 text-[9px] bg-red-100 text-red-700 px-1 rounded font-bold">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Customer Details */}
              <div className="space-y-2 pt-1 border-t border-[#EADBCA]">
                <label className="block text-[11px] font-bold text-[#4A0E17] uppercase tracking-wider">
                  4. Customer Contact Details
                </label>

                <div>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8F7E75] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white border border-[#E0D5C3] focus:border-[#4A0E17] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8F7E75] absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      maxLength={14}
                      placeholder="Mobile Number (for SMS & Reminder) *"
                      value={customerPhone}
                      onChange={e => setCustomerPhoneInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white border border-[#E0D5C3] focus:border-[#4A0E17] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8F7E75] absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="Email Address (Optional)"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white border border-[#E0D5C3] focus:border-[#4A0E17] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-[#8F7E75] absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      placeholder="Special requests (e.g. Bringing 2 guests, need urgent alteration)"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#E0D5C3] focus:border-[#4A0E17] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#4A0E17] text-[#D4AF37] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:bg-[#380B12] transition-colors flex items-center justify-center gap-2 border border-[#D4AF37]/50 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span>Reserving Exclusive Fitting...</span>
                ) : (
                  <>
                    <span>Confirm Trial for {selectedDate} ({selectedSlot})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-[#8F7E75] flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>Zero advance deposit • Free cancellation anytime</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
