import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role, User } from "@/stores/useAuthStore";
import privateClient from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
export interface CreateStaffData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: "STAFF";
  isActive?: boolean;
}
interface UserState {
  users: User[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  createStaff: (staffData: CreateStaffData) => Promise<boolean>;
  assignRoles: (id: number, role: Role) => Promise<boolean>;
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
      createStaff: async (staffData: CreateStaffData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await privateClient.post("/users/create", {
            email: staffData.email,
            password: staffData.password,
            fullName: staffData.fullName,
            phone: staffData.phone,
            roleIds: [1],
          });

          const newUser = response.data?.data || response.data;

          // Add new user to store
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
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ users: state.users }),
    }
  )
);
