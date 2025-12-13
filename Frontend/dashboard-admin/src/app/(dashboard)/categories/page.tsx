"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCategoryStore } from "@/stores/categoryStore";
import { toast } from "sonner";
import CustomModal from "@/components/common/CustomModal";

export default function CategoriesPage() {
  const { deleteCategory, categories, fetchCategories, isLoading, error } =
    useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    categoryId: number | null;
    categoryName: string;
  }>({
    open: false,
    categoryId: null,
    categoryName: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const rootCategories = categories.filter((category) => !category.parentId);

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteDialog({
      open: true,
      categoryId: id,
      categoryName: name,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.categoryId) {
      deleteCategory(deleteDialog.categoryId);
      setDeleteDialog({ open: false, categoryId: null, categoryName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, categoryId: null, categoryName: "" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Lỗi: {error}</p>
          <Button onClick={() => fetchCategories()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  // Pagination calculation
  const totalPages = Math.ceil(rootCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = rootCategories.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    const half = Math.floor(showPages / 2);

    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + showPages - 1);

    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Danh mục chính</h1>
          <p className="text-muted-foreground">
            Quản lý danh mục chính trong hệ thống
          </p>
        </div>
        <Button asChild>
          <Link href="/categories/add">
            <Plus className="mr-2 h-4 w-4" />
            Thêm danh mục chính
          </Link>
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách danh mục chính ({rootCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rootCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Chưa có danh mục chính nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                      >
                        {category.isActive ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/categories/edit/${category.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteClick(category.id, category.name)
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              {/* Previous Button */}
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}

              {/* Page Numbers */}
              {getPageNumbers().map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNum)}
                    isActive={pageNum === currentPage}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Next Button */}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Results info */}
      {rootCategories.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, rootCategories.length)}{" "}
          trong số {rootCategories.length} danh mục chính
        </div>
      )}
        <CustomModal
            open={deleteDialog.open}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            title={`Bạn có chắc chắn muốn xóa danh mục này không?`}
            description="Hành động này không thể hoàn tác"
            confirmText="Xóa"
            cancelText="Hủy"
            variant="destructive"
        />
    </div>

  );
}
