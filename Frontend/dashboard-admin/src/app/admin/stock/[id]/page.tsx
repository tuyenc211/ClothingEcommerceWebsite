"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useInventoryStore } from "@/stores/inventoryStore";

interface VariantInventory {
  variantId: number;
  sku: string;
  sizeName: string;
  colorName: string;
  colorCode: string;
  currentQuantity: number;
  newQuantity: number;
}

export default function ProductInventoryPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);

  const { updateInventory, fetchInventoriesByProduct } = useInventoryStore();

  const [productName, setProductName] = useState("");
  const [productSku, setProductSku] = useState("");
  const [variants, setVariants] = useState<VariantInventory[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data khi component mount
  useEffect(() => {
    const loadData = async () => {
      // Chỉ cần gọi 1 API duy nhất - backend đã trả về đầy đủ thông tin
      const productInventories = await fetchInventoriesByProduct(productId);
      
      if (!productInventories || productInventories.length === 0) {
        toast.error("Không tìm thấy sản phẩm hoặc sản phẩm chưa có biến thể");
        router.push("/admin/stock");
        return;
      }

      // Lấy thông tin product từ inventory đầu tiên
      const firstInventory = productInventories[0];
      setProductName(firstInventory.productVariant?.product?.name || "Sản phẩm");
      setProductSku(firstInventory.productVariant?.product?.sku || "");

      // Map inventories thành variants với thông tin từ backend
      const variantInventories: VariantInventory[] = productInventories.map((inv) => {
        const variant = inv.productVariant;
        return {
          variantId: variant.id,
          sku: variant.sku,
          sizeName: variant.size?.name || "N/A",
          colorName: variant.color?.name || "N/A",
          colorCode: variant.color?.code || "#000000",
          currentQuantity: inv.quantity || 0,
          newQuantity: inv.quantity || 0,
        };
      });

      setVariants(variantInventories);
    };
    
    loadData();
  }, [productId, fetchInventoriesByProduct, router]);

  // Update quantity trong state
  const handleQuantityChange = (variantId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0) return;

    setVariants((prev) =>
      prev.map((v) =>
        v.variantId === variantId ? { ...v, newQuantity: numValue } : v
      )
    );
  };

  // Lưu tất cả thay đổi
  const handleSaveAll = async () => {
    setIsSaving(true);

    try {
      // Update từng variant thông qua API backend
      const updatePromises = variants
        .filter(v => v.newQuantity !== v.currentQuantity)
        .map(variant => 
          updateInventory({
            variantId: variant.variantId,
            quantity: variant.newQuantity
          })
        );
      
      await Promise.all(updatePromises);

      toast.success("Cập nhật tồn kho thành công!");

      // Reload data từ backend
      const productInventories = await fetchInventoriesByProduct(productId);
      
      const updatedVariants: VariantInventory[] = productInventories.map((inv) => {
        const variant = inv.productVariant;
        return {
          variantId: variant.id,
          sku: variant.sku,
          sizeName: variant.size?.name || "N/A",
          colorName: variant.color?.name || "N/A",
          colorCode: variant.color?.code || "#000000",
          currentQuantity: inv.quantity || 0,
          newQuantity: inv.quantity || 0,
        };
      });

      setVariants(updatedVariants);
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật tồn kho");
    } finally {
      setIsSaving(false);
    }
  };

  // Check xem có thay đổi nào không
  const hasChanges = variants.some((v) => v.newQuantity !== v.currentQuantity);

  // Get stock status badge
  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Hết hàng
        </Badge>
      );
    }
    if (quantity <= 10) {
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-yellow-100 text-yellow-800"
        >
          <AlertTriangle className="h-3 w-3" />
          Sắp hết
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Còn hàng
      </Badge>
    );
  };

  if (variants.length === 0 && !productName) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/stock">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quản lý tồn kho</h1>
            <p className="text-muted-foreground">
              {productName} {productSku && `- ${productSku}`}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSaveAll}
          disabled={!hasChanges || isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách biến thể</CardTitle>
          <CardDescription>
            Cập nhật số lượng tồn kho cho từng biến thể sản phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Kích thước</TableHead>
                <TableHead>Màu sắc</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => {
                const hasChange =
                  variant.newQuantity !== variant.currentQuantity;
                return (
                  <TableRow
                    key={variant.variantId}
                    className={hasChange ? "bg-blue-50" : ""}
                  >
                    <TableCell className="font-mono text-sm">
                      {variant.sku}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{variant.sizeName}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: variant.colorCode }}
                        />
                        <span>{variant.colorName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min="0"
                        value={variant.newQuantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            variant.variantId,
                            e.target.value
                          )
                        }
                        className="w-24 text-center"
                      />
                    </TableCell>
                    <TableCell>{getStockBadge(variant.newQuantity)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Warning if changes */}
      {hasChanges && (
        <Card className="border-blue-500 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">
                Có{" "}
                {
                  variants.filter((v) => v.newQuantity !== v.currentQuantity)
                    .length
                }{" "}
                biến thể đã thay đổi. Nhớ lưu để cập nhật thay đổi.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
