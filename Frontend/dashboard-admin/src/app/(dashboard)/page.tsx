"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { RevenueChart } from "@/components/common/RevenueChart";
import { useDashboardStore } from "@/stores/dashboardStore";
import { formatCurrency } from "@/lib/utils";
import StatCard from "@/components/common/StatCard";

function getStatusBadgeVariant(status: string) {
  switch (status.toUpperCase()) {
    case "DELIVERED":
      return "default";
    case "CONFIRMED":
    case "PACKING":
      return "secondary";
    case "SHIPPED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const {
    stats,
    recentOrders,
    isLoading,
    fetchDashboardStats,
    fetchRecentOrders,
    fetchRevenueData,
  } = useDashboardStore();

  useEffect(() => {
    setMounted(true);
    // Fetch data when component mounts
    fetchDashboardStats();
    fetchRecentOrders();
    fetchRevenueData();
  }, [fetchDashboardStats, fetchRecentOrders, fetchRevenueData]);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Spinner */}
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Tổng doanh thu",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
    },
    {
      title: "Tổng đơn hàng",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
    },
    {
      title: "Tổng khách hàng",
      value: stats.totalCustomers.toString(),
      icon: Users,
    },
    {
      title: "Tổng sản phẩm",
      value: stats.totalProducts.toString(),
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Chào mừng bạn đến với Dashboard Admin của Aristino.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Revenue Chart */}
            <div className="col-span-4">
              <RevenueChart />
            </div>

            {/* Recent Sales */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Bán hàng gần đây</CardTitle>
                <CardDescription>
                  {recentOrders.length > 0
                    ? `Bạn đã có ${stats.totalOrders} đơn hàng trong tháng này.`
                    : "Không có dữ liệu bán hàng"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {order.customerName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.customerEmail}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          {formatCurrency(order.discountedTotal)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Không có đơn hàng gần đây
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng gần đây</CardTitle>
              <CardDescription>
                Danh sách các đơn hàng gần đây của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Đã giảm giá</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <TableRow key={order.id} className="py-2">
                        <TableCell className="font-medium">
                          {order.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.customerName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.customerEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{order.products}</TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          {formatCurrency(order.discountedTotal)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        Không có đơn hàng nào gần đây.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
