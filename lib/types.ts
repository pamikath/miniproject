export type ProductCategory =
  | "all"
  | "ebook"
  | "template"
  | "course"
  | "software"
  | "graphics"
  | "other";

export type ProductTag = "recommended" | "bestseller" | "new";

export type OrderStatus = "pending_payment" | "processing" | "completed" | "cancelled";

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: ProductCategory;
  tags: ProductTag[];
  price: number;
  originalPrice?: number;
  coverImage: string;
  rating: number;
  reviewCount: number;
  fileType: string;
  fileSize: string;
  downloadFileUrl: string;
  fileName: string;
  features?: string[];
  author?: string;
  sellerEmail?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected?: boolean;
}

export interface OrderItem {
  productId: string;
  title: string;
  category: string;
  price: number;
  coverImage: string;
  fileType: string;
  fileSize: string;
  fileName: string;
  downloadUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #LB20240615
  date: string;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  netAmount: number;
  status: OrderStatus;
  paymentMethod: "stripe" | "promptpay" | "credit_card";
  customerName?: string;
  customerEmail?: string;
  createdAt?: string;
  downloadExpiry?: string;
  downloadCount?: number;
}

export interface AddressInfo {
  recipientName: string;
  phone: string;
  addressLine: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  taxId?: string;
  companyName?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  phone?: string;
  bio?: string;
  avatar: string;
  isVip: boolean;
  tier: "Member" | "Pro" | "VIP";
  stats: {
    favoritesCount: number;
    ordersCount: number;
    rewardPoints: number;
  };
  address?: AddressInfo;
  joinedDate?: string;
}
