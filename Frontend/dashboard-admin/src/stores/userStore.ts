import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role, User } from "@/stores/useAuthStore";
import privateClient from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";

// Interface for creating staff accounts
export interface CreateStaffData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: "STAFF";
  isActive?: boolean;
}

// Interface for user form data
export interface UserFormData {
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  roles: Role[];
}

interface UserState {
  users: User[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<User | null>;
  addUser: (userData: Omit<User, "id">) => Promise<boolean>;
  createStaff: (staffData: CreateStaffData) => Promise<boolean>;
  updateUser: (id: number, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  toggleUserStatus: (id: number) => Promise<boolean>;
  assignRoles: (id: number, role: Role) => Promise<boolean>;

  // Utils
  clearError: () => void;
  getUserById: (id: number) => User | undefined;
  getUsersByRole: (roleName: string) => User[];
  searchUsers: (term: string) => User[];
  getActiveUsers: () => User[];
  getInactiveUsers: () => User[];
  getStaffUsers: () => User[];
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      isLoading: false,
      isFetching: false,
      error: null,

      // Fetch all users from backend
      fetchUsers: async () => {
        set({ isFetching: true, error: null });
        try {
          const response = await privateClient.get("/users");
          const data = response.data?.data || response.data || [];

          set({ users: data, isFetching: false });
          console.log("✅ Users fetched:", data);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Lỗi khi tải danh sách người dùng";

          set({ error: errorMessage, isFetching: false });
          console.error("❌ Fetch users error:", errorMessage);
          toast.error(errorMessage);
        }
      },

      // Fetch single user by ID
      fetchUserById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get(`/users/${id}`);
          const data = response.data?.data || response.data;

          // Update user in store
          set((state) => ({
            users: state.users.map((u) => (u.id === id ? data : u)),
            isLoading: false,
          }));

          console.log("✅ User fetched:", data);
          return data;
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Lỗi khi tải thông tin người dùng";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Fetch user error:", errorMessage);
          toast.error(errorMessage);
          return null;
        }
      },

      addUser: async (userData: Omit<User, "id">) => {
        set({ isLoading: true, error: null });

        try {
          const response = await privateClient.post("/users", userData);
          const newUser = response.data?.data || response.data;

          set((state) => ({
            users: [newUser, ...state.users],
            isLoading: false,
          }));

          toast.success("Tạo tài khoản thành công!");
          console.log("✅ User created:", newUser);
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi tạo tài khoản";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Create user error:", errorMessage);
          toast.error(errorMessage);
          return false;
        }
      },

      createStaff: async (staffData: CreateStaffData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await privateClient.post("/users/staff", staffData);
          const newUser = response.data?.data || response.data;

          set((state) => ({
            users: [newUser, ...state.users],
            isLoading: false,
          }));

          toast.success("Tạo tài khoản nhân viên thành công!");
          console.log("✅ Staff created:", newUser);
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Lỗi khi tạo tài khoản nhân viên";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Create staff error:", errorMessage);
          toast.error(errorMessage);
          return false;
        }
      },

      updateUser: async (id: number, userData: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
          const response = await privateClient.put(`/users/${id}`, userData);
          const updatedUser = response.data?.data || response.data;

          set((state) => ({
            users: state.users.map((user) =>
              user.id === id ? updatedUser : user
            ),
            isLoading: false,
          }));

          toast.success("Cập nhật tài khoản thành công!");
          console.log("✅ User updated:", updatedUser);
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi cập nhật tài khoản";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Update user error:", errorMessage);
          toast.error(errorMessage);
          return false;
        }
      },

      deleteUser: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
          await privateClient.delete(`/users/${id}`);

          set((state) => ({
            users: state.users.filter((user) => user.id !== id),
            isLoading: false,
          }));

          toast.success("Xóa tài khoản thành công!");
          console.log("✅ User deleted:", id);
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi xóa tài khoản";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Delete user error:", errorMessage);
          toast.error(errorMessage);
          return false;
        }
      },

      toggleUserStatus: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
          const currentUser = get().users.find((user) => user.id === id);
          if (!currentUser) {
            set({ error: "Không tìm thấy người dùng", isLoading: false });
            toast.error("Không tìm thấy người dùng");
            return false;
          }
          const endpoint = currentUser.isActive
            ? `/users/${id}/lock`
            : `/users/${id}/unlock`;

          await privateClient.put(endpoint);

          const successMessage = currentUser.isActive
            ? "Đã khóa tài khoản thành công!"
            : "Đã mở khóa tài khoản thành công!";
          toast.success(successMessage);

          // Fetch lại toàn bộ users để đồng bộ với backend
          await get().fetchUsers();
          
          console.log("✅ User status toggled and users refreshed");
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Lỗi khi thay đổi trạng thái";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Toggle status error:", errorMessage);
          toast.error(errorMessage);
          return false;
        }
      },

      assignRoles: async (id: number, role: Role) => {
        set({ isLoading: true, error: null });

        try {
          if (!role || !role.name) {
            set({
              error: "Người dùng phải có ít nhất một vai trò",
              isLoading: false,
            });
            toast.error("Người dùng phải có ít nhất một vai trò");
            return false;
          }

          const response = await privateClient.put(`/users/${id}/roles`, {
            id: role.id,
            name: role.name.toUpperCase(),
          });
          const updatedUser = response.data?.data || response.data;
          set((state) => ({
            users: state.users.map((user) =>
              user.id === id ? updatedUser : user
            ),
            isLoading: false,
          }));

          toast.success("Cập nhật vai trò thành công!");
          return true;
        } catch (error) {
          let errorMessage = "Đã xảy ra lỗi khi thay đổi vai trò";
          if (error instanceof AxiosError && error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Assign roles error:", errorMessage);
          toast.error(errorMessage);
          return false;
        }
      },

      clearError: () => set({ error: null }),

      getUserById: (id: number) => {
        return get().users.find((user) => user.id === id);
      },

      getUsersByRole: (roleName: string) => {
        return get().users.filter((user) =>
          user.roles?.some(
            (role) => role.name.toLowerCase() === roleName.toLowerCase()
          )
        );
      },

      searchUsers: (term: string) => {
        if (!term.trim()) return get().users;

        const searchTerm = term.toLowerCase();
        return get().users.filter(
          (user) =>
            user.fullName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            (user.phone && user.phone.includes(searchTerm)) ||
            user.roles?.some((role) =>
              role.name.toLowerCase().includes(searchTerm)
            )
        );
      },

      getActiveUsers: () => {
        return get().users.filter((user) => user.isActive);
      },

      getInactiveUsers: () => {
        return get().users.filter((user) => !user.isActive);
      },

      getStaffUsers: () => {
        return get().users.filter((user) =>
          user.roles?.some(
            (role) => role.name === "Admin" || role.name === "Staff"
          )
        );
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ users: state.users }),
    }
  )
);
