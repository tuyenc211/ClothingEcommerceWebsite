"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MapPin, CreditCard, Ticket, ChevronRight, Check } from "lucide-react";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import { useColorStore } from "@/stores/colorStore";
import { useSizeStore } from "@/stores/sizeStore";
import { useCouponStore } from "@/stores/couponStore";
import useAuthStore from "@/stores/useAuthStore";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useAddress } from "@/hooks/useAddress";

interface ShippingFormData {
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  wardCode: string;
  province: string;
  provinceCode: string;
  note?: string;
}

interface EnrichedCartItem extends CartItem {
  product?: {
    id: number;
    name: string;
    sku?: string;
    base_price: number;
    images?: { id: number; imageUrl: string }[];
  };
  color?: {
    id: number;
    name: string;
    code: string;
  };
  size?: {
    id: number;
    code: string;
    name: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { authUser, getDefaultAddress } = useAuthStore();
  const {
    items,
    getCartSummary,
    clearCart,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
  } = useCartStore();
  const { getProduct } = useProductStore();
  const { colors } = useColorStore();
  const { sizes } = useSizeStore();
  const { getActiveCoupons } = useCouponStore();

  // Address hook
  const {
    provinces,
    wards,
    isLoadingProvinces,
    isLoadingWards,
    fetchWards,
    clearWards,
  } = useAddress();

  // States
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: "",
    phone: "",
    address: "",
    ward: "",
    wardCode: "",
    province: "",
    provinceCode: "",
    note: "",
  });

  const activeCoupons = getActiveCoupons();
  const summary = getCartSummary();

  // Mock data cho testing (khi giỏ hàng trống)
  const mockCartItems = useMemo(() => {
    return [
      {
        id: 1,
        cart_id: 1,
        variant_id: 1001,
        unit_price: 299000,
        quantity: 2,
        variant: {
          id: 1001,
          product_id: 1,
          sku: "SHIRT-BLK-L",
          size_id: 3,
          color_id: 1,
          price: 299000,
        },
        product: {
          id: 1,
          name: "Áo Ni Fitted L.3 7842 - Trắng - 2XL",
          sku: "SHIRT-001",
          base_price: 299000,
          images: [
            {
              id: 1,
              imageUrl:
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
            },
          ],
        },
        color: {
          id: 1,
          name: "Trắng",
          code: "#FFFFFF",
        },
        size: {
          id: 3,
          code: "2XL",
          name: "2XL",
        },
      },
      {
        id: 2,
        cart_id: 1,
        variant_id: 1002,
        unit_price: 599000,
        quantity: 1,
        variant: {
          id: 1002,
          product_id: 2,
          sku: "JEAN-BLU-32",
          size_id: 4,
          color_id: 2,
          price: 599000,
        },
        product: {
          id: 2,
          name: "Quần Jeans Slim Fit - Xanh Đen - 32",
          sku: "JEAN-002",
          base_price: 599000,
          images: [
            {
              id: 2,
              imageUrl:
                "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
            },
          ],
        },
        color: {
          id: 2,
          name: "Xanh Đen",
          code: "#1e3a8a",
        },
        size: {
          id: 4,
          code: "32",
          name: "32",
        },
      },
      {
        id: 3,
        cart_id: 1,
        variant_id: 1003,
        unit_price: 799000,
        quantity: 1,
        variant: {
          id: 1003,
          product_id: 3,
          sku: "HOOD-GRY-M",
          size_id: 2,
          color_id: 3,
          price: 799000,
        },
        product: {
          id: 3,
          name: "Áo Khoác Hoodie Oversize - Xám - M",
          sku: "HOOD-003",
          base_price: 799000,
          images: [
            {
              id: 3,
              imageUrl:
                "https://images.unsplash.com/photo-1556821840-3a9c6fcc9fdf?w=400&h=400&fit=crop",
            },
          ],
        },
        color: {
          id: 3,
          name: "Xám",
          code: "#6b7280",
        },
        size: {
          id: 2,
          code: "M",
          name: "M",
        },
      },
    ];
  }, []);

  // Mock summary cho testing
  const mockSummary = {
    subtotal: 1696000,
    discount: 0,
    shipping: 30000,
    tax: 169600,
    total: 1895600,
    itemCount: 4,
  };

  // Sử dụng data thật từ cart, nếu không có thì dùng mock data
  const displayItems = items.length > 0 ? items : mockCartItems;
  const displaySummary = items.length > 0 ? summary : mockSummary;

  // Enrich cart items
  const enrichedItems = useMemo(() => {
    return displayItems
      .map((item) => {
        const variant = item.variant;
        if (!variant) return null;

        // Nếu đang dùng mock data thì đã có đầy đủ thông tin rồi
        if (items.length === 0) {
          return item as EnrichedCartItem;
        }

        // Nếu dùng real data thì cần enrich
        const product = getProduct(variant.product_id);
        const color = colors.find((c) => c.id === variant.color_id);
        const size = sizes.find((s) => s.id === variant.size_id);

        return {
          ...item,
          product,
          color,
          size,
        } as EnrichedCartItem;
      })
      .filter((item): item is EnrichedCartItem => item !== null);
  }, [displayItems, items.length, getProduct, colors, sizes]);

  // Load default address on mount
  useEffect(() => {
    if (authUser) {
      const defaultAddr = getDefaultAddress();
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setFormData({
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          address: defaultAddr.line,
          ward: defaultAddr.ward || "",
          wardCode: "",
          province: defaultAddr.province || "",
          provinceCode: "",
          note: "",
        });
      } else if (authUser.addresses && authUser.addresses.length > 0) {
        // Use first address if no default
        const firstAddr = authUser.addresses[0];
        setSelectedAddressId(firstAddr.id);
        setFormData({
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          address: firstAddr.line,
          ward: firstAddr.ward || "",
          wardCode: "",
          province: firstAddr.province || "",
          provinceCode: "",
          note: "",
        });
      } else {
        setIsNewAddress(true);
        setFormData({
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          address: "",
          ward: "",
          wardCode: "",
          province: "",
          provinceCode: "",
          note: "",
        });
      }
    } else {
      setIsNewAddress(true);
    }
  }, [authUser, getDefaultAddress]);

  // Redirect if cart is empty (commented out để test với mock data)
  // useEffect(() => {
  //   if (items.length === 0) {
  //     toast.error("Giỏ hàng trống");
  //     router.push("/cart");
  //   }
  // }, [items, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (provinceCode: string) => {
    const selectedProvince = provinces.find((p) => p.code === provinceCode);
    setFormData((prev) => ({
      ...prev,
      provinceCode: provinceCode,
      province: selectedProvince?.name || "", // API mới dùng "name" thay vì "full_name"
      wardCode: "",
      ward: "",
    }));

    // Fetch wards for selected province
    fetchWards(provinceCode);
  };

  const handleWardChange = (wardCode: string) => {
    const selectedWard = wards.find((w) => w.code === wardCode);
    setFormData((prev) => ({
      ...prev,
      wardCode: wardCode,
      ward: selectedWard?.name || "", // API mới dùng "name" thay vì "full_name"
    }));
  };

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddressId(addressId);
    setIsNewAddress(false);

    if (authUser) {
      const selectedAddr = authUser.addresses?.find(
        (addr) => addr.id === addressId
      );
      if (selectedAddr) {
        setFormData({
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          address: selectedAddr.line,
          ward: selectedAddr.ward || "",
          wardCode: "",
          province: selectedAddr.province || "",
          provinceCode: "",
          note: formData.note || "",
        });
      }
    }
  };

  const handleNewAddress = () => {
    setIsNewAddress(true);
    setSelectedAddressId(null);
    setFormData({
      fullName: authUser?.fullName || "",
      phone: authUser?.phone || "",
      address: "",
      ward: "",
      wardCode: "",
      province: "",
      provinceCode: "",
      note: formData.note || "",
    });
    clearWards();
  };

  const handleApplyCoupon = (couponCode: string) => {
    const coupon = activeCoupons.find((c) => c.code === couponCode);
    if (coupon) {
      const success = applyCoupon(coupon);
      if (success) {
        setShowCouponList(false);
        toast.success(`Đã áp dụng mã giảm giá: ${couponCode}`);
      } else {
        toast.error("Không thể áp dụng mã giảm giá này");
      }
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info("Đã hủy mã giảm giá");
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return false;
    }

    if (!formData.province || !formData.ward) {
      toast.error("Vui lòng chọn tỉnh/thành phố và xã/phường");
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // TODO: Call API to create order
      const orderData = {
        user_id: authUser?.id,
        items: enrichedItems.map((item) => ({
          variant_id: item?.variant?.id,
          product_name: item?.product?.name,
          sku: item?.variant?.sku,
          quantity: item?.quantity,
          unit_price: item?.unit_price,
          line_total: (item?.unit_price || 0) * (item?.quantity || 0),
        })),
        subtotal: displaySummary.subtotal,
        discount_total: displaySummary.discount,
        shipping_fee: displaySummary.shipping,
        grand_total: displaySummary.total,
        payment_method: paymentMethod,
        shipping_address_snapshot: formData,
        note: formData.note,
      };

      console.log("Creating order:", orderData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Đặt hàng thành công!");

      // Chỉ clear cart nếu đang dùng real data
      if (items.length > 0) {
        clearCart();
      }

      router.push("/user/orders");
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Đặt hàng thất bại. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Comment out redirect để test với mock data
  // if (items.length === 0) {
  //   return null; // Will redirect in useEffect
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/cart">Giỏ hàng</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/checkout">Thanh toán</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-6 h-6" />
          <h1 className="text-xl md:text-2xl font-semibold">Thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <CardTitle>Thông tin giao hàng</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Saved Addresses */}
                {authUser &&
                  authUser.addresses &&
                  authUser.addresses.length > 0 && (
                    <div className="space-y-3">
                      <Label>Địa chỉ đã lưu</Label>
                      <RadioGroup
                        value={selectedAddressId?.toString() || "new"}
                        onValueChange={(value: string) => {
                          if (value === "new") {
                            handleNewAddress();
                          } else {
                            handleAddressSelect(parseInt(value));
                          }
                        }}
                      >
                        {authUser.addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                              selectedAddressId === addr.id
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleAddressSelect(addr.id)}
                          >
                            <RadioGroupItem
                              value={addr.id.toString()}
                              id={`addr-${addr.id}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Label
                                  htmlFor={`addr-${addr.id}`}
                                  className="font-medium cursor-pointer"
                                >
                                  {addr.line}
                                </Label>
                                {addr.isDefault && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Mặc định
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {[addr.ward, addr.district, addr.province]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* New Address Option */}
                        <div
                          className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                            isNewAddress
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={handleNewAddress}
                        >
                          <RadioGroupItem value="new" id="addr-new" />
                          <Label
                            htmlFor="addr-new"
                            className="font-medium cursor-pointer"
                          >
                            Sử dụng địa chỉ mới
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                {/* Address Form */}
                {(isNewAddress ||
                  !authUser ||
                  !authUser.addresses ||
                  authUser.addresses.length === 0) && (
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          Họ và tên <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Nhập họ và tên"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Số điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="province">
                          Tỉnh/ Thành phố{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.provinceCode}
                          onValueChange={handleProvinceChange}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingProvinces
                                  ? "Đang tải..."
                                  : "Chọn tỉnh/thành phố"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {provinces.map((province) => (
                              <SelectItem
                                key={province.code}
                                value={province.code}
                              >
                                {province.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ward">
                          Xã/ Phường <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.wardCode}
                          onValueChange={handleWardChange}
                          disabled={!formData.provinceCode}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !formData.provinceCode
                                  ? "Chọn tỉnh/thành phố trước"
                                  : isLoadingWards
                                  ? "Đang tải..."
                                  : "Chọn xã/phường"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {wards.map((ward) => (
                              <SelectItem key={ward.code} value={ward.code}>
                                {ward.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">
                        Địa chỉ cụ thể <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Số nhà, tên đường..."
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <CardTitle>Phương thức thanh toán</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: string) =>
                    setPaymentMethod(value as "COD" | "VNPAY")
                  }
                >
                  {/* COD Payment */}
                  <div
                    className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      paymentMethod === "COD"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("COD")}
                  >
                    <RadioGroupItem value="COD" id="payment-cod" />
                    <Label
                      htmlFor="payment-cod"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </p>
                    </Label>
                  </div>

                  {/* VNPay Payment */}
                  <div
                    className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      paymentMethod === "VNPAY"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("VNPAY")}
                  >
                    <RadioGroupItem value="VNPAY" id="payment-vnpay" />
                    <Label
                      htmlFor="payment-vnpay"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          Thanh toán qua VNPay
                        </span>
                        <Image
                          src="/images/logo/vnpay.svg"
                          alt="VNPay"
                          width={60}
                          height={20}
                          className="h-5 w-auto"
                        />
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Đơn hàng ({displayItems.length} sản phẩm)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Products List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {enrichedItems.map((item) => {
                    if (!item || !item.product) return null;

                    const productImage =
                      item.product.images?.[0]?.imageUrl ||
                      "/images/placeholder.jpg";

                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          <Image
                            src={productImage}
                            alt={item.product.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                          <Badge
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            variant="secondary"
                          >
                            {item.quantity}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-2">
                            {item.product.name}
                          </h4>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.color && (
                              <span>
                                {item.color.name}
                                {item.size && " / "}
                              </span>
                            )}
                            {item.size && <span>{item.size.code}</span>}
                          </div>
                          <div className="text-sm font-medium mt-1">
                            {formatPrice(item.unit_price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Coupon Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    <Label>Mã giảm giá</Label>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {appliedCoupon.code}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 h-8"
                      >
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowCouponList(!showCouponList)}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Chọn mã giảm giá
                    </Button>
                  )}

                  {/* Coupon List */}
                  {showCouponList && !appliedCoupon && (
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                      {activeCoupons.length > 0 ? (
                        activeCoupons.map((coupon) => (
                          <div
                            key={coupon.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleApplyCoupon(coupon.code)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {coupon.code}
                                </Badge>
                                <span className="text-sm font-medium">
                                  Giảm {formatPrice(coupon.value)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {coupon.description || coupon.name}
                              </p>
                              {coupon.min_order_total && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Đơn tối thiểu:{" "}
                                  {formatPrice(coupon.min_order_total)}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-sm text-gray-500">
                          Không có mã giảm giá khả dụng
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">
                      {formatPrice(displaySummary.subtotal)}
                    </span>
                  </div>
                  {displaySummary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-medium">
                        -{formatPrice(displaySummary.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">
                      {displaySummary.shipping === 0
                        ? "Miễn phí"
                        : formatPrice(displaySummary.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thuế (VAT 10%):</span>
                    <span className="font-medium">
                      {formatPrice(displaySummary.tax)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">
                    {formatPrice(displaySummary.total)}
                  </span>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Hoàn tất đơn hàng"}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/cart")}
                >
                  Quay lại giỏ hàng
                </Button>

                {/* Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    Chúng tôi sẽ XÁC NHẬN đơn hàng bằng TIN NHẮN SMS. Bạn vui
                    lòng kiểm tra TIN NHẮN ngay khi đặt hàng thành công và CHỜ
                    NHẬN HÀNG
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
