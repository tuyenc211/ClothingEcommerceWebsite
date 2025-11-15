"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useDashboardStore } from "@/stores/dashboardStore";

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

export function RevenueChart() {
  const [timeRange, setTimeRange] = React.useState("6m");
  const { revenueData, fetchRevenueData } = useDashboardStore();

  React.useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const filteredData = React.useMemo(() => {
    let monthsToShow = 6;

    if (timeRange === "3m") {
      monthsToShow = 3;
    } else if (timeRange === "12m") {
      monthsToShow = 12;
    }

    // Chuyển đổi dữ liệu để phù hợp với Bar Chart
    return revenueData.slice(-monthsToShow).map((item) => ({
      date: item.date,
      revenue: item.revenue
    }));
  }, [timeRange, revenueData]);

  // Tính toán phần trăm thay đổi so với tháng trước
  const currentMonthRevenue =
    filteredData[filteredData.length - 1]?.revenue || 0;
  const previousMonthRevenue =
    filteredData[filteredData.length - 2]?.revenue || 0;

  const percentageChange =
    previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
        100
      : 0;

  const isPositive = percentageChange > 0;

  // Tính tổng doanh thu
  const totalRevenue = filteredData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const averageRevenue =
    filteredData.length > 0 ? totalRevenue / filteredData.length : 0;

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Doanh thu theo tháng</CardTitle>
          <CardDescription>
            Hiển thị doanh thu của{" "}
            {timeRange === "3m" ? "3" : timeRange === "6m" ? "6" : "12"} tháng
            gần nhất
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[140px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="6 tháng" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="3m" className="rounded-lg">
              3 tháng
            </SelectItem>
            <SelectItem value="6m" className="rounded-lg">
              6 tháng
            </SelectItem>
            <SelectItem value="12m" className="rounded-lg">
              12 tháng
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart accessibilityLayer data={filteredData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("vi-VN", {
                  month: "short",
                  year: "2-digit",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatCurrencyShort}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("vi-VN", {
                      month: "long",
                      year: "numeric",
                    });
                  }}
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Doanh thu",
                  ]}
                  hideLabel={false}
                />
              }
            />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-4">
        <div className="flex gap-2 leading-none font-medium">
          {isPositive ? (
            <>
              Tăng {Math.abs(percentageChange).toFixed(1)}% so với tháng trước{" "}
              <TrendingUp className="h-4 w-4 text-green-600" />
            </>
          ) : (
            <>
              Giảm {Math.abs(percentageChange).toFixed(1)}% so với tháng trước{" "}
              <TrendingDown className="h-4 w-4 text-red-600" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Tổng doanh thu: {formatCurrency(totalRevenue)} • Trung bình:{" "}
          {formatCurrency(averageRevenue)}/tháng
        </div>
      </CardFooter>
    </Card>
  );
}
