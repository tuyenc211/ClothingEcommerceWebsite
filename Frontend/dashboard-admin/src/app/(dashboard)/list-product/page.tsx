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
import CustomModal from "@/components/common/CustomModal";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { Edit, Trash2, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { usePagination } from "@/lib/usePagination";
import PaginationBar from "@/components/common/PaginationBar";

export default function ProductListPage() {
  const { products, fetchProducts, deleteProduct } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    productId: 0,
  });

  useEffect(() => {
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
  const {
    currentPage,
    setPage,
    totalPages,
    startIndex,
    endIndex,
    pageNumbers,
    slice,
  } = usePagination({
    totalItems: products.length,
    itemsPerPage: 10,
    showPages: 5,
  });
  const paginatedProducts = slice(products);
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
          <Link href="/product">
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
              {paginatedProducts.map((product, index) => {
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
                            src={firstImage.image_url}
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
                        {formatCurrency(product.basePrice)}
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
                            <Link href={`/product/${product.id}`}>
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
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        onPageChange={setPage}
      />
      {/* Results info */}
      {products.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, products.length)} trong
          số {products.length} sản phẩm
        </div>
      )}

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
