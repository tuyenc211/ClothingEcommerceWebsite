import { create } from "zustand";
import { toast } from "sonner";
import { SignUpData, LoginData } from "@/types";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { persist } from "zustand/middleware";

// Role interface matching database schema
export interface Role {
  id: number; // BIGINT PRIMARY KEY AUTO_INCREMENT
  name: string; // VARCHAR(100) NOT NULL
}

// Address interface matching database schema
export interface Address {
  id: number; // BIGINT PRIMARY KEY AUTO_INCREMENT
  user_id: number; // BIGINT NOT NULL references users(id)
  line: string; // VARCHAR(255) NOT NULL
  ward?: string; // VARCHAR(100)
  district?: string; // VARCHAR(100)
  province?: string; // VARCHAR(100)
  country?: string; // VARCHAR(100) DEFAULT 'VN'
  isDefault: boolean; // TINYINT(1) DEFAULT 0
}

// User interface matching database schema
export interface User {
  id: number; // BIGINT PRIMARY KEY AUTO_INCREMENT
  email: string; // VARCHAR(255) NOT NULL UNIQUE
  password?: string; // VARCHAR(255) NOT NULL (hidden in responses)
  fullName: string; // VARCHAR(255) NOT NULL
  phone?: string; // VARCHAR(30)
  isActive: boolean; // TINYINT(1) NOT NULL DEFAULT 1

  // Relationships (populated from joins)
  roles?: Role[]; // From user_roles table
  addresses?: Address[]; // From addresses table
}

interface AuthStore {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isCheckingAuth: boolean;
  isForgettingPassword: boolean;
  isResettingPassword: boolean;

  // User management
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;

  // Address management
  addAddress: (address: Omit<Address, "id" | "userId">) => Promise<void>;
  updateAddress: (id: number, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
  getDefaultAddress: () => Address | undefined;

  // Role management
  hasRole: (roleName: string) => boolean;
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isAdminOrStaff: () => boolean;
  isCustomer: () => boolean;

  // Auth actions
  checkAuth: () => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isLoggingOut: false,
      isCheckingAuth: false,
      isForgettingPassword: false,
      isResettingPassword: false,
      checkAuth: async () => {
        if (get().isCheckingAuth) return;
        set({ isCheckingAuth: true });
        try {
          const res = await privateClient.get("/auth/check-auth");

          // Kiểm tra vai trò - chỉ cho phép Admin và Staff truy cập dashboard
          const user = res.data.user || res.data;
          const hasValidRole = user?.roles?.some(
            (role: Role) =>
              role.name === "Admin" ||
              role.name === "Staff" ||
              role.name === "admin" ||
              role.name === "staff"
          );

          if (!hasValidRole) {
            set({ authUser: null });
            toast.error("Bạn không có quyền truy cập vào trang quản trị");
            return;
          }

          set({ authUser: user });
        } catch (error) {
          console.log("CheckAuth error:", error);
          set({ authUser: null });
        } finally {
          set({ isCheckingAuth: false });
        }
      },

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
              user.roles?.[0]?.name || "ADMIN"
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

      signup: async (data: SignUpData) => {
        set({ isSigningUp: true });

        try {
          // Simulate API call - replace with actual API when backend is ready
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mock successful signup - Default to Admin role for dashboard access
          const authUser: User = {
            id: Date.now(), // BIGINT PRIMARY KEY AUTO_INCREMENT
            email: data.email,
            phone: data.phoneNumber,
            fullName: data.fullName,
            isActive: true,
            roles: [{ id: 1, name: "Admin" }], // Default to Admin role
            addresses: [],
          };

          set({
            authUser: authUser,
            isSigningUp: false,
          });

          toast.success("Đăng ký thành công");
        } catch (error) {
          set({ isSigningUp: false });
          toast.error("Đăng ký thất bại");
          throw error;
        }
      },
      logout: async () => {
        set({ isLoggingOut: true });
        try {
          await privateClient.post("/auth/logout");
          console.log("✅ Logout thành công");

          set({
            authUser: null,
            isLoggingOut: false,
          });
          toast.success("Đăng xuất thành công");
        } catch (error) {
          console.log("Error logging out:", error);
          set({
            authUser: null,
            isLoggingOut: false,
          });
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
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 500));

          const currentUser = get().authUser;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...data };
            set({ authUser: updatedUser });
            toast.success("Cập nhật thông tin thành công");
          }
        } catch (error) {
          toast.error("Cập nhật thông tin thất bại");
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
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 500));

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
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 500));

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
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 500));

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
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 500));

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
        return (
          get().hasRole("Admin") ||
          get().hasRole("admin") ||
          get().hasRole("super_admin")
        );
      },

      isStaff: () => {
        return get().hasRole("Staff") || get().hasRole("staff");
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
