import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";

interface PaymentMethodSelectorProps {
  paymentMethod: "COD" | "WALLET";
  onPaymentMethodChange: (method: "COD" | "WALLET") => void;
}

export default function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSelectorProps) {
  return (
    <RadioGroup
      value={paymentMethod}
      onValueChange={(value: string) =>
        onPaymentMethodChange(value as "COD" | "WALLET")
      }
    >
      {/* COD Payment */}
      <div
        className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
          paymentMethod === "COD"
            ? "border-primary bg-primary/5"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => onPaymentMethodChange("COD")}
      >
        <RadioGroupItem value="COD" id="payment-cod" />
        <Label htmlFor="payment-cod" className="flex-1 cursor-pointer">
          <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
          <p className="text-sm text-gray-500 mt-1">
            Thanh toán bằng tiền mặt khi nhận hàng
          </p>
        </Label>
      </div>

      {/* VNPay Payment */}
      <div
        className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
          paymentMethod === "WALLET"
            ? "border-primary bg-primary/5"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => onPaymentMethodChange("WALLET")}
      >
        <RadioGroupItem value="WALLET" id="payment-wallet" />
        <Label htmlFor="payment-wallet" className="flex-1 cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="font-medium">Thanh toán qua VNPay</span>
            <Image
              src="/images/logo/vnpay.svg"
              alt="VNPay"
              width={60}
              height={20}
              className="h-5 w-auto"
            />
          </div>
        </Label>
      </div>
    </RadioGroup>
  );
}
