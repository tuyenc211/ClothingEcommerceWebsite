"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, AlertTriangle, Search, Filter, Edit } from "lucide-react";
import Link from "next/link";
import { useProductStore, StockStatus } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { formatCurrency } from "@/lib/utils";
import StatCard from "@/components/common/StatCard";
import {usePagination} from "@/lib/usePagination";
import PaginationBar from "@/components/common/PaginationBar";

export default function InventoryOverviewPage() {
  const { products, fetchProducts } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { fetchAllInventories, inventories } = useInventoryStore();

  // Fetch data khi component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchAllInventories();
  }, [fetchProducts, fetchCategories, fetchAllInventories]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  // Tính toán dữ liệu tồn kho từ inventories
  const inventoryData = useMemo(() => {
    return products.map((product) => {
      // Tính tổng tồn kho từ inventories của product
      const productInventories = inventories.filter(
        (inv) => inv.productVariant?.product?.id === product.id
      );

      const totalStock = productInventories.reduce(
        (sum, inv) => sum + (inv.quantity || 0),
        0
      );

      let status: StockStatus = "in_stock";
      if (totalStock === 0) status = "out_of_stock";
      else if (totalStock <= 10) status = "low_stock";

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        categoryName: product.category?.name || "N/A",
        categoryId: product.category?.id,
        totalStock,
        status,
        basePrice: product.basePrice,
      };
    });
  }, [products, inventories]);

  // Lọc dữ liệu
  const filteredData = useMemo(() => {
    let filtered = inventoryData;

    // Lọc theo search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.sku.toLowerCase().includes(term)
      );
    }

    // Lọc theo status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Lọc theo category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.categoryId === categoryFilter);
    }

    return filtered;
  }, [inventoryData, searchTerm, statusFilter, categoryFilter]);

    const {
        currentPage,
        setPage,
        totalPages,
        startIndex,
        endIndex,
        pageNumbers,
        slice,
    } = usePagination({
        totalItems: filteredData.length,
        itemsPerPage: 10,
        showPages: 5,
    });
  const paginatedData = slice(filteredData)
  const stats = useMemo(() => {
    const totalProducts = inventoryData.length;
    const totalStock = inventoryData.reduce((sum, p) => sum + p.totalStock, 0);
    const outOfStock = inventoryData.filter(
      (p) => p.status === "out_of_stock"
    ).length;
    const lowStock = inventoryData.filter(
      (p) => p.status === "low_stock"
    ).length;

    return { totalProducts, totalStock, outOfStock, lowStock };
  }, [inventoryData]);

  // Badge cho status
  const getStockBadge = (status: StockStatus, quantity: number) => {
    if (status === "out_of_stock") {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Hết hàng
        </Badge>
      );
    }
    if (status === "low_stock") {
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-yellow-100 text-yellow-800"
        >
          <AlertTriangle className="h-3 w-3" />
          Sắp hết ({quantity})
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Còn hàng ({quantity})
      </Badge>
    );
  };

  // Loading state
  if (products.length === 0 || inventories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  const statsCards = [
    {
      title: "Tổng sản phẩm",
      value: stats.totalProducts.toString(),
      icon: Package,
    },
    {
      title: "Tổng tồn kho",
      value: stats.totalStock.toString(),
      icon: Package,
    },
    {
      title: "Tổng hết hàng",
      value: stats.outOfStock.toString(),
      icon: AlertTriangle,
    },
    {
      title: "Tổng săp hết",
      value: stats.lowStock.toString(),
      icon: AlertTriangle,
    },
  ];
  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Quản lý tồn kho</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý tồn kho của tất cả sản phẩm
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {statsCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên hoặc SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StockStatus | "all")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="in_stock">Còn hàng</SelectItem>
                  <SelectItem value="low_stock">Sắp hết</SelectItem>
                  <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select
                value={String(categoryFilter)}
                onValueChange={(value) =>
                  setCategoryFilter(value === "all" ? "all" : Number(value))
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories
                    .filter((c) => c.parentId)
                    .map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách tồn kho ({filteredData.length})</CardTitle>
            <CardDescription>
              Quản lý tồn kho của tất cả sản phẩm trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-center">Tồn kho</TableHead>
                  <TableHead className="text-right">Giá gốc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div
                        key={filteredData.length}
                        className="text-muted-foreground"
                      >
                        Không tìm thấy sản phẩm
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {item.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div
                          className={`text-lg font-bold ${
                            item.status === "out_of_stock"
                              ? "text-red-600"
                              : item.status === "low_stock"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.totalStock}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.basePrice)}
                      </TableCell>
                      <TableCell>
                        {getStockBadge(item.status, item.totalStock)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="flex items-center gap-2"
                        >
                          <Link href={`/stock/${item.id}`}>
                            <Edit className="h-4 w-4" />
                            Cập nhật
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

          <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              onPageChange={setPage}
          />

        {/* Results info */}
        {filteredData.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredData.length)}{" "}
            trong số {filteredData.length} sản phẩm
          </div>
        )}
      </div>
  );
}
