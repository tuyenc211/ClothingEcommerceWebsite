"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const { login, loginAsAdmin, isLoggingIn, authUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Redirect về callbackUrl sau khi login thành công
  useEffect(() => {
    if (authUser) {
      router.replace(callbackUrl);
    }
  }, [authUser, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await login({ email, password });
      // Router sẽ tự động chuyển hướng thông qua useEffect
    } catch (error) {
      // Error đã được xử lý trong store và hiển thị toast
      console.log("Login failed:", error);
    }
  };

  const handleQuickLogin = async () => {
    try {
      await loginAsAdmin();
      // Router sẽ tự động chuyển hướng thông qua useEffect
    } catch (error) {
      console.log("Quick login failed:", error);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Admin account
                </p>
              </div>

              {/* Email */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoggingIn}
                />
              </div>

              {/* Password */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/forgot-password"
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoggingIn}
                />
              </div>

              {/* Nút login với loading */}
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Login
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              {/* Nút đăng nhập nhanh với Admin */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoggingIn}
                onClick={handleQuickLogin}
              >
                {isLoggingIn && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                🚀 Đăng nhập nhanh với Admin
              </Button>

              {/* Thông tin tài khoản demo */}
              <div className="text-center text-sm text-muted-foreground">
                <p className="font-medium">Tài khoản demo có sẵn:</p>
                <p>📧 admin@fashionstore.vn (Admin)</p>
                <p>📧 staff@fashionstore.vn (Staff)</p>
              </div>
            </div>
          </form>

          {/* Ảnh bên phải */}
          <div className="bg-muted relative hidden md:block">
            <img
              src="../assets/login.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover
                         dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
