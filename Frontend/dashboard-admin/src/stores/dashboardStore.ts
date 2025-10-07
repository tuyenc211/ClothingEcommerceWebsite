import { create } from "zustand";

// Mock data interfaces
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: "active" | "inactive";
  image?: string;
  description?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: "active" | "inactive";
  productsCount: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

interface DashboardState {
  // Data
  products: Product[];
  categories: Category[];
  customers: Customer[];
  orders: Order[];
  stats: DashboardStats;

  // Loading states
  isLoading: boolean;

  // Actions
  initializeData: () => void;

  // Product actions
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Category actions
  addCategory: (
    category: Omit<Category, "id" | "createdAt" | "productsCount">
  ) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Customer actions
  addCustomer: (
    customer: Omit<Customer, "id" | "createdAt" | "totalOrders" | "totalSpent">
  ) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Order actions
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;

  // Stats calculation
  calculateStats: () => void;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Áo thun nam basic",
    price: 299000,
    category: "Áo thun",
    stock: 50,
    status: "active",
    description: "Áo thun nam basic chất liệu cotton",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Quần jean nữ skinny",
    price: 599000,
    category: "Quần jean",
    stock: 30,
    status: "active",
    description: "Quần jean nữ skinny fit",
    createdAt: "2024-01-02",
  },
];

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Áo thun",
    slug: "ao-thun",
    description: "Các loại áo thun",
    status: "active",
    productsCount: 15,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Quần jean",
    slug: "quan-jean",
    description: "Các loại quần jean",
    status: "active",
    productsCount: 8,
    createdAt: "2024-01-01",
  },
];

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0123456789",
    address: "Hà Nội",
    totalOrders: 5,
    totalSpent: 2500000,
    status: "active",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0987654321",
    address: "TP.HCM",
    totalOrders: 3,
    totalSpent: 1800000,
    status: "active",
    createdAt: "2024-01-02",
  },
];

const mockOrders: Order[] = [
  {
    id: "1",
    customerId: "1",
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@email.com",
    items: [
      {
        id: "1",
        productId: "1",
        productName: "Áo thun nam basic",
        quantity: 2,
        price: 299000,
      },
    ],
    total: 598000,
    status: "delivered",
    shippingAddress: "Hà Nội",
    createdAt: "2024-01-15",
  },
];

export const useDashboardStore = create<DashboardState>((set, get) => ({
  products: [],
  categories: [],
  customers: [],
  orders: [],
  stats: {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    productsGrowth: 0,
  },
  isLoading: false,

  initializeData: () => {
    set({
      products: mockProducts,
      categories: mockCategories,
      customers: mockCustomers,
      orders: mockOrders,
    });
    get().calculateStats();
  },

  // Product actions
  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      products: [...state.products, newProduct],
    }));
    get().calculateStats();
  },

  updateProduct: (id, product) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...product } : p
      ),
    }));
    get().calculateStats();
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
    get().calculateStats();
  },

  // Category actions
  addCategory: (category) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      productsCount: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      categories: [...state.categories, newCategory],
    }));
  },

  updateCategory: (id, category) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...category } : c
      ),
    }));
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },

  // Customer actions
  addCustomer: (customer) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      customers: [...state.customers, newCustomer],
    }));
    get().calculateStats();
  },

  updateCustomer: (id, customer) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...customer } : c
      ),
    }));
    get().calculateStats();
  },

  deleteCustomer: (id) => {
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    }));
    get().calculateStats();
  },

  // Order actions
  addOrder: (order) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      orders: [...state.orders, newOrder],
    }));
    get().calculateStats();
  },

  updateOrder: (id, order) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...order } : o)),
    }));
    get().calculateStats();
  },

  deleteOrder: (id) => {
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    }));
    get().calculateStats();
  },

  calculateStats: () => {
    const { products, customers, orders } = get();

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalProducts = products.length;

    set({
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth: 12.5, // Mock growth percentages
        ordersGrowth: 8.3,
        customersGrowth: 15.2,
        productsGrowth: 5.7,
      },
    });
  },
}));
