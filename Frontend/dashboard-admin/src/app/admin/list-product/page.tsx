"use client";

import { useState, useEffect } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomModal from "@/components/shared/CustomModal";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { Edit, Trash2, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProductListPage() {
  const { products, fetchProducts, deleteProduct, isLoading } =
    useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    productId: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleDeleteProduct = (productId: number) => {
    setDeleteModal({ open: true, productId });
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleteModal.productId);
      setDeleteModal({ open: false, productId: 0 });
    } catch (error) {
      console.error("Error deleting product:", error);
      // Error already handled by store with toast
    }
  };

  // Format currency VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Danh Sách Sản Phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách sản phẩm trong hệ thống
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/product">
            <Plus className="mr-2 h-4 w-4" />
            Thêm Sản Phẩm
          </Link>
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Sản Phẩm ({products.length})</CardTitle>
          <CardDescription>Tất cả sản phẩm trong cửa hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Tên Sản Phẩm</TableHead>
                <TableHead>Ảnh</TableHead>
                <TableHead>Giá Gốc</TableHead>
                <TableHead>Danh Mục</TableHead>
                <TableHead className="text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => {
                const category = categories.find(
                  (c) => c.id === product.category.id
                );
                const firstImage = product.images?.[0];

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{product.sku}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {product.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                        {firstImage ? (
                          <Image
                            src={firstImage.imageUrl}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-xs text-gray-500">IMG</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatPrice(product.basePrice)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {category?.name || "Chưa phân loại"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/product/${product.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Sửa
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Không tìm thấy sản phẩm nào
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <CustomModal
        onConfirm={confirmDelete}
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, productId: 0 })}
        title="Xóa Sản Phẩm"
        description="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
}
