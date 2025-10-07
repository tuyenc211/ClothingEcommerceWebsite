"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Edit,
  Save,
  X,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react";
import { User } from "@/stores/useAuthStore";
import { toast } from "sonner";

interface EditUserFormData {
  fullName: string;
  phone: string;
  address: string;
}

interface EditUserModalProps {
  user: User;
  trigger?: React.ReactNode;
  onSubmit: (userId: number, userData: Partial<User>) => Promise<void>;
}

export default function EditUserModal({
  user,
  trigger,
  onSubmit,
}: EditUserModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EditUserFormData>({
    fullName: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Khởi tạo form data khi modal mở
  useEffect(() => {
    if (open && user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.addresses?.[0]?.line || "",
      });
      setErrors({});
    }
  }, [open, user]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const updatedData: Partial<User> = {
        fullName: formData.fullName,
        phone: formData.phone,
        addresses: formData.address
          ? [
              {
                id: user.addresses?.[0]?.id || Date.now(),
                user_id: user.id,
                line: formData.address,
                ward: user.addresses?.[0]?.ward,
                district: user.addresses?.[0]?.district,
                province: user.addresses?.[0]?.province,
                country: user.addresses?.[0]?.country || "VN",
                isDefault: true,
              },
            ]
          : user.addresses,
      };

      await onSubmit(user.id, updatedData);
      toast.success("Cập nhật thông tin thành công!");
      setOpen(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setErrors({});
  };

  // Hiển thị badge cho vai trò
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
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

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return <UserCheck className="h-5 w-5" />;
      case "staff":
        return <Users className="h-5 w-5" />;
      case "customer":
        return <UserIcon className="h-5 w-5" />;
      default:
        return <UserIcon className="h-5 w-5" />;
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Edit className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg">
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">Chỉnh sửa thông tin</h2>
                {user.roles?.map((role) => getRoleBadge(role.name))}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cá nhân của tài khoản
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserIcon className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Họ và tên */}
              <div>
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className={errors.fullName ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email (readonly) */}
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user.email}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Email không thể thay đổi
                </p>
              </div>

              {/* Số điện thoại */}
              <div>
                <Label htmlFor="phone">Số điện thoại *</Label>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className={errors.phone ? "border-red-500" : ""}
                    disabled={isLoading}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Địa chỉ */}
              <div>
                <Label htmlFor="address">Địa chỉ</Label>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-3" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                    placeholder="Nhập địa chỉ"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin vai trò (readonly) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {getRoleIcon(user.roles?.[0]?.name || "")}
                Thông tin vai trò
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Vai trò:</span>
                <div className="flex items-center gap-2">
                  {getRoleIcon(user.roles?.[0]?.name || "")}
                  {getRoleBadge(user.roles?.[0]?.name || "")}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Trạng thái:</span>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
