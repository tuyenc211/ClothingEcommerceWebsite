import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import {AxiosError} from "axios";
import {toast} from "sonner";

// Coupon interface matching database schema
export interface Coupon {
    id: number;
    code: string;
    name: string;
    description?: string;
    value: number;
    maxUses?: number;
    maxUsesPerUser?: number;
    minOrderTotal?: number;
    startsAt?: string;
    endsAt?: string;
    isActive: boolean;
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

 fetchCoupons:()=> Promise<void>;
  getCoupons: () => Coupon[];
  getCouponById: (id: number) => Coupon | undefined;
  getActiveCoupons: () => Coupon[];
  getCouponStatus: (coupon: Coupon) => "active" | "expired" | "upcoming";

  setError: (error: string | null) => void;
  clearError: () => void;
}
export const useCouponStore = create<CouponStore>()(
  persist(
    (set, get) => ({
      coupons: [],
      isLoading: false,
      error: null,

      getCoupons: () => {
        return get().coupons;
      },

      getCouponById: (id: number) => {
        return get().coupons.find((coupon) => coupon.id === id);
      },

        fetchCoupons: async () => {
            set({ isLoading: true, error: null });
            try {
                const response = await privateClient.get("/coupons");
                const data = response.data.data || response.data;

                set({
                    coupons: data.sort((a: Coupon, b: Coupon) => {
                        if (!a.startsAt || !b.startsAt) return 0;
                        return (
                            new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
                        );
                    }),
                    error: null,
                });

                console.log("✅ Coupons fetched:", data);
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

      // getCouponsSortedByDate: () => {
      //   return get().coupons.sort((a, b) => {
      //     if (!a.startsAt || !b.startsAt) return 0;
      //     return (
      //       new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
      //     );
      //   });
      // },

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
