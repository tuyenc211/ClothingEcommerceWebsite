import { create } from "zustand";
import { toast } from "sonner";
import { SignUpData, LoginData } from "@/types";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { persist } from "zustand/middleware";

export interface Role {
  id: number;
  name: string;
}

export interface Address {
  id: number;
  user_id: number;
  line: string;
  ward?: string;
  district?: string;
  province?: string;
  country?: string;
  isDefault: boolean;
}

export interface User {
  id: number;
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  roles?: Role[];
  addresses?: Address[];
}

interface AuthStore {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isForgettingPassword: boolean;
  isResettingPassword: boolean;
  isConfirmingEmail: boolean;

  // User management
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;

  // Address management
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, "id" | "user_id">) => Promise<void>;
  updateAddress: (id: number, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
  getDefaultAddress: () => Address | undefined;

  // Role management
  hasRole: (roleName: string) => boolean;
  // Auth actions
  signup: (data: SignUpData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  confirmEmail: (token: string) => Promise<void>;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isForgettingPassword: false,
      isResettingPassword: false,
      isConfirmingEmail: false,

      login: async (data: LoginData) => {
        set({ isLoggingIn: true });
        try {
          const res = await privateClient.post("/auth/login", data);

          console.log("✅ Login success:", res.data);

          // Backend set cookie, frontend lưu user data
          set({ authUser: res.data.user || res.data });

          toast.success("Đăng nhập thành công");
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Đã xảy ra lỗi khi đăng nhập";

          console.log("❌ Login error:", errorMessage);
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoggingIn: false });
        }
      },

      signup: async (data: SignUpData) => {
        set({ isSigningUp: true });

        try {
          const res = await privateClient.post("/auth/register", data);
          toast.success(
            "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
          );
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Đăng ký thất bại";

          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isSigningUp: false });
        }
      },

      logout: async () => {
        try {
          await privateClient.post("/auth/logout");
        } catch (error) {
          console.log("Logout error:", error);
        } finally {
          set({ authUser: null });
          toast.success("Đăng xuất thành công");
        }
      },

      forgotPassword: async (email: string) => {
        set({ isForgettingPassword: true });
        try {
          await privateClient.post("/auth/forgot-password", { email });
          toast.success(
            "Liên kết khôi phục mật khẩu đã được gửi đến email của bạn"
          );
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại sau.";

          console.log("❌ Forgot password error:", errorMessage);
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isForgettingPassword: false });
        }
      },

      resetPassword: async (token: string, password: string) => {
        set({ isResettingPassword: true });
        try {
          const response = await privateClient.put("/auth/reset-password", {
            token,
            newPassword: password,
          });
          toast.success("Mật khẩu đã được đặt lại thành công");
          return response.data;
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.";

          console.log("❌ Reset password error:", errorMessage);
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isResettingPassword: false });
        }
      },

      confirmEmail: async (token: string) => {
        set({ isConfirmingEmail: true });
        try {
          const response = await privateClient.get("/auth/confirm", {
            params: { token },
          });
          toast.success(
            "Xác thực email thành công! Bạn có thể đăng nhập ngay."
          );
          return response.data;
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Có lỗi xảy ra khi xác thực email. Token có thể đã hết hạn.";

          console.log("❌ Confirm email error:", errorMessage);
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isConfirmingEmail: false });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const currentUser = get().authUser;
          if (!currentUser?.id) {
            throw new Error("User not authenticated");
          }
          await privateClient.put(`/users/change/${currentUser.id}`, {
            fullName: data.fullName,
            phone: data.phone,
          });

          // Cập nhật local state
          const updatedUser = {
            ...currentUser,
            fullName: data.fullName || currentUser.fullName,
            phone: data.phone || currentUser.phone,
          };
          set({ authUser: updatedUser });
          toast.success("Cập nhật thông tin thành công");
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Cập nhật thông tin thất bại";
          toast.error(errorMessage);
          throw error;
        }
      },

      changePassword: async (oldPassword: string, newPassword: string) => {
        try {
          const currentUser = get().authUser;
          if (!currentUser?.email) {
            throw new Error("User not authenticated");
          }

          await privateClient.put("/users/change-password", {
            email: currentUser.email,
            oldPassword,
            newPassword,
          });
          toast.success("Đổi mật khẩu thành công");
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Đổi mật khẩu thất bại";
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchAddresses: async () => {
        try {
          const currentUser = get().authUser;
          if (!currentUser?.id) {
            console.warn("User not authenticated, skipping fetch addresses");
            return;
          }

          const response = await privateClient.get(
            `/addresses/user/${currentUser.id}`
          );
          const addresses = response.data;

          const updatedUser = {
            ...currentUser,
            addresses: addresses,
          };
          set({ authUser: updatedUser });
        } catch (error) {
          console.error("Fetch addresses error:", error);
          // Don't throw error to prevent auth state from being cleared
          // Just log the error and keep the current state
        }
      },

      addAddress: async (address: Omit<Address, "id" | "user_id">) => {
        try {
          const currentUser = get().authUser;
          if (!currentUser?.id) {
            throw new Error("User not authenticated");
          }

          const response = await privateClient.post("/addresses", {
            ...address,
            userId: currentUser.id,
          });
          const newAddress = response.data;

          // Nếu địa chỉ mới là mặc định, cập nhật các địa chỉ khác
          let updatedAddresses = [...(currentUser.addresses || []), newAddress];
          if (newAddress.isDefault) {
            updatedAddresses = updatedAddresses.map((addr) =>
              addr.id === newAddress.id ? addr : { ...addr, isDefault: false }
            );
          }

          const updatedUser = {
            ...currentUser,
            addresses: updatedAddresses,
          };
          set({ authUser: updatedUser });
          toast.success("Thêm địa chỉ thành công");
        } catch (error) {
          toast.error("Thêm địa chỉ thất bại");
          throw error;
        }
      },

      updateAddress: async (id: number, address: Partial<Address>) => {
        try {
          const currentUser = get().authUser;
          if (!currentUser?.id) {
            throw new Error("User not authenticated");
          }

          const response = await privateClient.put(`/addresses/${id}`, {
            ...address,
            userId: currentUser.id,
          });
          const updatedAddress = response.data;
          let updatedAddresses = currentUser.addresses?.map((addr) =>
            addr.id === id ? updatedAddress : addr
          );

          if (updatedAddress.isDefault) {
            updatedAddresses = updatedAddresses?.map((addr) =>
              addr.id === id ? addr : { ...addr, isDefault: false }
            );
          }

          const updatedUser = {
            ...currentUser,
            addresses: updatedAddresses,
          };
          set({ authUser: updatedUser });
          toast.success("Cập nhật địa chỉ thành công");
        } catch (error) {
          toast.error("Cập nhật địa chỉ thất bại");
          throw error;
        }
      },

      deleteAddress: async (id: number) => {
        try {
          await privateClient.delete(`/addresses/${id}`);

          const currentUser = get().authUser;
          if (currentUser) {
            const updatedAddresses = currentUser.addresses?.filter(
              (addr) => addr.id !== id
            );

            const updatedUser = {
              ...currentUser,
              addresses: updatedAddresses,
            };
            set({ authUser: updatedUser });
            toast.success("Xóa địa chỉ thành công");
          }
        } catch (error) {
          toast.error("Xóa địa chỉ thất bại");
          throw error;
        }
      },

      setDefaultAddress: async (id: number) => {
        try {
          const response = await privateClient.put(`/addresses/${id}/default`);
          const updatedAddress = response.data;

          const currentUser = get().authUser;
          if (currentUser) {
            const updatedAddresses = currentUser.addresses?.map((addr) => ({
              ...addr,
              isDefault: addr.id === id,
            }));

            const updatedUser = {
              ...currentUser,
              addresses: updatedAddresses,
            };
            set({ authUser: updatedUser });
            toast.success("Đặt địa chỉ mặc định thành công");
          }
        } catch (error) {
          toast.error("Đặt địa chỉ mặc định thất bại");
          throw error;
        }
      },

      getDefaultAddress: () => {
        const currentUser = get().authUser;
        return currentUser?.addresses?.find((addr) => addr.isDefault);
      },

      hasRole: (roleName: string) => {
        const currentUser = get().authUser;
        return (
          currentUser?.roles?.some(
            (role) => role.name.toLowerCase() === roleName.toLowerCase()
          ) || false
        );
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        authUser: state.authUser,
      }),
    }
  )
);

export default useAuthStore;
