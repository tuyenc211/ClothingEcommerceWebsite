import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role, User } from "@/stores/useAuthStore";
import { mockUsers } from "@/data/productv2";

// Interface for creating staff accounts
export interface CreateStaffData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: "ADMIN" | "STAFF";
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
  error: string | null;

  // Actions
  addUser: (userData: Omit<User, "id">) => Promise<boolean>;
  createStaff: (staffData: CreateStaffData) => Promise<boolean>;
  updateUser: (id: number, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  toggleUserStatus: (id: number) => Promise<boolean>;
  assignRoles: (id: number, roles: Role[]) => Promise<boolean>;

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
      users: mockUsers,
      isLoading: false,
      error: null,

      addUser: async (userData: Omit<User, "id">) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if email already exists
          const existingUser = get().users.find(
            (u) => u.email === userData.email
          );
          if (existingUser) {
            set({ error: "Email đã được sử dụng", isLoading: false });
            return false;
          }

          // Check if phone already exists (if provided)
          if (userData.phone) {
            const existingPhone = get().users.find(
              (u) => u.phone === userData.phone
            );
            if (existingPhone) {
              set({ error: "Số điện thoại đã được sử dụng", isLoading: false });
              return false;
            }
          }

          const newUser: User = {
            ...userData,
            id: Date.now(),
            isActive: userData.isActive ?? true,
            roles: userData.roles || [{ id: 3, name: "Customer" }],
            addresses: userData.addresses || [],
          };

          set((state) => ({
            users: [...state.users, newUser],
            isLoading: false,
          }));

          return true;
        } catch {
          set({ error: "Đã xảy ra lỗi khi tạo tài khoản", isLoading: false });
          return false;
        }
      },

      createStaff: async (staffData: CreateStaffData) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if email already exists
          const existingUser = get().users.find(
            (u) => u.email === staffData.email
          );
          if (existingUser) {
            set({ error: "Email đã được sử dụng", isLoading: false });
            return false;
          }

          // Check if phone already exists (if provided)
          if (staffData.phone) {
            const existingPhone = get().users.find(
              (u) => u.phone === staffData.phone
            );
            if (existingPhone) {
              set({ error: "Số điện thoại đã được sử dụng", isLoading: false });
              return false;
            }
          }

          // Validate password
          if (staffData.password.length < 6) {
            set({
              error: "Mật khẩu phải có ít nhất 6 ký tự",
              isLoading: false,
            });
            return false;
          }

          // Get role object
          const roleMap = {
            Admin: { id: 1, name: "Admin" },
            Staff: { id: 2, name: "Staff" },
          };

          const newUser: User = {
            id: Date.now(),
            fullName: staffData.fullName,
            email: staffData.email,
            phone: staffData.phone,
            isActive: staffData.isActive ?? true,
            roles: [roleMap[staffData.role]],
            addresses: [],
          };

          set((state) => ({
            users: [...state.users, newUser],
            isLoading: false,
          }));

          return true;
        } catch {
          set({
            error: "Đã xảy ra lỗi khi tạo tài khoản nhân viên",
            isLoading: false,
          });
          return false;
        }
      },

      updateUser: async (id: number, userData: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 800));

          const userToUpdate = get().users.find((u) => u.id === id);
          if (!userToUpdate) {
            set({ error: "Không tìm thấy người dùng", isLoading: false });
            return false;
          }

          // Check email uniqueness if email is being updated
          if (userData.email && userData.email !== userToUpdate.email) {
            const existingUser = get().users.find(
              (u) => u.email === userData.email && u.id !== id
            );
            if (existingUser) {
              set({ error: "Email đã được sử dụng", isLoading: false });
              return false;
            }
          }

          // Check phone uniqueness if phone is being updated
          if (userData.phone && userData.phone !== userToUpdate.phone) {
            const existingPhone = get().users.find(
              (u) => u.phone === userData.phone && u.id !== id
            );
            if (existingPhone) {
              set({ error: "Số điện thoại đã được sử dụng", isLoading: false });
              return false;
            }
          }

          set((state) => ({
            users: state.users.map((user) =>
              user.id === id
                ? {
                    ...user,
                    ...userData,
                    // Preserve existing data if not provided
                    roles: userData.roles || user.roles,
                    addresses: userData.addresses || user.addresses,
                  }
                : user
            ),
            isLoading: false,
          }));

          return true;
        } catch {
          set({
            error: "Đã xảy ra lỗi khi cập nhật tài khoản",
            isLoading: false,
          });
          return false;
        }
      },

      deleteUser: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500));

          const user = get().users.find((u) => u.id === id);
          if (!user) {
            set({ error: "Không tìm thấy người dùng", isLoading: false });
            return false;
          }

          // Prevent deleting admin users
          const isAdmin = user.roles?.some(
            (role) => role.name === "Admin" || role.name === "Super Admin"
          );
          if (isAdmin) {
            set({
              error: "Không thể xóa tài khoản quản trị viên",
              isLoading: false,
            });
            return false;
          }

          set((state) => ({
            users: state.users.filter((user) => user.id !== id),
            isLoading: false,
          }));

          return true;
        } catch {
          set({ error: "Đã xảy ra lỗi khi xóa tài khoản", isLoading: false });
          return false;
        }
      },

      toggleUserStatus: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 300));

          const user = get().users.find((u) => u.id === id);
          if (!user) {
            set({ error: "Không tìm thấy người dùng", isLoading: false });
            return false;
          }

          // Prevent deactivating admin users
          const isAdmin = user.roles?.some(
            (role) => role.name === "Admin" || role.name === "Super Admin"
          );
          if (isAdmin && user.isActive) {
            set({
              error: "Không thể vô hiệu hóa tài khoản quản trị viên",
              isLoading: false,
            });
            return false;
          }

          set((state) => ({
            users: state.users.map((user) =>
              user.id === id
                ? {
                    ...user,
                    isActive: !user.isActive,
                  }
                : user
            ),
            isLoading: false,
          }));

          return true;
        } catch {
          set({
            error: "Đã xảy ra lỗi khi thay đổi trạng thái",
            isLoading: false,
          });
          return false;
        }
      },

      assignRoles: async (id: number, roles: Role[]) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500));

          const user = get().users.find((u) => u.id === id);
          if (!user) {
            set({ error: "Không tìm thấy người dùng", isLoading: false });
            return false;
          }

          // Validate roles
          if (!roles || roles.length === 0) {
            set({
              error: "Người dùng phải có ít nhất một vai trò",
              isLoading: false,
            });
            return false;
          }

          set((state) => ({
            users: state.users.map((user) =>
              user.id === id
                ? {
                    ...user,
                    roles: roles,
                  }
                : user
            ),
            isLoading: false,
          }));

          return true;
        } catch {
          set({
            error: "Đã xảy ra lỗi khi thay đổi vai trò",
            isLoading: false,
          });
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
