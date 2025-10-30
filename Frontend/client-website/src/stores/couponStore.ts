import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

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

interface CouponStore {
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;

  fetchCoupons: () => Promise<void>;
  getActiveCoupons: () => Coupon[];
  getValidCouponsByTime: () => Coupon[];

  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCouponStore = create<CouponStore>()(
  persist(
    (set, get) => ({
      coupons: [],
      isLoading: false,
      error: null,
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
          });
        } catch (error) {
          const axiosErr = error as AxiosError<{ message: string }>;
          const errorMsg =
            axiosErr?.response?.data?.message ||
            "Không thể tải danh sách mã giảm giá";

          set({ error: errorMsg });
          toast.error(errorMsg);
        } finally {
          set({ isLoading: false });
        }
      },

      getActiveCoupons: () => {
        return get().coupons.filter((c) => c.isActive);
      },

      getValidCouponsByTime: () => {
        const now = Date.now();
        return get().coupons.filter((c) => {
          const startOk = !c.startsAt || new Date(c.startsAt).getTime() <= now;
          const endOk = !c.endsAt || new Date(c.endsAt).getTime() >= now;
          return startOk && endOk;
        });
      },

      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "coupon-storage",
    }
  )
);
