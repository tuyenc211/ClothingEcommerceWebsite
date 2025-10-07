"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2, User, Phone } from "lucide-react";
import Link from "next/link";

type SignupFormData = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
};

interface SignupFormProps extends React.ComponentProps<"form"> {
  onSubmit?: (data: SignupFormData) => Promise<void>;
  onGoogleSignup?: () => Promise<void>;
  onFacebookSignup?: () => Promise<void>;
  isLoading?: boolean;
}

export function SignupForm({
  className,
  onSubmit,
  onGoogleSignup,
  onFacebookSignup,
  isLoading = false,
  ...props
}: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>();

  const password = watch("password");

  const handleFormSubmit = async (data: SignupFormData) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(handleFormSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Tạo tài khoản mới</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Nhập thông tin của bạn để tạo tài khoản
        </p>
      </div>

      <div className="grid gap-6">
        {/* Full Name Field */}
        <div className="grid gap-3">
          <Label htmlFor="fullName">Họ và tên</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input
              id="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              className={cn("pl-10", errors.fullName && "border-destructive")}
              {...register("fullName", {
                required: "Họ và tên là bắt buộc",
                minLength: {
                  value: 2,
                  message: "Họ và tên phải có ít nhất 2 ký tự",
                },
                maxLength: {
                  value: 50,
                  message: "Họ và tên không được quá 50 ký tự",
                },
              })}
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-destructive">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className={cn("pl-10", errors.email && "border-destructive")}
              {...register("email", {
                required: "Email là bắt buộc",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email không hợp lệ",
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Number Field */}
        <div className="grid gap-3">
          <Label htmlFor="phoneNumber">Số điện thoại</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input
              id="phoneNumber"
              type="tel"
              className={cn(
                "pl-10",
                errors.phoneNumber && "border-destructive"
              )}
              {...register("phoneNumber", {
                required: "Số điện thoại là bắt buộc",
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: "Số điện thoại phải có 10-11 chữ số",
                },
              })}
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-sm text-destructive">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="grid gap-3">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              className={cn(
                "pl-10 pr-10",
                errors.password && "border-destructive"
              )}
              {...register("password", {
                required: "Mật khẩu là bắt buộc",
                minLength: {
                  value: 8,
                  message: "Mật khẩu phải có ít nhất 8 ký tự",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message:
                    "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
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
        {/* Terms and Conditions */}

        {/* Signup Button */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Đang tạo tài khoản...
            </>
          ) : (
            "Đăng ký"
          )}
        </Button>

        {/* Divider */}
        <div className="relative text-center text-sm after:absolute after:inset-0 ">
          <span className="relative z-10  px-2 ">Hoặc tiếp tục với</span>
        </div>

        {/* Social Signup Buttons */}
        <div className="grid gap-2">
          {/* Google Signup */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onGoogleSignup}
            disabled={isLoading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Đăng Nhập bằng Google
          </Button>

          {/* Facebook Signup */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onFacebookSignup}
            disabled={isLoading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            Đăng Nhập bằng Facebook
          </Button>
        </div>
      </div>

      <div className="text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href="/user/login" className="underline underline-offset-4">
          Đăng nhập ngay
        </Link>
      </div>
    </form>
  );
}
