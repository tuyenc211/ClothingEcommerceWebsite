"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import UserLayout from "@/components/layouts/UserLayout";
import useAuthStore from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Lock, Eye, EyeOff } from "lucide-react";
import { useAddress } from "@/hooks/useAddress";

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phoneNumber: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  province: z.string().optional(),
  ward: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Mật khẩu phải chứa chữ hoa, chữ thường và số"
      ),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function UserProfilePage() {
  const { authUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>("");
  const [selectedWardCode, setSelectedWardCode] = useState<string>("");

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    provinces,
    wards,
    isLoadingProvinces,
    isLoadingWards,
    fetchWards,
    clearWards,
  } = useAddress();

  // Profile form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: authUser?.fullName || "",
      email: authUser?.email || "",
      phoneNumber: authUser?.phone || "",
      province: "",
      ward: "",
      address: "",
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle province change
  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvinceCode(provinceCode);
    setSelectedWardCode("");
    setValue("province", provinceCode);
    setValue("ward", "");
    clearWards();

    if (provinceCode) {
      fetchWards(provinceCode);
    }
  };

  // Handle ward change
  const handleWardChange = (wardCode: string) => {
    setSelectedWardCode(wardCode);
    setValue("ward", wardCode);
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true);
    try {
      const selectedProvince = provinces.find((p) => p.code === data.province);
      const selectedWard = wards.find((w) => w.code === data.ward);

      const addressData = {
        ...data,
        provinceName: selectedProvince?.name || "",
        wardName: selectedWard?.name || "",
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Updating profile:", addressData);

      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch {
      toast.error("Cập nhật thông tin thất bại!");
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsChangingPassword(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Changing password:", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      resetPassword();
      toast.success("Đổi mật khẩu thành công!");
    } catch {
      toast.error("Đổi mật khẩu thất bại!");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setSelectedProvinceCode("");
    setSelectedWardCode("");
    clearWards();
  };

  const getProvinceName = () => {
    const province = provinces.find((p) => p.code === selectedProvinceCode);
    return province?.name || "";
  };

  const getWardName = () => {
    const ward = wards.find((w) => w.code === selectedWardCode);
    return ward?.name || "";
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl uppercase font-bold">
              Thông Tin Cá Nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center space-x-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 uppercase">
                    {authUser?.fullName}
                  </h2>
                  <p className="text-gray-600">{authUser?.email}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và Tên</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Số Điện Thoại</Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Địa chỉ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="province">Tỉnh/Thành phố</Label>
                    {isEditing ? (
                      <Select
                        value={selectedProvinceCode}
                        onValueChange={handleProvinceChange}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingProvinces
                                ? "Đang tải..."
                                : "Chọn tỉnh/thành phố"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-70 overflow-y-auto">
                          {provinces.map((province) => (
                            <SelectItem
                              key={province.code}
                              value={province.code}
                            >
                              {province.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={getProvinceName()}
                        disabled
                        className="bg-gray-50"
                        placeholder="Chưa chọn"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ward">Xã/Phường</Label>
                    {isEditing ? (
                      <Select
                        value={selectedWardCode}
                        onValueChange={handleWardChange}
                        disabled={!selectedProvinceCode}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedProvinceCode
                                ? "Chọn tỉnh/thành phố trước"
                                : isLoadingWards
                                ? "Đang tải..."
                                : "Chọn xã/phường"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-70 overflow-y-auto">
                          {wards.map((ward) => (
                            <SelectItem key={ward.code} value={ward.code}>
                              {ward.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={getWardName()}
                        disabled
                        className="bg-gray-50"
                        placeholder="Chưa chọn"
                      />
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Địa chỉ cụ thể</Label>
                    <Input
                      id="address"
                      {...register("address")}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="Số nhà, tên đường..."
                    />
                    {errors.address && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>Chỉnh Sửa</Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl uppercase font-bold flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Đổi Mật Khẩu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      {...registerPassword("currentPassword")}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      {...registerPassword("newPassword")}
                      placeholder="Nhập mật khẩu mới"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ
                    thường và số
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline">
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  onClick={() => resetPassword()}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
