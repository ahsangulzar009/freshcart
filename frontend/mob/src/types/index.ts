
export type UserRole = "CUSTOMER" | "ADMIN" | "DELIVERY_PARTNER"

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"

export type PaymentMethod = "COD" | "ONLINE"

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED"

export type ProductCategory = "FRUITS" | "VEGETABLES" | "MEAT"

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: UserRole
}

export interface Product {
  id: string
  name: string
  description: string | null
  category: ProductCategory
  price: number;
  unit: string;
  stock: number;
  imageUrl: string | null;
  isActive: boolean
  isFeatured: boolean
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean
}

export interface OrderItem {
  id: string;
  orderId: string
  productId: string;
  quantity: number;
  unitPrice: number;
  total: string;
  product: Product
}

export interface Order{
  id: string;
  orderNumber: string;
  customerId: string;
  deliveryPartnerId: string;  
  addressId: string;
  status: OrderStatus      
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  subtotal: string;
  deliveryFee: string;
  discount: string
  total: string;
  notes: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  address: Address
}

export interface CartItem{
  product: Product;
  quantity: number;
}

export interface PaginationMeta{
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T>{
  success: boolean;
  message: string;
  data: T
}

export interface PaginatedMeta<T>{
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta
}