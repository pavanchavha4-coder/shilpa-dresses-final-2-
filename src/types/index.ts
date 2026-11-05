export type GarmentCategory = "Women's Wear" | "Men's Wear" | "Kids Wear" | "Bridal & Couture";

export type GarmentSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "Custom Fit";

export interface Product {
  id: string;
  name: string;
  category: GarmentCategory;
  subcategory: string;
  price: number;
  originalPrice: number;
  description: string;
  fabric: string;
  sizes: GarmentSize[];
  colors: string[];
  stock: number;
  lowStockThreshold: number;
  featured: boolean;
  isNewArrival: boolean;
  imageUrl: string;
  additionalImages?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: GarmentCategory;
  description: string;
  imageUrl: string;
  itemCount: number;
}

export type BookingStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled';

export interface TrialBooking {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  selectedSize: GarmentSize;
  trialDate: string; // YYYY-MM-DD
  trialTimeSlot: string; // e.g. "11:30 AM"
  notes?: string;
  status: BookingStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlotOption {
  time: string;
  label: string;
}

export interface TrialAvailability {
  id: string;
  date: string; // YYYY-MM-DD
  blockedSlots: string[]; // e.g. ["11:30 AM", "03:30 PM"]
  isEntireDayBlocked: boolean;
  reason?: string;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';

export interface SaleItem {
  productId: string;
  productName: string;
  size: GarmentSize;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  trialBookingId?: string;
  soldBy: string;
  notes?: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'owner' | 'manager';
  token: string;
}

export interface AppSetting {
  id: string;
  storeName: string;
  tagline: string;
  brandOwner: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  city: string;
  state: string;
  openingTime: string;
  closingTime: string;
  maxTrialsPerSlot: number;
  trialDurationMinutes: number;
}

export interface FirebaseConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  mode: 'firebase' | 'local_storage';
  projectId?: string;
  error?: string | null;
}
