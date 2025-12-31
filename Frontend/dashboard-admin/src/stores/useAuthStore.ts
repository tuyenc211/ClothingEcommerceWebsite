import { create } from "zustand";
import { toast } from "sonner";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
export interface Role {
  id: number;
  name: string;
}
export interface LoginData {
  email: string;
  password: string;
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
  accessToken?: string;
  phone?: string;
  isActive: boolean;
  roles?: Role[];
  addresses?: Address[];
}

interface AuthStore {
  authUser: User | null;
  accessToken: string | null;
  isLoading: boolean;

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
  setAccessToken: (token: string | null) => void;

  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearState: () => void;
}

const useAuthStore = create<AuthStore>()((set, get) => ({
  authUser: null,
  accessToken: null,
  isLoading: false,

  login: async (data: LoginData) => {
    set({ isLoading: true });
    try {
      const res = await privateClient.post("/auth/login", data);
      const user = res.data.user || res.data;
      const hasValidRole = user?.roles?.some(
        (role: Role) => role.name === "ADMIN" || role.name === "STAFF"
      );

      if (!hasValidRole) {
        set({ isLoading: false });
        throw new Error("Unauthorized access");
      }
      set({ authUser: user, accessToken: res.data.accesstoken });
      toast.success(
        `Đăng nhập thành công với vai trò ${user.roles?.[0]?.name?.toLowerCase()}`
      );
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Đã xảy ra lỗi khi đăng nhập";

      console.log(" Login error:", errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    try {
      get().clearState();
      await privateClient.post("/auth/logout");
    } catch (error) {
      console.log("Logout error:", error);
    }
  },

  refresh: async () => {
    try {
      set({ isLoading: true });
      const response = await privateClient.get("/auth/refresh");
      set({
        authUser: response.data.user,
        accessToken: response.data.accessToken,
      });
    } catch (error) {
      console.error(error);
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      get().clearState();
    } finally {
      set({ isLoading: false });
    }
  },
  setAccessToken: (token: string | null) => {
    set({ accessToken: token });
  },
  forgotPassword: async (email: string) => {
    set({ isLoading: true });
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

      console.log("    Forgot password error:", errorMessage);
      toast.error(errorMessage);
      throw error as AxiosError;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (token: string, password: string) => {
    set({ isLoading: true });
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

      console.log("    Reset password error:", errorMessage);
      toast.error(errorMessage);
      throw error as AxiosError;
    } finally {
      set({ isLoading: false });
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
        axiosError?.response?.data?.message || "Cập nhật thông tin thất bại";
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
    return currentUser?.roles?.some((role) => role.name === roleName) || false;
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
  clearState: () => {
    set({ authUser: null, accessToken: null, isLoading: false });
  },
}));
export default useAuthStore;
