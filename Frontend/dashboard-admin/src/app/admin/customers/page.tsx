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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  Users,
  UserCheck,
  Shield,
  User,
} from "lucide-react";

// Định nghĩa types cho tài khoản thống nhất
type UserRole = "customer" | "staff" | "admin" | "super_admin";
type UserStatus = "active" | "inactive" | "suspended";

interface UnifiedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  avatar?: string;
  // Dành cho khách hàng
  totalOrders?: number;
  totalSpent?: number;
  // Dành cho nhân viên
  department?: string;
  position?: string;
}

// Mock data cho tất cả loại tài khoản
const mockUsers: UnifiedUser[] = [
  // Khách hàng
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    role: "customer",
    status: "active",
    joinDate: "2024-01-15",
    avatar: "",
    totalOrders: 5,
    totalSpent: 299.95,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 234-5678",
    role: "customer",
    status: "active",
    joinDate: "2023-11-20",
    avatar: "",
    totalOrders: 12,
    totalSpent: 899.5,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    phone: "+1 (555) 345-6789",
    role: "customer",
    status: "inactive",
    joinDate: "2024-02-10",
    avatar: "",
    totalOrders: 3,
    totalSpent: 156.75,
  },
  // Nhân viên
  {
    id: "4",
    name: "Alice Brown",
    email: "alice.brown@company.com",
    phone: "+1 (555) 456-7890",
    role: "staff",
    status: "active",
    joinDate: "2023-12-05",
    avatar: "",
    department: "Bán hàng",
    position: "Nhân viên bán hàng",
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie.wilson@company.com",
    phone: "+1 (555) 567-8901",
    role: "admin",
    status: "active",
    joinDate: "2023-08-18",
    avatar: "",
    department: "Quản lý",
    position: "Admin",
  },
  {
    id: "6",
    name: "David Kim",
    email: "david.kim@company.com",
    phone: "+1 (555) 678-9012",
    role: "staff",
    status: "active",
    joinDate: "2024-03-10",
    avatar: "",
    department: "Kho",
    position: "Nhân viên kho",
  },
  {
    id: "7",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 789-0123",
    role: "customer",
    status: "active",
    joinDate: "2024-02-20",
    avatar: "",
    totalOrders: 7,
    totalSpent: 445.3,
  },
  {
    id: "8",
    name: "Mike Chen",
    email: "mike.chen@company.com",
    phone: "+1 (555) 890-1234",
    role: "super_admin",
    status: "active",
    joinDate: "2023-01-01",
    avatar: "",
    department: "Điều hành",
    position: "Super Admin",
  },
];

export default function UsersManagementPage() {
  const [users] = useState(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lọc users dựa trên search term và role
  useEffect(() => {
    let filtered = users;

    // Lọc theo role
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    // Lọc theo search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.phone && user.phone.includes(searchTerm)) ||
          (user.department &&
            user.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.position &&
            user.position.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, users]);

  // Hiển thị badge cho trạng thái
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Hoạt động</Badge>;
      case "inactive":
        return <Badge variant="secondary">Không hoạt động</Badge>;
      case "suspended":
        return <Badge variant="destructive">Bị khóa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Hiển thị badge cho vai trò
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            Super Admin
          </Badge>
        );
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
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  // Lấy icon cho vai trò
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return <Shield className="h-4 w-4" />;
      case "admin":
        return <UserCheck className="h-4 w-4" />;
      case "staff":
        return <Users className="h-4 w-4" />;
      case "customer":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Tính customer level cho khách hàng
  const getCustomerLevel = (totalSpent?: number) => {
    if (!totalSpent) return "";
    if (totalSpent >= 1000) return "VIP";
    if (totalSpent >= 500) return "Premium";
    return "Regular";
  };

  // Tính stats theo role
  const getStatsData = () => {
    const customers = users.filter((u) => u.role === "customer");
    const staff = users.filter((u) => u.role === "staff");
    const admins = users.filter(
      (u) => u.role === "admin" || u.role === "super_admin"
    );
    const activeUsers = users.filter((u) => u.status === "active");

    return {
      totalUsers: users.length,
      totalCustomers: customers.length,
      totalStaff: staff.length,
      totalAdmins: admins.length,
      activeUsers: activeUsers.length,
    };
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const stats = getStatsData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản lý tài khoản</h1>
        <p className="text-muted-foreground">
          Quản lý tất cả tài khoản khách hàng và nhân viên trong hệ thống
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            <User className="h-4 w-4 text-muted-foreground" />
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
            <p className="text-xs text-muted-foreground">Tài khoản nhân viên</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quản trị viên</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdmins}</div>
            <p className="text-xs text-muted-foreground">Admin & Super Admin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đang hoạt động
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Tài khoản đang dùng</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Card>
        <CardContent className="pt-6">
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
                onClick={() => setSelectedRole("customer")}
                variant={selectedRole === "customer" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Khách hàng ({stats.totalCustomers})
              </Button>
              <Button
                onClick={() => setSelectedRole("staff")}
                variant={selectedRole === "staff" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Nhân viên ({stats.totalStaff})
              </Button>
              <Button
                onClick={() => setSelectedRole("admin")}
                variant={selectedRole === "admin" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin ({users.filter((u) => u.role === "admin").length})
              </Button>
              <Button
                onClick={() => setSelectedRole("super_admin")}
                variant={selectedRole === "super_admin" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Super Admin (
                {users.filter((u) => u.role === "super_admin").length})
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm theo tên, email, SĐT, phòng ban, chức vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
              : `${getRoleDisplayName(selectedRole)} (${filteredUsers.length})`}
          </CardTitle>
          <CardDescription>
            Danh sách chi tiết tài khoản và hoạt động của họ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Thông tin bổ sung</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="mr-1 h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      {getRoleBadge(user.role)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === "customer" ? (
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">
                            {user.totalOrders || 0}
                          </span>{" "}
                          đơn hàng
                        </div>
                        <div className="text-sm">
                          Chi tiêu:{" "}
                          <span className="font-medium">
                            ${(user.totalSpent || 0).toFixed(2)}
                          </span>
                        </div>
                        {getCustomerLevel(user.totalSpent) && (
                          <Badge variant="outline" className="text-xs">
                            {getCustomerLevel(user.totalSpent)}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {user.department && (
                          <div className="text-sm">
                            Phòng ban:{" "}
                            <span className="font-medium">
                              {user.department}
                            </span>
                          </div>
                        )}
                        {user.position && (
                          <div className="text-sm">
                            Chức vụ:{" "}
                            <span className="font-medium">{user.position}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {new Date(user.joinDate).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Gửi email
                        </DropdownMenuItem>
                        {user.role !== "super_admin" && (
                          <DropdownMenuItem className="text-red-600">
                            <User className="mr-2 h-4 w-4" />
                            {user.status === "active"
                              ? "Khóa tài khoản"
                              : "Kích hoạt"}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Không tìm thấy người dùng nào phù hợp với từ khóa tìm kiếm"
                  : "Không tìm thấy người dùng nào"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Helper function for role display names
  function getRoleDisplayName(role: UserRole | "all") {
    switch (role) {
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
}
