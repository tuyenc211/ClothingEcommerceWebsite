"use client";

import { useState } from "react";
import { useSizeStore } from "@/stores/sizeStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomModal from "@/components/shared/CustomModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Ruler } from "lucide-react";
import Link from "next/link";

export default function SizeListPage() {
  const { sizes, deleteSize } = useSizeStore();
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    sizeId: number | null;
    sizeName: string;
  }>({
    open: false,
    sizeId: null,
    sizeName: "",
  });

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({
      open: true,
      sizeId: id,
      sizeName: name,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.sizeId) {
      deleteSize(deleteModal.sizeId);
      setDeleteModal({ open: false, sizeId: null, sizeName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, sizeId: null, sizeName: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sizes</h1>
          <p className="text-muted-foreground">
            Quản lý kích thước cho sản phẩm
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/sizes/add">
            <Plus className="mr-2 h-4 w-4" />
            Thêm size
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng kích thước
            </CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sizes.length}</div>
            <p className="text-xs text-muted-foreground">
              Kích thước trong hệ thống
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sizes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách kích thước ({sizes.length})</CardTitle>
          <CardDescription>Tất cả kích thước trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã size</TableHead>
                  <TableHead>Tên size</TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Không tìm thấy kích thước nào
                    </TableCell>
                  </TableRow>
                ) : (
                  sizes
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((size) => (
                      <TableRow key={size.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {size.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {size.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{size.sortOrder}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/sizes/edit/${size.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteClick(size.id, size.name)
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
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <CustomModal
        open={deleteModal.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={`Bạn có chắc chắn muốn xóa size "${deleteModal.sizeName}"?`}
        description="Hành động này không thể hoàn tác. Kích thước sẽ bị xóa vĩnh viễn."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
}
