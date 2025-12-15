"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomModal from "@/components/common/CustomModal";
import {
  MoreHorizontal,
  Users,
  UserCheck,
  User as UserIcon,
  Plus,
  Edit,
  Trash2,
  Settings,
  Ban,
  CheckCircle,
  Loader2,
  Search,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { Role, User } from "@/stores/useAuthStore";
import EditUserModal from "@/components/common/EditUserModal";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { usePagination } from "@/lib/usePagination";
import PaginationBar from "@/components/common/PaginationBar";
import {
  useDeleteUser,
  useToggleUserStatus,
  useUpdateUser,
  useAllUsers,
} from "@/services/usersService";

export default function UsersManagementPage() {
  const { data: users = [], isLoading } = useAllUsers();
  const deleteUserMutation = useDeleteUser();
  const toggleUserStatus = useToggleUserStatus();
  const updateUser = useUpdateUser();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | "all">("all");
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  useEffect(() => {
    let filtered = users;
    filtered = filtered.filter(
      (user) => !user.roles?.some((role) => role.name.toLowerCase() === "admin")
    );
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.phone && user.phone.includes(term)) ||
          user.roles?.some((role) => role.name.toLowerCase().includes(term))
      );
    }
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
  }, [selectedRole, users, searchTerm]);
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
  useEffect(() => {
    setPage(1);
  }, [selectedRole, setPage, searchTerm]);

  const handleUpdateUser = async (userId: number, userData: Partial<User>) => {
    if (!userId) return;
    updateUser.mutate({ userId, userData });
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    deleteUserMutation.mutate(deletingUserId, {
      onSuccess: () => {
        setDeletingUserId(null);
        setShowDeleteDialog(false);
      },
    });
  };

  const handleToggleStatus = async (userId: number) => {
    setTogglingUserId(userId);
    toggleUserStatus.mutate(userId, {
      onSuccess: () => {
        setTogglingUserId(null);
      },
    });
  };

  const confirmDelete = (userId: number) => {
    setDeletingUserId(userId);
    setShowDeleteDialog(true);
  };

  const getStatsData = () => {
    const customers = users.filter((u) =>
      u.roles?.some((role) => role.name === "CUSTOMER")
    );
    const staff = users.filter((u) =>
      u.roles?.some((role) => role.name === "STAFF")
    );

    return {
      totalUsers: users.filter(
        (u) => !u.roles?.some((role) => role.name.toLowerCase() === "admin")
      ).length,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Spinner */}
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
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
        </div>

        {/* Filter Buttons */}
        <Card className="py-2">
          <CardContent className="p-3">
            <div className="space-y-4 flex items-center justify-between">
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Tìm kiếm tài khoản"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                  <TableHead>STT</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">
                        {startIndex + index + 1}
                      </div>
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
                            <Badge variant="outline">{role.name}</Badge>
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
                              <DropdownMenuItem asChild>
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
                                onClick={() => confirmDelete(user.id)}
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
        <CustomModal
          open={showDeleteDialog}
          onClose={() => {
            setDeletingUserId(null);
            setShowDeleteDialog(false);
          }}
          onConfirm={handleDeleteUser}
          title="Xác nhận xóa tài khoản"
          description="Bạn có chắc chắn muốn xóa tài khoản này không. Hành động này không thể hoàn tác."
          confirmText="Xóa tài khoản"
          variant="destructive"
        />
      </div>
    </RoleGuard>
  );
}
