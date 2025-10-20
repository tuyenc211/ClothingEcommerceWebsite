"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  isLoading?: boolean;
  orderCode: string;
  paymentMethod?: "COD" | "WALLET";
  paymentStatus?: string;
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  orderCode,
  paymentMethod,
  paymentStatus,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason(""); // Reset reason after confirm
  };

  const handleCancel = () => {
    setReason(""); // Reset reason on cancel
    onOpenChange(false);
  };

  const showRefundWarning =
    paymentMethod === "WALLET" && paymentStatus === "PAID";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Bạn có chắc chắn muốn hủy đơn hàng <strong>#{orderCode}</strong>{" "}
              không?
            </p>
            <p>Hành động này không thể hoàn tác.</p>

            {/* Refund Warning */}
            {showRefundWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ Lưu ý hoàn tiền
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Đơn hàng này đã được thanh toán online. Sau khi hủy, hệ thống
                  sẽ tự động khởi tạo quy trình hoàn tiền cho khách hàng.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Không
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Đang hủy..." : "Hủy đơn hàng"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
