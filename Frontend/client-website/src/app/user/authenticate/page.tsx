"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AuthenticatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirmEmail, isConfirmingEmail } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("Token xác thực không hợp lệ");
      return;
    }

    const verifyEmail = async () => {
      try {
        await confirmEmail(token);
        setStatus("success");
        setTimeout(() => {
          router.push("/user/login");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          "Không thể xác thực email. Token có thể đã hết hạn hoặc không hợp lệ."
        );
      }
    };

    verifyEmail();
  }, [searchParams, confirmEmail, router]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Đang xác thực email...</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Xác thực thành công!</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Email của bạn đã được xác thực thành công. Bạn sẽ được chuyển
                hướng đến trang đăng nhập trong 3 giây.
              </p>
            </div>
            <Link href="/user/login" className="w-full">
              <Button className="w-full">Đăng nhập ngay</Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Xác thực thất bại</h1>
              <p className="text-muted-foreground text-sm text-balance">
                {errorMessage}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Link href="/user/register" className="w-full">
                <Button className="w-full">Đăng ký lại</Button>
              </Link>
              <Link href="/user/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Quay lại đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
