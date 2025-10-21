"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Users,
  UserCheck,
  Shield,
  User as UserIcon,
  Plus,
  Edit,
  Trash2,
  Settings,
  Ban,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { Role, User } from "@/stores/useAuthStore";
import EditUserModal from "@/components/shared/EditUserModal";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function UsersManagementPage() {
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUser,
    deleteUser,
    toggleUserStatus,
    clearError,
  } = useUserStore();

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | "all">("all");
  const [mounted, setMounted] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUserName, setDeletingUserName] = useState("");

  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, [fetchUsers]);

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Initialize filtered users
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // Lọc users dựa trên search term và role
  useEffect(() => {
    let filtered = users;

    // Lọc theo role
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) =>
        user.roles?.some((role) => {
          const roleName = role.name.toLowerCase();
          switch (selectedRole.name) {
            case "CUSTOMER":
              return roleName === "customer";
            case "STAFF":
              return roleName === "staff";
            default:
              return false;
          }
        })
      );
    }

    setFilteredUsers(filtered);
  }, [selectedRole, users]);

  // Handler

  const handleUpdateUser = async (userId: number, userData: Partial<User>) => {
    const success = await updateUser(userId, userData);
    if (success) {
      toast.success("Cập nhật tài khoản thành công!");
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;

    const success = await deleteUser(deletingUserId);
    if (success) {
      toast.success("Xóa tài khoản thành công!");
    }
    setDeletingUserId(null);
    setShowDeleteDialog(false);
  };

  const handleToggleStatus = async (userId: number) => {
    const success = await toggleUserStatus(userId);
    if (success) {
      const user = users.find((u) => u.id === userId);
      const newStatus =
        user?.isActive === true ? "không hoạt động" : "hoạt động";
      toast.success(`Đã thay đổi trạng thái tài khoản thành ${newStatus}`);
    }
  };

  const confirmDelete = (userId: number, userName: string) => {
    setDeletingUserId(userId);
    setDeletingUserName(userName);
    setShowDeleteDialog(true);
  };

  // Hiển thị badge cho vai trò
  const getRoleBadge = (role: Role) => {
    switch (role.name) {
      case "admin":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
            Admin
          </Badge>
        );
      case "staff":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            Nhân viên
          </Badge>
        );
      case "customer":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Khách hàng
          </Badge>
        );
      default:
        return <Badge variant="outline">{role.name}</Badge>;
    }
  };

  // Tính stats theo role
  const getStatsData = () => {
    const customers = users.filter((u) =>
      u.roles?.some((role) => role.name === "Customer")
    );
    const staff = users.filter((u) =>
      u.roles?.some((role) => role.name === "Staff")
    );
    const admins = users.filter((u) =>
      u.roles?.some((role) => role.name === "Admin")
    );

    return {
      totalUsers: users.length,
      totalCustomers: customers.length,
      totalStaff: staff.length,
      totalAdmins: admins.length,
    };
  };

  // Helper function for role display names
  function getRoleDisplayName(role: Role | "all") {
    if (role === "all") {
      return "Tất cả tài khoản";
    }
    switch (role.name) {
      case "customer":
        return "Khách hàng";
      case "staff":
        return "Nhân viên";
      case "admin":
        return "Admin";
      case "super_admin":
        return "Super Admin";
      default:
        return "Tất cả tài khoản";
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const stats = getStatsData();

  return (
    <RoleGuard requireAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Quản lý tài khoản</h1>
            <p className="text-muted-foreground">
              Quản lý tất cả tài khoản khách hàng và nhân viên trong hệ thống
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/users/add-staff">
                <Plus className="mr-2 h-4 w-4" />
                Thêm nhân viên
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng tài khoản
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Tất cả loại tài khoản
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Tài khoản khách hàng
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nhân viên</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStaff}</div>
              <p className="text-xs text-muted-foreground">
                Tài khoản nhân viên
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quản trị viên
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAdmins}</div>
              <p className="text-xs text-muted-foreground">
                Admin & Super Admin
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <Card className="py-2">
          <CardContent className="p-3">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setSelectedRole("all")}
                  variant={selectedRole === "all" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Tất cả ({users.length})
                </Button>
                <Button
                  onClick={() => setSelectedRole({ id: 3, name: "customer" })}
                  variant={
                    selectedRole !== "all" && selectedRole.name === "customer"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4" />
                  Khách hàng ({stats.totalCustomers})
                </Button>
                <Button
                  onClick={() => setSelectedRole({ id: 2, name: "staff" })}
                  variant={
                    selectedRole !== "all" && selectedRole.name === "staff"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  Nhân viên ({stats.totalStaff})
                </Button>
                <Button
                  onClick={() => setSelectedRole({ id: 1, name: "admin" })}
                  variant={
                    selectedRole !== "all" && selectedRole.name === "admin"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Admin ({stats.totalAdmins})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedRole === "all"
                ? `Tất cả tài khoản (${filteredUsers.length})`
                : `${getRoleDisplayName(selectedRole)} (${
                    filteredUsers.length
                  })`}
            </CardTitle>
            <CardDescription>
              Danh sách tài khoản trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{user.fullName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.phone || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.roles?.map((role) => (
                          <div
                            key={role.id}
                            className="flex items-center gap-1"
                          >
                            {getRoleBadge(role)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="default">Hoạt động</Badge>
                      ) : (
                        <Badge variant="secondary">Không hoạt động</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <EditUserModal
                            user={user}
                            onSubmit={handleUpdateUser}
                            trigger={
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/assign-role/${user.id}`}>
                              <Settings className="mr-2 h-4 w-4" />
                              Phân quyền
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!user.roles?.some(
                            (role) => role.name === "Admin"
                          ) && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(user.id)}
                                className={
                                  user.isActive
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }
                              >
                                {user.isActive ? (
                                  <Ban className="mr-2 h-4 w-4" />
                                ) : (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                {user.isActive ? "Khóa tài khoản" : "Kích hoạt"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  confirmDelete(user.id, user.fullName)
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa tài khoản
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa tài khoản{" "}
                <strong>&ldquo;{deletingUserName}&rdquo;</strong>?
                <br />
                <br />
                Hành động này không thể hoàn tác. Tài khoản sẽ bị xóa vĩnh viễn
                khỏi hệ thống.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeletingUserId(null);
                  setDeletingUserName("");
                  setShowDeleteDialog(false);
                }}
              >
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Xóa tài khoản
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
}
