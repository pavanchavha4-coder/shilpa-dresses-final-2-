import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { SplashScreen } from './components/SplashScreen';
import { Navbar } from './components/Navbar';
import { BottomNav, CustomerTab, OwnerTab } from './components/BottomNav';
import { HomeView } from './views/customer/HomeView';
import { ShopView } from './views/customer/ShopView';
import { MyTrialsView } from './views/customer/MyTrialsView';
import { ProfileView } from './views/customer/ProfileView';
import { ProductDetailModal } from './views/customer/ProductDetailModal';
import { TrialBookingModal } from './views/customer/TrialBookingModal';
import { ThreeDressShowroom } from './components/ThreeDressShowroom';
import { AdminLoginModal } from './views/admin/AdminLoginModal';
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { AdminBookingsView } from './views/admin/AdminBookingsView';
import { AdminProductsView } from './views/admin/AdminProductsView';
import { AdminStockView } from './views/admin/AdminStockView';
import { AdminSalesView } from './views/admin/AdminSalesView';
import { AdminSettingsView } from './views/admin/AdminSettingsView';
import { Product, GarmentCategory, GarmentSize, TrialBooking } from './types';
import { Search, X, Sparkles, Box } from 'lucide-react';

function AppContent() {
  const { adminUser, logoutAdmin, products } = useStore();

  const [hasShownSplash, setHasShownSplash] = useState(false);
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [ownerTab, setOwnerTab] = useState<OwnerTab>('dashboard');

  // Customer flows
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);
  const [bookingSize, setBookingSize] = useState<GarmentSize>('M');
  const [selectedShopCategory, setSelectedShopCategory] = useState<GarmentCategory | 'All'>('All');
  const [is3DShowroomOpen, setIs3DShowroomOpen] = useState(false);
  const [showroomProduct, setShowroomProduct] = useState<Product | null>(null);

  // Admin flows
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [initialBookingForSale, setInitialBookingForSale] = useState<TrialBooking | null>(null);

  // Global Quick Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle owner portal access
  const handleOpenOwnerPortal = () => {
    if (adminUser) {
      setIsOwnerMode(true);
      setOwnerTab('dashboard');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoginOpen(false);
    setIsOwnerMode(true);
    setOwnerTab('dashboard');
  };

  const handleSwitchToCustomer = () => {
    setIsOwnerMode(false);
  };

  const handleSelectCategoryFromHome = (category: GarmentCategory) => {
    setSelectedShopCategory(category);
    setCustomerTab('shop');
  };

  const handleStartBooking = (product: Product, size: GarmentSize) => {
    setSelectedProduct(null);
    setBookingProduct(product);
    setBookingSize(size);
  };

  const handleOpen3DShowroom = (product?: Product) => {
    setShowroomProduct(product || products[0] || null);
    setIs3DShowroomOpen(true);
  };

  const handleStartSaleFromBooking = (booking: TrialBooking) => {
    setInitialBookingForSale(booking);
    setOwnerTab('sales');
  };

  if (!hasShownSplash) {
    return <SplashScreen onFinish={() => setHasShownSplash(true)} />;
  }

  // Quick search results
  const searchResults = searchQuery.trim()
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.fabric.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#241315] flex flex-col justify-between selection:bg-[#4A0E17] selection:text-[#FDFBF7]">
      {/* Top Mobile-First Container */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#FDFBF7] relative shadow-2xl">
        
        {/* Navigation Bar */}
        <Navbar
          onOpenOwnerPortal={handleOpenOwnerPortal}
          onOpenSearch={() => setIsSearchOpen(true)}
          isOwnerMode={isOwnerMode}
          onSwitchToCustomer={handleSwitchToCustomer}
        />

        {/* Main Body Views */}
        <main className="flex-1 w-full overflow-x-hidden">
          {isOwnerMode ? (
            /* OWNER ADMIN SCREENS */
            <>
              {ownerTab === 'dashboard' && (
                <AdminDashboardView
                  onNavigateTab={setOwnerTab}
                  onOpenNewProductModal={() => setOwnerTab('products')}
                  onOpenNewSaleModal={() => setOwnerTab('sales')}
                />
              )}
              {ownerTab === 'bookings' && (
                <AdminBookingsView onStartSaleFromBooking={handleStartSaleFromBooking} />
              )}
              {ownerTab === 'products' && (
                <AdminProductsView />
              )}
              {ownerTab === 'stock' && (
                <AdminStockView />
              )}
              {ownerTab === 'sales' && (
                <AdminSalesView
                  initialBookingForSale={initialBookingForSale}
                  onClearInitialBooking={() => setInitialBookingForSale(null)}
                />
              )}
              {ownerTab === 'settings' && (
                <AdminSettingsView
                  onLogout={() => {
                    logoutAdmin();
                    setIsOwnerMode(false);
                  }}
                />
              )}
            </>
          ) : (
            /* CUSTOMER STOREFRONT SCREENS */
            <>
              {customerTab === 'home' && (
                <HomeView
                  onSelectCategory={handleSelectCategoryFromHome}
                  onSelectProduct={setSelectedProduct}
                  onOpen3DShowroom={handleOpen3DShowroom}
                  onNavigateToShop={() => {
                    setSelectedShopCategory('All');
                    setCustomerTab('shop');
                  }}
                />
              )}
              {customerTab === 'shop' && (
                <ShopView
                  initialCategory={selectedShopCategory}
                  onSelectProduct={setSelectedProduct}
                  onBookTrial={handleStartBooking}
                />
              )}
              {customerTab === 'trials' && (
                <MyTrialsView />
              )}
              {customerTab === 'profile' && (
                <ProfileView onOpenOwnerPortal={handleOpenOwnerPortal} />
              )}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav
          isOwnerMode={isOwnerMode}
          activeCustomerTab={customerTab}
          onSelectCustomerTab={setCustomerTab}
          activeOwnerTab={ownerTab}
          onSelectOwnerTab={setOwnerTab}
        />
      </div>

      {/* MODAL 1: Product Details Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBookTrial={handleStartBooking}
        />
      )}

      {/* MODAL 2: VIP Trial Booking Modal */}
      {bookingProduct && (
        <TrialBookingModal
          product={bookingProduct}
          preselectedSize={bookingSize}
          onClose={() => setBookingProduct(null)}
          onBookingSuccess={() => {
            // Once confirmed, user can view in My Trials
            setCustomerTab('trials');
          }}
        />
      )}

      {/* MODAL 3: Standalone 3D Mannequin Showroom Modal */}
      {is3DShowroomOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-md h-[560px] relative">
            <ThreeDressShowroom
              garmentName={showroomProduct?.name || 'Royal Zardozi Couture Gown'}
              initialColor="#4A0E17"
              onClose={() => setIs3DShowroomOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MODAL 4: Admin Staff Login */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}

      {/* MODAL 5: Global Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-[#FDFBF7] text-[#241315] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-[#D4AF37]/50 mt-12 flex flex-col max-h-[80vh]">
            <div className="p-3 bg-[#4A0E17] text-[#FDFBF7] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#D4AF37]" />
              <input
                type="text"
                autoFocus
                placeholder="Search bridal lehengas, silk sarees, bandhgalas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-xs text-[#FDFBF7] placeholder:text-[#FDFBF7]/60 focus:outline-none"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1 hover:text-[#D4AF37]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-3 space-y-2 no-scrollbar">
              {searchQuery.trim() === '' ? (
                <div className="p-4 text-center text-xs text-[#8F7E75]">
                  Type garment name, fabric, or category above to explore our collection.
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#8F7E75]">
                  No matching garments found for "{searchQuery}".
                </div>
              ) : (
                searchResults.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSelectedProduct(p);
                    }}
                    className="p-2.5 rounded-xl bg-white border border-[#E8DEC8] hover:border-[#4A0E17] flex items-center gap-3 cursor-pointer transition-all"
                  >
                    <img src={p.imageUrl} alt="" className="w-10 h-12 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-[#7A6458] font-semibold">{p.category}</div>
                      <div className="text-xs font-bold text-[#380B12] truncate">{p.name}</div>
                      <div className="text-xs font-extrabold text-[#4A0E17]">
                        ₹{p.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
