"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Mail, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/stores/useAuthStore";
import { toast } from "sonner";

interface ForgotPasswordData {
  email: string;
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isLoading} = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordData>();

  const onSubmit = handleSubmit(
    async (data: ForgotPasswordData) => {
      try {
        await forgotPassword(data.email);
        setIsSubmitted(true);
      } catch (error) {
        // Error đã được handle trong useAuthStore
        console.log("Forgot password failed:", error);
      }
    },
    (errors) => {
      Object.values(errors).map((error) => toast.error(error.message));
    }
  );

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      {!isSubmitted ? (
        <>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để
              đặt lại mật khẩu
            </p>
          </div>

          <div className="grid gap-6">
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
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : (
                "Gửi liên kết khôi phục"
              )}
            </Button>
          </div>

          <div className="text-center text-sm">
            <Link
              href="/user/login"
              className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Email đã được gửi</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Nếu tài khoản với email <strong>{getValues("email")}</strong>{" "}
                tồn tại trong hệ thống, bạn sẽ nhận được liên kết khôi phục mật
                khẩu trong ít phút.
              </p>
              <p className="text-muted-foreground text-xs">
                Không nhận được email? Kiểm tra thư mục spam hoặc thử lại sau.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Gửi lại email
            </Button>
            <Link href="/user/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      )}
    </form>
  );
}
