import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  Category, 
  TrialBooking, 
  TrialAvailability, 
  Sale, 
  AppSetting, 
  BookingStatus, 
  GarmentSize, 
  PaymentMethod,
  AdminUser,
  FirebaseConnectionStatus 
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  STORE_SETTINGS, 
  STANDARD_TIME_SLOTS 
} from '../data/initialData';
import { initFirebaseService } from '../services/firebase';

interface BookingPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  selectedSize: GarmentSize;
  trialDate: string;
  trialTimeSlot: string;
  notes?: string;
}

interface SalePayload {
  customerName: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    productName: string;
    size: GarmentSize;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  trialBookingId?: string;
  soldBy: string;
  notes?: string;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  bookings: TrialBooking[];
  availability: TrialAvailability[];
  sales: Sale[];
  settings: AppSetting;
  firebaseStatus: FirebaseConnectionStatus;
  adminUser: AdminUser | null;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  // Booking operations
  createBooking: (payload: BookingPayload) => Promise<{ success: boolean; booking?: TrialBooking; error?: string }>;
  updateBookingStatus: (bookingId: string, status: BookingStatus, adminNotes?: string) => Promise<{ success: boolean; error?: string }>;
  cancelCustomerBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  checkSlotAvailability: (date: string, timeSlot: string) => { isAvailable: boolean; reason?: string };
  // Product & Stock operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; product?: Product; error?: string }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  adjustStock: (productId: string, delta: number) => Promise<{ success: boolean; newStock?: number; error?: string }>;
  // Slot availability operations
  toggleSlotBlock: (date: string, timeSlot: string) => Promise<{ success: boolean; error?: string }>;
  toggleEntireDayBlock: (date: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  // Sales & POS operations
  recordSale: (payload: SalePayload) => Promise<{ success: boolean; sale?: Sale; error?: string }>;
  // Admin auth
  loginAdmin: (idOrEmail: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  // Settings operations
  updateSettings: (updates: Partial<AppSetting>) => Promise<{ success: boolean; error?: string }>;
  resetToInitialCatalog: () => void;
  refreshFirebaseConnection: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: 'shilpa_store_products',
  CATEGORIES: 'shilpa_store_categories',
  BOOKINGS: 'shilpa_store_bookings',
  AVAILABILITY: 'shilpa_store_availability',
  SALES: 'shilpa_store_sales',
  SETTINGS: 'shilpa_store_settings',
  ADMIN_SESSION: 'shilpa_admin_session',
  CUSTOMER_PHONE: 'shilpa_customer_phone'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial seed
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [bookings, setBookings] = useState<TrialBooking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return saved ? JSON.parse(saved) : [
        {
          id: 'bkg_seed_1',
          bookingCode: 'SHL-2026-9281',
          customerName: 'Priya Sharma',
          customerPhone: '9876543210',
          customerEmail: 'priya.s@example.com',
          productId: 'prod_1',
          productName: 'Royal Crimson Zardozi Bridal Lehenga',
          productImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
          productPrice: 34999,
          selectedSize: 'M',
          trialDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          trialTimeSlot: '11:30 AM',
          notes: 'Bridal consultation with mother. Needs sizing check for blouse.',
          status: 'Accepted',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'bkg_seed_2',
          bookingCode: 'SHL-2026-4712',
          customerName: 'Aarav Malhotra',
          customerPhone: '9822334455',
          customerEmail: 'aarav.m@example.com',
          productId: 'prod_3',
          productName: 'Burgundy Raw Silk Jodhpuri Bandhgala',
          productImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
          productPrice: 18999,
          selectedSize: '40 (M)' as any,
          trialDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          trialTimeSlot: '05:00 PM',
          notes: 'Sangeet outfit trial. Will arrive at 5 sharp.',
          status: 'Pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [availability, setAvailability] = useState<TrialAvailability[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AVAILABILITY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SALES);
      return saved ? JSON.parse(saved) : [
        {
          id: 'sale_seed_1',
          invoiceNumber: 'INV-SD-10821',
          customerName: 'Ananya Deshmukh',
          customerPhone: '9823112233',
          items: [
            {
              productId: 'prod_2',
              productName: 'Kanjeevaram Champagne Gold Tissue Silk Saree',
              size: 'Custom Fit',
              price: 22499,
              quantity: 1
            }
          ],
          subtotal: 22499,
          discount: 1000,
          tax: 1074,
          totalAmount: 22573,
          paymentMethod: 'UPI',
          soldBy: 'Owner (Shilpa)',
          notes: 'Walk-in boutique client. Gift packaging requested.',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<AppSetting>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : STORE_SETTINGS;
    } catch {
      return STORE_SETTINGS;
    }
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const session = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  });

  const [customerPhone, setCustomerPhoneState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOMER_PHONE) || '';
  });

  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConnectionStatus>({
    isConfigured: false,
    isConnected: false,
    mode: 'local_storage',
    error: 'Initial test'
  });

  // Sync state to LocalStorage automatically
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) { console.error(e); }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) { console.error(e); }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) { console.error(e); }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(availability));
    } catch (e) { console.error(e); }
  }, [availability]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (e) { console.error(e); }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) { console.error(e); }
  }, [settings]);

  // Check Firebase connection status on mount
  const refreshFirebaseConnection = useCallback(async () => {
    const status = await initFirebaseService();
    setFirebaseStatus(status);
  }, []);

  useEffect(() => {
    refreshFirebaseConnection();
  }, [refreshFirebaseConnection]);

  const setCustomerPhone = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    setCustomerPhoneState(clean);
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_PHONE, clean);
  };

  // Double-booking and Availability validation logic
  const checkSlotAvailability = useCallback((date: string, timeSlot: string): { isAvailable: boolean; reason?: string } => {
    // 1. Check if the date is fully blocked by owner
    const dateConfig = availability.find(a => a.date === date);
    if (dateConfig?.isEntireDayBlocked) {
      return { 
        isAvailable: false, 
        reason: dateConfig.reason || 'Boutique is closed or reserved for a private event on this date.' 
      };
    }

    // 2. Check if this specific time slot is blocked by owner
    if (dateConfig?.blockedSlots?.includes(timeSlot)) {
      return { 
        isAvailable: false, 
        reason: 'This fitting slot is currently unavailable or blocked by boutique staff.' 
      };
    }

    // 3. Check existing active bookings (Pending or Accepted)
    const existingActiveBookings = bookings.filter(b => 
      b.trialDate === date && 
      b.trialTimeSlot === timeSlot && 
      (b.status === 'Pending' || b.status === 'Accepted')
    );

    const maxCapacity = settings.maxTrialsPerSlot || 1;
    if (existingActiveBookings.length >= maxCapacity) {
      return { 
        isAvailable: false, 
        reason: 'This exclusive slot has already been reserved by another customer. Please choose another time.' 
      };
    }

    return { isAvailable: true };
  }, [availability, bookings, settings.maxTrialsPerSlot]);

  // Create Trial Booking
  const createBooking = async (payload: BookingPayload): Promise<{ success: boolean; booking?: TrialBooking; error?: string }> => {
    try {
      // Validate slot availability
      const availabilityCheck = checkSlotAvailability(payload.trialDate, payload.trialTimeSlot);
      if (!availabilityCheck.isAvailable) {
        return { success: false, error: availabilityCheck.reason || 'Slot not available' };
      }

      // Validate inputs
      if (!payload.customerName.trim()) {
        return { success: false, error: 'Customer name is required' };
      }
      if (!payload.customerPhone || payload.customerPhone.length < 10) {
        return { success: false, error: 'Please enter a valid 10-digit mobile number' };
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const bookingCode = `SHL-2026-${randomSuffix}`;
      const nowIso = new Date().toISOString();

      const newBooking: TrialBooking = {
        id: `bkg_${Date.now()}_${randomSuffix}`,
        bookingCode,
        customerName: payload.customerName.trim(),
        customerPhone: payload.customerPhone.trim(),
        customerEmail: payload.customerEmail?.trim(),
        productId: payload.productId,
        productName: payload.productName,
        productImage: payload.productImage,
        productPrice: payload.productPrice,
        selectedSize: payload.selectedSize,
        trialDate: payload.trialDate,
        trialTimeSlot: payload.trialTimeSlot,
        notes: payload.notes?.trim(),
        status: 'Pending',
        createdAt: nowIso,
        updatedAt: nowIso
      };

      setBookings(prev => [newBooking, ...prev]);
      setCustomerPhone(payload.customerPhone);

      return { success: true, booking: newBooking };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create booking' };
    }
  };

  // Update Booking Status (Owner action)
  const updateBookingStatus = async (bookingId: string, status: BookingStatus, adminNotes?: string) => {
    try {
      setBookings(prev => prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status,
            adminNotes: adminNotes !== undefined ? adminNotes : b.adminNotes,
            updatedAt: new Date().toISOString()
          };
        }
        return b;
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update booking status' };
    }
  };

  // Cancel Customer Booking
  const cancelCustomerBooking = async (bookingId: string) => {
    try {
      const target = bookings.find(b => b.id === bookingId);
      if (!target) {
        return { success: false, error: 'Booking not found' };
      }
      if (target.status !== 'Pending') {
        return { success: false, error: 'Only pending bookings can be cancelled online. Please call the boutique.' };
      }

      setBookings(prev => prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'Cancelled',
            updatedAt: new Date().toISOString()
          };
        }
        return b;
      }));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to cancel booking' };
    }
  };

  // Add Product
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProduct: Product = {
        ...productData,
        id: `prod_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProducts(prev => [newProduct, ...prev]);
      return { success: true, product: newProduct };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to add product' };
    }
  };

  // Update Product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, ...updates, updatedAt: new Date().toISOString() };
        }
        return p;
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update product' };
    }
  };

  // Delete Product
  const deleteProduct = async (id: string) => {
    try {
      setProducts(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete product' };
    }
  };

  // Adjust Stock
  const adjustStock = async (productId: string, delta: number) => {
    try {
      let updatedStock = 0;
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          updatedStock = Math.max(0, p.stock + delta);
          return { ...p, stock: updatedStock, updatedAt: new Date().toISOString() };
        }
        return p;
      }));
      return { success: true, newStock: updatedStock };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to adjust stock' };
    }
  };

  // Slot block toggle
  const toggleSlotBlock = async (date: string, timeSlot: string) => {
    try {
      setAvailability(prev => {
        const existing = prev.find(a => a.date === date);
        if (existing) {
          const isBlocked = existing.blockedSlots?.includes(timeSlot);
          const newSlots = isBlocked
            ? existing.blockedSlots.filter(s => s !== timeSlot)
            : [...(existing.blockedSlots || []), timeSlot];
          return prev.map(a => a.date === date ? { ...a, blockedSlots: newSlots } : a);
        } else {
          return [...prev, {
            id: `avail_${Date.now()}`,
            date,
            blockedSlots: [timeSlot],
            isEntireDayBlocked: false
          }];
        }
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to toggle slot' };
    }
  };

  // Entire day block toggle
  const toggleEntireDayBlock = async (date: string, reason?: string) => {
    try {
      setAvailability(prev => {
        const existing = prev.find(a => a.date === date);
        if (existing) {
          return prev.map(a => a.date === date ? { 
            ...a, 
            isEntireDayBlocked: !a.isEntireDayBlocked, 
            reason: reason || a.reason 
          } : a);
        } else {
          return [...prev, {
            id: `avail_${Date.now()}`,
            date,
            blockedSlots: [],
            isEntireDayBlocked: true,
            reason: reason || 'Boutique Closed'
          }];
        }
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to toggle day block' };
    }
  };

  // Record Sale & POS
  const recordSale = async (payload: SalePayload) => {
    try {
      const invoiceNumber = `INV-SD-${Math.floor(10000 + Math.random() * 90000)}`;
      const newSale: Sale = {
        id: `sale_${Date.now()}`,
        invoiceNumber,
        customerName: payload.customerName.trim(),
        customerPhone: payload.customerPhone.trim(),
        items: payload.items,
        subtotal: payload.subtotal,
        discount: payload.discount,
        tax: payload.tax,
        totalAmount: payload.totalAmount,
        paymentMethod: payload.paymentMethod,
        trialBookingId: payload.trialBookingId,
        soldBy: payload.soldBy || 'Boutique Staff',
        notes: payload.notes?.trim(),
        timestamp: new Date().toISOString()
      };

      // Automatically decrement stock for sold items
      payload.items.forEach(item => {
        adjustStock(item.productId, -item.quantity);
      });

      // If tied to a trial booking, mark it completed
      if (payload.trialBookingId) {
        updateBookingStatus(payload.trialBookingId, 'Completed', `Converted to Sale: #${invoiceNumber}`);
      }

      setSales(prev => [newSale, ...prev]);
      return { success: true, sale: newSale };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to record sale' };
    }
  };

  // Admin Auth
  const loginAdmin = async (idOrEmail: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = idOrEmail.trim().toLowerCase();
    // Support default boutique owner credentials & admin email
    const isValidId = cleanId === 'admin@shilpadresses.com' || cleanId === 'shilpa_owner' || cleanId === 'pavanchavha4@gmail.com' || cleanId === 'admin';
    const isValidPass = pass === 'Nexora@Shilpa2026' || pass === 'shilpa123' || pass === 'admin123';

    if (isValidId && isValidPass) {
      const user: AdminUser = {
        id: 'usr_admin_shilpa',
        username: 'shilpa_owner',
        name: 'Shilpa (Boutique Owner)',
        email: cleanId.includes('@') ? cleanId : 'admin@shilpadresses.com',
        role: 'owner',
        token: `token_${Date.now()}_nexora`
      };
      setAdminUser(user);
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user));
      return { success: true };
    } else {
      return { success: false, error: 'Invalid boutique credentials. Use admin@shilpadresses.com and Nexora@Shilpa2026' };
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  };

  // Update Settings
  const updateSettings = async (updates: Partial<AppSetting>) => {
    try {
      setSettings(prev => ({ ...prev, ...updates }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update settings' };
    }
  };

  // Reset to initial catalog
  const resetToInitialCatalog = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setSettings(STORE_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  return (
    <StoreContext.Provider value={{
      products,
      categories,
      bookings,
      availability,
      sales,
      settings,
      firebaseStatus,
      adminUser,
      customerPhone,
      setCustomerPhone,
      createBooking,
      updateBookingStatus,
      cancelCustomerBooking,
      checkSlotAvailability,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      toggleSlotBlock,
      toggleEntireDayBlock,
      recordSale,
      loginAdmin,
      logoutAdmin,
      updateSettings,
      resetToInitialCatalog,
      refreshFirebaseConnection
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
