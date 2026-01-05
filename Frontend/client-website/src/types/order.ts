import { Product } from "./product";

export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "WALLET";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "PARTIAL";

export interface OrderItem {
  id: number;
  orderId: number;
  product: Product;
  variantId?: number;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Shipment {
  id: number;
  orderId: number;
  carrier?: string;
  trackingNumber?: string;
  status?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  fromStatus?: string;
  toStatus: string;
  changedBy?: number;
  changedAt: string;
  note?: string;
}

export interface CreateOrderRequest {
  paymentMethod: PaymentMethod;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    ward: string;
    province: string;
  };
}

export interface Order {
  id: number;
  code: string;
  status: OrderStatus;
  totalItems: number;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddressSnapshot?: Record<string, unknown>;
  placedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
  shipments?: Shipment[];
  statusHistory?: OrderStatusHistory[];
}
