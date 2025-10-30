"use client";

import { Order } from "@/stores/orderStore";
import { OrderStatusBadge } from "./StatusBadges";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import useAuthStore from "@/stores/useAuthStore";
interface InvoiceTemplateProps {
  order: Order;
}

export function InvoiceTemplate({ order }: InvoiceTemplateProps) {
  const { authUser } = useAuthStore();
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  const formatAddress = () => {
    if (
      typeof order.shippingAddressSnapshot === "object" &&
      order.shippingAddressSnapshot
    ) {
      const addr = order.shippingAddressSnapshot as Record<string, string>;
      return `${addr.line || ""}, ${addr.ward || ""}, ${addr.district || ""}, ${
        addr.province || ""
      }, ${addr.country || ""}`;
    }
  };

  return (
    <div
      className={`bg-white p-4 rounded-lg border shadow-sm max-w-4xl mx-auto`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Hóa đơn</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-gray-600">Trạng thái</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Aristino</h2>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>123 Đường ABC, Quận XYZ, Thành phố ABC, Việt Nam</p>
            <p>+84 909 090 909</p>
            <p>info@aristino.com</p>
            <p>https://aristino.com</p>
          </div>
        </div>
      </div>
      {/* Invoice Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Ngày</h3>
          <p className="text-gray-900">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Mã hóa đơn
          </h3>
          <p className="text-gray-900">#{order.code}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Khách hàng
          </h3>
          <div className="text-gray-900 space-y-1">
            <p className="font-medium">{authUser?.fullName || "N/A"}</p>
            <p className="text-sm text-gray-600">{authUser?.email || "N/A"}</p>
            {authUser?.phone && (
              <p className="text-sm text-gray-600">{authUser.phone}</p>
            )}
            <p className="text-sm text-gray-600">{formatAddress()}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                  SR.
                </th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                  Tên sản phẩm
                </th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                  Số lượng
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                  Giá sản phẩm
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-4 px-2 text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="py-4 px-2 text-sm text-gray-900 font-medium">
                    {item.productName}
                    {item.attributesSnapshot && (
                      <div className="text-xs text-gray-500">
                        {JSON.stringify(item.attributesSnapshot)}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-2 text-sm text-gray-900 text-center">
                    {item.quantity}
                  </td>
                  <td className="py-4 px-2 text-sm text-gray-900 text-right">
                    {formatPrice(item.unitPrice)}
                  </td>
                  <td className="py-4 px-2 text-sm font-semibold text-gray-800 text-right">
                    {formatPrice(item.lineTotal)}
                  </td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Phương thức thanh toán
            </h3>
            <p className="text-gray-900 capitalize">
              {order.paymentMethod === "COD" ? "Tiền mặt" : "Ví điện tử"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Phí vận chuyển
            </h3>
            <p className="text-gray-900">{formatPrice(order.shippingFee)}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Giảm giá
            </h3>
            <p className="text-gray-900">{formatPrice(order.discountTotal)}</p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Tổng tiền sản phẩm: {formatPrice(order.subtotal)}
              </p>
              <p className="text-sm text-gray-600">
                Tổng số lượng sản phẩm: {order.totalItems}
              </p>
              <p className="text-sm text-gray-600">
                Trạng thái thanh toán: {order.paymentMethod}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm md:text-lg text-gray-700 mb-2">
                <span className="font-semibold">Tổng tiền</span>
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {formatPrice(order.grandTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Info */}
      {/*{order.shipments && order.shipments.length > 0 && (*/}
      {/*  <div className="mt-8 p-4 bg-blue-50 rounded-lg">*/}
      {/*    <h3 className="text-sm font-semibold text-gray-700 mb-2">*/}
      {/*      SHIPMENT INFO*/}
      {/*    </h3>*/}
      {/*    {order.shipments.map((shipment) => (*/}
      {/*      <div key={shipment.id} className="text-sm text-gray-600 space-y-1">*/}
      {/*        <p>Carrier: {shipment.carrier || "N/A"}</p>*/}
      {/*        <p>Tracking: {shipment.tracking_number || "N/A"}</p>*/}
      {/*        <p>Status: {shipment.status || "N/A"}</p>*/}
      {/*        {shipment.shipped_at && (*/}
      {/*          <p>Shipped: {formatDate(shipment.shipped_at)}</p>*/}
      {/*        )}*/}
      {/*        {shipment.delivered_at && (*/}
      {/*          <p>Delivered: {formatDate(shipment.delivered_at)}</p>*/}
      {/*        )}*/}
      {/*      </div>*/}
      {/*    ))}*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  );
}
