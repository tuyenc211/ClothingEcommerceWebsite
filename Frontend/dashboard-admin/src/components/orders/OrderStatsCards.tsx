"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderStore } from "@/stores/orderStore";
import {
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
export function OrderStatsCards() {
  const { orders, getTotalRevenue, getOrdersByStatus } = useOrderStore();
  const totalOrders = orders.length;
  const totalRevenue = getTotalRevenue();
  const pendingOrders = getOrdersByStatus("NEW").length;
  const deliveredOrders = getOrdersByStatus("DELIVERED").length;

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      change: "+12%",
      changeType: "positive" as const,
      color: "blue",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      change: "+18%",
      changeType: "positive" as const,
      color: "green",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toLocaleString(),
      icon: Clock,
      change: "-5%",
      changeType: "negative" as const,
      color: "yellow",
    },
    {
      title: "Completed Orders",
      value: deliveredOrders.toLocaleString(),
      icon: CheckCircle,
      change: "+22%",
      changeType: "positive" as const,
      color: "green",
    },
  ];

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon
                className={`h-4 w-4 ${
                  iconColors[stat.color as keyof typeof iconColors]
                }`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="flex items-center text-xs">
                <TrendingUp
                  className={`h-3 w-3 mr-1 ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                />
                <span
                  className={
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {stat.change}
                </span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
