import { mockCoupons } from "@/data/productv2";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Coupon interface matching database schema
export interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  value: number;
  max_uses?: number;
  max_uses_per_user?: number;
  min_order_total?: number;
  starts_at?: string;
  ends_at?: string;
  is_active: boolean;
}
export interface CouponRedemption {
  id: number;
  coupon_id: number;
  user_id?: number;
  order_id?: number;
  redeemed_at: string;

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
  deleteCoupon: (id: number) => void;
  getActiveCoupons: () => Coupon[];
  getCouponsSortedByDate: () => Coupon[];

  // Validation
  validateCouponCode: (code: string, excludeId?: number) => boolean;
  validateCouponDates: (startsAt: string, endsAt: string) => boolean;
  getCouponStatus: (coupon: Coupon) => "active" | "expired" | "upcoming";

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
