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
  imageUrl?: string;
}

interface CouponStore {
  coupons: Coupon[];
  availableCoupons: Coupon[];
  isLoading: boolean;
  error: string | null;

  fetchCoupons: () => Promise<void>;
  fetchAvailableCoupons: (userId: number, orderTotal: number) => Promise<void>;
  getValidCouponsByTime: () => Coupon[];

  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCouponStore = create<CouponStore>()(
  persist(
    (set, get) => ({
      coupons: [],
      availableCoupons: [],
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
      fetchAvailableCoupons: async (userId: number, orderTotal: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get("/coupons/available", {
            params: { userId, orderTotal },
          });
          const data = response.data || [];

          set({
            availableCoupons: data.sort((a: Coupon, b: Coupon) => {
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
            "Không thể tải danh sách mã giảm giá khả dụng";

          set({ error: errorMsg, availableCoupons: [] });
          console.error("Fetch available coupons error:", errorMsg);
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
