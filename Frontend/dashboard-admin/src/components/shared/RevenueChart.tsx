"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
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
import {formatCurrency} from "@/lib/utils";

// Mock data doanh thu theo tháng (VNĐ)
const revenueData = [
  { date: "2024-01-01", currentMonth: 285000000, lastMonth: 245000000 },
  { date: "2024-02-01", currentMonth: 320000000, lastMonth: 285000000 },
  { date: "2024-03-01", currentMonth: 310000000, lastMonth: 320000000 },
  { date: "2024-04-01", currentMonth: 450000000, lastMonth: 310000000 },
  { date: "2024-05-01", currentMonth: 520000000, lastMonth: 450000000 },
  { date: "2024-06-01", currentMonth: 580000000, lastMonth: 520000000 },
  { date: "2024-07-01", currentMonth: 650000000, lastMonth: 580000000 },
  { date: "2024-08-01", currentMonth: 720000000, lastMonth: 650000000 },
  { date: "2024-09-01", currentMonth: 690000000, lastMonth: 720000000 },
  { date: "2024-10-01", currentMonth: 780000000, lastMonth: 690000000 },
  { date: "2024-11-01", currentMonth: 850000000, lastMonth: 780000000 },
  { date: "2024-12-01", currentMonth: 920000000, lastMonth: 850000000 },
];

const chartConfig = {
  currentMonth: {
    label: "Tháng này",
    color: "#F8F7BA",
  },
  lastMonth: {
    label: "Tháng trước",
    color: "#BDE3C3",
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

  const filteredData = React.useMemo(() => {
    let monthsToShow = 6;

    if (timeRange === "3m") {
      monthsToShow = 3;
    } else if (timeRange === "12m") {
      monthsToShow = 12;
    }

    return revenueData.slice(-monthsToShow);
  }, [timeRange]);

  // Tính toán phần trăm thay đổi
  const currentMonthRevenue =
    filteredData[filteredData.length - 1]?.currentMonth || 0;
  const lastMonthRevenue =
    filteredData[filteredData.length - 1]?.lastMonth || 0;
  const percentageChange =
    lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  const isPositive = percentageChange > 0;

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Doanh thu theo tháng</CardTitle>
          <CardDescription>
            So sánh doanh thu tháng hiện tại với tháng trước
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={isPositive ? "text-green-600" : "text-red-600"}>
              {isPositive ? "+" : ""}
              {percentageChange.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">so với tháng trước</span>
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
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCurrentMonth" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-currentMonth)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-currentMonth)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillLastMonth" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-lastMonth)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-lastMonth)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
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
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    chartConfig[name as keyof typeof chartConfig]?.label ||
                      name,
                  ]}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="lastMonth"
              type="natural"
              fill="url(#fillLastMonth)"
              stroke="var(--color-lastMonth)"
              stackId="a"
            />
            <Area
              dataKey="currentMonth"
              type="natural"
              fill="url(#fillCurrentMonth)"
              stroke="var(--color-currentMonth)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: "hsl(var(--chart-1))",
                }}
              />
              <span>Tháng này: {formatCurrencyShort(currentMonthRevenue)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: "hsl(var(--chart-2))",
                }}
              />
              <span>Tháng trước: {formatCurrencyShort(lastMonthRevenue)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
