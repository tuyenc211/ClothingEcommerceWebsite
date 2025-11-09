"use client";

import { useState } from "react";
import useAuthStore from "@/stores/useAuthStore";
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
import { User, Mail, Phone, Lock, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { authUser, updateProfile, changePassword } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: authUser?.fullName || "",
    phone: authUser?.phone || "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);

    try {
      await updateProfile(profileData);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setIsSubmittingPassword(true);

    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      fullName: authUser?.fullName || "",
      phone: authUser?.phone || "",
    });
    setIsEditingProfile(false);
  };

  const handleCancelPassword = () => {
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thông tin cá nhân</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý thông tin tài khoản và bảo mật của bạn
        </p>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Thông tin cá nhân
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-2  ">
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isEditingProfile ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Họ và tên</p>
                  <p className="font-medium">{authUser?.fullName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{authUser?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">
                    {authUser?.phone || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Vai trò</p>
                  <p className="font-medium">
                    {authUser?.roles?.map((role) => role.name).join(", ") ||
                      "Chưa có vai trò"}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsEditingProfile(true)}
                className="w-full"
              >
                Chỉnh sửa thông tin
              </Button>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={authUser?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email không thể thay đổi
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="number"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="flex-1"
                >
                  <Save className="h-4 w-4" />
                  {isSubmittingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmittingProfile}
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>
            Cập nhật mật khẩu để bảo mật tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
              <Input
                id="oldPassword"
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    oldPassword: e.target.value,
                  })
                }
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Nhập mật khẩu mới"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Nhập lại mật khẩu mới"
                required
                minLength={6}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmittingPassword}
                className="flex-1"
              >
                <Lock className="h-4 w-4" />
                {isSubmittingPassword
                  ? "Đang cập nhật..."
                  : "Cập nhật mật khẩu"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelPassword}
                disabled={isSubmittingPassword}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
