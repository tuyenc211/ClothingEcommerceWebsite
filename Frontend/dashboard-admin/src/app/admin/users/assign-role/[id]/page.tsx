"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { Role, User } from "@/stores/useAuthStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Shield,
  Users,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface RoleOption {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const availableRoles: RoleOption[] = [
  {
    id: 2,
    name: "Staff",
    description: "Nhân viên - có quyền quản lý sản phẩm và đơn hàng",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    id: 3,
    name: "Customer",
    description: "Khách hàng - chỉ có quyền mua hàng",
    icon: UserIcon,
    color: "bg-green-500",
  },
];

export default function AssignRolePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const { getUserById, assignRoles, isLoading } = useUserStore();

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (id) {
      const user = getUserById(id);
      if (user) {
        setCurrentUser(user);
        // Set current role as default
        if (user.roles && user.roles.length > 0) {
          setSelectedRoleId(user.roles[0].id);
        }
      } else {
        // User not found, redirect to users list
        router.push("/admin/users");
      }
    }
  }, [id, getUserById, router]);

  const handleAssignRole = async () => {
    if (!selectedRoleId || !currentUser) return;

    try {
      const selectedRole = availableRoles.find(
        (role) => role.id === selectedRoleId
      );
      if (!selectedRole) {
        toast.error("Vai trò không hợp lệ");
        return;
      }

      // Send only the role name in uppercase
      const success = await assignRoles(currentUser.id, selectedRole.name.toUpperCase());

      if (success) {
        toast.success(
          `Đã phân quyền ${selectedRole.name} cho ${currentUser.fullName}`
        );
        router.push("/admin/users");
      } else {
        toast.error("Có lỗi xảy ra khi phân quyền");
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("Có lỗi xảy ra khi phân quyền");
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const selectedRole = availableRoles.find(
    (role) => role.id === selectedRoleId
  );
  const currentRole = currentUser.roles?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Phân quyền nhân viên</h1>
          <p className="text-muted-foreground">
            Thay đổi quyền hạn và vai trò của người dùng
          </p>
        </div>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin người dùng</CardTitle>
          <CardDescription>
            Xem thông tin của người dùng cần phân quyền
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-lg font-semibold">
                {currentUser.fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{currentUser.fullName}</h3>
              <p className="text-muted-foreground">{currentUser.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  Vai trò hiện tại:
                </span>
                {currentRole ? (
                  <Badge variant="outline">{currentRole.name}</Badge>
                ) : (
                  <Badge variant="secondary">Chưa có vai trò</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn vai trò mới</CardTitle>
          <CardDescription>
            Chọn vai trò phù hợp cho người dùng này
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Vai trò *</label>
            <Select
              value={selectedRoleId?.toString()}
              onValueChange={(value) => setSelectedRoleId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    <div className="flex items-center gap-2">
                      <role.icon className="h-4 w-4" />
                      {role.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Preview */}
          {selectedRole && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-8 h-8 rounded-full ${selectedRole.color} flex items-center justify-center`}
                >
                  <selectedRole.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedRole.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRole.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info for Staff role */}
          {selectedRoleId === 2 && (
            <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Vai trò nhân viên có quyền quản lý sản phẩm và đơn hàng
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/users">Hủy</Link>
        </Button>
        <Button
          onClick={handleAssignRole}
          disabled={
            isLoading || !selectedRoleId || selectedRoleId === currentRole?.id
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang phân quyền...
            </>
          ) : (
            "Phân quyền"
          )}
        </Button>
      </div>
    </div>
  );
}
