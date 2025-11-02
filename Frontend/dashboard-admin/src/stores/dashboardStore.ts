import { create } from "zustand";
import privateClient from "@/lib/axios";
import { Order } from "./orderStore";
import { Role, User } from "./useAuthStore";

// Dashboard statistics interfaces
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

export interface RecentOrder {
  id: number;
  code: string;
  customerName: string;
  customerEmail: string;
  products: number;
  total: number;
  discountedTotal: number;
  status: string;
  createdAt: string;
}

export interface RevenueData {
  date: string;
  currentMonth: number;
  lastMonth: number;
}

interface DashboardState {
  // Data
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  revenueData: RevenueData[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardStats: () => Promise<void>;
  fetchRecentOrders: () => Promise<void>;
  fetchRevenueData: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
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
  recentOrders: [],
  revenueData: [],
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch data from different endpoints
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        privateClient.get("/orders"),
        privateClient.get("/users"),
        privateClient.get("/products"),
      ]);

      const orders = ordersRes.data?.data || ordersRes.data || [];
      const users = usersRes.data?.data || usersRes.data || [];
      const products = productsRes.data?.data || productsRes.data || [];

      // Calculate total revenue from orders
      const totalRevenue = orders.reduce(
        (sum: number, order: Order) => sum + (order.grandTotal || 0),
        0
      );

      // Count customers (users with CUSTOMER role)
      const totalCustomers = users.filter((user: User) =>
        user.roles?.some((role: Role) => role.name === "CUSTOMER")
      ).length;

      // Calculate stats
      const stats: DashboardStats = {
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers,
        totalProducts: products.length,
        revenueGrowth: 0, // Can calculate if you have historical data
        ordersGrowth: 0,
        customersGrowth: 0,
        productsGrowth: 0,
      };

      set({ stats, isLoading: false });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  fetchRecentOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await privateClient.get("/orders");
      const orders = response.data?.data || response.data || [];

      // Transform orders to RecentOrder format and get latest 5
      const recentOrders: RecentOrder[] = orders
        .sort(
          (a: Order, b: Order) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        )
        .slice(0, 5)
        .map((order: Order) => ({
          id: order.id,
          code: order.code,
          customerName: order.user?.fullName || "N/A",
          customerEmail: order.user?.email || "N/A",
          products: order.totalItems || order.items?.length || 0,
          total: order.subtotal || 0,
          discountedTotal: order.grandTotal || 0,
          status: order.status,
          createdAt: order.createdAt || order.placedAt,
        }));

      set({ recentOrders, isLoading: false });
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      throw error;
    }
  },

  fetchRevenueData: async () => {
    try {
      const response = await privateClient.get("/orders");
      const orders = response.data?.data || response.data || [];

      // Group orders by month and calculate revenue
      const monthlyRevenue = new Map<string, number>();
      
      orders.forEach((order: Order) => {
        if (order.createdAt && order.grandTotal) {
          const date = new Date(order.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
          const current = monthlyRevenue.get(monthKey) || 0;
          monthlyRevenue.set(monthKey, current + order.grandTotal);
        }
      });

      // Convert to array and sort by date
      const sortedMonths = Array.from(monthlyRevenue.entries())
        .sort(([a], [b]) => a.localeCompare(b));

      // Create revenue data with current and last month comparison
      const revenueData: RevenueData[] = sortedMonths.map(([date, revenue], index) => {
        const lastMonthRevenue = index > 0 ? sortedMonths[index - 1][1] : 0;
        return {
          date,
          currentMonth: revenue,
          lastMonth: lastMonthRevenue,
        };
      });

      set({ revenueData });
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      set({ error: "Failed to fetch revenue data" });
    }
  },

  clearError: () => set({ error: null }),
}));
