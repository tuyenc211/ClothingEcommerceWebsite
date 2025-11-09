"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import privateClient from "@/lib/axios";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { handleVNPayCallback } from "@/services/paymentService";

export default function VNPayCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get all VNPay callback parameters
        const params = searchParams.get("vn-pay-callback") || "";

        console.log("VNPay callback params:", params);
        // Call backend to verify and process payment
        const response = await handleVNPayCallback(params);

        console.log("Backend response:", response);
      } catch (error) {
        console.error("Error processing VNPay callback:", error);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Status Icon */}
          <div className="mb-6 flex justify-center">
            {status === "processing" && (
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            )}
            {status === "error" && (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>

          {/* Additional Info */}
          {status === "processing" && (
            <p className="text-sm text-gray-500">
              Vui lòng không đóng trang này...
            </p>
          )}

          {status === "success" && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Đơn hàng của bạn đã được xác nhận.
              </p>
              <p className="text-sm text-gray-500">
                Đang chuyển đến trang đơn hàng...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Giao dịch không thành công.
              </p>
              <p className="text-sm text-gray-500">
                Bạn sẽ được chuyển về trang thanh toán...
              </p>
            </div>
          )}
        </div>

        {/* Payment Details (if available) */}
        {searchParams?.get("vnp_TxnRef") && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Mã đơn hàng:</span>
                <span className="font-medium text-gray-900">
                  {searchParams.get("vnp_TxnRef")}
                </span>
              </div>
              {searchParams.get("vnp_Amount") && (
                <div className="flex justify-between">
                  <span>Số tiền:</span>
                  <span className="font-medium text-gray-900">
                    {(
                      parseInt(searchParams.get("vnp_Amount") || "0") / 100
                    ).toLocaleString("vi-VN")}{" "}
                    ₫
                  </span>
                </div>
              )}
              {searchParams.get("vnp_BankCode") && (
                <div className="flex justify-between">
                  <span>Ngân hàng:</span>
                  <span className="font-medium text-gray-900">
                    {searchParams.get("vnp_BankCode")}
                  </span>
                </div>
              )}
              {searchParams.get("vnp_TransactionNo") && (
                <div className="flex justify-between">
                  <span>Mã giao dịch:</span>
                  <span className="font-medium text-gray-900">
                    {searchParams.get("vnp_TransactionNo")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
