import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  imageUrl?: string;
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

  fetchCoupons: () => Promise<void>;
  getCouponById: (id: number) => Promise<Coupon>;
  addCoupon: (
    couponData: Omit<Coupon, "id" | "createdAt" | "updatedAt">,
    image?: File
  ) => Promise<void>;
  updateCoupon: (
    id: number,
    couponData: Partial<Coupon>,
    image?: File
  ) => Promise<void>;
  deleteCoupon: (id: number) => Promise<void>;

  searchCoupons: (query: string) => Coupon[];
  getActiveCoupons: () => Coupon[];
  getCouponsSortedByDate: () => Coupon[];

  validateCouponCode: (code: string, excludeId?: number) => boolean;
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

      getCouponById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get(`/coupons/${id}`);
          const coupon = response.data.data || response.data;
          return coupon;
          console.log("✅ Coupon fetched:", coupon);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Không thể tải thông tin mã giảm giá";
          set({ error: errorMessage });
          console.error("❌ Fetch coupon error:", error);
          toast.error(errorMessage);
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      addCoupon: async (couponData, image) => {
        set({ isLoading: true, error: null });
        try {
          const respone = await privateClient.post("/coupons", couponData);
          const newCoupon = respone.data.data || respone.data;
          const CouponId = newCoupon.id;
          if (image && CouponId) {
            const formData = new FormData();
            formData.append("image", image);
            await privateClient.post(
              `/coupons/${CouponId}/upload-image`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          }

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

      updateCoupon: async (id: number, couponData, image) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.put(
            `/coupons/${id}`,
            couponData
          );
          const updatedCoupon = response.data.data || response.data;

          // Bước 2: Upload ảnh mới nếu có
          if (image) {
            const formData = new FormData();
            formData.append("file", image);

            await privateClient.post(`/coupons/${id}/upload-image`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
          }
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
