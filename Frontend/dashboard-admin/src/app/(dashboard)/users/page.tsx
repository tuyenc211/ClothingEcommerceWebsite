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
import EditUserModal from "@/components/common/EditUserModal";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { usePagination } from "@/lib/usePagination";
import PaginationBar from "@/components/common/PaginationBar";

export default function UsersManagementPage() {
  const {
    users,
    isLoading,
    fetchUsers,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useUserStore();

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | "all">("all");
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUserName, setDeletingUserName] = useState("");
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  // Pagination calculation
  const {
    currentPage,
    setPage,
    totalPages,
    startIndex,
    endIndex,
    pageNumbers,
    slice,
  } = usePagination({
    totalItems: filteredUsers.length,
    itemsPerPage: 10,
    showPages: 5,
  });
  const paginatedUsers = slice(filteredUsers);
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedRole]);

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
    setTogglingUserId(userId);
    const success = await toggleUserStatus(userId);
    setTogglingUserId(null);
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
      case "STAFF":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            Nhân viên
          </Badge>
        );
      case "CUSTOMER":
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
      u.roles?.some((role) => role.name === "CUSTOMER")
    );
    const staff = users.filter((u) =>
      u.roles?.some((role) => role.name === "STAFF")
    );

    return {
      totalUsers: users.length,
      totalCustomers: customers.length,
      totalStaff: staff.length,
    };
  };

  // Helper function for role display names
  function getRoleDisplayName(role: Role | "all") {
    if (role === "all") {
      return "Tất cả tài khoản";
    }
    switch (role.name) {
      case "CUSTOMER":
        return "Khách hàng";
      case "STAFF":
        return "Nhân viên";
      default:
        return "Tất cả tài khoản";
    }
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
              <Link href="/users/add-staff">
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
                  onClick={() => setSelectedRole({ id: 2, name: "CUSTOMER" })}
                  variant={
                    selectedRole !== "all" && selectedRole.name === "CUSTOMER"
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
                  onClick={() => setSelectedRole({ id: 1, name: "STAFF" })}
                  variant={
                    selectedRole !== "all" && selectedRole.name === "STAFF"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  Nhân viên ({stats.totalStaff})
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
                {paginatedUsers.map((user) => (
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
                            disabled={togglingUserId === user.id}
                          >
                            {togglingUserId === user.id ? (
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
                            <Link href={`/users/assign-role/${user.id}`}>
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

        {/* Pagination */}
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          onPageChange={setPage}
        />

        {/* Results info */}
        {filteredUsers.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}{" "}
            trong số {filteredUsers.length} tài khoản
          </div>
        )}

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
