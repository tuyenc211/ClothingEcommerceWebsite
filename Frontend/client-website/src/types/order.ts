export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  ward: string;
  district: string;
  province: string;
}

export interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
export const mockOrders: Order[] = [
  {
    _id: "order_1",
    userId: "user_123",
    orderNumber: "ORD-2024-001",
    items: [
      {
        _id: "item_1",
        productId: "prod_1",
        productName: "Áo Thun Nam Basic",
        productImage:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
        size: "L",
        color: "Đen",
        quantity: 2,
        price: 299000,
        total: 598000,
      },
      {
        _id: "item_2",
        productId: "prod_2",
        productName: "Quần Jeans Slim Fit",
        productImage:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop",
        size: "32",
        color: "Xanh Đen",
        quantity: 1,
        price: 599000,
        total: 599000,
      },
    ],
    subtotal: 1197000,
    shippingFee: 30000,
    discount: 0,
    total: 1227000,
    shippingAddress: {
      fullName: "Tài Ngô Văn",
      phoneNumber: "0987654321",
      address: "123 Đường ABC",
      ward: "Phường 1",
      district: "Quận 1",
      province: "TP. Hồ Chí Minh",
    },
    paymentMethod: "COD",
    paymentStatus: "pending",
    orderStatus: "processing",
    note: "Gọi trước khi giao",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:20:00Z",
  },
  {
    _id: "order_2",
    userId: "user_123",
    orderNumber: "ORD-2024-002",
    items: [
      {
        _id: "item_3",
        productId: "prod_3",
        productName: "Áo Khoác Hoodie",
        productImage:
          "https://images.unsplash.com/photo-1556821840-3a9c6fcc9fdf?w=200&h=200&fit=crop",
        size: "M",
        color: "Xám",
        quantity: 1,
        price: 799000,
        total: 799000,
      },
    ],
    subtotal: 799000,
    shippingFee: 30000,
    discount: 50000,
    total: 779000,
    shippingAddress: {
      fullName: "Tài Ngô Văn",
      phoneNumber: "0987654321",
      address: "123 Đường ABC",
      ward: "Phường 1",
      district: "Quận 1",
      province: "TP. Hồ Chí Minh",
    },
    paymentMethod: "Bank Transfer",
    paymentStatus: "paid",
    orderStatus: "delivered",
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
  },
  {
    _id: "order_3",
    userId: "user_123",
    orderNumber: "ORD-2024-003",
    items: [
      {
        _id: "item_4",
        productId: "prod_4",
        productName: "Giày Sneaker Nam",
        productImage:
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop",
        size: "42",
        color: "Trắng",
        quantity: 1,
        price: 1299000,
        total: 1299000,
      },
    ],
    subtotal: 1299000,
    shippingFee: 30000,
    discount: 0,
    total: 1329000,
    shippingAddress: {
      fullName: "Tài Ngô Văn",
      phoneNumber: "0987654321",
      address: "123 Đường ABC",
      ward: "Phường 1",
      district: "Quận 1",
      province: "TP. Hồ Chí Minh",
    },
    paymentMethod: "Credit Card",
    paymentStatus: "paid",
    orderStatus: "shipped",
    createdAt: "2024-01-20T14:22:00Z",
    updatedAt: "2024-01-21T11:30:00Z",
  },
];
