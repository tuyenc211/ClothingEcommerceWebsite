import { create } from "zustand";
import { toast } from "sonner";
import { SignUpData, LoginData } from "@/types";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { persist } from "zustand/middleware";

// Role interface matching database schema
export interface Role {
  id: number;
  name: string;
}

// Address interface matching database schema
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

// User interface matching database schema
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

// JWT Token Response
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// Auth Response
export interface AuthResponse {
  user: User;
  tokens: TokenResponse;
}

interface AuthStore {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isCheckingAuth: boolean;
  isForgettingPassword: boolean;
  isResettingPassword: boolean;
  hasInitialized: boolean;
  isRefreshingToken: boolean;

  // Token management
  refreshToken: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;

  // User management
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;

  // Address management
  addAddress: (address: Omit<Address, "id" | "user_id">) => Promise<void>;
  updateAddress: (id: number, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
  getDefaultAddress: () => Address | undefined;

  // Role management
  hasRole: (roleName: string) => boolean;
  isAdmin: () => boolean;
  isCustomer: () => boolean;

  // Auth actions
  checkAuth: () => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  initialize: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isCheckingAuth: false,
      isForgettingPassword: false,
      isResettingPassword: false,
      isRefreshingToken: false,
      hasInitialized: false,

      initialize: () => {
        set({ hasInitialized: true });
      },

      // Get access token from cookies via API call
      getAccessToken: async () => {
        try {
          const response = await privateClient.get("/auth/token");
          return response.data.accessToken;
        } catch (error) {
          console.error("Failed to get access token:", error);
          return null;
        }
      },

      // Refresh token
      refreshToken: async () => {
        if (get().isRefreshingToken) return;

        set({ isRefreshingToken: true });
        try {
          await privateClient.post("/auth/refresh");
          // Server sẽ set cookie mới
        } catch (error) {
          // Nếu refresh thất bại, logout user
          set({ authUser: null });
          if (typeof window !== 'undefined') {
            window.location.href = '/user/login';
          }
          throw error;
        } finally {
          set({ isRefreshingToken: false });
        }
      },

      checkAuth: async () => {
        if (get().isCheckingAuth) return;
        
        set({ isCheckingAuth: true });
        try {
          const res = await privateClient.get("/auth/me");
          set({
            authUser: res.data?.user,
            hasInitialized: true,
          });
        } catch (error) {
          set({ authUser: null, hasInitialized: true });
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      login: async (data: LoginData) => {
        set({ isLoggingIn: true });
        try {
          const res = await privateClient.post("/auth/login", data, {
            withCredentials: true, // Đảm bảo cookies được gửi
          });
          
          console.log("✅ Login thành công, response:", res);
          
          // Server sẽ set httpOnly cookies cho tokens
          set({ 
            authUser: res.data.user, 
            hasInitialized: true 
          });
          
          toast.success("Đăng nhập thành công");
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Đã xảy ra lỗi khi đăng nhập";

          console.log("❌ Error message:", errorMessage);
          toast.error(errorMessage);
          throw error as AxiosError;
        } finally {
          set({ isLoggingIn: false });
        }
      },

      signup: async (data: SignUpData) => {
        set({ isSigningUp: true });

        try {
          const res = await privateClient.post("/auth/register", data, {
            withCredentials: true,
          });

          // Server sẽ set httpOnly cookies cho tokens
          set({
            authUser: res.data.user,
            hasInitialized: true,
          });

          toast.success("Đăng ký thành công");
        } catch (error) {
          set({ isSigningUp: false });
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
          await privateClient.post("/auth/logout", {}, {
            withCredentials: true,
          });
          // Server sẽ clear cookies
        } catch (error) {
          console.log("Error logging out:", error);
        } finally {
          set({ authUser: null, hasInitialized: true });
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
            { password }
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
          const response = await privateClient.put("/users/profile", data);
          const updatedUser = response.data.user;
          set({ authUser: updatedUser });
          toast.success("Cập nhật thông tin thành công");
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

      // Address management - Giữ nguyên logic mock hoặc cập nhật với API thật
      addAddress: async (address: Omit<Address, "id" | "user_id">) => {
        try {
          const response = await privateClient.post("/users/addresses", address);
          const newAddress = response.data.address;
          
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
          await privateClient.put(`/users/addresses/${id}`, address);
          
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
          await privateClient.delete(`/users/addresses/${id}`);
          
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
          await privateClient.patch(`/users/addresses/${id}/default`);
          
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
          currentUser?.roles?.some(
            (role) => role.name.toLowerCase() === roleName.toLowerCase()
          ) || false
        );
      },

      isAdmin: () => {
        return get().hasRole("admin") || get().hasRole("super_admin");
      },

      isCustomer: () => {
        return get().hasRole("customer");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        authUser: state.authUser,
        hasInitialized: state.hasInitialized,
      }),
    }
  )
);

export default useAuthStore;
