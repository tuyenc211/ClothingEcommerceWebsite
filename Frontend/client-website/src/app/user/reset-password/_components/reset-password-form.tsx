"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/stores/useAuthStore";
import { ResetPasswordData } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ResetPasswordFormProps extends React.ComponentProps<"form"> {
  token: string;
}

export function ResetPasswordForm({
  className,
  token,
  ...props
}: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, isResettingPassword } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordData>();

  const watchPassword = watch("password");

  const onSubmit = handleSubmit(
    async (data: ResetPasswordData) => {
      if (data.password !== data.confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp");
        return;
      }

      try {
        await resetPassword(token, data.password);
        setIsSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/user/login");
        }, 3000);
      } catch (error) {
        // Error đã được handle trong useAuthStore
        console.log("Reset password failed:", error);
      }
    },
    (errors) => {
      Object.values(errors).map((error) => toast.error(error.message));
    }
  );

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Mật khẩu đã được đặt lại</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển
              hướng đến trang đăng nhập trong 3 giây.
            </p>
          </div>
        </div>

        <Link href="/user/login">
          <Button className="w-full">Tiếp tục đến đăng nhập</Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <div className="grid gap-6">
        {/* Password Field */}
        <div className="grid gap-3">
          <Label htmlFor="password">Mật khẩu mới</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu mới"
              className={cn(
                "pl-10 pr-10",
                errors.password && "border-destructive"
              )}
              {...register("password", {
                required: "Mật khẩu là bắt buộc",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu mới"
              className={cn(
                "pl-10 pr-10",
                errors.confirmPassword && "border-destructive"
              )}
              {...register("confirmPassword", {
                required: "Xác nhận mật khẩu là bắt buộc",
                validate: (value) =>
                  value === watchPassword || "Mật khẩu xác nhận không khớp",
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isResettingPassword}>
          {isResettingPassword ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Đang đặt lại mật khẩu...
            </>
          ) : (
            "Đặt lại mật khẩu"
          )}
        </Button>
      </div>

      <div className="text-center text-sm">
        Nhớ mật khẩu?{" "}
        <Link href="/user/login" className="underline underline-offset-4">
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  );
}
