"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
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
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "#000",
  },
} satisfies ChartConfig;

const formatCurrencyShort = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} ng`;
  return value.toLocaleString("vi-VN");
};

export function RevenueChart() {
  const [timeRange, setTimeRange] = React.useState("6m");
  const { revenueData, fetchRevenueData } = useDashboardStore();

  React.useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const filteredData = React.useMemo(() => {
    const months = timeRange === "3m" ? 3 : timeRange === "12m" ? 12 : 6;
    return revenueData.slice(-months).map((item) => ({
      date: item.date,
      revenue: item.revenue,
    }));
  }, [timeRange, revenueData]);

  const currentRevenue = filteredData[filteredData.length - 1]?.revenue || 0;
  const previousRevenue = filteredData[filteredData.length - 2]?.revenue || 0;
  const percentageChange =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  const totalRevenue = filteredData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const averageRevenue =
    filteredData.length > 0 ? totalRevenue / filteredData.length : 0;

  return (
    <Card className="border rounded-xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-xl font-semibold text-foreground">
            Doanh thu theo tháng
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {timeRange === "3m"
              ? "3 tháng"
              : timeRange === "6m"
              ? "6 tháng"
              : "12 tháng"}{" "}
            gần nhất
          </CardDescription>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 tháng</SelectItem>
            <SelectItem value="6m">6 tháng</SelectItem>
            <SelectItem value="12m">12 tháng</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={13}
                tickFormatter={(value) => {
                  try {
                    return format(new Date(value), "MMM", { locale: vi });
                  } catch {
                    return value;
                  }
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={13}
                tickFormatter={formatCurrencyShort}
              />
              <ChartTooltip
                cursor={{ fill: "#f3f4f6", opacity: 0.8 }}
                content={
                  <ChartTooltipContent
                    className="bg-white border rounded-lg"
                    labelFormatter={(value) =>
                      format(new Date(value), "MMMM yyyy", { locale: vi })
                    }
                    formatter={(value: ValueType) =>
                      formatCurrency(Number(value))
                    }
                  />
                }
              />
              <Bar dataKey="revenue" fill="#000000d6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-medium">
            {percentageChange >= 0 ? (
              <>
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-green-600 text-lg font-semibold">
                  +{Math.abs(percentageChange).toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-red-600 text-lg font-semibold">
                  {Math.abs(percentageChange).toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-muted-foreground">so với tháng trước</span>
          </div>
        </div>

        <div className="flex gap-8 text-sm">
          <div>
            <div className="text-muted-foreground">Tổng doanh thu</div>
            <div className="text-xl font-semibold mt-1">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Trung bình/tháng</div>
            <div className="text-xl font-semibold mt-1">
              {formatCurrency(averageRevenue)}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
