"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import UserLayout from "@/components/sections/UserLayout";
import useAuthStore from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Lock, Eye, EyeOff } from "lucide-react";

type ProfileForm = {
  fullName: string;
  email: string;
  phone?: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function UserProfilePage() {
  const { authUser, updateProfile, changePassword } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isSaving },
    reset,
    setValue,
  } = useForm<ProfileForm>({
    defaultValues: {
      fullName: authUser?.fullName || "",
      email: authUser?.email || "",
      phone: authUser?.phone ?? "",
    },
  });

  useEffect(() => {
    if (authUser) {
      reset({
        fullName: authUser.fullName || "",
        email: authUser.email || "",
        phone: authUser.phone ?? "",
      });
    }
  }, [authUser, reset]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
    reset: resetPassword,
    watch,
  } = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword");

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateProfile({
        fullName: data.fullName.trim(),
        phone: data.phone?.trim(),
      });
      toast.success("Cập nhật thông tin thành công");
      setIsEditing(false);
      // đồng bộ name ở header hiển thị
      setValue("fullName", data.fullName.trim());
    } catch {
      toast.error("Cập nhật thông tin thất bại");
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success("Đổi mật khẩu thành công");
      resetPassword();
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Đổi mật khẩu thất bại");
    }
  };

  const handleCancel = () => {
    reset(); // quay về defaultValues hiện tại
    setIsEditing(false);
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
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    {...register("fullName", {
                      required: "Họ tên là bắt buộc",
                    })}
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
                    disabled
                    className="bg-gray-50"
                    {...register("email")}
                  />
                  {/* thường không cần validate vì field disabled */}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số Điện Thoại</Label>
                  <Input
                    id="phone"
                    type="tel" // quan trọng: không dùng number
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Ví dụ: 0912345678 hoặc +84912345678"
                    {...register("phone", {
                      required: "Số điện thoại là bắt buộc",
                      validate: (v) => {
                        const val = (v ?? "").trim();
                        const ok =
                          /^(0\d{9,10})$/.test(val) ||
                          /^\+84\d{9,10}$/.test(val);
                        return (
                          ok || "Số điện thoại không hợp lệ (0… hoặc +84…)"
                        );
                      },
                      setValueAs: (v) => (v ?? "").trim(),
                    })}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                {!isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Chỉnh Sửa
                  </Button>
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
                      placeholder="Nhập mật khẩu hiện tại"
                      {...registerPassword("currentPassword", {
                        required: "Vui lòng nhập mật khẩu hiện tại",
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword((s) => !s)}
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
                      placeholder="Nhập mật khẩu mới"
                      {...registerPassword("newPassword", {
                        required: "Vui lòng nhập mật khẩu mới",
                        minLength: {
                          value: 6,
                          message: "Mật khẩu mới phải có ít nhất 6 ký tự",
                        },
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword((s) => !s)}
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
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Xác nhận mật khẩu mới"
                      {...registerPassword("confirmPassword", {
                        required: "Vui lòng xác nhận mật khẩu",
                        validate: (v) =>
                          v === newPasswordValue ||
                          "Mật khẩu xác nhận không khớp",
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => resetPassword()}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isChangingPassword}>
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
