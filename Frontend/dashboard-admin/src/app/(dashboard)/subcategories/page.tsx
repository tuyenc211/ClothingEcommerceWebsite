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
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCategoryStore } from "@/stores/categoryStore";
import { toast } from "sonner";

export default function SubcategoriesPage() {
  const { categories, deleteCategory, getCategory, fetchCategories } = useCategoryStore();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    categoryId: number | null;
    categoryName: string;
  }>({
    open: false,
    categoryId: null,
    categoryName: "",
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Chỉ lấy danh mục con (có parentId)
  const subcategories = categories.filter((category) => category.parentId);

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
      toast.success("Xóa danh mục con thành công!");
      setDeleteDialog({ open: false, categoryId: null, categoryName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, categoryId: null, categoryName: "" });
  };

  // Lấy tên danh mục cha
  const getParentCategoryName = (parentId?: number) => {
    if (!parentId) return "-";
    const parentCategory = getCategory(parentId);
    return parentCategory?.name || "-";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center  items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Danh mục con</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý danh mục con trong hệ thống
          </p>
        </div>
        <Button asChild className="mt-2 md:mt-0">
          <Link href="/subcategories/add">
            <Plus className="mr-2 h-4 w-4" />
            Thêm danh mục con
          </Link>
        </Button>
      </div>

      {/* Subcategories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục nhỏ ({subcategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID danh mục nhỏ</TableHead>
                <TableHead>Tên danh mục nhỏ</TableHead>
                <TableHead>Tên danh mục chính</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Chưa có danh mục con nào
                  </TableCell>
                </TableRow>
              ) : (
                subcategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      {getParentCategoryName(category.parentId)}
                    </TableCell>
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
                          <Link
                            href={`/subcategories/edit/${category.id}`}
                          >
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa danh mục con</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục con &ldquo;
              {deleteDialog.categoryName}&rdquo;?
              <br />
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
