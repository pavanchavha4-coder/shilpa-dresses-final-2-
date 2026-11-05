import React from 'react';
import { Crown, Shield, Search, Sparkles, UserCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface NavbarProps {
  onOpenOwnerPortal: () => void;
  onOpenSearch: () => void;
  isOwnerMode: boolean;
  onSwitchToCustomer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenOwnerPortal,
  onOpenSearch,
  isOwnerMode,
  onSwitchToCustomer
}) => {
  const { adminUser, bookings } = useStore();
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;

  return (
    <header className="sticky top-0 z-40 bg-[#4A0E17] text-[#FDFBF7] shadow-md border-b border-[#D4AF37]/30 safe-top">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#380B12] border border-[#D4AF37] flex items-center justify-center shadow-inner">
            <Crown className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-brand font-bold text-base tracking-wider text-[#FDFBF7]">
                SHILPA DRESSES
              </span>
              {isOwnerMode && (
                <span className="bg-[#D4AF37] text-[#4A0E17] text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                  Owner
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#D4AF37]/90 tracking-widest uppercase">
              By NEXORA Technologies
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-full hover:bg-[#380B12] text-[#FDFBF7] transition-colors border border-transparent hover:border-[#D4AF37]/40"
            title="Search Couture & Dresses"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Owner Mode Switch or Login */}
          {isOwnerMode ? (
            <button
              onClick={onSwitchToCustomer}
              className="bg-[#D4AF37] text-[#4A0E17] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow hover:bg-[#F3E5AB] transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </button>
          ) : (
            <button
              onClick={onOpenOwnerPortal}
              className="relative p-2 rounded-full bg-[#380B12] text-[#D4AF37] hover:bg-[#2A060C] transition-colors border border-[#D4AF37]/40 flex items-center justify-center"
              title="Staff / Owner Portal"
            >
              <Shield className="w-4 h-4" />
              {adminUser && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#4A0E17]">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
