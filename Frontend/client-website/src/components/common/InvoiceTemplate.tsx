"use client";

import { Order } from "@/stores/orderStore";
import { OrderStatusBadge } from "./StatusBadges";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
interface InvoiceTemplateProps {
  order: Order;
}

export function InvoiceTemplate({ order }: InvoiceTemplateProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  const formatAddress = () => {
    if (
      typeof order.shipping_address_snapshot === "object" &&
      order.shipping_address_snapshot
    ) {
      const addr = order.shipping_address_snapshot as Record<string, string>;
      return `${addr.line || ""}, ${addr.ward || ""}, ${addr.district || ""}, ${
        addr.province || ""
      }, ${addr.country || ""}`;
    }
    return order.shippingAddress || "N/A";
  };

  return (
    <div
      className={`bg-white p-4 rounded-lg border shadow-sm max-w-4xl mx-auto`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-gray-600">STATUS</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Zorvex</h2>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>2 Lawson Avenue, California, United States</p>
            <p>+1 (212) 456-7890</p>
            <p>ecommerceadmin@gmail.com</p>
            <p>ecommerce-admin-board.vercel.app</p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">DATE</h3>
          <p className="text-gray-900">{formatDate(order.created_at)}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            INVOICE NO
          </h3>
          <p className="text-gray-900">#{order.code}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            INVOICE TO
          </h3>
          <div className="text-gray-900 space-y-1">
            <p className="font-medium">{order.customerName || "N/A"}</p>
            <p className="text-sm text-gray-600">
              {order.customerEmail || "N/A"}
            </p>
            {order.customerPhone && (
              <p className="text-sm text-gray-600">{order.customerPhone}</p>
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
                  PRODUCT TITLE
                </th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                  QUANTITY
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                  ITEM PRICE
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                  AMOUNT
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
                    {item.product_name}
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
                    {formatPrice(item.unit_price)}
                  </td>
                  <td className="py-4 px-2 text-sm font-semibold text-green-600 text-right">
                    {formatPrice(item.line_total)}
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
              PAYMENT METHOD
            </h3>
            <p className="text-gray-900 capitalize">
              {order.payment_method === "COD" ? "Tiền mặt" : "Ví điện tử"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              SHIPPING COST
            </h3>
            <p className="text-gray-900">{formatPrice(order.shipping_fee)}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              DISCOUNT
            </h3>
            <p className="text-gray-900">{formatPrice(order.discount_total)}</p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Subtotal: {formatPrice(order.subtotal)}
              </p>
              <p className="text-sm text-gray-600">
                Total Items: {order.total_items}
              </p>
              <p className="text-sm text-gray-600">
                Payment Status: {order.payment_status}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm md:text-lg text-gray-700 mb-2">
                <span className="font-semibold">TOTAL AMOUNT</span>
              </p>
              <p className="text-3xl font-bold text-green-600">
                {formatPrice(order.grand_total)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Info */}
      {order.shipments && order.shipments.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            SHIPMENT INFO
          </h3>
          {order.shipments.map((shipment) => (
            <div key={shipment.id} className="text-sm text-gray-600 space-y-1">
              <p>Carrier: {shipment.carrier || "N/A"}</p>
              <p>Tracking: {shipment.tracking_number || "N/A"}</p>
              <p>Status: {shipment.status || "N/A"}</p>
              {shipment.shipped_at && (
                <p>Shipped: {formatDate(shipment.shipped_at)}</p>
              )}
              {shipment.delivered_at && (
                <p>Delivered: {formatDate(shipment.delivered_at)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
