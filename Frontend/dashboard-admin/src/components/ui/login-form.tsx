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
import Image from "next/image";
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { login, isLoggingIn, authUser } = useAuthStore();

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
    } catch (error) {
      console.log("Login failed:", error);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Chào mừng bạn trở lại</h1>
                <p className="text-muted-foreground text-balance">
                  Truy cập vào dashboard của bạn
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
                <Label htmlFor="password">Password</Label>
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
            </div>
          </form>

          {/* Ảnh bên phải */}
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/assets/login.jpg"
              alt="Image"
              className="absolute inset-0 object-cover
                         dark:brightness-[0.2] dark:grayscale"
              fill
              unoptimized
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
