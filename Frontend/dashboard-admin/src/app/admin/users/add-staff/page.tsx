"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore, CreateStaffData } from "@/stores/userStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomInput from "@/components/shared/CustomInput";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface StaffFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "Admin" | "Staff";
  isActive: boolean;
}

export default function AddStaffPage() {
  const router = useRouter();
  const { createStaff, isLoading } = useUserStore();

  const [formData, setFormData] = useState<StaffFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Staff",
    isActive: true,
  });

  const [errors, setErrors] = useState<
    Record<keyof StaffFormData, string | undefined>
  >({} as Record<keyof StaffFormData, string | undefined>);

  const handleInputChange = (
    field: keyof StaffFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<keyof StaffFormData, string | undefined> =
      {} as Record<keyof StaffFormData, string | undefined>;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (formData.phone && !/^[0-9+\-\s()]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const staffData: CreateStaffData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
        role: formData.role,
        isActive: formData.isActive,
      };

      const success = await createStaff(staffData);

      if (success) {
        toast.success("Tạo tài khoản nhân viên thành công");
        router.push("/admin/users");
      } else {
        toast.error("Có lỗi xảy ra khi tạo tài khoản");
      }
    } catch (error) {
      console.error("Error creating staff:", error);
      toast.error("Có lỗi xảy ra khi tạo tài khoản");
    }
  };

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
          <h1 className="text-3xl font-bold">Tạo tài khoản nhân viên</h1>
          <p className="text-muted-foreground">
            Thêm tài khoản mới cho nhân viên với quyền truy cập hệ thống
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Nhập thông tin cơ bản của nhân viên
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CustomInput
                label="Họ và tên"
                name="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                error={errors.fullName}
                required
                maxLength={100}
              />

              <CustomInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="nhanvien@company.com"
                error={errors.email}
                required
                maxLength={255}
              />

              <CustomInput
                label="Số điện thoại"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="0901234567"
                error={errors.phone}
                maxLength={15}
              />
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
              <CardDescription>
                Cấu hình quyền hạn và trạng thái tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CustomInput
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Mật khẩu tối thiểu 6 ký tự"
                error={errors.password}
                required
                maxLength={50}
              />

              <CustomInput
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder="Nhập lại mật khẩu"
                error={errors.confirmPassword}
                required
                maxLength={50}
              />

              <div className="space-y-2">
                <Label htmlFor="role">Vai trò *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "Admin" | "Staff") =>
                    handleInputChange("role", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Staff">Nhân viên (Staff)</SelectItem>
                    <SelectItem value="Admin">Quản trị viên (Admin)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Admin có toàn quyền, Staff có quyền hạn hạn chế
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">Tài khoản hoạt động</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Tài khoản không hoạt động sẽ không thể đăng nhập
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/users">Hủy</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              "Tạo tài khoản"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
