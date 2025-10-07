import React from "react";
import {
  Coffee,
  Truck,
  CreditCard,
  Shield,
  Smile,
  Handbag,
} from "lucide-react";

interface PolicyItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const policyData: PolicyItem[] = [
  {
    id: "quality",
    icon: <Handbag className="w-10 h-10 md:w-12 md:h-12 text-black" />,
    title: "Chính hãng",
    description: "100% Chính hãng",
  },
  {
    id: "delivery",
    icon: <Truck className="w-10 h-10 md:w-12 md:h-12 text-black" />,
    title: "Miễn phí vận chuyển",
    description: "Áp dụng cho đơn hàng từ 500k",
  },
  {
    id: "payment",
    icon: <CreditCard className="w-10 h-10 md:w-12 md:h-12 text-black" />,
    title: "Thanh toán đa dạng",
    description: "Thanh toán khi nhận hàng,... ",
  },
  {
    id: "security",
    icon: <Shield className="w-10 h-10 md:w-12 md:h-12 text-black" />,
    title: "Bảo hành",
    description: "Lên đến 180 ngày",
  },
];

export default function ListPolicy() {
  return (
    <div className="border-t  py-2 ">
      <div className="container mx-auto ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-4">
          {policyData.map((policy) => (
            <div
              key={policy.id}
              className="flex items-start text-start  gap-3 py-2 md:py-4 px-5  space-x-4"
            >
              <div className="mb-4">{policy.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {policy.title}
                </h3>
                <h4 className=" text-gray-600">{policy.description}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
