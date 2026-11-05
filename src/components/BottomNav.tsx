import React from 'react';
import { 
  Home, 
  ShoppingBag, 
  CalendarClock, 
  User, 
  LayoutDashboard, 
  ClipboardList, 
  Layers, 
  PackageCheck, 
  Receipt, 
  Settings 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export type CustomerTab = 'home' | 'shop' | 'trials' | 'profile';
export type OwnerTab = 'dashboard' | 'bookings' | 'products' | 'stock' | 'sales' | 'settings';

interface BottomNavProps {
  isOwnerMode: boolean;
  activeCustomerTab: CustomerTab;
  onSelectCustomerTab: (tab: CustomerTab) => void;
  activeOwnerTab: OwnerTab;
  onSelectOwnerTab: (tab: OwnerTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  isOwnerMode,
  activeCustomerTab,
  onSelectCustomerTab,
  activeOwnerTab,
  onSelectOwnerTab
}) => {
  const { bookings, customerPhone, products } = useStore();

  // Pending bookings counter for owner
  const pendingOwnerCount = bookings.filter(b => b.status === 'Pending').length;

  // Active customer bookings counter
  const customerActiveCount = bookings.filter(b => 
    (customerPhone && b.customerPhone === customerPhone) && 
    (b.status === 'Pending' || b.status === 'Accepted')
  ).length;

  // Low stock products counter for owner
  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;

  if (isOwnerMode) {
    const ownerItems: Array<{ tab: OwnerTab; label: string; icon: React.ReactNode; badge?: number }> = [
      { tab: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
      { tab: 'bookings', label: 'Trials', icon: <ClipboardList className="w-5 h-5" />, badge: pendingOwnerCount },
      { tab: 'products', label: 'Catalog', icon: <Layers className="w-5 h-5" /> },
      { tab: 'stock', label: 'Stock', icon: <PackageCheck className="w-5 h-5" />, badge: lowStockCount },
      { tab: 'sales', label: 'POS/Sales', icon: <Receipt className="w-5 h-5" /> },
      { tab: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
    ];

    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#380B12] text-[#FDFBF7] border-t border-[#D4AF37]/30 shadow-2xl safe-bottom">
        <div className="max-w-md mx-auto grid grid-cols-6 py-1.5 px-1">
          {ownerItems.map(item => {
            const isActive = activeOwnerTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectOwnerTab(item.tab)}
                className={`relative flex flex-col items-center justify-center py-1 rounded-lg transition-colors ${
                  isActive ? 'text-[#D4AF37]' : 'text-[#FDFBF7]/60 hover:text-[#FDFBF7]'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[15px] h-[15px] flex items-center justify-center border border-[#380B12]">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium line-clamp-1">
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-[#D4AF37] mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // Customer Navigation
  const customerItems: Array<{ tab: CustomerTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { tab: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { tab: 'shop', label: 'Shop', icon: <ShoppingBag className="w-5 h-5" /> },
    { tab: 'trials', label: 'My Trials', icon: <CalendarClock className="w-5 h-5" />, badge: customerActiveCount },
    { tab: 'profile', label: 'Boutique', icon: <User className="w-5 h-5" /> }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#4A0E17] text-[#FDFBF7] border-t border-[#D4AF37]/30 shadow-2xl safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-4 py-2 px-3">
        {customerItems.map(item => {
          const isActive = activeCustomerTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectCustomerTab(item.tab)}
              className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-[#D4AF37]' : 'text-[#FDFBF7]/65 hover:text-[#FDFBF7]'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#D4AF37] text-[#4A0E17] text-[10px] font-extrabold px-1.5 rounded-full h-4 flex items-center justify-center border border-[#4A0E17]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 font-semibold tracking-wide">
                {item.label}
              </span>
              {isActive && (
                <div className="w-5 h-0.5 rounded-full bg-[#D4AF37] mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
