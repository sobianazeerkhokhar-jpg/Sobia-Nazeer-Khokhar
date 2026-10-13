export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category: string;
  collection?: string;
  price: number;
  salePrice?: number;
  stock: number;
  material: string;
  color: string;
  size?: string;
  isAntiTarnish: boolean;
  description: string;
  specifications: { [key: string]: string };
  careInstructions: string;
  images: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  status: 'active' | 'draft' | 'out_of_stock' | 'archived';
  videoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  itemCount?: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'hidden';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
  sku: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'card' | 'easypaisa' | 'jazzcash';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  houseFlat: string;
  streetArea: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  token?: string;
  addresses?: ShippingAddress[];
  createdAt: string;
  orderCount?: number;
  totalSpent?: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logo: string;
  contactEmail: string;
  phone: string;
  whatsappNumber: string;
  storeAddress: string;
  currency: string;
  currencySymbol: string;
  flatShippingFee: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  announcementText: string;
  instagramUrl: string;
  facebookUrl: string;
  returnPolicy: string;
  shippingPolicy: string;
  privacyPolicy: string;
  termsConditions: string;
  heroHeadline: string;
  heroSubheading: string;
  heroImage: string;
  heroButtonPrimary: string;
  heroButtonSecondary: string;
  antiTarnishHeadline: string;
  antiTarnishDescription: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}
