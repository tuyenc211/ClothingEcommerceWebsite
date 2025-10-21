import { mockCoupons } from "@/data/productv2";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Coupon interface matching database schema
export interface Coupon {
  id: number; // BIGINT PRIMARY KEY AUTO_INCREMENT
  code: string; // VARCHAR(50) NOT NULL UNIQUE
  name: string; // VARCHAR(255) NOT NULL
  description?: string; // TEXT
  value: number; // DECIMAL(12,2) NOT NULL
  maxUses?: number;
  maxUsesPerUser?: number;
  minOrderTotal?: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean; // TINYINT(1) NOT NULL DEFAULT 1
}

// Coupon redemption interface matching database schema
export interface CouponRedemption {
  id: number; // BIGINT PRIMARY KEY AUTO_INCREMENT
  coupon_id: number; // BIGINT NOT NULL references coupons(id)
  user_id?: number; // BIGINT references users(id)
  order_id?: number; // BIGINT references orders(id)
  redeemed_at: string; // DATETIME DEFAULT CURRENT_TIMESTAMP

  // Populated fields
  coupon?: Coupon;
  user?: {
    id: number;
    fullName: string;
    email?: string;
  };
}

interface CouponStore {
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCoupons: () => void;
  getCouponById: (id: number) => Promise<Coupon>;
  addCoupon: (
    couponData: Omit<Coupon, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateCoupon: (id: number, couponData: Partial<Coupon>) => void;
  deleteCoupon: (id: number) => void;

  // Filters & Search
  searchCoupons: (query: string) => Coupon[];
  getActiveCoupons: () => Coupon[];
  getCouponsSortedByDate: () => Coupon[];

  // Validation
  validateCouponCode: (code: string, excludeId?: number) => boolean;
  validateCouponDates: (startsAt: string, endsAt: string) => boolean;
  getCouponStatus: (coupon: Coupon) => "active" | "expired" | "upcoming";

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
export const useCouponStore = create<CouponStore>()(
  persist(
    (set, get) => ({
      coupons: mockCoupons,
      isLoading: false,
      error: null,

      fetchCoupons: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get("/coupons");
          const coupons = response.data.data || response.data;

          set({
            coupons: coupons.sort((a: Coupon, b: Coupon) => {
              if (!a.startsAt || !b.startsAt) return 0;
              return (
                new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
              );
            }),
            error: null,
          });

          console.log("✅ Coupons fetched:", coupons);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Không thể tải danh sách mã giảm giá";
          set({ error: errorMessage });
          console.error("❌ Fetch coupons error:", error);
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      getCouponById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get(`/coupons/${id}`);
          const coupon = response.data.data || response.data;
          return coupon;
          console.log("✅ Coupon fetched:", coupon);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage = axiosError?.response?.data?.message;
          ("Không thể tải thông tin mã giảm giá");
          set({ error: errorMessage });
          console.error("❌ Fetch coupon error:", error);
          toast.error(errorMessage);
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      addCoupon: async (couponData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.post("/coupons", couponData);
          const newCoupon = response.data.data || response.data;

          set((state) => ({
            coupons: [newCoupon, ...state.coupons].sort((a, b) => {
              if (!a.startsAt || !b.startsAt) return 0;
              return (
                new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
              );
            }),
            error: null,
          }));

          toast.success("Thêm mã giảm giá thành công");
          console.log("✅ Coupon added:", newCoupon);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError.response?.data?.message || "Không thể thêm mã giảm giá";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCoupon: async (id: number, couponData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.put(
            `/coupons/${id}`,
            couponData
          );
          const updatedCoupon = response.data.data || response.data;

          set((state) => ({
            coupons: state.coupons
              .map((coupon) => (coupon.id === id ? updatedCoupon : coupon))
              .sort((a, b) => {
                if (!a.startsAt || !b.startsAt) return 0;
                return (
                  new Date(b.startsAt).getTime() -
                  new Date(a.startsAt).getTime()
                );
              }),
            error: null,
          }));

          toast.success("Cập nhật mã giảm giá thành công");
          console.log("✅ Coupon updated:", updatedCoupon);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError.response?.data?.message ||
            "Không thể cập nhật mã giảm giá";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteCoupon: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await privateClient.delete(`/coupons/${id}`);

          set((state) => ({
            coupons: state.coupons.filter((coupon) => coupon.id !== id),
            error: null,
          }));

          toast.success("Xóa mã giảm giá thành công");
          console.log("✅ Coupon deleted:", id);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError.response?.data?.message || "Không thể xóa mã giảm giá";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      searchCoupons: (query: string) => {
        const lowerQuery = query.toLowerCase();
        return get().coupons.filter(
          (coupon) =>
            (coupon.name && coupon.name.toLowerCase().includes(lowerQuery)) ||
            (coupon.description &&
              coupon.description.toLowerCase().includes(lowerQuery))
        );
      },
      getCouponStatus: (coupon: Coupon): "active" | "expired" | "upcoming" => {
        const now = new Date();
        if (!coupon.startsAt || !coupon.endsAt) return "active";

        const startDate = new Date(coupon.startsAt);
        const endDate = new Date(coupon.endsAt);

        if (now < startDate) return "upcoming";
        if (now > endDate) return "expired";

        return "active";
      },
      getActiveCoupons: () => {
        return get().coupons.filter((coupon) => {
          const status = get().getCouponStatus(coupon);
          return status === "active";
        });
      },

      getCouponsSortedByDate: () => {
        return get().coupons.sort((a, b) => {
          if (!a.startsAt || !b.startsAt) return 0;
          return (
            new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
          );
        });
      },

      validateCouponCode: (code: string, excludeId?: number) => {
        const existing = get().coupons.find(
          (coupon) =>
            coupon.code.toLowerCase() === code.toLowerCase() &&
            coupon.id !== excludeId
        );
        return !existing;
      },

      validateCouponDates: (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return start < end;
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "coupon-storage",
    }
  )
);
