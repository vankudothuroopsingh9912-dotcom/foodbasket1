export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: 'Home' | 'Work' | 'Other';
  instructions?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  itemCount: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  unit: string; // e.g. "1 kg", "500 ml", "1 dozen", "pack"
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  isFeatured?: boolean;
  isOrganic?: boolean;
  isDailyDeal?: boolean;
  nutritionalInfo?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  storageInstructions?: string;
  shelfLife?: string;
  origin?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  description: string;
  expiryDate: string;
  isActive: boolean;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Preparing Your Basket'
  | 'Packed'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'razorpay' | 'cod' | 'upi';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
}

export interface DeliverySlot {
  id: string;
  date: string; // e.g. "Today, Oct 16"
  time: string; // e.g. "10:00 AM - 12:00 PM"
  isAvailable: boolean;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  time: string;
  note: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  deliverySlot: DeliverySlot;
  deliveryInstructions?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  timeline: OrderTimelineEvent[];
  courierName?: string;
  courierPhone?: string;
  courierLocation?: { lat: number; lng: number };
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAnalytics {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  recentOrders: Order[];
  ordersByStatus: Record<string, number>;
  salesByDay: { date: string; amount: number }[];
}
