"use client";

import { useRouter } from "next/navigation";
import { useUserStore, CreateStaffData } from "@/stores/userStore";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type StaffFormData = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
};

export default function AddStaffPage() {
  const router = useRouter();
  const { createStaff, isLoading } = useUserStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StaffFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: StaffFormData) => {
    try {
      const payload: CreateStaffData = {
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || undefined,
        password: data.password,
        role: "STAFF",
      };

      const ok = await createStaff(payload);
      if (ok) {
        toast.success("Tạo tài khoản nhân viên thành công");
        router.push("/users");
      } else {
        toast.error("Có lỗi xảy ra khi tạo tài khoản");
      }
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra khi tạo tài khoản");
    }
  };

  const ErrorText = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-sm text-red-600 mt-1">{msg}</p> : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/users">
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-6">
          {/* Thông tin cá nhân */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Nhập thông tin cơ bản của nhân viên
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  maxLength={100}
                  {...register("fullName", {
                    required: "Họ và tên là bắt buộc",
                    minLength: {
                      value: 2,
                      message: "Họ và tên phải có ít nhất 2 ký tự",
                    },
                    setValueAs: (v) =>
                      typeof v === "string" ? v.trimStart() : v,
                  })}
                />
                <ErrorText msg={errors.fullName?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nhanvien@company.com"
                  maxLength={255}
                  {...register("email", {
                    required: "Email là bắt buộc",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email không hợp lệ",
                    },
                    setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                  })}
                />
                <ErrorText msg={errors.email?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại (tuỳ chọn)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  maxLength={15}
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9+\-\s()]{10,15}$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                    setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                  })}
                />
                <ErrorText msg={errors.phone?.message} />
              </div>
            </CardContent>
          </Card>

          {/* Thông tin tài khoản */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
              <CardDescription>Mật khẩu & xác nhận</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mật khẩu tối thiểu 6 ký tự"
                  maxLength={50}
                  {...register("password", {
                    required: "Mật khẩu là bắt buộc",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    },
                  })}
                />
                <ErrorText msg={errors.password?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  maxLength={50}
                  {...register("confirmPassword", {
                    required: "Xác nhận mật khẩu là bắt buộc",
                    validate: (v) =>
                      v === passwordValue || "Mật khẩu xác nhận không khớp",
                  })}
                />
                <ErrorText msg={errors.confirmPassword?.message} />
              </div>

              <div className="space-y-2">
                <Label>Vai trò</Label>
                <div className="rounded-md border border-input bg-muted px-3 py-2">
                  <p className="text-sm font-medium">Nhân viên (Staff)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            asChild
            className="hover:bg-gray-700 hover:text-white"
          >
            <Link href="/users">Hủy</Link>
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="hover:bg-gray-800-700 hover:border-gray-800 hover:text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              "Lưu"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
