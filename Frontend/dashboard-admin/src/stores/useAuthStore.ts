import { create } from "zustand";
import { toast } from "sonner";
import { LoginData } from "@/types";
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
  isLoggingIn: boolean;
  isCheckingAuth: boolean;
  isForgettingPassword: boolean;
  isResettingPassword: boolean;

  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;

  addAddress: (address: Omit<Address, "id" | "userId">) => Promise<void>;
  updateAddress: (id: number, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
  getDefaultAddress: () => Address | undefined;

  hasRole: (roleName: string) => boolean;
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isAdminOrStaff: () => boolean;
  isCustomer: () => boolean;

  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      authUser: null,
      isLoggingIn: false,
      isCheckingAuth: false,
      isForgettingPassword: false,
      isResettingPassword: false,

      login: async (data: LoginData) => {
        set({ isLoggingIn: true });
        try {
          const res = await privateClient.post("/auth/login", data);

          console.log("✅ Login response:", res.data);

          const user = res.data.user || res.data;

          // Kiểm tra vai trò người dùng - chỉ cho phép Admin và Staff
          const hasValidRole = user?.roles?.some(
            (role: Role) => role.name === "ADMIN" || role.name === "STAFF"
          );

          if (!hasValidRole) {
            set({ isLoggingIn: false });
            toast.error("Bạn không có quyền truy cập vào trang quản trị");
            throw new Error("Unauthorized access");
          }

          // Backend sẽ set cookie, frontend lưu user data
          set({ authUser: user });
          toast.success(
            `Đăng nhập thành công với vai trò ${
              user.roles?.[0]?.name?.toLowerCase()
            }`
          );
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
          throw error as AxiosError;
        } finally {
          set({ isForgettingPassword: false });
        }
      },

      resetPassword: async (token: string, password: string) => {
        set({ isResettingPassword: true });
        try {
          const response = await privateClient.post(
            `/auth/reset-password/${token}`,
            {
              password,
            }
          );
          toast.success("Mật khẩu đã được đặt lại thành công");
          return response.data;
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.";

          console.log("❌ Reset password error:", errorMessage);
          toast.error(errorMessage);
          throw error as AxiosError;
        } finally {
          set({ isResettingPassword: false });
        }
      },

      // User management
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
          await privateClient.post("/auth/change-password", {
            oldPassword,
            newPassword,
          });
          toast.success("Đổi mật khẩu thành công");
        } catch (error) {
          toast.error("Đổi mật khẩu thất bại");
          throw error;
        }
      },

      // Address management
      addAddress: async (address: Omit<Address, "id" | "userId">) => {
        try {
          const newAddress: Address = {
            ...address,
            id: Date.now(),
            user_id: get().authUser?.id || 0,
          };

          const currentUser = get().authUser;
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              addresses: [...(currentUser.addresses || []), newAddress],
            };
            set({ authUser: updatedUser });
            toast.success("Thêm địa chỉ thành công");
          }
        } catch (error) {
          toast.error("Thêm địa chỉ thất bại");
          throw error;
        }
      },

      updateAddress: async (id: number, address: Partial<Address>) => {
        try {
          const currentUser = get().authUser;
          if (currentUser) {
            const updatedAddresses = currentUser.addresses?.map((addr) =>
              addr.id === id ? { ...addr, ...address } : addr
            );

            const updatedUser = {
              ...currentUser,
              addresses: updatedAddresses,
            };
            set({ authUser: updatedUser });
            toast.success("Cập nhật địa chỉ thành công");
          }
        } catch (error) {
          toast.error("Cập nhật địa chỉ thất bại");
          throw error;
        }
      },

      deleteAddress: async (id: number) => {
        try {
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

      // Role management
      hasRole: (roleName: string) => {
        const currentUser = get().authUser;
        return (
          currentUser?.roles?.some((role) => role.name === roleName) || false
        );
      },

      isAdmin: () => {
        return get().hasRole("ADMIN");
      },

      isStaff: () => {
        return get().hasRole("STAFF");
      },

      isAdminOrStaff: () => {
        return get().isAdmin() || get().isStaff();
      },

      isCustomer: () => {
        return get().hasRole("Customer") || get().hasRole("customer");
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
