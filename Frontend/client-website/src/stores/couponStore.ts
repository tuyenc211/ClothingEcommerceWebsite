import { mockCoupons } from "@/data/product";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Coupon interface matching database schema
export interface Coupon {
  id: number; // BIGINT PRIMARY KEY AUTO_INCREMENT
  code: string; // VARCHAR(50) NOT NULL UNIQUE
  name: string; // VARCHAR(255) NOT NULL
  description?: string; // TEXT
  value: number; // DECIMAL(12,2) NOT NULL
  max_uses?: number;
  max_uses_per_user?: number;
  min_order_total?: number;
  starts_at?: string;
  ends_at?: string;
  is_active: boolean; // TINYINT(1) NOT NULL DEFAULT 1
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
  getCoupons: () => Coupon[];
  getCouponById: (id: number) => Coupon | undefined;
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

      getCoupons: () => {
        return get().getCouponsSortedByDate();
      },

      getCouponById: (id: number) => {
        return get().coupons.find((coupon) => coupon.id === id);
      },

      addCoupon: (couponData) => {
        const newCoupon: Coupon = {
          ...couponData,
          id: Date.now(),
          starts_at: new Date().toISOString(),
          ends_at: new Date().toISOString(),
        };

        set((state) => ({
          coupons: [...state.coupons, newCoupon],
        }));
      },

      updateCoupon: (id: number, couponData) => {
        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === id
              ? {
                  ...coupon,
                  ...couponData,
                  updatedAt: new Date().toISOString(),
                }
              : coupon
          ),
        }));
      },

      deleteCoupon: (id: number) => {
        set((state) => ({
          coupons: state.coupons.filter((coupon) => coupon.id !== id),
        }));
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
        if (!coupon.starts_at || !coupon.ends_at) return "active";

        const startDate = new Date(coupon.starts_at);
        const endDate = new Date(coupon.ends_at);

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
          if (!a.starts_at || !b.starts_at) return 0;
          return (
            new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
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
